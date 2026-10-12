import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:5173";
const results = [];
const failures = [];
const consoleErrors = [];
page.on("pageerror", (error) => failures.push(error.message));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push({ text: message.text(), location: message.location() }); });
try {
  await page.goto(`${baseUrl}/#/components/overview`);
  await page.locator(".site-tools").waitFor();
  if (process.argv.includes("--header")) {
    const checks = [];
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const samples = [];
      for (const locale of ["ru", "en", "uk"]) {
        await page.evaluate((locale) => {
          const key = "neo-ui-site-settings";
          localStorage.setItem(key, JSON.stringify({ ...JSON.parse(localStorage.getItem(key) ?? "{}"), locale }));
        }, locale);
        await page.reload();
        await page.locator(".site-tools").waitFor();
        samples.push(await page.locator(".site-tools").evaluate((node) => {
          const { x, y, width, height } = node.getBoundingClientRect();
          return { x, y, width, height };
        }));
      }
      checks.push({ width, samples, stable: ["x", "y", "width", "height"].every((key) => Math.max(...samples.map((sample) => sample[key])) - Math.min(...samples.map((sample) => sample[key])) <= 1) });
    }
    writeFileSync(`evidence/docs-header-locale-${checks.every((check) => check.stable) ? "green" : "red"}.json`, JSON.stringify(checks, null, 2));
    assert(checks.every((check) => check.stable), "Changing locale must not move or resize header controls");
    await page.locator(".site-locale").click();
    await page.getByRole("menuitem", { name: "English", exact: true }).click();
    assert.equal((await page.locator(".site-locale").textContent()).trim(), "EN");
    assert.equal(await page.locator(".site-locale").evaluate((node) => node === document.activeElement), true);
    await page.locator(".site-locale").press("ArrowDown");
    await page.getByRole("menuitem", { name: "Русский", exact: true }).press("End");
    await page.getByRole("menuitem", { name: "Українська", exact: true }).press("Enter");
    assert.equal((await page.locator(".site-locale").textContent()).trim(), "UA");
    await page.locator(".site-appearance").click();
    assert.equal(await page.locator("html").getAttribute("data-ad-color-mode"), "light");
    await page.locator(".site-appearance").click();
    await page.locator(".site-motion").click();
    assert.equal(await page.locator("html").getAttribute("data-ad-motion"), "off");
    await page.locator(".site-motion").click();
    await page.locator(".site-settings-trigger").click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(await page.locator(".site-brand").innerText(), "NEO UI\nREACT COMPONENT SYSTEM");
    assert.equal(await page.title(), "NEO UI · React");
    await page.screenshot({path:"evidence/docs-header-final.png"});
    console.log("Header locale geometry, keyboard menu, appearance, motion, settings and branding passed.");
  }
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const clipped = await page.locator(".site-top button, .site-top input, .site-brand").evaluateAll((elements) => elements.filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width && box.height && (box.left < 0 || box.right > document.documentElement.clientWidth + 1);
    }).map((element) => ({ name: element.textContent || element.getAttribute("aria-label"), right: element.getBoundingClientRect().right })));
    results.push({ scenario: "all header actions reachable without hidden scrolling", width, clipped });
    await page.screenshot({ path: `evidence/docs-${width}.png` });
  }
  writeFileSync(`evidence/docs-header-${results.some((result) => result.clipped.length) ? "red" : "green"}.json`, JSON.stringify(results, null, 2));
  assert(results.every((result) => result.clipped.length === 0), JSON.stringify(results.filter((result) => result.clipped.length)));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.locator(".docs-mobile-nav > summary").click();
  await page.locator('.docs-mobile-nav-panel a[href="#/components/select"]').click();
  await page.getByRole("heading", { name: "Select", exact: true }).waitFor();
  const mobileNavigation = { scenario: "mobile navigation reveals the destination after choosing a component", menuOpen: await page.locator(".docs-mobile-nav").evaluate((element) => element.open) };
  writeFileSync(`evidence/docs-mobile-navigation-${mobileNavigation.menuOpen ? "red" : "green"}.json`, JSON.stringify(mobileNavigation, null, 2));
  assert.equal(mobileNavigation.menuOpen, false, "The mobile menu must close when navigating");
  if (process.argv.includes("--sweep")) {
    const links = await page.locator('.docs-mobile-nav-panel a[href^="#/components/"]').evaluateAll((elements) => elements.map((element) => [element.getAttribute("href"), element.textContent.trim()]).filter(([href]) => !href.endsWith("/overview")));
    const pages = [];
    const needsInspection = ({ clipped, pageOverflow, stageOverflow, exampleError }) => !!exampleError || clipped.length > 0 || pageOverflow || stageOverflow.x > 1 || stageOverflow.y > 1;
    for (const [href, name] of links) {
      await page.goto(`${baseUrl}/${href}`);
      await page.getByRole("heading", { name, exact: true }).waitFor();
      await page.locator(".docs-live-stage > :not(.ad-border)").first().waitFor();
      for (const width of [320, 375, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
        const geometry = await page.evaluate(() => {
          const stage = document.querySelector(".docs-live-stage");
          const rect = stage.getBoundingClientRect();
          const clipped = [...stage.querySelectorAll("button,input,select,textarea,a")].filter((element) => {
            const box = element.getBoundingClientRect();
            if (!box.width || !box.height || getComputedStyle(element).visibility === "hidden") return false;
            // A deliberate local scroller keeps its actions reachable.
            for (let parent = element.parentElement; parent && parent !== stage; parent = parent.parentElement) {
              if (/(auto|scroll)/.test(getComputedStyle(parent).overflowX) && parent.scrollWidth > parent.clientWidth) return false;
            }
            return box.left < rect.left - 1 || box.right > rect.right + 1;
          }).map((element) => ({ component: element.closest("[data-ad-component]")?.getAttribute("data-ad-component"), text: (element.textContent || element.getAttribute("aria-label") || "").slice(0,80) }));
          return { pageOverflow: document.documentElement.scrollWidth > innerWidth + 1, stageOverflow: { x: Math.max(0, stage.scrollWidth - stage.clientWidth), y: Math.max(0, stage.scrollHeight - stage.clientHeight) }, clipped, exampleError: stage.querySelector(".docs-example-error")?.textContent ?? null };
        });
        pages.push({ name, width, ...geometry });
        if (needsInspection(geometry)) await page.screenshot({ path: `evidence/docs-overflow-${name}-${width}.png` });
      }
      console.log(`${name}: ${pages.slice(-6).filter(needsInspection).length} widths need inspection`);
    }
    writeFileSync("evidence/docs-sweep.json", JSON.stringify({ baseUrl, pages, errors: failures, consoleErrors }, null, 2));
    assert.equal(failures.length, 0, failures.join("\n"));
    assert.equal(consoleErrors.length, 0, JSON.stringify(consoleErrors));
    assert(!pages.some(needsInspection), "Inspect evidence/docs-sweep.json for clipping or overflow");
  }
} finally {
  await browser.close();
}
