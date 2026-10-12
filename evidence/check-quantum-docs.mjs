import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:5173";
const stage = process.argv[2] ?? "green";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", permissions: ["clipboard-read", "clipboard-write"] });
await context.addInitScript(() => {
  if (window === window.top) {
    for (const key of ["neo-ui-site-settings", "ad-ui-site-settings"])
      localStorage.setItem(key, JSON.stringify({ locale: "ru", themeConfig: { version: 1, mode: "simple", theme: "ruby" } }));
  }
  window.quantumMessages = [];
  window.addEventListener("message", ({ data }) => {
    if (data?.type?.startsWith("ad-qf-")) window.quantumMessages.push(data);
  });
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
const checks = [], errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const check = (name, actual, expected) => checks.push({ name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
try {
  for (const route of ["quantum-field", "quantum-field-experience", "quantum-background"]) {
    await page.goto(`${baseUrl}/#/components/${route}`);
    await page.locator(".site-tools").waitFor();
    await page.locator("h1").waitFor();
    if (await page.locator(".docs-live-stage").count()) {
      await page.locator(".docs-live-stage > :not(.ad-border)").first().waitFor();
      await page.locator(".docs-live-stage").scrollIntoViewIfNeeded();
      if (await page.locator(".ad-quantum-field-experience").count()) await page.locator(".docs-live-stage iframe").waitFor();
    }
    check(`${route}: canonical heading`, await page.locator("h1").innerText(), "QuantumBackground");
    check(`${route}: full visualizer iframe`, await page.locator(".docs-live-stage iframe").count(), 1);
    await page.screenshot({ path: `evidence/quantum-docs-${stage}-${route}.png` });
  }
  if (checks.some((entry) => !entry.passed)) throw new Error("Canonical QuantumBackground routes must all expose the full visualizer");

  const iframe = page.locator(".docs-live-stage iframe");
  await iframe.scrollIntoViewIfNeeded();
  const frame = await (await iframe.elementHandle()).contentFrame();
  await frame.locator("canvas").waitFor({ timeout: 45000 });
  await page.waitForFunction(() => window.quantumMessages.some(({ type }) => type === "ad-qf-ready"), undefined, { timeout: 45000 });
  const canvas = frame.locator("canvas");
  const geometry = await canvas.evaluate((node) => ({ width: node.width, height: node.height, clientWidth: node.clientWidth, clientHeight: node.clientHeight }));
  check("WebGL canvas has real geometry", Object.values(geometry).every((value) => value > 0), true);
  const first = digest(await canvas.screenshot());
  await frame.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const next = () => ++frames === 12 ? resolve() : requestAnimationFrame(next);
    requestAnimationFrame(next);
  }));
  const second = digest(await canvas.screenshot());
  check("visualizer changes over twelve animation frames", first !== second, true);
  await page.screenshot({ path: `evidence/quantum-background-restored-${stage}.png` });
  if (stage === "green-production") await page.screenshot({ path: "evidence/quantum-background-restored.png" });

  const field = page.getByRole("button", { name: /Тип поля/ });
  await field.click();
  await page.getByRole("option", { name: "Photon (EM)", exact: true }).click();
  check("field control displays the selected mode", await field.innerText(), "Photon (EM)");
  await frame.waitForFunction(() => window.quantumMessages.some(({ type, key, value }) => type === "ad-qf-control" && key === "field" && value === "Photon (EM)"));
  check("selected mode reaches the full renderer", true, true);
  check("mode transition renders new pixels", digest(await canvas.screenshot()) !== second, true);

  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await iframe.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const dimensions = await page.evaluate(() => {
      const stage = document.querySelector(".docs-live-stage");
      const iframe = stage.querySelector("iframe");
      return { overflow: document.documentElement.scrollWidth - innerWidth, frameWidth: iframe.getBoundingClientRect().width, stageWidth: stage.getBoundingClientRect().width };
    });
    check(`${width}px: no page overflow`, dimensions.overflow <= 1, true);
    check(`${width}px: visualizer fits its container`, dimensions.frameWidth <= dimensions.stageWidth + 1, true);
    await page.screenshot({ path: `evidence/quantum-docs-${stage}-${width}.png` });
  }

  await page.getByRole("button", { name: "Код", exact: true }).click();
  await page.locator('.docs-code-editor-host[data-loaded="true"]').waitFor({ timeout: 45000 });
  await page.locator(".docs-live-actions button").last().click();
  const code = await page.evaluate(() => navigator.clipboard.readText());
  check("copyable example uses the canonical public import", /import[^;]*QuantumBackground[^;]*from ["']@neo-ui-kit\/react["']/.test(code), true);
  check("copyable example renders the canonical component", code.includes("<QuantumBackground"), true);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "API", exact: true }).click();
  await page.getByRole("dialog", { name: "QuantumBackground — API", exact: true }).waitFor();
  const api = await page.locator(".docs-code-pre").innerText();
  check("API dialog labels the canonical props", await page.locator(".docs-code-title").getByText("QuantumBackgroundProps", { exact: true }).count(), 1);
  check("API exposes full visualizer particle budget", api.includes("particleBudget"), true);
  await page.keyboard.press("Escape");
  await page.goto(`${baseUrl}/#/components/overview`);
  await page.locator(".docs-showcase-tile").first().waitFor();
  const tile = page.locator('.docs-showcase-tile:has(a[href="#/components/quantum-background"])');
  await tile.scrollIntoViewIfNeeded();
  check("overview has one canonical background tile", await tile.count(), 1);
  check("overview does not mount full visualizer iframes", await page.locator("iframe").count(), 0);
  check("browser runtime errors", errors, []);
  assert(checks.every((entry) => entry.passed), "Inspect failed QuantumBackground checks");
} finally {
  writeFileSync(`evidence/quantum-docs-${stage}.json`, JSON.stringify({ baseUrl, browser: await browser.version(), checkedAt: new Date().toISOString(), checks, errors, passed: checks.filter((entry) => entry.passed).length }, null, 2));
  await browser.close();
}
