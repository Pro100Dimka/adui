import fs from "node:fs";
const split = fs.readFileSync(
  "packages/ui/src/components/controls/SplitButton/styles.css",
  "utf8",
);
const shared = fs.readFileSync(
  "packages/ui/src/components/controls/shared.css",
  "utf8",
);
const failures = [];
for (const token of [
  "inline-size:max-content",
  "max-inline-size:100%",
  "ad-split-button-main",
  "ad-split-button-trigger",
  "text-overflow:ellipsis",
])
  if (!split.includes(token)) failures.push(`SplitButton missing ${token}`);
if (/!important/.test(split))
  failures.push("SplitButton must not use !important overrides");
if (!shared.includes(".ad-button-label"))
  failures.push("button label slot missing");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Button layout contracts OK");
