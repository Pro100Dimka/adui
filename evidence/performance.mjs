import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { cpus, totalmem, release } from "node:os";
import { build } from "esbuild";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

// Run against a local dev or production server. Browser profiles use TEMP/TMP.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const base = process.env.UI_BASE_URL ?? "http://127.0.0.1:5174";
const output = process.argv[2];
const repeats = Number(process.env.BENCH_REPEATS ?? 20);
if (!Number.isInteger(repeats) || repeats < 1) throw new Error("BENCH_REPEATS must be a positive integer");
if (!output) throw new Error("Pass a report path; keep scratch reports on the temporary drive.");
const summarize = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p) => sorted[Math.ceil(sorted.length * p) - 1];
  return { n: values.length, median: at(0.5), p95: values.length >= 20 ? at(0.95) : null, p99: values.length >= 100 ? at(0.99) : null, max: sorted.at(-1) };
};
const report = { environment: { cpu: cpus()[0].model, logicalCpus: cpus().length, ramBytes: totalmem(), os: release(), node: process.version, base }, scenarios: [], errors: [] };
if (process.argv.includes("--table")) {
  const built = await build({
    stdin: { contents: `
      import { createElement } from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { DataTable } from './packages/ui/src/components/feedback/DataTable/DataTable';
      export function run(count, width) {
        const columns = Array.from({length: width}, (_, i) => ({key: 'c' + i, title: 'Column ' + i, filter: false}));
        const rows = Array.from({length: count}, (_, i) => ({id: String(i), ['c' + (width - 1)]: (i * 7919) % count}));
        const samples = [];
        let markup;
        for (let round = 0; round < ${repeats + 3}; round++) {
          const start = performance.now();
          markup = renderToStaticMarkup(createElement(DataTable, {columns, rows, pageSize: 10, defaultSort: {key: 'c' + (width - 1), direction: 'asc'}}));
          if (round >= 3) samples.push(performance.now() - start);
        }
        if (!markup.includes('aria-sort="ascending"')) throw new Error('Missing sorted header');
        return { samples, markup };
      }
    `, resolveDir: resolve('.'), loader: "tsx" }, bundle: true, write: false, platform: "node", format: "cjs", jsx: "automatic", external: ["react", "react-dom/server", "react/jsx-runtime"], loader: { ".html": "text" }, logLevel: "silent",
    plugins: process.env.TABLE_BASELINE ? [{ name: "table-baseline", setup(plugin) {
      plugin.onLoad({ filter: /DataTable\.tsx$/ }, async (args) => ({ contents: await readFile(process.env.TABLE_BASELINE, "utf8"), loader: "tsx", resolveDir: resolve(args.path, "..") }));
    } }] : [],
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", built.outputFiles[0].text)(require, module, module.exports);
  for (const [rows, columns] of [[1000, 10], [20000, 40], [50000, 80]]) {
    const { samples, markup } = module.exports.run(rows, columns);
    report.scenarios.push({ name: "table-sort-and-server-render", rows, columns, markupSha256: createHash("sha256").update(markup).digest("hex"), milliseconds: summarize(samples), samples });
  }
} else if (process.argv.includes("--runtime")) {
  for (const concurrency of [1, 6]) {
    const samples = [];
    let bytes;
    for (let round = 0; round <= repeats; round++) {
      const start = performance.now();
      await Promise.all(Array.from({ length: concurrency }, async () => {
        const response = await fetch(`${base}/sandbox-runtime.js`);
        if (!response.ok) throw new Error(`Runtime: ${response.status}`);
        const body = await response.text();
        if (!body.includes("ad-preview-render")) throw new Error("Missing preview runtime");
        bytes = Buffer.byteLength(body);
      }));
      const elapsed = performance.now() - start;
      if (round) samples.push(elapsed);
      else report.scenarios.push({ name: "runtime-first-batch", concurrency, elapsed });
    }
    report.scenarios.push({ name: "runtime-warm-batch", concurrency, bytes, milliseconds: summarize(samples), samples });
  }
} else {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  report.environment.browser = browser.version();
  try {
    for (const throttle of [1, 4, 6]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      page.on("pageerror", error => report.errors.push(error.message));
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
      await cdp.send("Performance.enable");
      if (process.argv.includes("--screens")) {
        for (const slug of ["overview", "input-base", "data-table"]) {
          const navigations = [];
          for (let i = 0; i < 6; i++) {
            const start = performance.now();
            await page.goto(`${base}/#/components/${slug}`);
            await page.locator(slug === "overview" ? ".docs-showcase-grid" : ".docs-live-stage [data-ad-component]").first().waitFor();
            navigations.push(performance.now() - start);
          }
          const before = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
          const frames = await page.evaluate(() => new Promise(resolve => {
            const frames = [];
            let start, last;
            const tick = now => {
              start ??= now;
              if (last !== undefined) frames.push(now - last);
              last = now;
              if (now - start < 3000) requestAnimationFrame(tick);
              else resolve(frames);
            };
            requestAnimationFrame(tick);
          }));
          const after = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
          report.scenarios.push({ name: "screen", slug, throttle, emulated: throttle !== 1, firstNavigationMs: navigations[0], warmNavigationMs: summarize(navigations.slice(1)), frameIntervalsMs: summarize(frames), mainThreadTaskMs: (after.TaskDuration - before.TaskDuration) * 1000, sampledHeapBytes: after.JSHeapUsedSize });
        }
        await context.close();
        continue;
      }
      await page.goto(`${base}/#/components/input-base`);
      await page.locator(".docs-live-stage input").first().waitFor();
      const samples = [];
      for (let i = 0; i < Number(process.env.EDITOR_REPEATS ?? 6); i++) {
        const requests = [];
        const onRequest = request => requests.push(request.url());
        page.on("request", onRequest);
        const before = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
        const start = performance.now();
        await page.getByRole("button", { name: "Код", exact: true }).click();
        await page.locator(".monaco-editor textarea").waitFor();
        await page.frameLocator(".docs-live-frame").locator("#root input").first().waitFor();
        const elapsed = performance.now() - start;
        const after = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
        samples.push({ elapsed, requests: requests.length, taskMs: (after.TaskDuration - before.TaskDuration) * 1000, heapBytes: after.JSHeapUsedSize });
        page.off("request", onRequest);
        await page.keyboard.press("Escape");
        await page.locator(".docs-live-frame").waitFor({ state: "detached" });
      }
      report.scenarios.push({ name: "open-editor", throttle, emulated: throttle !== 1, cold: samples[0], warm: summarize(samples.slice(1).map(s => s.elapsed)), samples });
      await context.close();
    }
  } finally { await browser.close(); }
}
await writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, scenarios: report.scenarios.map(({ samples, ...scenario }) => scenario) }, null, 2));
if (report.errors.length) process.exitCode = 1;
