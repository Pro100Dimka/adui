const n=`import { useSvgId } from "../../../core/artwork";\r
import { useMemo, type CSSProperties } from "react";
import { mark } from "../../../core/base";\r
import { type SparklineProps } from "../shared";\r
\r
/** Line that draws itself in, an area glow below it and a beacon on the latest value. */
const DEMO = [12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23];

export const Sparkline = (p: SparklineProps) => {
  const values = p.values?.length ? p.values : DEMO;
  const id = useSvgId();
  const { line, lastX, lastY } = useMemo(() => {
    let min = p.fit ? Infinity : 0;
    let max = p.fit ? -Infinity : 1;
    for (const value of values) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
    // A steady line runs through the middle when the values fill their own range.
    const y = (value: number) => 66 - (max > min ? (value - min) / (max - min) : p.fit ? 0.5 : 0) * 58;
    const x = (index: number) => (index / Math.max(1, values.length - 1)) * 240;
    const points: number[] = [];
    if (values.length <= 240) {
      for (let i = 0; i < values.length; i++) points.push(i);
    } else {
      // At most two samples per output pixel: preserve both extrema and their order,
      // so a long recording keeps its narrow spikes without a giant SVG path.
      for (let bin = 0; bin < 240; bin++) {
        const from = Math.floor(bin * values.length / 240);
        const to = Math.floor((bin + 1) * values.length / 240);
        let low = from;
        let high = from;
        for (let i = from + 1; i < to; i++) {
          if (values[i] < values[low]) low = i;
          if (values[i] > values[high]) high = i;
        }
        points.push(low < high ? low : high);
        if (low !== high) points.push(low < high ? high : low);
      }
      if (points.at(-1) !== values.length - 1) points.push(values.length - 1);
    }
    return {
      line: points.map((i, n) => \`\${n ? "L" : "M"}\${x(i)},\${y(values[i])}\`).join(""),
      lastX: x(values.length - 1),
      lastY: y(values[values.length - 1]),
    };
  }, [values, p.fit]);
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
`;export{n as default};
