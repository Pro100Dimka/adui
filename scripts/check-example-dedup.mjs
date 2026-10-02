import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const checks = {
  Button: ["<U.IconButton", "<U.SplitButton", "<U.ToggleButton"],
  IconButton: ["<U.ButtonGroup", "<U.Button ", "<U.SplitButton"],
  SplitButton: ["<U.Button ", "<U.IconButton"],
  ToggleButton: ["<U.Button ", "<U.IconButton"],
  Tabs: ["<U.Button "],
  ThemePicker: ["<U.Card", "<U.Button "],
};
let bad = [];
for (const [name, forbidden] of Object.entries(checks)) {
  const file = path.join(
    root,
    "packages/ui/src/components",
    name === "ButtonGroup" ? "layout" : "controls",
    name,
    "example.tsx",
  );
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const token of forbidden)
    if (text.includes(token)) bad.push(`${name}: ${token}`);
}
if (bad.length) {
  console.error("Catalog example duplication found:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("Catalog examples are isolated: OK");
