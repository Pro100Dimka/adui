import fs from "node:fs";
const css = fs.readFileSync(
  new URL("../packages/ui/src/components/controls/shared.css", import.meta.url),
  "utf8",
);
const canonical = (
  css.match(/--ad-btn-radius:calc\(var\(--ad-size-radius\) \* 1\.08\)/g) || []
).length;
if (canonical !== 1)
  throw new Error(
    `Expected exactly one canonical button material block, got ${canonical}`,
  );
for (const variant of ["primary", "secondary", "ghost", "danger"])
  if (!css.includes(`[data-ad-variant="${variant}"]`))
    throw new Error(`Missing ${variant} button variant`);
const split = fs.readFileSync(
  new URL(
    "../packages/ui/src/components/controls/SplitButton/styles.css",
    import.meta.url,
  ),
  "utf8",
);
if (!split.includes("--ad-btn-radius:calc(var(--ad-size-radius) * 1.08)"))
  throw new Error("SplitButton does not share Button radius contract");
console.log("Button CSS canonical: OK");
