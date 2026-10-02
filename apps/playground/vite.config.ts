import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const ui = (path: string) =>
  fileURLToPath(new URL(`../../packages/ui/src/${path}`, import.meta.url));

// The playground uses the library sources directly, so edits show up through HMR without a rebuild.
export default defineConfig({
  base: "./",
  resolve: {
    alias: [
      { find: /^@ad-voice\/ui$/, replacement: ui("index.ts") },
      { find: /^@ad-voice\/ui\/styles\.css$/, replacement: ui("styles.css") },
    ],
  },
  // The docs embed every component source as raw text, so the bundle is intentionally large.
  build: { target: "es2022", sourcemap: true, chunkSizeWarningLimit: 1500 },
});
