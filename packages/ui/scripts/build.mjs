import { execSync } from "node:child_process";
import { cpSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (path) => root + path;

rmSync(at("dist"), { recursive: true, force: true });
// Types come from tsc, laid out like the sources.
execSync("tsc -p tsconfig.build.json --emitDeclarationOnly", {
  cwd: root,
  stdio: "inherit",
});
// JavaScript is bundled per entry point: plain Node and test runners need complete ESM
// (file extensions, inlined JSON), and shared code goes to common chunks so every entry
// sees the same modules — and the same React contexts.
await build({
  absWorkingDir: root,
  entryPoints: ["index", "core", "editor", "router", "forms"].map(
    (entry) => `src/${entry}.ts`,
  ),
  outdir: "dist",
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  chunkNames: "chunks/[name]-[hash]",
  legalComments: "none",
  loader: { ".html": "text" },
});
// Stylesheets and fonts (with their licence) are copied with the same layout (the docs-only dev
// helpers stay out).
cpSync(at("src"), at("dist"), {
  recursive: true,
  filter: (path) =>
    !/[\\/]src[\\/]dev$/.test(path) &&
    (statSync(path).isDirectory() || /\.(css|woff2)$/.test(path) || /[\\/]fonts[\\/].*\.txt$/.test(path) || /UPSTREAM-LICENSE\.txt$/.test(path)),
});
