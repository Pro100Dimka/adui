import { useSvgId } from "../../../core/artwork";
import { type CSSProperties } from "react";
import { mark } from "../../../core/base";
import { type SparklineProps } from "../shared";

/** Line that draws itself in, an area glow below it and a beacon on the latest value. */
export const Sparkline = (p: SparklineProps) => {
  const values = p.values ?? [
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,
  ];
  const id = useSvgId();
  const max = p.fit ? Math.max(...values) : Math.max(...values, 1);
  const min = p.fit ? Math.min(...values) : Math.min(...values, 0);
  // A steady line runs through the middle when the values fill their own range.
  const share = (v: number) => (max > min ? (v - min) / (max - min) : p.fit ? 0.5 : 0);
  const points = values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * 240,
    66 - share(v) * 58,
  ]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg
      {...mark("Sparkline", p)}
      viewBox="0 0 240 70"
      preserveAspectRatio="none"
      role={p.label ? "img" : undefined}
      aria-label={p.label}
      aria-hidden={!p.label}
      style={
        { ...p.style, "--ad-spark": p.color ?? "var(--ad-primary)" } as CSSProperties
      }
    >
      <defs>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ad-spark)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--ad-spark)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="ad-sparkline-area"
        d={`${line}L240,70L0,70Z`}
        fill={`url(#${id}-area)`}
      />
      <path className="ad-sparkline-line" d={line} pathLength={1} />
      <circle className="ad-sparkline-ping" cx={lastX} cy={lastY} r="3" />
      <circle className="ad-sparkline-dot" cx={lastX} cy={lastY} r="3" />
    </svg>
  );
};
