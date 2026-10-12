import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 320, height: 1000 }, reducedMotion: "reduce" });
const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:5173";
const stage = process.argv[2] ?? "green";
const only = process.argv[3];
const components = JSON.parse(readFileSync(new URL("./library-inventory.json", import.meta.url), "utf8")).components;
const errors = [], results = [];
page.on("pageerror", error => errors.push(error.message));
await page.addInitScript(() => localStorage.setItem("neo-ui-site-settings", JSON.stringify({ locale: "en", scale: 1, themeConfig: { version: 1, mode: "simple", theme: "ruby" } })));
const geometry = () => page.locator(".docs-live-stage").evaluate(stage => {
  const bounds = stage.getBoundingClientRect();
  return {
    pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    stageOverflow: stage.scrollWidth - stage.clientWidth,
    clipped: [...stage.querySelectorAll(".example-knobs button,.example-knobs input")].filter(element => {
      const rect = element.getBoundingClientRect();
      for (let parent = element.parentElement; parent && parent !== stage; parent = parent.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(parent).overflowX) && parent.scrollWidth > parent.clientWidth) return false;
      }
      return rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1);
    }).map(element => element.textContent || element.getAttribute("aria-label")),
    error: stage.querySelector(".docs-example-error")?.textContent ?? null,
  };
});
try {
  for (const component of components.filter(component => !only || component.name === only)) {
    const slug = component.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    await page.goto(`${baseUrl}/#/components/${slug}`);
    await page.getByRole("heading", { name: component.name, exact: true }).waitFor();
    await page.locator(".docs-live-stage > :not(.ad-border)").first().waitFor();
    const size = page.locator('.docs-live-stage [role="tablist"][aria-label="Size"]');
    const choices = await size.locator('[role="tab"]').allTextContents();
    const numericSegments = await page.locator('.example-knobs [role="tablist"]').evaluateAll(groups => groups.map(group => [...group.querySelectorAll('[role="tab"]')].map(tab => tab.textContent.trim())).filter(values => values.length && values.every(value => /^\d+(?:\.\d+)?(?:rem|px|em)?$/.test(value))));
    const row = { name: component.name, sizeContract: component.props.find(prop => prop.name === "size")?.type ?? null, choices, numericInputs: await page.locator('.example-knobs input[type="number"]').count(), numericSegments, sizes: [], initial: await geometry() };
    if (choices.length) {
      for (const choice of choices) {
        await size.getByRole("tab", { name: choice.trim(), exact: true }).click();
        await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
        const after = await geometry();
        row.sizes.push({ choice, selected: await size.getByRole("tab", { name: choice.trim(), exact: true }).getAttribute("aria-selected"), ...after });
      }
    }
    if (component.name === "RotaryKnob") {
      row.motion = [];
      for (const width of [null, 200]) {
        if (width) await page.locator(".example-stage").evaluate((element, width) => element.style.width = `${width}px`, width);
        for (const key of ["Home", "PageUp", "End", "ArrowDown"]) {
          await page.getByRole("slider").press(key);
          await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
          row.motion.push(await page.locator(".ad-rotary-knob").evaluate((root, { key, width }) => {
            const control = root.querySelector(".knob__control").getBoundingClientRect();
            const marker = root.querySelector(".knob__slot").getBoundingClientRect();
            const angle = parseFloat(getComputedStyle(root).getPropertyValue("--angle")) * Math.PI / 180;
            const radius = control.width * .27725;
            const markerError = Math.hypot(marker.x + marker.width / 2 - (control.x + control.width / 2 + radius * Math.sin(angle)), marker.y + marker.height / 2 - (control.y + control.height / 2 - radius * Math.cos(angle)));
            const parent = root.closest(".example-stage");
            return { width, key, markerError, scrollOverflow: parent.scrollWidth - parent.clientWidth, focus: document.activeElement === root.querySelector(".knob__control") };
          }, { key, width }));
        }
      }
    }
    row.passed = !numericSegments.length && (!choices.length || choices.map(choice => choice.trim().toLowerCase()).join(",") === "xs,sm,md,lg") && [row.initial, ...row.sizes].every(sample => !sample.pageOverflow && sample.stageOverflow <= 1 && !sample.clipped.length && !sample.error) && row.sizes.every(sample => sample.selected === "true");
    row.passed &&= !row.motion || row.motion.every(sample => sample.markerError < 1 && sample.scrollOverflow <= 1 && sample.focus);
    results.push(row);
    if (!row.passed || ["SvgAsset", "Icon", "Loader", "NeonWaves", "MelodixText", "RotaryKnob"].includes(component.name)) await page.screenshot({ path: `evidence/sizing-${stage}-${component.name}-320.png` });
    console.log(`${component.name}: ${row.passed ? "passed" : "FAILED"} (${choices.join("/") || "no size selector"}, ${row.numericInputs} numeric controls)`);
  }
  const report = { baseUrl, browser: browser.version(), viewport: [320, 1000], rootTextScale: 1, results, errors, passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length };
  writeFileSync(`evidence/docs-sizing-browser-${stage}.json`, JSON.stringify(report, null, 2));
  if (!only) assert(results.filter(result => result.choices.length).length >= 25, "The fixture must find the named size controls, including their localized labels");
  assert.equal(report.failed, 0);
  assert.equal(errors.length, 0);
} finally {
  await browser.close();
}
