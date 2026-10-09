import { useSvgId } from "../../../core/artwork";
import { useEffect, useMemo, useRef } from "react";
import { createResizeObserver } from "../../../core/environment";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";
import { useMotion } from "../../../core/providers/context";
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

/** A strand as cubic Béziers: x0 y0, then c1x c1y c2x c2y x y for every segment. */
type Curve = number[];

const toPath = (curve: Curve) => {
  let d = `M${curve[0]!.toFixed(2)} ${curve[1]!.toFixed(2)}`;
  for (let i = 2; i < curve.length; i += 6)
    d += `C${curve.slice(i, i + 6).map((n) => n.toFixed(2)).join(" ")}`;
  return d;
};

/** Appends an SVG "S" segment: its first control point mirrors the previous one. */
const smoothTo = (curve: Curve, c2x: number, c2y: number, x: number, y: number) => {
  const n = curve.length;
  curve.push(2 * curve[n - 2]! - curve[n - 4]!, 2 * curve[n - 1]! - curve[n - 3]!, c2x, c2y, x, y);
};

/** A smooth curve through the points (Catmull-Rom as cubic Béziers): few samples, no corners. */
const smooth = (xs: number[], ys: number[]): Curve => {
  const curve = [xs[0]!, ys[0]!];
  for (let i = 0; i < xs.length - 1; i += 1) {
    const x0 = xs[i - 1] ?? xs[i]!, y0 = ys[i - 1] ?? ys[i]!;
    const x1 = xs[i]!, y1 = ys[i]!, x2 = xs[i + 1]!, y2 = ys[i + 1]!;
    const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
    curve.push(x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6, x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6, x2, y2);
  }
  return curve;
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

/** One strand of the twist; most strands form the main twist, the rest run as a lower counter-current. */
const twistStrand = (t: number, drift: number, main: boolean): Curve => {
  const a = Math.sin(drift + t * 1.4) * H * 0.095;
  const b = Math.cos(drift * 0.8 + t * 1.8) * H * 0.08;
  if (!main) {
    const curve = [-12, H * (0.9 + t * 0.12) + b, W * 0.21, H * 0.98 + a, W * 0.33, H * 0.24 + t * H * 0.2 + a, W * 0.52, H * 0.75 + t * H * 0.25 + b];
    smoothTo(curve, W * 0.82, H * 0.38 + t * H * 0.27 + a, W + 8, H * (0.48 + t * 0.5) + b);
    return curve;
  }
  const curve = [-12, H * (0.38 + t * 0.58) + a, W * 0.2, H * 1.28 - t * H * 0.27 + a, W * 0.32, H * 0.34 + t * H * 0.21 + b, W * 0.46, H * 0.62 + t * H * 0.12];
  smoothTo(curve, W * 0.67, H * 1.14 - t * H * 0.09 + a, W * 0.8, H * 0.69 - t * H * 0.22 + b);
  smoothTo(curve, W * 0.94, H * 0.43 - t * H * 0.44 + a, W + 8, H * 0.21 + t * H * 0.45);
  return curve;
};

/** Points along a curve with their running length, so a comet moves at an even pace like a dash. */
const STEPS = 16;
const measure = (curve: Curve) => {
  const xs = [curve[0]!], ys = [curve[1]!], lengths = [0];
  for (let i = 2; i < curve.length; i += 6) {
    const x0 = curve[i - 2]!, y0 = curve[i - 1]!;
    const [x1, y1, x2, y2, x3, y3] = curve.slice(i, i + 6) as [number, number, number, number, number, number];
    for (let k = 1; k <= STEPS; k += 1) {
      const u = k / STEPS, v = 1 - u;
      const x = v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3;
      const y = v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3;
      lengths.push(lengths[lengths.length - 1]! + Math.hypot(x - xs[xs.length - 1]!, y - ys[ys.length - 1]!));
      xs.push(x);
      ys.push(y);
    }
  }
  return { xs, ys, lengths, total: lengths[lengths.length - 1]! };
};
type Track = ReturnType<typeof measure>;
const pointAt = (track: Track, fraction: number) => {
  const distance = Math.min(1, Math.max(0, fraction)) * track.total;
  let low = 0, high = track.lengths.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (track.lengths[middle]! < distance) low = middle;
    else high = middle;
  }
  const span = track.lengths[high]! - track.lengths[low]! || 1;
  const k = (distance - track.lengths[low]!) / span;
  return {
    x: track.xs[low]! + (track.xs[high]! - track.xs[low]!) * k,
    y: track.ys[low]! + (track.ys[high]! - track.ys[low]!) * k,
  };
};

