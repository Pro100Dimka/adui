const n=`import { useSvgId } from "../../../core/artwork";\r
import { useEffect, useMemo, useRef } from "react";\r
import { createResizeObserver } from "../../../core/environment";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";\r
import { useMotion } from "../../../core/providers/context";\r
import { seeded } from "../../../core/noise";\r
\r
export interface NeonWavesProps extends CommonProps {\r
  /** Number of strands in the bundle. */\r
  strands?: number;\r
  /** Scatter faint stars around the strands. */\r
  stars?: boolean;\r
  /** Shifts the wave shape, so neighbouring instances do not move in step. */\r
  phase?: number;\r
  /** "twist" braids the strands across; "ridge" lays them low on the left and lifts them into a mountain peak on the right. */\r
  shape?: "twist" | "ridge";\r
  /** Sparks of light that run along the strands. */\r
  comets?: number;\r
}\r
\r
const W = 600;\r
const H = 120;\r
\r
/** The ridge's skyline as (x, y) fractions: calm on the left, a sharp peak, a dip and a rise at the edge. */\r
const SKYLINE = [[0, 0.93], [0.16, 0.86], [0.3, 0.82], [0.42, 0.72], [0.55, 0.64], [0.64, 0.7], [0.74, 0.52], [0.84, 0.1], [0.9, 0.56], [0.95, 0.46], [1, 0.08]] as const;\r
const skyline = (x: number) => {\r
  const i = Math.max(0, SKYLINE.findIndex(([at]) => at >= x) - 1);\r
  const [x0, y0] = SKYLINE[i]!;\r
  const [x1, y1] = SKYLINE[Math.min(SKYLINE.length - 1, i + 1)]!;\r
  const k = x1 === x0 ? 0 : (x - x0) / (x1 - x0);\r
  return y0 + (y1 - y0) * (1 - Math.cos(k * Math.PI)) / 2;\r
};\r
const SAMPLES = 36;\r
\r
/** A strand as cubic Béziers: x0 y0, then c1x c1y c2x c2y x y for every segment. */\r
type Curve = number[];\r
\r
const toPath = (curve: Curve) => {\r
  let d = \`M\${curve[0]!.toFixed(2)} \${curve[1]!.toFixed(2)}\`;\r
  for (let i = 2; i < curve.length; i += 6)\r
    d += \`C\${curve.slice(i, i + 6).map((n) => n.toFixed(2)).join(" ")}\`;\r
  return d;\r
};\r
\r
/** Appends an SVG "S" segment: its first control point mirrors the previous one. */\r
const smoothTo = (curve: Curve, c2x: number, c2y: number, x: number, y: number) => {\r
  const n = curve.length;\r
  curve.push(2 * curve[n - 2]! - curve[n - 4]!, 2 * curve[n - 1]! - curve[n - 3]!, c2x, c2y, x, y);\r
};\r
\r
/** A smooth curve through the points (Catmull-Rom as cubic Béziers): few samples, no corners. */\r
const smooth = (xs: number[], ys: number[]): Curve => {\r
  const curve = [xs[0]!, ys[0]!];\r
  for (let i = 0; i < xs.length - 1; i += 1) {\r
    const x0 = xs[i - 1] ?? xs[i]!, y0 = ys[i - 1] ?? ys[i]!;\r
    const x1 = xs[i]!, y1 = ys[i]!, x2 = xs[i + 1]!, y2 = ys[i + 1]!;\r
    const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;\r
    curve.push(x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6, x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6, x2, y2);\r
  }\r
  return curve;\r
};\r
\r
/** One strand of the ridge: the skyline, spread apart in the valleys and gathered at the peaks, rippling slowly. */\r
const ridgeStrand = (t: number, drift: number) => {\r
  const xs: number[] = [];\r
  const ys: number[] = [];\r
  for (let i = 0; i <= SAMPLES; i += 1) {\r
    const x = i / SAMPLES;\r
    const base = skyline(x);\r
    const spread = H * (0.06 + 0.26 * base);\r
    // Neighbouring strands ripple out of step, so the bundle braids instead of moving as one band.\r
    const ripple = Math.sin(x * 8 + drift + t * 7) * H * (0.03 + 0.05 * base) + Math.sin(x * 21 - drift * 1.3 + t * 11) * H * 0.014;\r
    xs.push(x * (W + 20) - 10);\r
    ys.push(base * H + (t - 0.5) * spread + ripple);\r
  }\r
  return smooth(xs, ys);\r
};\r
\r
/** One strand of the twist; most strands form the main twist, the rest run as a lower counter-current. */\r
const twistStrand = (t: number, drift: number, main: boolean): Curve => {\r
  const a = Math.sin(drift + t * 1.4) * H * 0.095;\r
  const b = Math.cos(drift * 0.8 + t * 1.8) * H * 0.08;\r
  if (!main) {\r
    const curve = [-12, H * (0.9 + t * 0.12) + b, W * 0.21, H * 0.98 + a, W * 0.33, H * 0.24 + t * H * 0.2 + a, W * 0.52, H * 0.75 + t * H * 0.25 + b];\r
    smoothTo(curve, W * 0.82, H * 0.38 + t * H * 0.27 + a, W + 8, H * (0.48 + t * 0.5) + b);\r
    return curve;\r
  }\r
  const curve = [-12, H * (0.38 + t * 0.58) + a, W * 0.2, H * 1.28 - t * H * 0.27 + a, W * 0.32, H * 0.34 + t * H * 0.21 + b, W * 0.46, H * 0.62 + t * H * 0.12];\r
  smoothTo(curve, W * 0.67, H * 1.14 - t * H * 0.09 + a, W * 0.8, H * 0.69 - t * H * 0.22 + b);\r
  smoothTo(curve, W * 0.94, H * 0.43 - t * H * 0.44 + a, W + 8, H * 0.21 + t * H * 0.45);\r
  return curve;\r
};\r
\r
/** Points along a curve with their running length, so a comet moves at an even pace like a dash. */\r
const STEPS = 16;\r
const measure = (curve: Curve) => {\r
  const xs = [curve[0]!], ys = [curve[1]!], lengths = [0];\r
  for (let i = 2; i < curve.length; i += 6) {\r
    const x0 = curve[i - 2]!, y0 = curve[i - 1]!;\r
    const [x1, y1, x2, y2, x3, y3] = curve.slice(i, i + 6) as [number, number, number, number, number, number];\r
    for (let k = 1; k <= STEPS; k += 1) {\r
      const u = k / STEPS, v = 1 - u;\r
      const x = v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3;\r
      const y = v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3;\r
      lengths.push(lengths[lengths.length - 1]! + Math.hypot(x - xs[xs.length - 1]!, y - ys[ys.length - 1]!));\r
      xs.push(x);\r
      ys.push(y);\r
    }\r
  }\r
  return { xs, ys, lengths, total: lengths[lengths.length - 1]! };\r
};\r
type Track = ReturnType<typeof measure>;\r
const pointAt = (track: Track, fraction: number) => {\r
  const distance = Math.min(1, Math.max(0, fraction)) * track.total;\r
  let low = 0, high = track.lengths.length - 1;\r
  while (high - low > 1) {\r
    const middle = (low + high) >> 1;\r
    if (track.lengths[middle]! < distance) low = middle;\r
    else high = middle;\r
  }\r
  const span = track.lengths[high]! - track.lengths[low]! || 1;\r
  const k = (distance - track.lengths[low]!) / span;\r
  return {\r
    x: track.xs[low]! + (track.xs[high]! - track.xs[low]!) * k,\r
    y: track.ys[low]! + (track.ys[high]! - track.ys[low]!) * k,\r
  };\r
};\r
\r
/** A comet is a dash 1.6% of its strand long that laps the strand in 6 seconds. */\r
const COMET_LAP = 6;\r
const COMET_DASH = 0.016;\r
const COMET_WIDTH = 1.6;\r
\r
/** Which strands carry a comet: spread across the bundle so they never run on top of each other. */\r
const cometStrand = (i: number, comets: number, strands: number) => Math.min(strands - 1, Math.round(((i + 0.5) / comets) * (strands - 1)));\r
\r
/** A bundle of neon strands that flow and twist slowly, with faint stars around them. */\r
export function NeonWaves({\r
  strands = 22,\r
  stars = true,\r
  phase = 0.9,\r
  shape = "twist",\r
  comets = 0,\r
  ...p\r
}: NeonWavesProps) {\r
  const rootRef = useRef<HTMLSpanElement>(null);\r
  const ref = useRef<SVGSVGElement>(null);\r
  const cometsRef = useRef<HTMLSpanElement>(null);\r
  const lastDraw = useRef(-1);
  const tracks = useRef(new Map<number, Track>());
  const paths = useRef<{ node: SVGSVGElement; elements: NodeListOf<SVGPathElement> } | null>(null);
  const cometElements = useRef<{ node: HTMLSpanElement; elements: NodeListOf<HTMLElement> } | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const motion = useMotion();\r
  const id = useSvgId();\r
  const dots = useMemo(() => {
    if (!stars) return [];\r
    const next = seeded(7913 + Math.floor(phase * 713));\r
    return Array.from({ length: 60 }, () => ({\r
      x: next() * W,\r
      y: next() * H,\r
      r: 0.25 + next() * 0.55,\r
      o: 0.16 + next() * 0.42,\r
    }));\r
  }, [stars, phase]);
  const carried = useMemo(() => new Set(Array.from({ length: comets }, (_, i) => cometStrand(i, comets, strands))), [comets, strands]);
\r
  // The box is read from the observer, never measured on a frame.\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return;\r
    const observer = createResizeObserver(([entry]) => {\r
      if (!entry) return;\r
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height };\r
    });\r
    observer.observe(root);\r
    return () => observer.disconnect();\r
  }, []);\r
\r
  usePauseOffscreen(ref);\r
  useDecoration(ref, (time) => {\r
    // The strands drift slowly: redrawing them on every other tick (15 a second) looks the same\r
    // and halves their cost; the comets ride their own layers at the full clock rate.\r
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
        path.setAttribute("d", toPath(curve));\r
        if (carried.has(i)) tracks.current.set(i, measure(curve));\r
      });\r
    }\r
    // Each comet is a small glowing layer of its own: it is only moved and faded, never repainted.\r
    const { width, height } = size.current;\r
    if (!width || !height) return;
    const sx = width / W, sy = height / H;
    const cometNode = cometsRef.current;
    if (cometNode && (cometElements.current?.node !== cometNode || cometElements.current.elements.length !== comets))
      cometElements.current = { node: cometNode, elements: cometNode.querySelectorAll<HTMLElement>(".ad-neon-waves-comet") };
    if (!cometNode) return;
    cometElements.current?.elements.forEach((comet, i) => {
      const track = tracks.current.get(cometStrand(i, comets, strands));\r
      if (!track) return;\r
      const start = ((time + ((i * COMET_LAP) / comets + 1.8)) / COMET_LAP) % 1;\r
      const tail = pointAt(track, start), head = pointAt(track, start + COMET_DASH);\r
      const dx = (head.x - tail.x) * sx, dy = (head.y - tail.y) * sy;\r
      const length = Math.round(Math.hypot(dx, dy) + COMET_WIDTH);\r
      // Width changes only by whole pixels, so the tiny layer is rarely redrawn.\r
      if (comet.dataset.length !== String(length)) {\r
        comet.dataset.length = String(length);\r
        comet.style.width = \`\${length}px\`;\r
      }\r
      const x = (tail.x + head.x) / 2, y = (tail.y + head.y) / 2;\r
      comet.style.transform = \`translate(\${(x * sx).toFixed(2)}px, \${(y * sy).toFixed(2)}px) rotate(\${Math.atan2(dy, dx).toFixed(4)}rad) translate(-50%, -50%)\`;\r
      // Comets fade in where the strands themselves come out of the dark.\r
      comet.style.opacity = Math.min(1, Math.max(0, (x + 20) / ((W + 40) * 0.35))).toFixed(3);\r
    });\r
  });\r
\r
  return (\r
    <span {...mark("NeonWaves", p)} ref={rootRef} aria-hidden="true">\r
    <svg\r
      ref={ref}\r
      className="ad-neon-waves-strands"\r
      viewBox={\`0 0 \${W} \${H}\`}\r
      preserveAspectRatio="none"\r
    >\r
      <defs>\r
        <linearGradient id={\`\${id}-strand\`}>\r
          <stop stopColor="var(--ad-primary-700)" stopOpacity="0" />\r
          <stop offset=".16" stopColor="var(--ad-primary-600)" stopOpacity=".35" />\r
          <stop offset=".57" stopColor="var(--ad-red)" stopOpacity=".74" />\r
          <stop offset=".78" stopColor="var(--ad-pink)" stopOpacity=".85" />\r
          <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity=".44" />\r
        </linearGradient>\r
      </defs>\r
      {Array.from({ length: strands }, (_, i) => (\r
        <path\r
          key={i}\r
          className="ad-neon-waves-strand"\r
          fill="none"\r
          stroke={\`url(#\${id}-strand)\`}\r
          strokeWidth={i === 5 ? 1 : 0.55}\r
          opacity={i === 5 ? 0.95 : 0.52}\r
          vectorEffect="non-scaling-stroke"\r
        />\r
      ))}\r
    </svg>\r
    {/* Motion off: comets rest at the start of their strand, where the fade hides them. */}\r
    {comets > 0 && motion && (\r
      <span ref={cometsRef} className="ad-neon-waves-comets">\r
        {Array.from({ length: comets }, (_, i) => (\r
          <i key={i} className="ad-neon-waves-comet" />\r
        ))}\r
      </span>\r
    )}\r
      {/* Stars are page elements over the drawing, not part of it: their twinkle fades on the\r
          GPU and never redraws the strands. */}\r
      {dots.map((d, i) => (\r
        <i\r
          key={i}\r
          className="ad-neon-waves-star"\r
          style={{\r
            left: \`\${(d.x / W) * 100}%\`,\r
            top: \`\${(d.y / H) * 100}%\`,\r
            width: \`\${Math.max(1, d.r * 3)}px\`,\r
            opacity: d.o,\r
            animationDelay: \`\${-(i % 9) * 0.45}s\`,\r
          }}\r
        />\r
      ))}\r
    </span>\r
  );\r
}\r
`;export{n as default};
