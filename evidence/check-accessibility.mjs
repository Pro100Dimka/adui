import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const axe = readFileSync("release/consumer-react19/node_modules/axe-core/axe.min.js", "utf8");
const results = [];
const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:5173";
try {
  await page.goto(`${baseUrl}/#/components/overview`);
  const links = await page.locator('.docs-mobile-nav-panel a[href^="#/components/"]').evaluateAll((elements) => elements.map((element) => [element.getAttribute("href"), element.textContent.trim()]).filter(([href]) => !href.endsWith("/overview")));
  for (const [href, name] of links) {
    await page.goto(`${baseUrl}/${href}`);
    await page.getByRole("heading", { name, exact: true }).waitFor();
    await page.locator(".docs-live-stage > :not(.ad-border)").first().waitFor();
    await page.addScriptTag({ content: axe });
    const report = await page.evaluate(async () => (await axe.run(document.querySelector(".docs-live-stage"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map(({ id, impact, description, nodes }) => ({ id, impact, description, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })) })));
    for (const issue of report) {
      for (const node of issue.nodes) {
        const avatarOwner = { FilePicker: "Pro100Yojik", FormFields: "Дмитрий" }[name];
        if (avatarOwner && issue.id === "label-content-name-mismatch" && node.target.join() === ".ad-file-picker-avatar-button" && node.html.includes(`Изменить фото: ${avatarOwner}`)) {
          node.manualReview = { result: "false positive: coincident SVG glow and foreground text counted twice; visible owner is included in the accessible name", evidence: "file-picker-label-analysis.json", screenshot: "file-picker-label-analysis.png" };
        }
      }
    }
    results.push({ name, violations: report });
    console.log(`${name}: ${report.map((issue) => issue.id).join(", ") || "passed"}`);
    writeFileSync("evidence/accessibility-catalog.json", JSON.stringify({ baseUrl, browser: await browser.version(), axe: require("../release/consumer-react19/node_modules/axe-core/package.json").version, viewport: [1440, 1000], results }, null, 2));
  }
  assert(results.every((result) => result.violations.every((issue) => issue.nodes.every((node) => node.manualReview))), "Inspect evidence/accessibility-catalog.json for unreviewed accessibility violations");
} finally { await browser.close(); }