/** A comet is a dash 1.6% of its strand long that laps the strand in 6 seconds. */
const COMET_LAP = 6;
const COMET_DASH = 0.016;
const COMET_WIDTH = 1.6;

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
  const rootRef = useRef<HTMLSpanElement>(null);
  const ref = useRef<SVGSVGElement>(null);
  const cometsRef = useRef<HTMLSpanElement>(null);
  const lastDraw = useRef(-1);
  const tracks = useRef(new Map<number, Track>());
  const paths = useRef<{ node: SVGSVGElement; elements: NodeListOf<SVGPathElement> } | null>(null);
  const cometElements = useRef<{ node: HTMLSpanElement; elements: NodeListOf<HTMLElement> } | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const motion = useMotion();
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
  const carried = useMemo(() => new Set(Array.from({ length: comets }, (_, i) => cometStrand(i, comets, strands))), [comets, strands]);

  // The box is read from the observer, never measured on a frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = createResizeObserver(([entry]) => {
      if (!entry) return;
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height };
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    // The strands drift slowly: redrawing them on every other tick (15 a second) looks the same
    // and halves their cost; the comets ride their own layers at the full clock rate.
    if (lastDraw.current < 0 || time - lastDraw.current >= 1 / 16) {
      lastDraw.current = time;
      const node = ref.current;
      if (node && (paths.current?.node !== node || paths.current.elements.length !== strands))
        paths.current = { node, elements: node.querySelectorAll<SVGPathElement>(".ad-neon-waves-strand") };
      tracks.current.clear();
      paths.current?.elements.forEach((path, i, elements) => {
        const t = i / Math.max(1, elements.length - 1);
        const drift = time * 0.42 + phase;
        const curve = shape === "ridge" ? ridgeStrand(t, drift) : twistStrand(t, drift, i < elements.length * 0.68);
        path.setAttribute("d", toPath(curve));
        if (carried.has(i)) tracks.current.set(i, measure(curve));
      });
    }
    // Each comet is a small glowing layer of its own: it is only moved and faded, never repainted.
    const { width, height } = size.current;
    if (!width || !height) return;
    const sx = width / W, sy = height / H;
    const cometNode = cometsRef.current;
    if (cometNode && (cometElements.current?.node !== cometNode || cometElements.current.elements.length !== comets))
      cometElements.current = { node: cometNode, elements: cometNode.querySelectorAll<HTMLElement>(".ad-neon-waves-comet") };
    if (!cometNode) return;
    cometElements.current?.elements.forEach((comet, i) => {
      const track = tracks.current.get(cometStrand(i, comets, strands));
      if (!track) return;
      const start = ((time + ((i * COMET_LAP) / comets + 1.8)) / COMET_LAP) % 1;
      const tail = pointAt(track, start), head = pointAt(track, start + COMET_DASH);
      const dx = (head.x - tail.x) * sx, dy = (head.y - tail.y) * sy;
      const length = Math.round(Math.hypot(dx, dy) + COMET_WIDTH);
      // Width changes only by whole pixels, so the tiny layer is rarely redrawn.
      if (comet.dataset.length !== String(length)) {
        comet.dataset.length = String(length);
        comet.style.width = `${length}px`;
      }
      const x = (tail.x + head.x) / 2, y = (tail.y + head.y) / 2;
      comet.style.transform = `translate(${(x * sx).toFixed(2)}px, ${(y * sy).toFixed(2)}px) rotate(${Math.atan2(dy, dx).toFixed(4)}rad) translate(-50%, -50%)`;
      // Comets fade in where the strands themselves come out of the dark.
      comet.style.opacity = Math.min(1, Math.max(0, (x + 20) / ((W + 40) * 0.35))).toFixed(3);
    });
  });

  return (
    <span {...mark("NeonWaves", p)} ref={rootRef} aria-hidden="true">
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
    {/* Motion off: comets rest at the start of their strand, where the fade hides them. */}
    {comets > 0 && motion && (
      <span ref={cometsRef} className="ad-neon-waves-comets">
        {Array.from({ length: comets }, (_, i) => (
          <i key={i} className="ad-neon-waves-comet" />
        ))}
      </span>
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
