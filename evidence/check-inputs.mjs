import { build } from "esbuild";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = process.argv[2];
if (!output) throw new Error("Pass a temporary output path");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const built = await build({ stdin: { contents: `
  import {createRoot} from 'react-dom/client';
  import {ThemeProvider, InputBase, Icon, TextField, Select, Autocomplete, NumberField, TextArea, TagInput, PeoplePicker} from './packages/ui/src/index';
  import './packages/ui/src/styles.css';
  const fields = {
    InputBase: p => <InputBase {...p} startAdornment={<Icon name="search"/>}><input placeholder="Своё поле"/></InputBase>,
    TextField: p => <TextField {...p} label="Имя в комнате" labelPlacement="floating" defaultValue="Дмитрий"/>,
    Select: p => <Select {...p} label="Выбор" labelPlacement="floating" options={['Первый', 'Второй']}/>,
    Autocomplete: p => <Autocomplete {...p} options={['Первый', 'Второй']}/>,
    NumberField: p => <NumberField {...p} defaultValue={12}/>,
    TextArea: p => <TextArea {...p} defaultValue="Текст"/>,
    TagInput: p => <TagInput {...p} defaultValue={['Тег']}/>,
    PeoplePicker: p => <PeoplePicker {...p} defaultValue={[{id:'1',name:'Анна Ковальчук'}]}/>,
  };
  createRoot(document.getElementById('root')).render(<ThemeProvider><main style={{padding:24,background:'var(--ad-neutral-950)',color:'var(--ad-text)'}}>
    {Object.entries(fields).map(([name, Field]) => <section key={name} data-field={name}><h3>{name}</h3><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:24}}>
      {['outlined','filled','underlined'].map(variant => <Field key={variant} size="md" variant={variant}/>)}</div></section>)}
  </main></ThemeProvider>);
`, loader: "tsx", resolveDir: resolve(".") }, bundle: true, write: false, outfile: "inputs.js", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, loader: { ".html": "text", ".woff2": "dataurl" }, logLevel: "silent" });
const files = new Map(built.outputFiles.map(file => [file.path.endsWith(".css") ? "/inputs.css" : "/inputs.js", file.text]));
const server = createServer((request, response) => {
  response.setHeader("Content-Type", request.url.endsWith(".css") ? "text/css" : request.url.endsWith(".js") ? "text/javascript" : "text/html");
  response.end(files.get(request.url) ?? '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/inputs.css"><style>body{margin:0}</style></head><body><div id="root"></div><script src="/inputs.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, reducedMotion: "reduce" });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  for (const field of ["InputBase", "TextField", "Select", "Autocomplete", "NumberField", "TextArea", "TagInput", "PeoplePicker"]) {
    const row = page.locator(`[data-field="${field}"]`);
    await row.scrollIntoViewIfNeeded();
    await row.locator(".ad-input-border > .ad-border > svg[viewBox]").first().waitFor();
    for (const variant of ["outlined", "filled", "underlined"]) {
      const input = row.locator(`.ad-input-base[data-ad-variant="${variant}"]`);
      const measure = () => input.evaluate(node => {
        const style = getComputedStyle(node), border = node.querySelector(".ad-input-border");
        return { background: style.backgroundImage, color: style.backgroundColor, radius: style.borderTopLeftRadius, height: node.getBoundingClientRect().height, overlayHeight: border?.getBoundingClientRect().height ?? 0, contour: !!border?.querySelector(".ad-border"), pseudo: getComputedStyle(node, "::after").content };
      });
      const normal = await measure();
      await input.locator('input,textarea,button.ad-input-control').first().focus();
      const focused = await measure();
      assert.equal(normal.contour, variant !== "filled", `${field}/${variant}: animated border only for outlined and underlined`);
      assert.equal(normal.pseudo, "none", `${field}/${variant}: no separate CSS contour`);
      if (variant !== "filled") for (const state of [normal, focused]) {
        assert.equal(state.background, "none", `${field}/${variant}: transparent image`);
        assert.equal(state.color, "rgba(0, 0, 0, 0)", `${field}/${variant}: transparent colour`);
      }
      if (variant === "underlined") {
        assert.equal(normal.radius, "0px");
        assert(normal.overlayHeight <= 1.1, "Underline contour must have line height");
      } else assert(parseFloat(normal.radius) >= normal.height / 2, `${field}: pill radius must cover the actual height, including floating labels`);
      results.push({ field, variant, normal, focused });
    }
  }
  await page.locator('[data-field="TextField"]').screenshot({ path: `${output}.png` });
  await writeFile(output, JSON.stringify(results, null, 2));
  console.log(`${results.length} field variants passed; preview: ${output}.png`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
