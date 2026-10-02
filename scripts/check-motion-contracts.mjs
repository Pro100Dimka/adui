import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

const engine = read("packages/ui/src/core/motion-engine.js");
const base = read("packages/ui/src/theme/base.css");

expect(
  engine.includes("width:'100%',height:'100%'"),
  "Animated border overlay must size itself from its host with 100% x 100%.",
);
expect(
  engine.includes("overlay.setAttribute('width','100%')"),
  "Animated border SVG width must be 100%.",
);
expect(
  engine.includes("overlay.setAttribute('height','100%')"),
  "Animated border SVG height must be 100%.",
);
expect(
  !engine.includes("cssRem(w)"),
  "Animated border must not convert measured host width into a fixed CSS size.",
);
expect(
  !engine.includes("cssRem(h)"),
  "Animated border must not convert measured host height into a fixed CSS size.",
);
expect(
  engine.includes("new ResizeObserver(item.sync)"),
  "Animated border must keep ResizeObserver geometry synchronization.",
);
expect(
  engine.includes("getPointAtLength"),
  "Animated border moving light path animation is missing.",
);
expect(
  /\.ad-border\{[^}]*width:100%[^}]*height:100%[^}]*overflow:visible/.test(
    base,
  ),
  "Animated border CSS must remain 100% x 100% and overflow-visible.",
);

if (errors.length) {
  console.error("Motion contracts FAILED:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(
  "Motion contracts OK: animated borders follow host geometry and remain resize-safe.",
);
