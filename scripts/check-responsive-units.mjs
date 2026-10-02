import fs from "node:fs";
import path from "node:path";

const roots = ["packages", "apps"];
const extensions = new Set([".css", ".ts", ".tsx", ".js", ".jsx", ".html"]);
const ignored = new Set(["node_modules", "dist", "release", ".git"]);
const unitPattern =
  /(?<![\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)px\b|\}px\b|["']px["']/g;
const failures = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (extensions.has(path.extname(entry.name))) {
      const text = fs.readFileSync(file, "utf8");
      const lines = text.split(/\r?\n/);
      lines.forEach((line, index) => {
        unitPattern.lastIndex = 0;
        if (unitPattern.test(line))
          failures.push(`${file}:${index + 1}: ${line.trim()}`);
      });
    }
  }
}

roots.forEach(walk);
if (failures.length) {
  console.error(
    "Fixed pixel units are not allowed. Use rem/em/%/vw/vh/dvw/dvh/clamp/min/max instead:\n",
  );
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Responsive units OK: no CSS px lengths in packages/ or apps/.");
