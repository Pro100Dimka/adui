import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };

const host = read("apps/playground/src/screens/ScreenHost.tsx");
expect(host.includes('@ad-voice/ui/styles.css?inline'), "ScreenHost must import @ad-voice/ui/styles.css?inline");
expect(!host.includes('@ad-voice/ui/components.css?inline'), "ScreenHost still imports removed components.css entry");
expect(/\.ad-legacy-body\{[^}]*overflow:auto/.test(host), "Legacy screen body must stay scrollable when content exceeds the host");

const app = read("apps/playground/src/app/app.css");
expect(/\.screen-stage\{[^}]*overflow:auto/.test(app), "Screen stage must remain scrollable");
expect(/\.sidebar\{[^}]*overflow:auto/.test(app), "Sidebar must remain scrollable");
expect(app.includes("--ad-shell-side:clamp("), "Adaptive shell width token is missing");
expect(app.includes("--ad-shell-top:clamp("), "Adaptive shell top token is missing");

const scrollArea = read("packages/ui/src/components/layout/ScrollArea/styles.css");
expect(/\.ad-scroll-area\{[\s\S]*?overflow:auto/.test(scrollArea), "ScrollArea must use overflow:auto");
expect(scrollArea.includes("scrollbar-gutter:stable"), "ScrollArea should preserve scrollbar gutter");

const vite = read("apps/playground/vite.config.ts");
expect(vite.includes('styles\\.css(?=\\?|$)'), "Vite alias must resolve @ad-voice/ui/styles.css with query strings like ?inline");

if (errors.length) {
  console.error("Layout contracts FAILED:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Layout contracts OK: adaptive shell + scroll containers + Vite stylesheet entry.");
