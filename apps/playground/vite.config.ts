import { defineConfig } from "vite";
import { build } from "esbuild";
import { fileURLToPath, URL } from "node:url";

const ui = (path: string) =>
  fileURLToPath(new URL(`../../packages/ui/src/${path}`, import.meta.url));

/** The opaque preview frame needs a classic, self-contained script in dev too. */
export async function buildSandboxRuntime() {
  const result = await build({
    entryPoints: [fileURLToPath(new URL("./src/catalog/sandboxRuntime.tsx", import.meta.url))],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    alias: Object.fromEntries(["index", "core", "editor", "forms", "router"].map((part) => [
      part === "index" ? "@ad-voice/ui" : `@ad-voice/ui/${part}`,
      ui(`${part}.ts`),
    ])),
  });
  return result.outputFiles[0].text;
}

// The playground uses the library sources directly, so edits show up through HMR without a rebuild.
export default defineConfig({
  base: "./",
  plugins: [{
    name: "sandbox-dev-runtime",
    configureServer(server) {
      server.middlewares.use("/sandbox-runtime.js", async (_request, response, next) => {
        try {
          response.setHeader("Content-Type", "text/javascript; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(await buildSandboxRuntime());
        } catch (error) {
          next(error);
        }
      });
    },
  }],
  resolve: {
    alias: [
      { find: /^@ad-voice\/ui$/, replacement: ui("index.ts") },
      { find: /^@ad-voice\/ui\/styles\.css$/, replacement: ui("styles.css") },
      {
        find: /^@ad-voice\/ui\/(editor|core|router|forms)$/,
        replacement: ui("$1.ts"),
      },
    ],
  },
  // The docs embed every component source as raw text, so the bundle is intentionally large.
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
});
