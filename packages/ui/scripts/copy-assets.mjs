import { cp, mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const one = async (a, b) => {
  await mkdir(dirname(resolve(root, b)), { recursive: true });
  await copyFile(resolve(root, a), resolve(root, b));
};
await one("src/styles.css", "dist/styles.css");
await one("src/tokens.css", "dist/tokens.css");
await one("src/components.css", "dist/components.css");
await cp(resolve(root, "src/theme"), resolve(root, "dist/theme"), {
  recursive: true,
});
await cp(resolve(root, "src/components"), resolve(root, "dist/components"), {
  recursive: true,
  filter: (s) => !s.endsWith(".tsx") && !s.endsWith(".ts"),
});
await one("src/artwork/icons.json", "dist/artwork/icons.json");
await one("src/artwork/illustrations.json", "dist/artwork/illustrations.json");
