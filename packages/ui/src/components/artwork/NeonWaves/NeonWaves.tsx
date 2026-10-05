import { useSvgId } from "../../../core/artwork";
import { useMemo, useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";
import { seeded } from "../../../core/noise";

export interface NeonWavesProps extends CommonProps {
  /** Number of strands in the bundle. */
  strands?: number;
  /** Scatter faint stars around the strands. */
  stars?: boolean;
  /** Shifts the wave shape, so neighbouring instances do not move in step. */
  phase?: number;
  /** "twist" braids the strands across; "ridge" lays them low on the left and lifts them into a mountain peak on the right. */
  shape?: "twist" | "ridge";
  /** Sparks of light that run along the strands. */
  comets?: number;
}

const W = 600;
const H = 120;

/** The ridge's skyline as (x, y) fractions: calm on the left, a sharp peak, a dip and a rise at the edge. */
const SKYLINE = [[0, 0.93], [0.16, 0.86], [0.3, 0.82], [0.42, 0.72], [0.55, 0.64], [0.64, 0.7], [0.74, 0.52], [0.84, 0.1], [0.9, 0.56], [0.95, 0.46], [1, 0.08]] as const;
const skyline = (x: number) => {
  const i = Math.max(0, SKYLINE.findIndex(([at]) => at >= x) - 1);
  const [x0, y0] = SKYLINE[i]!;
  const [x1, y1] = SKYLINE[Math.min(SKYLINE.length - 1, i + 1)]!;
  const k = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
  return y0 + (y1 - y0) * (1 - Math.cos(k * Math.PI)) / 2;
};
const SAMPLES = 36;

/** A smooth curve through the points (Catmull-Rom as cubic Béziers): few samples, no corners. */
const smooth = (xs: number[], ys: number[]) => {
  let d = `M${xs[0]!.toFixed(1)} ${ys[0]!.toFixed(1)}`;
  for (let i = 0; i < xs.length - 1; i += 1) {
    const x0 = xs[i - 1] ?? xs[i]!, y0 = ys[i - 1] ?? ys[i]!;
    const x1 = xs[i]!, y1 = ys[i]!, x2 = xs[i + 1]!, y2 = ys[i + 1]!;
    const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
    d += `C${(x1 + (x2 - x0) / 6).toFixed(1)} ${(y1 + (y2 - y0) / 6).toFixed(1)} ${(x2 - (x3 - x1) / 6).toFixed(1)} ${(y2 - (y3 - y1) / 6).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
};

/** One strand of the ridge: the skyline, spread apart in the valleys and gathered at the peaks, rippling slowly. */
const ridgeStrand = (t: number, drift: number) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = i / SAMPLES;
    const base = skyline(x);
    const spread = H * (0.06 + 0.26 * base);
    // Neighbouring strands ripple out of step, so the bundle braids instead of moving as one band.
    const ripple = Math.sin(x * 8 + drift + t * 7) * H * (0.03 + 0.05 * base) + Math.sin(x * 21 - drift * 1.3 + t * 11) * H * 0.014;
    xs.push(x * (W + 20) - 10);
    ys.push(base * H + (t - 0.5) * spread + ripple);
  }
  return smooth(xs, ys);
};

/** Which strands carry a comet: spread across the bundle so they never run on top of each other. */
const cometStrand = (i: number, comets: number, strands: number) => Math.min(strands - 1, Math.round(((i + 0.5) / comets) * (strands - 1)));

/** A bundle of neon strands that flow and twist slowly, with faint stars around them. */
export function NeonWaves({
  strands = 22,
  stars = true,
  phase = 0.9,
  shape = "twist",
  comets = 0,
  ...p
}: NeonWavesProps) {
  const ref = useRef<SVGSVGElement>(null);
  const cometsRef = useRef<SVGSVGElement>(null);
  const lastDraw = useRef(-1);
  const id = useSvgId();
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

  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    // The strands drift slowly: redrawing them on every other tick (15 a second) looks the same
    // and halves their cost; the comets ride their own layer at the full clock rate.
    if (lastDraw.current >= 0 && time - lastDraw.current < 1 / 16) return;
    lastDraw.current = time;
    const paths = ref.current?.querySelectorAll<SVGPathElement>(".ad-neon-waves-strand");
    paths?.forEach((path, i) => {
      const t = i / Math.max(1, paths.length - 1);
      const drift = time * 0.42 + phase;
      if (shape === "ridge") {
        path.setAttribute("d", ridgeStrand(t, drift));
        return;
      }
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
    // Each comet rides its strand; its own dash animation moves it along.
    cometsRef.current?.querySelectorAll<SVGPathElement>(".ad-neon-waves-comet").forEach((comet) => {
      const strand = paths?.[Number(comet.dataset.strand)];
      const d = strand?.getAttribute("d");
      if (d) comet.setAttribute("d", d);
    });
  });

  return (
    <span {...mark("NeonWaves", p)} aria-hidden="true">
    <svg
      ref={ref}
      className="ad-neon-waves-strands"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`${id}-strand`}>
          <stop stopColor="var(--ad-primary-700)" stopOpacity="0" />
          <stop offset=".16" stopColor="var(--ad-primary-600)" stopOpacity=".35" />
          <stop offset=".57" stopColor="var(--ad-red)" stopOpacity=".74" />
          <stop offset=".78" stopColor="var(--ad-pink)" stopOpacity=".85" />
          <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity=".44" />
        </linearGradient>
      </defs>
      {Array.from({ length: strands }, (_, i) => (
        <path
          key={i}
          className="ad-neon-waves-strand"
          fill="none"
          stroke={`url(#${id}-strand)`}
          strokeWidth={i === 5 ? 1 : 0.55}
          opacity={i === 5 ? 0.95 : 0.52}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
    {comets > 0 && (
    <svg ref={cometsRef} className="ad-neon-waves-comets" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        {/* Comets fade in where the strands themselves come out of the dark. */}
        <linearGradient id={`${id}-fade`}>
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset=".35" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-comets`} maskUnits="userSpaceOnUse" x={-20} y={-H} width={W + 40} height={H * 3}>
          <rect x={-20} y={-H} width={W + 40} height={H * 3} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-comets)`}>
      {Array.from({ length: comets }, (_, i) => (
        <path
          key={`comet-${i}`}
          className="ad-neon-waves-comet"
          data-strand={cometStrand(i, comets, strands)}
          fill="none"
          pathLength={100}
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `${-((i * 6) / comets + 1.8) % 6}s` }}
        />
      ))}
      </g>
    </svg>
    )}
      {/* Stars are page elements over the drawing, not part of it: their twinkle fades on the
          GPU and never redraws the strands. */}
      {dots.map((d, i) => (
        <i
          key={i}
          className="ad-neon-waves-star"
          style={{
            left: `${(d.x / W) * 100}%`,
            top: `${(d.y / H) * 100}%`,
            width: `${Math.max(1, d.r * 3)}px`,
            opacity: d.o,
            animationDelay: `${-(i % 9) * 0.45}s`,
          }}
        />
      ))}
    </span>
  );
}
