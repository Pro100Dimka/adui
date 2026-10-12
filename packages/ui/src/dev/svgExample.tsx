import type { VectorNode } from "../index";
import { Playground, U, jsx, sizes } from "./exampleHelpers";

const widths = { xs: "2rem", sm: "3rem", md: "4rem", lg: "6rem" };

const node: VectorNode = {
  tag: "svg",
  props: { viewBox: "0 0 64 64", fill: "none", "aria-hidden": true },
  children: [
    { tag: "defs", children: [
      { tag: "linearGradient", props: { id: "signal", x2: "1", y2: "1" }, children: [
        { tag: "stop", props: { stopColor: "var(--ad-primary)" } },
        { tag: "stop", props: { offset: "1", stopColor: "var(--ad-secondary)" } },
      ] },
    ] },
    { tag: "rect", props: { x: 4, y: 4, width: 56, height: 56, rx: 16, fill: "url(#signal)" } },
    { tag: "path", props: { d: "M14 32h8l5-14 10 28 5-14h8", stroke: "white", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } },
  ],
};

export default function SvgAssetExample() {
  return (
    <Playground
      knobs={{ size: { options: sizes, value: "md" } }}
      code={(v) => jsx("SvgAsset", { node, label: "Neon signal", style: { width: widths[v.size], maxWidth: "100%", height: "auto" } })}
    >
      {(v) => <U.Stack direction="row" gap={3}>
        {["Neon signal", "Second signal"].map(label => <U.SvgAsset key={label} node={node} label={label} style={{ width: widths[v.size], maxWidth: "100%", height: "auto" }} />)}
      </U.Stack>}
    </Playground>
  );
}
