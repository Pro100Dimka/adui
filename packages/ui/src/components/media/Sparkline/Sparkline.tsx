import { mark } from "../../../core/base";
import { type SparklineProps } from "../shared";

export const Sparkline = (p: SparklineProps) => {
  const values = p.values ?? [
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,
  ];
  return (
    <svg
      {...mark("Sparkline", p)}
      viewBox="0 0 240 70"
      role={p.label ? "img" : undefined}
      aria-label={p.label}
      aria-hidden={!p.label}
    >
      <polyline
        points={values
          .map(
            (v, i) => `${(i / Math.max(1, values.length - 1)) * 240},${65 - v}`,
          )
          .join(" ")}
        fill="none"
        stroke={p.color ?? "#ff416a"}
        strokeWidth={1.4}
        style={{ filter: "drop-shadow(0 0 0.25rem #ff315c)" }}
      />
    </svg>
  );
};
