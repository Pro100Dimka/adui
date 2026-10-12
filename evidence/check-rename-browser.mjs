import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:4173";
const { version } = JSON.parse(readFileSync(new URL("../packages/ui/package.json", import.meta.url), "utf8"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const checks = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
const check = (name, actual, expected) => { checks.push({ name, actual, expected, passed: actual === expected }); assert.equal(actual, expected, name); };
try {
  await page.goto(`${baseUrl}/#/components/overview`);
  await page.locator(".docs-install-line").first().waitFor();
  const lines = await page.locator(".docs-install-line").allTextContents();
  check("install command uses npm registry package", lines[0], "npm install @neo-ui-kit/react");
  check("overview displays the current package version", await page.getByText(`v${version}`, { exact: true }).count(), 1);
  check("stylesheet example uses renamed public import", lines[1], 'import "@neo-ui-kit/react/styles.css";');
  check("site branding is uppercase", await page.title(), "NEO UI · React");
  check("overview no longer exposes old package name", (await page.locator("body").innerText()).includes("@ad-voice/ui"), false);
  for (let index = 0; index < lines.length; index++) {
    await page.locator(".docs-install button").nth(index).click();
    check(`copy install line ${index + 1}`, await page.evaluate(() => navigator.clipboard.readText()), lines[index]);
  }
  await page.screenshot({ path: "evidence/rename-overview-production.png" });
  await page.goto(`${baseUrl}/#/components/button`);
  await page.getByRole("heading", { name: "Button", exact: true }).waitFor();
  await page.getByRole("button", { name: "Код", exact: true }).click();
  await page.locator('.docs-code-editor-host[data-loaded="true"]').waitFor({ timeout: 60000 });
  await page.locator(".docs-live-actions button").last().click();
  const original = await page.evaluate(() => navigator.clipboard.readText());
  check("generated Button example imports renamed root", original.includes('from "@neo-ui-kit/react"'), true);
  check("generated Button example removes old root", original.includes("@ad-voice/ui"), false);
  const code = `import * as React from "react";
import { Button } from "@neo-ui-kit/react";
import * as Core from "@neo-ui-kit/react/core";
import * as Editor from "@neo-ui-kit/react/editor";
import * as Forms from "@neo-ui-kit/react/forms";
import * as Routing from "@neo-ui-kit/react/router";
export default function Example() {
  const [count, setCount] = React.useState(0);
  const resolved = [Core, Editor, Forms, Routing].every((module) => Object.keys(module).length > 0);
  return <div><p>{resolved ? "All public entry points resolved" : "Missing module"}</p><Button onClick={() => setCount(count + 1)}>Renamed counter {count}</Button></div>;
}`;
  const input = page.locator('.monaco-editor [role="textbox"]');
  await input.focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  const preview = page.frameLocator('iframe[title="Button preview"]');
  await preview.getByRole("button", { name: "Renamed counter 0", exact: true }).waitFor({ timeout: 30000 });
  check("opaque-origin sandbox resolves root and core/editor/forms/router", await preview.getByText("All public entry points resolved", { exact: true }).count(), 1);
  await preview.getByRole("button", { name: "Renamed counter 0", exact: true }).click();
  await preview.getByRole("button", { name: "Renamed counter 1", exact: true }).waitFor();
  check("stateful renamed Button responds once", await preview.getByRole("button", { name: "Renamed counter 1", exact: true }).count(), 1);
  await preview.getByRole("button", { name: "Renamed counter 1", exact: true }).click();
  await preview.getByRole("button", { name: "Renamed counter 2", exact: true }).waitFor();
  check("state survives second click", await preview.getByRole("button", { name: "Renamed counter 2", exact: true }).count(), 1);
  check("live preview reports no compile/runtime error", await page.locator(".docs-live-preview .ad-message-bar").count(), 0);
  await page.locator(".docs-live-actions button").last().click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const linesWithoutIndent = (text) => text.split(/\r?\n/).map((line) => line.trim()).join("\n");
  check("editor copies edited module with renamed imports", linesWithoutIndent(copied), linesWithoutIndent(code));
  await page.screenshot({ path: "evidence/rename-live-editor-production.png" });
  check("browser runtime and console errors", errors.length, 0);
} finally {
  writeFileSync("evidence/rename-browser-production.json", JSON.stringify({ baseUrl, browser: await browser.version(), completedAt: new Date().toISOString(), checks, errors, passed: checks.filter((entry) => entry.passed).length }, null, 2));
  await browser.close();
}
