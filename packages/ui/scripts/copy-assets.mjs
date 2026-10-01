import { mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  ["src/styles.css", "dist/styles.css"],
  ["src/tokens.css", "dist/tokens.css"],
  ["src/components.css", "dist/components.css"],
  ["src/artwork/icons.json", "dist/artwork/icons.json"],
  ["src/artwork/illustrations.json", "dist/artwork/illustrations.json"],
];
for (const [from, to] of files) {
  await mkdir(dirname(resolve(root, to)), { recursive: true });
  await copyFile(resolve(root, from), resolve(root, to));
}
