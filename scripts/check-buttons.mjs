import fs from "node:fs";
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const shared = read("packages/ui/src/components/controls/shared.css");
const group = read("packages/ui/src/components/layout/ButtonGroup/styles.css");
const host = read("apps/playground/src/screens/ScreenHost.tsx");
const failures = [];
for (const token of [
  ".ad-icon-button{width:var(--ad-size-h)",
  '[data-ad-variant="primary"]',
  '[data-ad-variant="danger"]',
])
  if (!shared.includes(token)) failures.push(`shared.css missing ${token}`);
if (!group.includes("gap:0.625rem"))
  failures.push("ButtonGroup must own consistent gap");
for (const component of ["Button", "IconButton", "ToggleButton"])
  if (
    !host.includes(`[data-ad-component=\\"${component}\\"]`) &&
    !host.includes(`[data-ad-component="${component}"]`)
  )
    failures.push(`ScreenHost missing ${component} screen skin`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Button system contracts OK");
