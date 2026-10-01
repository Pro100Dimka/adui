import fs from "node:fs";
const base=fs.readFileSync("packages/ui/src/core/base.tsx","utf8");
const css=fs.readFileSync("packages/ui/src/components/controls/shared.css","utf8");
const tabs=fs.readFileSync("packages/ui/src/components/controls/Tabs/Tabs.tsx","utf8");
for (const size of ["xs","sm","md","lg"]) { if (!base.includes(`"${size}"`)) throw new Error(`Size ${size} missing in public type`); if (!css.includes(`data-ad-size="${size}"`)) throw new Error(`Size ${size} missing in control CSS`); }
if (!tabs.includes('size={p.size}')) throw new Error("Tabs does not propagate size to Tab");
console.log("Control sizes OK: xs / sm / md / lg");
