import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
const root = new URL("../apps/playground/src/", import.meta.url);
const rawVisual =
  /<(button|input|textarea|select|h[1-6]|p|strong|small|code|pre|header|footer|article|section|span|a|nav|aside|main)\b/g;
const allowed = new Set(["screens/ScreenHost.tsx"]);
const failures = [];
async function walk(dir, prefix = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const path = join(dir.pathname, entry.name);
    if (entry.isDirectory()) await walk(new URL(`./${entry.name}/`, dir), rel);
    else if (entry.name.endsWith(".tsx") && !allowed.has(rel)) {
      const source = await readFile(path, "utf8");
      const matches = [...source.matchAll(rawVisual)].map((m) => m[1]);
      if (matches.length)
        failures.push(`${rel}: ${[...new Set(matches)].join(", ")}`);
    }
  }
}
await walk(root);
if (failures.length) {
  console.error(
    "Playground still contains raw visual elements:\n" + failures.join("\n"),
  );
  process.exit(1);
}
console.log(
  "UI primitive contract OK: playground pages use @ad-voice/ui for visible UI; ScreenHost is the only technical DOM bridge.",
);
