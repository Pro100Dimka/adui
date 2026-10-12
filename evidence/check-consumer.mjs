import { build } from "esbuild";
import { createServer } from "node:http";
import { writeFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const directory = resolve(process.argv[2] ?? "release/consumer-react19");
const stage = process.argv[3] ?? "green";
assert(realpathSync(resolve(directory, "node_modules/@neo-ui-kit/react")).startsWith(directory), "The consumer must install a tarball, not a workspace link");
const bundle = await build({ entryPoints: [resolve(directory, "main.tsx")], outdir: resolve(directory, "build"), bundle: true, write: false, jsx: "automatic", format: "esm", loader: { ".woff2": "file" } });
const files = new Map(bundle.outputFiles.map((file) => ["/" + relative(resolve(directory, "build"), file.path).replaceAll("\\", "/"), file.contents]));
const server = createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  response.setHeader("Content-Type", pathname.endsWith(".js") ? "text/javascript" : pathname.endsWith(".css") ? "text/css" : pathname.endsWith(".woff2") ? "font/woff2" : "text/html");
  response.end(files.get(pathname) ?? '<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div><link rel="stylesheet" href="/main.css"><script type="module" src="/main.js"></script>');
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const channel = process.env.BROWSER_CHANNEL ?? "chrome";
const browser = await chromium.launch({ channel, headless: true });
const page = await browser.newPage({ viewport: { width: 768, height: 1000 }, reducedMotion: "reduce" });
page.setDefaultTimeout(5000);
const errors = [], results = [];
const consoleErrors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
const check = (name, actual, expected) => results.push({ name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
try {
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole("button", { name: "Check refs", exact: true }).click();
  check("all declared element refs reach their public DOM targets", await page.getByTestId("refs").textContent(), "Button,IconButton,ToggleButton,Tab,InputBase,Select,Slider");
  writeFileSync(`evidence/consumer-${directory.split(/[\\/]/).at(-1)}-${stage}.json`, JSON.stringify({ directory, browser: await browser.version(), results }, null, 2));
  assert(results[0].passed, "React element refs must work in every declared peer version");
  check("locale context is shared across split entry points", await page.locator(".ad-toast").textContent(), "Settings saved");
  await page.getByRole("button", { name: /^Packed select/ }).click();
  check("Select from the installed package opens an anchored listbox", await page.getByRole("listbox").count(), 1);
  if (await page.getByRole("option", { name: "Beta", exact: true }).count()) {
    await page.getByRole("option", { name: "Beta", exact: true }).click();
    check("controlled selection updates its trigger", (await page.getByRole("button", { name: /^Packed select/ }).textContent()).trim(), "Beta");
  }
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  check("native dialog mounts with public imports", await page.getByRole("dialog", { name: "Packed dialog", exact: true }).count(), 1);
  await page.getByRole("button", { name: /^Dialog select/ }).click();
  check("select opens inside modal top layer", await page.getByRole("listbox").isVisible(), true);
  await page.keyboard.press("Escape");
  check("first Escape closes only the nested selection layer", await page.getByRole("dialog").isVisible() && await page.getByRole("listbox").count() === 0, true);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Packed dialog", exact: true }).waitFor({ state: "hidden" });
  check("dialog closes and restores focus", await page.getByRole("button", { name: "Open dialog", exact: true }).evaluate((element) => document.activeElement === element), true);
  if (!results.at(-1).passed) console.log(await page.evaluate(() => ({ active: document.activeElement?.outerHTML.slice(0, 300), dialogs: document.querySelectorAll("dialog").length })));
  check("styles and SVG contour shipped", await page.locator(".ad-animated-border").evaluate((element) => ({ position: getComputedStyle(element).position, svg: !!element.querySelector(".ad-border svg") })), { position: "relative", svg: true });
  check("font CSS and WOFF2 are loadable", await page.evaluate(async () => { const fonts = await document.fonts.load('20px "Melodix"'); return fonts.length > 0 && fonts.every((font) => font.status === "loaded"); }), true);
  check("SVG and accessible relationship IDs are unique across instances", await page.locator("[id]").evaluateAll((elements) => new Set(elements.map((element) => element.id)).size === elements.length), true);
  check("host elements keep native box sizing and font family", await page.evaluate(() => {
    const host = document.createElement("button"); host.textContent = "Host button"; document.body.append(host);
    const before = { box: getComputedStyle(host).boxSizing, font: getComputedStyle(host).fontFamily };
    for (const sheet of document.styleSheets) sheet.disabled = true;
    const after = { box: getComputedStyle(host).boxSizing, font: getComputedStyle(host).fontFamily };
    for (const sheet of document.styleSheets) sheet.disabled = false;
    host.remove(); return JSON.stringify(before) === JSON.stringify(after);
  }), true);
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    check(`isolated package has no page overflow at ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (!results.at(-1).passed) results.at(-1).overflowingElements = await page.locator("main *").evaluateAll((elements) => elements.filter((element) => !element.closest(".ad-border") && element.getBoundingClientRect().right > innerWidth && element.getBoundingClientRect().width > 0).slice(0, 14).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent.slice(0, 90), right: element.getBoundingClientRect().right })));
    if (!results.at(-1).passed) results.at(-1).scrollingElements = await page.locator("main *").evaluateAll((elements) => elements.filter((element) => !element.closest(".ad-border") && element.scrollWidth > element.clientWidth + 1 && element.getBoundingClientRect().width > 0).slice(0, 14).map((element) => ({ tag: element.tagName, className: element.className, width: element.clientWidth, scrollWidth: element.scrollWidth, overflow: getComputedStyle(element).overflow, text: element.textContent.slice(0, 90) })));
  }
  await page.setViewportSize({ width: 768, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
  check("200 percent root text does not overflow the page", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  if (!results.at(-1).passed) results.at(-1).overflowingElements = await page.locator("main *").evaluateAll((elements) => elements.filter((element) => !element.closest(".ad-border") && element.getBoundingClientRect().right > innerWidth && element.getBoundingClientRect().width > 0).slice(0, 14).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent.slice(0, 90), right: element.getBoundingClientRect().right })));
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  await page.emulateMedia({ forcedColors: "active" });
  await page.getByRole("button", { name: "Open dialog", exact: true }).focus();
  check("forced colors keyboard focus remains visible", await page.getByRole("button", { name: "Open dialog", exact: true }).evaluate((el) => document.activeElement === el && getComputedStyle(el).outlineStyle !== "none"), true);
  await page.emulateMedia({ forcedColors: "none" });
  await page.screenshot({ path: `evidence/consumer-${directory.split(/[\\/]/).at(-1)}-${stage}.png`, fullPage: true });
  check("no uncaught browser exceptions", errors, []);
  check("no browser console errors", consoleErrors, []);
  writeFileSync(`evidence/consumer-${directory.split(/[\\/]/).at(-1)}-${stage}.json`, JSON.stringify({ directory, channel, browser: await browser.version(), results }, null, 2));
  assert(results.every((result) => result.passed), JSON.stringify(results.filter((result) => !result.passed)));
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
