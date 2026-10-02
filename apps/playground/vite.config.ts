import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const ui = (path: string) =>
  fileURLToPath(new URL(`../../packages/ui/src/${path}`, import.meta.url));

export default defineConfig({
  base: "./",
  resolve: {
    alias: [
      {
        find: /^@ad-voice\/ui\/components\.css$/,
        replacement: ui("components.css"),
      },
      {
        find: /^@ad-voice\/ui\/styles\.css(?=\?|$)/,
        replacement: ui("styles.css"),
      },
      {
        find: /^@ad-voice\/ui\/tokens\.css(?=\?|$)/,
        replacement: ui("tokens.css"),
      },
      { find: /^@ad-voice\/ui\/core$/, replacement: ui("core.ts") },
      { find: /^@ad-voice\/ui\/editor$/, replacement: ui("editor.ts") },
      { find: /^@ad-voice\/ui\/composites$/, replacement: ui("composites.ts") },
      { find: /^@ad-voice\/ui$/, replacement: ui("index.ts") },
    ],
  },
  server: {
    fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] },
  },
  build: { target: "es2022", sourcemap: true, chunkSizeWarningLimit: 4000 },
  esbuild: { jsx: "automatic" },
});
