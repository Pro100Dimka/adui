import fs from "node:fs";
import path from "node:path";

const roots = ["packages/ui/src", "apps/playground/src"];
const ignored = new Set(["node_modules", "dist", "release", ".git"]);
const failures = [];
const cssFixed =
  /\b(?:min-|max-)?(?:width|height)\s*:\s*-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|pt|cm|mm|in)\b/g;
const jsxNumeric =
  /style\s*=\s*\{\{[^\n}]*\b(?:width|height|minWidth|maxWidth|minHeight|maxHeight)\s*:\s*-?(?:\d+(?:\.\d+)?|\.\d+)\b/g;

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:css|tsx|jsx|ts|js)$/.test(entry.name)) {
      const text = fs.readFileSync(file, "utf8");
      text.split(/\r?\n/).forEach((line, index) => {
        cssFixed.lastIndex = 0;
        jsxNumeric.lastIndex = 0;
        if (cssFixed.test(line) || jsxNumeric.test(line))
          failures.push(`${file}:${index + 1}: ${line.trim()}`);
      });
    }
  }
}
roots.forEach(walk);
if (failures.length) {
  console.error(
    "Fixed layout dimensions found. Use intrinsic sizing, percentages, viewport/container units, aspect-ratio, or a responsive CSS variable instead:\n",
  );
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "Responsive dimensions OK: no direct fixed width/height declarations or numeric JSX dimensions.",
);
