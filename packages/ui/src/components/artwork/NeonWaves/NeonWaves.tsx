import { useSvgId } from "../../../core/artwork";
import { useEffect, useMemo, useRef } from "react";
import { createResizeObserver } from "../../../core/environment";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";
import { useMotion } from "../../../core/providers/context";
import { seeded } from "../../../core/noise";
import { createNeonRenderer, neonGeometry } from "./neon-renderer.js";

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

const {
  W, H, toPath, ridgeStrand, twistStrand, measure, pointAt, cometStrand,
  COMET_LAP, COMET_DASH, COMET_WIDTH,
} = neonGeometry;
type Track = ReturnType<typeof measure>;

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
  const lastTime = useRef(0);
  const renderer = useRef<ReturnType<typeof createNeonRenderer>>(null);
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
      renderer.current?.update();
      painter.current(lastTime.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rootRef.current || !ref.current) return;
    renderer.current = createNeonRenderer(rootRef.current, ref.current, { strands, phase, shape, comets, dots, time: lastTime.current });
    return () => { renderer.current?.dispose(); renderer.current = null; };
  }, []);
  useEffect(() => {
    renderer.current?.update({ strands, phase, shape, comets, dots, time: lastTime.current });
  }, [strands, phase, shape, comets, dots, motion]);

  usePauseOffscreen(rootRef);
  const paint = (time: number) => {
    lastTime.current = time;
    if (renderer.current?.ready) return;
    // The SVG fallback retains its lower redraw rate; worker rendering runs at the motion rate.
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
  };
  const painter = useRef(paint);
  painter.current = paint;
  useDecoration(ref, paint);

  const star = (d: typeof dots[number], i: number, opacity: number) => (
    <i key={i} className="ad-neon-waves-star" style={{
      left: `${(d.x / W) * 100}%`, top: `${(d.y / H) * 100}%`,
      width: `${Math.max(1, d.r * 3)}px`, opacity,
    }} />
  );

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
      {/* A constant 0.05 floor plus a fading overlay preserves each star's opacity exactly:
          0.05 + 0.95 * ((opacity - 0.05) / 0.95) * phase. Only nine groups animate. */}
      {dots.length > 0 && <>
        <span className="ad-neon-waves-stars-floor">{dots.map((d, i) => star(d, i, 0.05))}</span>
        {Array.from({ length: 9 }, (_, phase) => (
          <span key={phase} className="ad-neon-waves-stars" style={{ animationDelay: `${-phase * 0.45}s` }}>
            {dots.map((d, i) => i % 9 === phase ? star(d, i, (d.o - 0.05) / 0.95) : null)}
          </span>
        ))}
      </>}
    </span>
  );
}
