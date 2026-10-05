import { useSvgId } from "../../../core/artwork";
import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";

export const WaveDecoration = (p: CommonProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useSvgId();
  const paint = (t: number) =>
    ref.current?.querySelectorAll("path").forEach((path, j) => {
      let d = "";
      for (let i = 0; i <= 65; i++) {
        const x = (i / 65) * 600,
          y =
            65 +
            (j - 11) * 2.5 +
            Math.sin(i * 0.115 + t * 0.6 + j * 0.08) * 24 +
            Math.sin(i * 0.19 - t * 0.31) * 9;
        d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      path.setAttribute("d", d);
    });
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
