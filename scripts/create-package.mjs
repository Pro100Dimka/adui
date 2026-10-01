import { mkdir, readdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const release = resolve(root, "release");
await mkdir(release, { recursive: true });
for (const name of await readdir(release)) if (name.endsWith(".tgz")) await rm(resolve(release, name));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\n[1/3] TypeScript + library build...");
run("npm", ["run", "build:ui"]);
console.log("\n[2/3] npm package dry-run...");
run("npm", ["pack", "./packages/ui", "--dry-run"]);
console.log("\n[3/3] Creating .tgz in release/...\n");
run("npm", ["pack", "./packages/ui", "--pack-destination", "./release"]);
console.log("\nDone. Install the .tgz from the release folder in your application.\n");
