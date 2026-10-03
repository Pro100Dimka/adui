import { execSync } from "node:child_process";
import { cpSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (path) => root + path;

rmSync(at("dist"), { recursive: true, force: true });
execSync("tsc -p tsconfig.build.json", { cwd: root, stdio: "inherit" });
// tsc emits JS, types and imported JSON; stylesheets are copied with the same layout
// (the docs-only dev helpers stay out).
cpSync(at("src"), at("dist"), {
  recursive: true,
  filter: (path) =>
    !/[\\/]src[\\/]dev$/.test(path) &&
    (statSync(path).isDirectory() || path.endsWith(".css")),
});
