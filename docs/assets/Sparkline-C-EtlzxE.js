const r=`import { useSvgId } from "../../../core/artwork";\r
import { type CSSProperties } from "react";\r
import { mark } from "../../../core/base";\r
import { type SparklineProps } from "../shared";\r
\r
/** Line that draws itself in, an area glow below it and a beacon on the latest value. */\r
export const Sparkline = (p: SparklineProps) => {\r
  const values = p.values ?? [\r
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,\r
  ];\r
  const id = useSvgId();\r
  const max = p.fit ? Math.max(...values) : Math.max(...values, 1);\r
  const min = p.fit ? Math.min(...values) : Math.min(...values, 0);\r
  // A steady line runs through the middle when the values fill their own range.\r
  const share = (v: number) => (max > min ? (v - min) / (max - min) : p.fit ? 0.5 : 0);\r
  const points = values.map((v, i) => [\r
    (i / Math.max(1, values.length - 1)) * 240,\r
    66 - share(v) * 58,\r
  ]);\r
  const line = points.map(([x, y], i) => \`\${i ? "L" : "M"}\${x},\${y}\`).join("");\r
  const [lastX, lastY] = points[points.length - 1];\r
  const box = { viewBox: "0 0 240 70", preserveAspectRatio: "none", "aria-hidden": true } as const;\r
  // Three drawings in paint order: the line with its glow, the beacon's ring, the dot. The ring\r
  // pulses for as long as the sparkline is shown, so it is kept apart from the glowing line and\r
  // dot: they are painted once, and only the bare ring is redrawn.\r
  return (\r
    <span\r
      {...mark("Sparkline", p)}\r
      role={p.label ? "img" : undefined}\r
      aria-label={p.label}\r
      aria-hidden={!p.label}\r
      style={\r
        { ...p.style, "--ad-spark": p.color ?? "var(--ad-primary)" } as CSSProperties\r
      }\r
    >\r
      <svg {...box}>\r
        <defs>\r
          <linearGradient id={\`\${id}-area\`} x1="0" y1="0" x2="0" y2="1">\r
            <stop offset="0" stopColor="var(--ad-spark)" stopOpacity="0.45" />\r
            <stop offset="1" stopColor="var(--ad-spark)" stopOpacity="0" />\r
          </linearGradient>\r
        </defs>\r
        <path\r
          className="ad-sparkline-area"\r
          d={\`\${line}L240,70L0,70Z\`}\r
          fill={\`url(#\${id}-area)\`}\r
        />\r
        <path className="ad-sparkline-line" d={line} pathLength={1} />\r
      </svg>\r
      <svg {...box}>\r
        <circle className="ad-sparkline-ping" cx={lastX} cy={lastY} r="3" />\r
      </svg>\r
      <svg {...box}>\r
        <circle className="ad-sparkline-dot" cx={lastX} cy={lastY} r="3" />\r
      </svg>\r
    </span>\r
  );\r
};\r
`;export{r as default};
