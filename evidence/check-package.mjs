import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { build } from "esbuild";

const directory = resolve(process.argv[2] ?? "release/consumer-react19");
const consumer = createRequire(resolve(directory, "package.json"));
const load = (name) => import(pathToFileURL(consumer.resolve(name)).href);
const entries = Object.fromEntries(await Promise.all(["", "/core", "/forms", "/editor", "/router"].map(async (name) => [name || "/index", await load(`@neo-ui-kit/react${name}`)])));
const ui = entries["/index"], core = entries["/core"];
assert.equal(ui.ThemeProvider, core.ThemeProvider);
assert.equal(ui.LocaleProvider, core.LocaleProvider);
assert.equal(ui.Form, entries["/forms"].Form);
assert.equal(ui.PianoRoll, entries["/editor"].PianoRoll);
assert.equal(ui.Router, entries["/router"].Router);
const { createElement: h, version } = await load("react");
const { renderToStaticMarkup } = await load("react-dom/server");
const html = renderToStaticMarkup(h(core.LocaleProvider, { locale: "en" }, h(core.ThemeProvider, { theme: "violet" },
  h(ui.Button, null, "Server button"), h(ui.TextField, { label: "Server field", defaultValue: "Ready" }),
  h(ui.Select, { label: "Server select", options: ["One", "Two"] }), h(ui.AnimatedBorder, null, "Server border"), h(ui.Toast, { duration: 0 })
)));
for (const text of ["Server button", "Server field", "Server select", "Server border", "Settings saved"]) assert(html.includes(text), `SSR missing ${text}`);
const manifestPath = consumer.resolve("@neo-ui-kit/react/package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (process.argv[3]) assert.equal(manifest.version, process.argv[3], "Installed package must have the requested release version");
for (const value of Object.values(manifest.exports)) {
  for (const file of typeof value === "string" ? [value] : Object.values(value)) assert(existsSync(resolve(dirname(manifestPath), file)), `Missing export ${file}`);
}
const bundle = await build({ stdin: { contents: 'export { Button } from "@neo-ui-kit/react";', resolveDir: directory }, bundle: true, write: false, format: "esm", minify: true, treeShaking: true, external: ["react", "react-dom", "react/jsx-runtime"], target: "es2022" });
const code = bundle.outputFiles[0].text;
assert(!code.includes("ad-piano-roll"), "Button must not retain the editor");
assert(!code.includes("quantum-field"), "Button must not retain the QuantumField renderer");
assert(!/hostv2-|pf-art-1/.test(code), "Button must not retain unrelated host/planet artwork data");
assert(!code.includes("ad-player-play"), "Button must not retain the AudioPlayer");
const report = { directory, node: process.version, react: version, package: `${manifest.name}@${manifest.version}`, entries: Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, Object.keys(value).length])), sharedProviderIdentity: true, serverRendering: "passed for the representative component set; this is not a hydration certification", allExportsExist: true, buttonBundle: { bytes: Buffer.byteLength(code), gzipBytes: gzipSync(code).length, editorRetained: false, quantumRendererRetained: false, unrelatedArtworkRetained: false, audioPlayerRetained: false }, result: "passed" };
writeFileSync(`evidence/package-${directory.split(/[\\/]/).at(-1)}-${process.versions.node.split(".")[0]}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
