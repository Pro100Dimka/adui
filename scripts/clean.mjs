import { rm } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
await Promise.all([
  rm(resolve(root, "packages/ui/dist"), { recursive: true, force: true }),
  rm(resolve(root, "apps/playground/dist"), { recursive: true, force: true }),
  rm(resolve(root, "release"), { recursive: true, force: true }),
]);
console.log("Cleaned dist and release folders.");
