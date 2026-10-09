import { useSvgId } from "../../../core/artwork";
import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";

/** Samples per strand. The waves are long and smooth, so 23 points joined by Catmull-Rom curves
 * trace the waves closer than 66 straight segments did, with a third of the work to draw it. */
const POINTS = 23;
const STEP = 65 / (POINTS - 1);
const X = Array.from({ length: POINTS }, (_, k) => (k * STEP / 65) * 600);

/** One strand at time t: two travelling sines, the slow swell and a counter-ripple. */
const strand = (j: number, t: number) => {
  // One extra sample beyond each end, so the curve keeps the wave's true slope at the edges.
  const ys = Array.from({ length: POINTS + 2 }, (_, k) => {
    const i = (k - 1) * STEP;
    return 65 + (j - 11) * 2.5 + Math.sin(i * 0.115 + t * 0.6 + j * 0.08) * 24 + Math.sin(i * 0.19 - t * 0.31) * 9;
  });
  let d = `M0 ${ys[1]!.toFixed(2)}`;
  for (let k = 1; k < POINTS; k += 1) {
    const y0 = ys[k - 1]!, y1 = ys[k]!, y2 = ys[k + 1]!, y3 = ys[k + 2]!;
    const x1 = X[k - 1]!, x2 = X[k]!, third = (x2 - x1) / 3;
    d += `C${(x1 + third).toFixed(2)} ${(y1 + (y2 - y0) / 6).toFixed(2)} ${(x2 - third).toFixed(2)} ${(y2 - (y3 - y1) / 6).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  return d;
};

export const WaveDecoration = (p: CommonProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const paths = useRef<NodeListOf<SVGPathElement>>(null);
  const uid = useSvgId();
  const paint = (t: number) => {
    if (!ref.current) return;
    paths.current ??= ref.current.querySelectorAll("path");
    paths.current.forEach((path, j) => path.setAttribute("d", strand(j, t)));
  };
  usePauseOffscreen(ref);
  useDecoration(ref, paint);
  return (
    <svg
      {...mark("WaveDecoration", p)}
      ref={ref}
      viewBox="0 0 600 130"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wave-${uid}`}>
          {[
            [0, 0],
            [0.2, 0.3],
            [0.7, 1],
            [1, 0.35],
          ].map(([offset, opacity]) => (
            <stop
              key={offset}
              offset={offset}
              stopColor="var(--ad-primary)"
              stopOpacity={opacity}
            />
          ))}
        </linearGradient>
      </defs>
      {Array.from({ length: 22 }, (_, j) => (
        <path
          key={j}
          d="M0 65H600"
          fill="none"
          stroke={`url(#wave-${uid})`}
          strokeWidth={j % 7 === 0 ? 1.2 : 0.65}
          opacity={0.5 + (j % 4) * 0.13}
        />
      ))}
    </svg>
  );
};
