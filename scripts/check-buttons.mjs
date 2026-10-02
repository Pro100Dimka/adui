import fs from "node:fs";
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const shared = read("packages/ui/src/components/controls/shared.css");
const group = read("packages/ui/src/components/layout/ButtonGroup/styles.css");
const host = read("apps/playground/src/screens/ScreenHost.tsx");
const failures = [];
for (const token of [
  ".ad-icon-button{",
  'data-ad-variant="primary"',
  'data-ad-variant="danger"',
])
  if (!shared.includes(token)) failures.push(`shared.css missing ${token}`);
if (!/gap:\.?4[02]rem/.test(group))
  failures.push("ButtonGroup must own compact consistent gap");
for (const component of ["Button", "IconButton", "ToggleButton"]) {
  const selectorA = `[data-ad-component=\\"${component}\\"]`;
  const selectorB = `[data-ad-component="${component}"]`;
  if (host.includes(selectorA) || host.includes(selectorB))
    failures.push(
      `ScreenHost must not reskin ${component}; library CSS is the single source of truth`,
    );
}
if (shared.includes("radial-gradient(circle at var(--ad-button-x)"))
  failures.push("Button specular highlight regressed to a visible point");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "Button system contracts OK: library styles are canonical; ScreenHost owns geometry only.",
);
