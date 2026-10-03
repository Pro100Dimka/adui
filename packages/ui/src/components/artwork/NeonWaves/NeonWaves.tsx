import { useId, useMemo, useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { seeded } from "../../../core/noise";

export interface NeonWavesProps extends CommonProps {
  /** Number of strands in the bundle. */
  strands?: number;
  /** Scatter faint stars around the strands. */
  stars?: boolean;
  /** Shifts the wave shape, so neighbouring instances do not move in step. */
  phase?: number;
}

const W = 600;
const H = 120;

/** A bundle of neon strands that flow and twist slowly, with faint stars around them. */
export function NeonWaves({
  strands = 22,
  stars = true,
  phase = 0.9,
  ...p
}: NeonWavesProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const dots = useMemo(() => {
    if (!stars) return [];
    const next = seeded(7913 + Math.floor(phase * 713));
    return Array.from({ length: 60 }, () => ({
      x: next() * W,
      y: next() * H,
      r: 0.25 + next() * 0.55,
      o: 0.16 + next() * 0.42,
    }));
  }, [stars, phase]);

  useDecoration(ref, (time) => {
    const paths = ref.current?.querySelectorAll("path");
    paths?.forEach((path, i) => {
      const t = i / Math.max(1, paths.length - 1);
      const drift = time * 0.42 + phase;
      const a = Math.sin(drift + t * 1.4) * H * 0.095;
      const b = Math.cos(drift * 0.8 + t * 1.8) * H * 0.08;
      const y = H * (0.38 + t * 0.58);
      // Most strands form the main twist; the rest run as a lower counter-current.
      path.setAttribute(
        "d",
        i < paths.length * 0.68
          ? `M-12 ${y + a} C${W * 0.2} ${H * 1.28 - t * H * 0.27 + a} ${W * 0.32} ${H * 0.34 + t * H * 0.21 + b} ${W * 0.46} ${H * 0.62 + t * H * 0.12} S${W * 0.67} ${H * 1.14 - t * H * 0.09 + a} ${W * 0.8} ${H * 0.69 - t * H * 0.22 + b} S${W * 0.94} ${H * 0.43 - t * H * 0.44 + a} ${W + 8} ${H * 0.21 + t * H * 0.45}`
          : `M-12 ${H * (0.9 + t * 0.12) + b} C${W * 0.21} ${H * 0.98 + a} ${W * 0.33} ${H * 0.24 + t * H * 0.2 + a} ${W * 0.52} ${H * 0.75 + t * H * 0.25 + b} S${W * 0.82} ${H * 0.38 + t * H * 0.27 + a} ${W + 8} ${H * (0.48 + t * 0.5) + b}`,
      );
    });
  });

  return (
    <svg
      {...mark("NeonWaves", p)}
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-strand`}>
          <stop stopColor="#6d112b" stopOpacity="0" />
          <stop offset=".16" stopColor="#af153d" stopOpacity=".35" />
          <stop offset=".57" stopColor="var(--ad-red)" stopOpacity=".74" />
          <stop offset=".78" stopColor="var(--ad-pink)" stopOpacity=".85" />
          <stop offset="1" stopColor="#d91b43" stopOpacity=".44" />
        </linearGradient>
      </defs>
      {Array.from({ length: strands }, (_, i) => (
        <path
          key={i}
          fill="none"
          stroke={`url(#${id}-strand)`}
          strokeWidth={i === 5 ? 1 : 0.55}
          opacity={i === 5 ? 0.95 : 0.52}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {dots.map((d, i) => (
        <circle
          key={i}
          className="ad-neon-waves-star"
          cx={d.x}
          cy={d.y}
          r={d.r}
          opacity={d.o}
          style={{ animationDelay: `${-(i % 9) * 0.45}s` }}
        />
      ))}
    </svg>
  );
}
