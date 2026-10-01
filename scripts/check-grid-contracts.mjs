import { readFile } from "node:fs/promises";

const [tsx, css] = await Promise.all([
  readFile(new URL("../packages/ui/src/components/layout/Grid/Grid.tsx", import.meta.url), "utf8"),
  readFile(new URL("../packages/ui/src/components/layout/Grid/styles.css", import.meta.url), "utf8")
]);

const checks = [
  [tsx.includes('const isItem = hasPlacement && columns == null && minChildWidth == null;'), "Grid distinguishes placement-only items from containers"],
  [tsx.includes('isItem ? "ad-grid-item" : "ad-grid"'), "Grid item does not receive container class"],
  [css.includes('.ad-grid:not(.ad-grid--auto-fit)'), "Responsive column rules exclude auto-fit grids"],
  [css.includes('.ad-grid-item {'), "Grid item has dedicated placement styles"],
  [css.includes('repeat(\n    auto-fit,'), "Auto-fit template remains explicit"]
];

const failed = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error("Grid contracts failed:\n- " + failed.join("\n- "));
  process.exit(1);
}
console.log("Grid contracts OK");
