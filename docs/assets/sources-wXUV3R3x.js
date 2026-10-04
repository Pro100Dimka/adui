const c=`import { useSvgId } from "../../../core/artwork";
import { type CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface DatabaseArtProps extends CommonProps {
  label?: string;
}

const SPARKS = [
  [42, 84, 1, -1],
  [44, 111, 1, -2.7],
  [132, 143, 1, -0.6],
  [15, 135, 0.75, -2],
  [64, 151, 0.8, -3],
  [156, 147, 0.75, -1.5],
];

/** Neon database cylinder: light orbits run along its rings, sparks twinkle around it. */
export function DatabaseArt({ label, ...p }: DatabaseArtProps) {
  const id = useSvgId();
  const ref = (name: string) => \`url(#\${id}-\${name})\`;
  const rings =
    "M39 83C39 106 134 106 134 83M39 108C39 132 134 132 134 108M39 133C39 155 134 155 134 133";
  return (
    <svg
      {...mark("DatabaseArt", p)}
      viewBox="0 0 170 179"
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <defs>
        <filter id={\`\${id}-bloom\`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id={\`\${id}-body\`}>
          <stop stopColor="var(--ad-primary-600)" />
          <stop offset=".12" stopColor="var(--ad-primary-800)" />
          <stop offset=".3" stopColor="var(--ad-primary-900)" />
          <stop offset=".72" stopColor="var(--ad-neutral-950)" />
          <stop offset="1" stopColor="var(--ad-primary-800)" />
        </linearGradient>
        <radialGradient id={\`\${id}-top\`} cx=".3" cy=".27" r=".9">
          <stop stopColor="var(--ad-primary-600)" />
          <stop offset=".23" stopColor="var(--ad-primary-800)" />
          <stop offset=".66" stopColor="var(--ad-neutral-900)" />
          <stop offset="1" stopColor="var(--ad-primary-900)" />
        </radialGradient>
        <linearGradient id={\`\${id}-edge\`}>
          <stop stopColor="var(--ad-neutral-200)" />
          <stop offset=".16" stopColor="var(--ad-secondary)" />
          <stop offset=".47" stopColor="var(--ad-primary-700)" />
          <stop offset=".8" stopColor="var(--ad-primary)" />
          <stop offset="1" stopColor="var(--ad-secondary-200)" />
        </linearGradient>
        <radialGradient id={\`\${id}-aura\`}>
          <stop stopColor="var(--ad-primary)" stopOpacity=".3" />
          <stop offset=".5" stopColor="var(--ad-primary)" stopOpacity=".12" />
          <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />
        </radialGradient>
        <g id={\`\${id}-spark\`}>
          <path d="M-7 0H7M0-8V8" stroke="var(--ad-secondary-200)" strokeWidth=".7" />
          <circle r="3.4" fill="var(--ad-primary)" filter={ref("bloom")} />
          <circle r="1.4" fill="var(--ad-neutral-200)" />
        </g>
      </defs>
      <ellipse
        cx="85"
        cy="120"
        rx="83"
        ry="71"
        fill={ref("aura")}
        className="ad-art-aura"
      />
      <g transform="translate(0 2)">
        <path
          d="M39 57V133C39 156 134 156 134 133V57Z"
          fill={ref("body")}
          stroke="var(--ad-primary)"
          strokeWidth=".75"
        />
        <path
          d={rings}
          stroke="var(--ad-primary)"
          strokeWidth="3.5"
          opacity=".7"
          filter={ref("bloom")}
        />
        <path d={rings} stroke={ref("edge")} strokeWidth="1.4" />
        <ellipse
          cx="86.5"
          cy="57"
          rx="47.5"
          ry="17"
          fill={ref("top")}
          stroke="var(--ad-primary)"
          strokeWidth="1.1"
        />
        <ellipse
          cx="86.5"
          cy="57"
          rx="47.5"
          ry="17"
          stroke="var(--ad-primary)"
          strokeWidth="5"
          opacity=".75"
          filter={ref("bloom")}
        />
        <ellipse
          cx="86.5"
          cy="57"
          rx="42"
          ry="13.8"
          stroke={ref("edge")}
          strokeWidth=".5"
          opacity=".8"
        />
        {[81, 106, 132].map((cy) => (
          <ellipse
            key={cy}
            cx="86.5"
            cy={cy}
            rx="47.5"
            ry="17"
            stroke="var(--ad-primary)"
            strokeWidth=".7"
            opacity=".75"
          />
        ))}
        <g stroke="var(--ad-neutral-200)" strokeWidth="1.45">
          {[57, 106, 132].map((cy, i) => (
            <ellipse
              key={cy}
              className="ad-art-orbit"
              cx="86.5"
              cy={cy}
              rx="47.5"
              ry="17"
              pathLength="100"
              style={{ animationDelay: \`\${-i * 1.3}s\` }}
            />
          ))}
        </g>
        <ellipse
          cx="86.5"
          cy="53.5"
          rx="5"
          ry="1.6"
          fill="var(--ad-primary)"
          filter={ref("bloom")}
        />
        <ellipse cx="86.5" cy="53.5" rx="3.4" ry=".8" fill="var(--ad-secondary-200)" />
      </g>
      {SPARKS.map(([x, y, scale, delay]) => (
        <g
          key={\`\${x}-\${y}\`}
          className="ad-art-spark"
          style={{ "--ad-delay": \`\${delay}s\` } as CSSProperties}
        >
          <use
            href={\`#\${id}-spark\`}
            transform={\`translate(\${x} \${y}) scale(\${scale})\`}
          />
        </g>
      ))}
    </svg>
  );
}
`,d=`import { DatabaseArt } from "@ad-voice/ui";

export default function DatabaseArtExample() {
  return <DatabaseArt label="Хранилище записей" />;
}
`,p=`export default {\r
  name: "DatabaseArt",\r
  description:\r
    "Неоновая база данных с бегущими орбитами и искрами — для хранилища и данных.",\r
  category: "motion",\r
} as const;\r
`,u=`import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { clamp01, fbm, seeded, type Painting } from "../../../core/noise";
import { useArtwork } from "../useArtwork";

export interface LandscapeProps extends CommonProps {
  /** Darken the left side so text placed over it stays readable. */
  shade?: boolean;
}

type Point = readonly [number, number];
const W = 1220;
const H = 168;

const centerX = 1129,
  centerY = 309,
  radius = 346;

/** Night nebula, a ruby-rimmed planet and two mountain ridges, painted procedurally. */
const landscape: Painting = {
  pixels(image, from, to) {
    const { width } = image;
    const scale = width / W;
    for (let py = from; py < to; py += 1)
      for (let px = 0; px < width; px += 1) {
        const x = px / scale,
          y = py / scale;
        const n = fbm(x * 0.012, y * 0.013 + 20),
          warp = fbm(x * 0.004, y * 0.005) * 70;
        const f = fbm(x * 0.025 + warp * 0.03, y * 0.032 + warp * 0.02);
        const ridge =
          1 - Math.abs(2 * fbm(x * 0.026 + n * 5, y * 0.034 + n * 5, 5) - 1);
        const threads =
          Math.pow(clamp01((ridge - 0.61) * 2.7), 4) *
          Math.pow(clamp01((f - 0.33) * 3), 1.3);
        const horizon = Math.exp(
          -(((x - 820) / 160) ** 2 + ((y - 171) / 40) ** 2),
        );
        const cloud =
          Math.exp(-(((x - 830) / 340) ** 2)) *
          (8 + 32 * n ** 2 + 95 * threads);
        let red = 6 + cloud + horizon * 170,
          green = 8 + cloud * 0.19 + horizon * 32,
          blue = 14 + cloud * 0.3 + horizon * 44;
        const dx = (x - centerX) / radius,
          dy = (y - centerY) / radius,
          radial = Math.hypot(dx, dy),
          edge = (1 - radial) * radius;
        const sideLight = clamp01(0.18 - dx * 0.98 - dy * 0.15, 0.08, 1.3);
        if (radial <= 1) {
          const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
          const terrain = fbm(dx * 22 + z * 9, dy * 26 + z * 4, 6);
          const geology = fbm(dx * 78 + terrain * 9, dy * 82 + terrain * 7, 3);
          const vein =
            1 -
            Math.abs(
              fbm(dx * 83 + geology * 5, dy * 97 + geology * 5, 3) * 2 - 1,
            );
          const lava =
            Math.pow(clamp01((vein - 0.66) * 2.9), 5) *
            Math.pow(clamp01((terrain - 0.34) * 3.3), 1.6);
          const rim = Math.exp(-Math.max(0, edge) / 2.15) * sideLight;
          const atmosphere = Math.exp(-Math.max(0, edge) / 23) * sideLight;
          const face = clamp01(0.5 - dx * 0.32 - z * 0.5, 0.12, 0.6);
          red =
            7 +
            face * (26 + 46 * terrain) +
            lava * 82 +
            rim * 238 +
            atmosphere * 166;
          green =
            8 +
            face * (17 + 12 * terrain) +
            lava * 5 +
            rim * 202 +
            atmosphere * 38;
          blue =
            16 +
            face * (21 + 18 * terrain) +
            lava * 14 +
            rim * 211 +
            atmosphere * 62;
        } else if (radial < 1.12) {
          const halo = Math.exp(edge / 13) * sideLight;
          red += halo * 142;
          green += halo * 18;
          blue += halo * 34;
        }
        const pixel = (py * width + px) * 4;
        image.data[pixel] = red;
        image.data[pixel + 1] = green;
        image.data[pixel + 2] = blue;
        image.data[pixel + 3] = 255;
      }
  },
  finish(context, width) {
    context.save();
    context.scale(width / W, width / W);

    // Stars above the ridge line.
    const next = seeded(840);
    for (let i = 0; i < 350; i += 1) {
      const x = 410 + next() * 810,
        y = next() * 168;
      if (Math.hypot(x - centerX, y - centerY) < radius) continue;
      context.fillStyle = \`rgba(255,\${55 + Math.round(next() * 68)},\${75 + Math.round(next() * 70)},\${0.1 + next() * 0.4})\`;
      context.beginPath();
      context.arc(x, y, 0.15 + next() * 0.57, 0, Math.PI * 2);
      context.fill();
    }
    glow(context, 828, 156, 96, "255,98,96", 0.26);
    glow(context, 828, 156, 38, "255,168,132", 0.4);
    mountain(context, FAR_RIDGE, 180, "#451320", "#ef56667a", 716);
    mountain(context, NEAR_RIDGE, 181, "#080a10", "#7f2635a0", 282);
    context.restore();
  },
};

function glow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, \`rgba(\${color},\${alpha})\`);
  gradient.addColorStop(1, \`rgba(\${color},0)\`);
  context.fillStyle = gradient;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function polygon(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  fill: string,
) {
  context.beginPath();
  points.forEach(([x, y], i) =>
    i ? context.lineTo(x, y) : context.moveTo(x, y),
  );
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

/** A ridge with jittered detail, a glowing crest line and faceted slopes. */
function mountain(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  base: number,
  color: string,
  line: string,
  seed: number,
) {
  const rand = seeded(seed),
    fine: Point[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i],
      [x2, y2] = points[i + 1];
    fine.push([x1, y1]);
    for (let d = 1; d <= 3; d += 1) {
      const t = d / 4;
      fine.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + (rand() - 0.5) * 6]);
    }
  }
  fine.push(points[points.length - 1]);
  polygon(context, [...fine, [W, base], [0, base]], color);
  context.beginPath();
  fine.forEach(([x, y], i) =>
    i ? context.lineTo(x, y) : context.moveTo(x, y),
  );
  context.strokeStyle = line;
  context.lineWidth = 0.8;
  context.stroke();
  for (let i = 1; i < fine.length - 1; i += 1) {
    const [x, y] = fine[i];
    if (fine[i - 1][1] < y || fine[i + 1][1] < y) continue;
    const foot: Point = [
      x + 8 + rand() * 27,
      Math.min(base + 8, y + 20 + rand() * 32),
    ];
    polygon(
      context,
      [fine[i - 1], [x, y], foot],
      \`rgba(52,33,45,\${0.12 + rand() * 0.26})\`,
    );
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 5 + rand() * 8, y + 12 + rand() * 8);
    context.lineTo(...foot);
    context.strokeStyle = \`rgba(192,49,69,\${0.1 + rand() * 0.26})\`;
    context.lineWidth = 0.6;
    context.stroke();
  }
}

const FAR_RIDGE: Point[] = [
  [0, 168],
  [410, 166],
  [475, 155],
  [518, 149],
  [548, 151],
  [582, 138],
  [610, 135],
  [650, 148],
  [697, 144],
  [725, 135],
  [749, 146],
  [768, 143],
  [788, 152],
  [825, 143],
  [843, 150],
  [868, 145],
  [891, 147],
  [918, 141],
  [945, 148],
  [989, 153],
  [1025, 149],
  [1100, 155],
  [1175, 144],
  [1220, 163],
];
const NEAR_RIDGE: Point[] = [
  [0, 169],
  [440, 168],
  [475, 153],
  [497, 151],
  [516, 138],
  [534, 123],
  [546, 128],
  [561, 114],
  [574, 112],
  [585, 100],
  [597, 94],
  [608, 96],
  [622, 113],
  [633, 113],
  [650, 132],
  [663, 121],
  [678, 117],
  [690, 129],
  [701, 141],
  [722, 145],
  [739, 155],
  [779, 158],
  [803, 148],
  [821, 153],
  [844, 149],
  [863, 145],
  [874, 135],
  [887, 129],
  [899, 128],
  [913, 140],
  [927, 145],
  [939, 144],
  [956, 151],
  [976, 154],
  [995, 164],
  [1110, 168],
  [1180, 152],
  [1202, 130],
  [1220, 132],
];

/** Procedural night landscape with a planet; children are laid over it. */
export function Landscape({ shade = true, children, ...p }: LandscapeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useArtwork(ref, "landscape", W, H, landscape);
  return (
    <div {...mark("Landscape", p)} data-shade={shade || undefined}>
      <canvas ref={ref} aria-hidden />
      <span className="ad-landscape-glow" aria-hidden />
      {children && <div className="ad-landscape-content">{children}</div>}
    </div>
  );
}
`,m=`import { Landscape } from "@ad-voice/ui";

export default function LandscapeExample() {
  return <Landscape />;
}
`,f=`export default {
  name: "Landscape",
  description:
    "Процедурный ночной пейзаж: туманность, планета со светящейся кромкой цвета темы и горные хребты.",
  category: "motion",
  wide: true,
} as const;
`,g=`import { useSvgId } from "../../../core/artwork";
import { useMemo, useRef } from "react";
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
  let d = \`M\${xs[0]!.toFixed(1)} \${ys[0]!.toFixed(1)}\`;
  for (let i = 0; i < xs.length - 1; i += 1) {
    const x0 = xs[i - 1] ?? xs[i]!, y0 = ys[i - 1] ?? ys[i]!;
    const x1 = xs[i]!, y1 = ys[i]!, x2 = xs[i + 1]!, y2 = ys[i + 1]!;
    const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
    d += \`C\${(x1 + (x2 - x0) / 6).toFixed(1)} \${(y1 + (y2 - y0) / 6).toFixed(1)} \${(x2 - (x3 - x1) / 6).toFixed(1)} \${(y2 - (y3 - y1) / 6).toFixed(1)} \${x2.toFixed(1)} \${y2.toFixed(1)}\`;
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

  useDecoration(ref, (time) => {
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
          ? \`M-12 \${y + a} C\${W * 0.2} \${H * 1.28 - t * H * 0.27 + a} \${W * 0.32} \${H * 0.34 + t * H * 0.21 + b} \${W * 0.46} \${H * 0.62 + t * H * 0.12} S\${W * 0.67} \${H * 1.14 - t * H * 0.09 + a} \${W * 0.8} \${H * 0.69 - t * H * 0.22 + b} S\${W * 0.94} \${H * 0.43 - t * H * 0.44 + a} \${W + 8} \${H * 0.21 + t * H * 0.45}\`
          : \`M-12 \${H * (0.9 + t * 0.12) + b} C\${W * 0.21} \${H * 0.98 + a} \${W * 0.33} \${H * 0.24 + t * H * 0.2 + a} \${W * 0.52} \${H * 0.75 + t * H * 0.25 + b} S\${W * 0.82} \${H * 0.38 + t * H * 0.27 + a} \${W + 8} \${H * (0.48 + t * 0.5) + b}\`,
      );
    });
    // Each comet rides its strand; its own dash animation moves it along.
    ref.current?.querySelectorAll<SVGPathElement>(".ad-neon-waves-comet").forEach((comet) => {
      const strand = paths?.[Number(comet.dataset.strand)];
      const d = strand?.getAttribute("d");
      if (d) comet.setAttribute("d", d);
    });
  });

  return (
    <svg
      {...mark("NeonWaves", p)}
      ref={ref}
      viewBox={\`0 0 \${W} \${H}\`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={\`\${id}-strand\`}>
          <stop stopColor="var(--ad-primary-700)" stopOpacity="0" />
          <stop offset=".16" stopColor="var(--ad-primary-600)" stopOpacity=".35" />
          <stop offset=".57" stopColor="var(--ad-red)" stopOpacity=".74" />
          <stop offset=".78" stopColor="var(--ad-pink)" stopOpacity=".85" />
          <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity=".44" />
        </linearGradient>
        {/* Comets fade in where the strands themselves come out of the dark. */}
        <linearGradient id={\`\${id}-fade\`}>
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset=".35" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={\`\${id}-comets\`} maskUnits="userSpaceOnUse" x={-20} y={-H} width={W + 40} height={H * 3}>
          <rect x={-20} y={-H} width={W + 40} height={H * 3} fill={\`url(#\${id}-fade)\`} />
        </mask>
      </defs>
      {Array.from({ length: strands }, (_, i) => (
        <path
          key={i}
          className="ad-neon-waves-strand"
          fill="none"
          stroke={\`url(#\${id}-strand)\`}
          strokeWidth={i === 5 ? 1 : 0.55}
          opacity={i === 5 ? 0.95 : 0.52}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <g mask={\`url(#\${id}-comets)\`}>
      {Array.from({ length: comets }, (_, i) => (
        <path
          key={\`comet-\${i}\`}
          className="ad-neon-waves-comet"
          data-strand={cometStrand(i, comets, strands)}
          fill="none"
          pathLength={100}
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: \`\${-((i * 6) / comets + 1.8) % 6}s\` }}
        />
      ))}
      </g>
      {dots.map((d, i) => (
        <circle
          key={i}
          className="ad-neon-waves-star"
          cx={d.x}
          cy={d.y}
          r={d.r}
          opacity={d.o}
          style={{ animationDelay: \`\${-(i % 9) * 0.45}s\` }}
        />
      ))}
    </svg>
  );
}
`,h=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function NeonWavesExample() {
  return (
    <Playground
      stretch
      knobs={{
        strands: { options: ["12", "22", "34"], value: "22" },
        stars: { value: true },
        shape: { options: ["twist", "ridge"], value: "twist" },
        comets: { options: ["0", "3", "6"], value: "3" },
      }}
      code={(v) =>
        jsx("NeonWaves", {
          strands: v.strands === "22" ? undefined : Number(v.strands),
          stars: v.stars ? undefined : { expr: "false" },
          shape: v.shape === "twist" ? undefined : v.shape,
          comets: v.comets === "0" ? undefined : Number(v.comets),
        })
      }
    >
      {(v) => <U.NeonWaves strands={Number(v.strands)} stars={v.stars} shape={v.shape as "twist" | "ridge"} comets={Number(v.comets)} />}
    </Playground>
  );
}
`,v=`export default {
  name: "NeonWaves",
  description:
    "Пучок текущих неоновых нитей со звёздами и бегущими по ним кометами света; форма «twist» или горный хребет «ridge» — живой фон карточек и шапок.",
  category: "motion",
  wide: true,
} as const;
`,b=`import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { clamp01, fbm, noise, type Painting } from "../../../core/noise";
import { useArtwork } from "../useArtwork";

export type PlanetProps = CommonProps;

/** Size of the picture in its own units; it is painted at whatever resolution it is shown. */
const W = 515;
const H = 114;

/** The rim of a dark planet rising from the bottom right, lit by a ruby atmosphere. */
const planet: Painting = {
  pixels(image, from, to) {
    const { width } = image;
    const scale = width / W,
      centerX = 344 * scale,
      centerY = 290 * scale,
      radius = 302 * scale;
    for (let y = from; y < to; y += 1)
      for (let x = 0; x < width; x += 1) {
        const dx = (x - centerX) / radius,
          dy = (y - centerY) / radius,
          radial = Math.hypot(dx, dy),
          edge = (1 - radial) * radius;
        const pixel = (y * width + x) * 4;
        if (radial > 1.12) continue;
        const light = clamp01(0.48 - dx * 0.8 - dy * 0.3, 0.08, 1.2);
        if (radial > 1) {
          const alpha = Math.exp(-(radial - 1) * 88) * 0.58 * light;
          image.data[pixel] = 255;
          image.data[pixel + 1] = 40;
          image.data[pixel + 2] = 82;
          image.data[pixel + 3] = 255 * alpha;
          continue;
        }
        const z = Math.sqrt(1 - dx * dx - dy * dy);
        const terrainNoise = fbm(dx * 18 + z * 7, dy * 21 + z * 5, 6);
        const crust = Math.pow(
          1 -
            Math.abs(
              noise(dx * 80 + 8 * terrainNoise, dy * 80 + 8 * terrainNoise) *
                2 -
                1,
            ),
          4,
        );
        const ridge = clamp01((terrainNoise - 0.38) * 5) * crust;
        const rim = Math.exp(-Math.max(0, edge) / (2.2 * scale)) * light;
        const bloom = Math.exp(-Math.max(0, edge) / (15 * scale)) * light;
        const shade = clamp01(0.48 - dx * 0.78 - z * 0.55, 0.07, 0.95);
        const terrain = (10 + 61 * ridge + 26 * terrainNoise) * shade;
        image.data[pixel] = terrain + rim * 239 + bloom * 75;
        image.data[pixel + 1] = terrain * 0.14 + rim * 165 + bloom * 8;
        image.data[pixel + 2] = terrain * 0.34 + rim * 183 + bloom * 25;
        image.data[pixel + 3] = 255;
      }
  },
};

/** Planet horizon banner; children are laid over the dark side. */
export function Planet({ children, ...p }: PlanetProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useArtwork(ref, "planet", W, H, planet);
  return (
    <div {...mark("Planet", p)}>
      <canvas ref={ref} aria-hidden />
      {children && <div className="ad-planet-content">{children}</div>}
    </div>
  );
}
`,y=`import { Planet } from "@ad-voice/ui";

export default function PlanetExample() {
  return <Planet />;
}
`,x=`export default {
  name: "Planet",
  description:
    "Кромка планеты в светящейся атмосфере цвета темы — фон для баннеров и слоганов.",
  category: "motion",
  wide: true,
} as const;
`,k=`import { useSvgId } from "../../../core/artwork";

import { mark, type CommonProps } from "../../../core/base";

export interface ServerArtProps extends CommonProps {
  /** Show an upload cloud above the rack (deployment scenes). */
  upload?: boolean;
  label?: string;
}

/** Neon server rack: LEDs blink, a light runs along its edge, a spark twinkles above. */
export function ServerArt({ upload = false, label, ...p }: ServerArtProps) {
  const id = useSvgId();
  const url = (name: string) => \`url(#\${id}-\${name})\`;
  return (
    <svg
      {...mark("ServerArt", p)}
      viewBox="0 0 180 170"
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <defs>
        <linearGradient id={\`\${id}-front\`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--ad-primary-700)" />
          <stop offset=".22" stopColor="var(--ad-primary-900)" />
          <stop offset=".72" stopColor="var(--ad-neutral-900)" />
          <stop offset="1" stopColor="var(--ad-primary-800)" />
        </linearGradient>
        <linearGradient id={\`\${id}-side\`} x1="0" y1="0" x2=".9" y2="1">
          <stop stopColor="var(--ad-primary-800)" />
          <stop offset=".27" stopColor="var(--ad-primary-900)" />
          <stop offset="1" stopColor="var(--ad-neutral-950)" />
        </linearGradient>
        <linearGradient id={\`\${id}-top\`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor="var(--ad-secondary-200)" />
          <stop offset=".23" stopColor="var(--ad-primary-600)" />
          <stop offset=".57" stopColor="var(--ad-primary-800)" />
          <stop offset="1" stopColor="var(--ad-neutral-900)" />
        </linearGradient>
        <linearGradient id={\`\${id}-edge\`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--ad-secondary-200)" />
          <stop offset=".29" stopColor="var(--ad-primary)" />
          <stop offset=".52" stopColor="var(--ad-primary-700)" />
          <stop offset=".8" stopColor="var(--ad-primary)" />
          <stop offset="1" stopColor="var(--ad-primary-700)" />
        </linearGradient>
        <radialGradient id={\`\${id}-aura\`}>
          <stop stopColor="var(--ad-primary)" stopOpacity=".28" />
          <stop offset=".6" stopColor="var(--ad-primary)" stopOpacity=".06" />
          <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />
        </radialGradient>
        <filter id={\`\${id}-bloom\`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {upload && (
        <g className="ad-server-cloud">
          <path
            d="M57 40C37 42 40 16 58 20 63-5 96-4 102 18 120 13 132 32 117 42Z"
            fill="var(--ad-primary-900)"
            stroke="var(--ad-secondary)"
            strokeOpacity=".65"
            strokeWidth=".7"
          />
          <path d="M80 37V18m-7 7 7-7 7 7" stroke="var(--ad-secondary)" strokeWidth="1.5" />
        </g>
      )}
      <g transform={upload ? "translate(0 15)" : undefined}>
        <ellipse
          cx="89"
          cy="124"
          rx="76"
          ry="22"
          fill={url("aura")}
          className="ad-art-aura"
        />
        <path
          d="M26 43 98 29 150 45 75 61Z"
          fill={url("top")}
          stroke={url("edge")}
          strokeWidth=".75"
        />
        <path
          d="M98 29 150 45 150 119 98 107Z"
          fill={url("side")}
          stroke="var(--ad-primary-700)"
          strokeWidth=".7"
        />
        <path
          d="M26 43 98 29 98 107 26 121Z"
          fill={url("front")}
          stroke={url("edge")}
          strokeWidth="1"
        />
        <path
          d="M29 46 94 33 94 105 29 117Z"
          fill="var(--ad-neutral-900)"
          stroke="var(--ad-primary-600)"
          strokeOpacity=".45"
          strokeWidth=".65"
        />
        {Array.from({ length: 15 }, (_, row) => (
          <g key={row}>
            <path
              d={\`M33 \${50 + row * 3.35} 90 \${38.8 + row * 3.35}\`}
              stroke="var(--ad-primary-700)"
              strokeOpacity=".58"
            />
            {Array.from({ length: 9 }, (__, col) => (
              <path
                key={col}
                d={\`M\${34 + col * 6.15} \${49.8 + row * 3.35 - col * 1.205}l2.6-.51\`}
                stroke="var(--ad-neutral-950)"
                strokeWidth="1.65"
              />
            ))}
          </g>
        ))}
        <path
          d="M27 44 98 30 147 45"
          stroke="var(--ad-secondary-200)"
          strokeWidth="3"
          opacity=".35"
          filter={url("bloom")}
        />
        <path d="M27 44 98 30 147 45" stroke="var(--ad-secondary-200)" strokeWidth=".75" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <path
              d={\`M107 \${52 + i * 7.5}l34 9v4l-34-9Z\`}
              fill="var(--ad-neutral-950)"
              stroke="var(--ad-primary-800)"
              strokeWidth=".55"
            />
            <path
              d={\`M109 \${54 + i * 7.5}l3 .8\`}
              className="ad-server-led"
              strokeWidth="1.4"
              style={{ animationDelay: \`\${-i * 0.34}s\` }}
            />
          </g>
        ))}
        <path
          d="M31 108 93 96v8l-62 12Z"
          fill="var(--ad-primary-900)"
          stroke="var(--ad-primary-700)"
          strokeWidth=".55"
        />
        <path d="M35 110l20-4" className="ad-server-glow" strokeWidth="1.1" />
        <circle cx="85" cy="103.5" r="1.5" className="ad-server-dot" />
        <path
          d="M27 43 98 29 98 107 27 121Z"
          pathLength="100"
          className="ad-server-orbit"
        />
        <path
          d="M26 125 98 112 150 126v14l-73 10-51-10Z"
          fill={url("side")}
          stroke="var(--ad-primary-700)"
          strokeWidth=".6"
        />
        <path
          d="M26 125 98 112v15l-72 13Z"
          fill={url("front")}
          stroke="var(--ad-primary-600)"
          strokeWidth=".65"
        />
        <path
          d="M33 130 83 121m-50 13 41-7"
          stroke="var(--ad-primary-700)"
          strokeWidth=".8"
        />
        <circle
          cx="91"
          cy="121.5"
          r="1.3"
          className="ad-server-dot"
          style={{ animationDelay: "-1.7s" }}
        />
      </g>
      <g className="ad-art-spark">
        <path d="M114 27h14m-7-10v20" stroke="var(--ad-secondary-100)" strokeWidth=".65" />
        <circle cx="121" cy="27" r="2.6" fill="var(--ad-neutral-200)" />
      </g>
    </svg>
  );
}
`,_=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ServerArtExample() {
  return (
    <Playground
      knobs={{ upload: { value: false } }}
      code={(v) =>
        jsx("ServerArt", { label: "Сервер комнат", upload: v.upload })
      }
    >
      {(v) => <U.ServerArt label="Сервер комнат" upload={v.upload} />}
    </Playground>
  );
}
`,w=`export default {\r
  name: "ServerArt",\r
  description:\r
    "Неоновая серверная стойка с мигающими светодиодами — для сервисов и развёртывания.",\r
  category: "motion",\r
} as const;\r
`,P=`import { useSvgId } from "../../../core/artwork";
import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";

export interface SpectrumProps extends CommonProps {
  /** Segmented level columns, or smooth glowing bars in a bell shape. */
  variant?: "segmented" | "bars";
}

const COLUMNS = 27;
const ROWS = 29;
const BARS = 23;

/** A living audio spectrum used as decoration behind level and monitoring panels. */
export function Spectrum({ variant = "segmented", ...p }: SpectrumProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useSvgId();

  useDecoration(ref, (time) => {
    const svg = ref.current;
    if (!svg) return;
    if (variant === "segmented") {
      // Columns rise more towards the edges, each on its own beat.
      svg.querySelectorAll<SVGRectElement>("[data-mask]").forEach((mask, i) => {
        const edge = Math.abs(i - 13) / 13;
        const height =
          12 +
          edge *
            (37 + (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.59)) ** 1.7 * 142);
        mask.setAttribute("y", (232 - height).toFixed(1));
        mask.setAttribute("height", height.toFixed(1));
      });
      return;
    }
    svg.querySelectorAll<SVGRectElement>("[data-bar]").forEach((bar, i) => {
      const envelope = Math.exp(-(((i - 16) / 6) ** 2));
      const rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);
      const height =
        9 +
        100 * envelope * (0.53 + 0.47 * rhythm) +
        15 * Math.sin(i * 0.67 + time * 0.58) ** 2;
      bar.setAttribute("y", (134 - height).toFixed(2));
      bar.setAttribute("height", height.toFixed(2));
    });
  });

  return (
    <svg
      {...mark("Spectrum", p)}
      ref={ref}
      data-variant={variant}
      viewBox={variant === "segmented" ? "0 0 325 232" : "0 0 163 140"}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {variant === "segmented" ? (
        <>
          <defs>
            {Array.from({ length: COLUMNS }, (_, i) => (
              <clipPath key={i} id={\`\${id}-c\${i}\`}>
                <rect data-mask x={i * 12 + 3} y="232" width="8" height="0" />
              </clipPath>
            ))}
          </defs>
          {Array.from({ length: COLUMNS }, (_, i) => (
            <g key={i} clipPath={\`url(#\${id}-c\${i})\`}>
              {Array.from({ length: ROWS }, (__, row) => (
                <rect
                  key={row}
                  x={i * 12 + 3}
                  y={224 - row * 7}
                  width="8"
                  height="5"
                  rx=".35"
                  opacity={0.17 + row / 35}
                />
              ))}
            </g>
          ))}
        </>
      ) : (
        <>
          <defs>
            <linearGradient id={\`\${id}-bar\`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="var(--ad-secondary-200)" />
              <stop offset=".24" stopColor="var(--ad-red)" />
              <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: BARS }, (_, i) => (
            <rect
              key={i}
              data-bar
              x={4 + i * 6.75}
              y="40"
              width="2.8"
              height="100"
              rx="1.3"
              fill={\`url(#\${id}-bar)\`}
              opacity={0.55 + i / 55}
            />
          ))}
        </>
      )}
    </svg>
  );
}
`,S=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function SpectrumExample() {
  return (
    <Playground
      knobs={{
        variant: {
          options: ["segmented", "bars"] as const,
          value: "segmented",
        },
      }}
      code={(_, c) => jsx("Spectrum", { variant: c.variant })}
    >
      {(v) => <U.Spectrum variant={v.variant} />}
    </Playground>
  );
}
`,T=`export default {\r
  name: "Spectrum",\r
  description:\r
    "Живой спектр: сегментные колонки уровня или столбики «колоколом».",\r
  category: "motion",\r
} as const;\r
`,C=`import { canPaint, createResizeObserver } from "../../core/environment";\r
import { useEffect, type RefObject } from "react";\r
import { paintCanvas, type Painting } from "../../core/noise";\r
\r
/** Most pixels one picture may take: sharp on large hi-dpi screens, still quick to paint. */\r
const BUDGET = 3_200_000;\r
\r
/**\r
 * Paints a procedural picture at the resolution its canvas is actually shown at (the box\r
 * it covers times the screen's pixel density), so nothing is upscaled into blocks or\r
 * stair-stepped edges. Repaints sharper when the box grows; reveals the canvas when ready.\r
 */\r
export function useArtwork(\r
  ref: RefObject<HTMLCanvasElement | null>,\r
  key: string,\r
  width: number,\r
  height: number,\r
  painting: Painting,\r
) {\r
  useEffect(() => {\r
    const canvas = ref.current;\r
    if (!canvas) return;\r
    let shown = 0;\r
    let alive = true;\r
    const paint = () => {\r
      if (!canPaint()) return;\r
      const box = canvas.getBoundingClientRect();\r
      const density = window.devicePixelRatio || 1;\r
      const wanted = Math.max(box.width / width, box.height / height) * density;\r
      const limit = Math.sqrt(BUDGET / (width * height));\r
      // Steps of a quarter keep the cache small while resizing.\r
      const scale = Math.min(limit, Math.max(1, Math.ceil(wanted * 4) / 4));\r
      if (scale <= shown) return;\r
      shown = scale;\r
      const w = Math.round(width * scale);\r
      const h = Math.round(height * scale);\r
      void paintCanvas(key, w, h, painting).then((picture) => {\r
        if (!alive || scale !== shown) return;\r
        canvas.width = w;\r
        canvas.height = h;\r
        canvas.getContext("2d")?.drawImage(picture, 0, 0);\r
        canvas.dataset.ready = "";\r
      });\r
    };\r
    const observer = createResizeObserver(paint);\r
    observer.observe(canvas);\r
    return () => {\r
      alive = false;\r
      observer.disconnect();\r
    };\r
  }, [ref, key, width, height, painting]);\r
}\r
`,M=`import { useRef, useState } from "react";\r
import { assignRef, useControllable } from "../../../core/base";\r
import { Popover } from "../../feedback/Popover/Popover";\r
import { FieldFrame, fieldLabel, useFieldIds, OptionList, toOption } from "../internal";\r
import { IconButton } from "../IconButton/IconButton";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { AutocompleteProps } from "../shared";\r
\r
export const Autocomplete = ({\r
  options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO"],\r
  onOptionSelect,\r
  value,\r
  defaultValue = "",\r
  onValueChange,\r
  label,\r
  description,\r
  error,\r
  startAdornment,\r
  endAdornment,\r
  clearable,\r
  inputRef,\r
  className,\r
  size,\r
  variant,\r
  labelPlacement = "top",\r
  tone: _tone,\r
  material: _material,\r
  style: _style,\r
  children: _children,\r
  ...input\r
}: AutocompleteProps) => {\r
  const [current, setCurrent] = useControllable(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const [open, setOpen] = useState(false);\r
  const [active, setActive] = useState(0);\r
  const inputNode = useRef<HTMLInputElement>(null);\r
  const box = useRef<HTMLDivElement>(null);\r
  const all = options.map(toOption);\r
  // A value that already names an option shows the whole list, like a reopened select.\r
  const query = all.some((o) => o.label === current)\r
    ? ""\r
    : current.trim().toLocaleLowerCase();\r
  const filtered = all.filter(\r
    (o) =>\r
      !query ||\r
      o.label.toLocaleLowerCase().includes(query) ||\r
      o.value.toLocaleLowerCase().includes(query),\r
  );\r
  const listId = \`\${input.id ?? "ad-autocomplete"}-listbox\`;\r
  const choose = (next: string) => {\r
    setCurrent(next);\r
    onOptionSelect?.(next);\r
    setOpen(false);\r
    inputNode.current?.focus();\r
  };\r
  const ids = useFieldIds(label, description || error);\r
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      ids={ids}\r
      className={\`ad-autocomplete-shell \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={input.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        ref={box}\r
        size={size}\r
        variant={variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(label, input.required) : undefined}\r
        filled={!!current}\r
        disabled={input.disabled}\r
        readOnly={input.readOnly}\r
        error={!!error}\r
        startAdornment={startAdornment}\r
        endAdornment={\r
          <>\r
            {clearable && current && (\r
              <IconButton\r
                size="xs"\r
                variant="ghost"\r
                icon="close"\r
                label="Очистить"\r
                onClick={() => {\r
                  setCurrent("");\r
                  setOpen(true);\r
                }}\r
              />\r
            )}\r
            {endAdornment}\r
            <IconButton\r
              size="xs"\r
              variant="ghost"\r
              icon="chevron"\r
              label="Показать варианты"\r
              aria-expanded={open}\r
              onClick={() => {\r
                setOpen((v) => !v);\r
                inputNode.current?.focus();\r
              }}\r
            />\r
          </>\r
        }\r
      >\r
        <input\r
          {...ids.aria}\r
          {...input}\r
          className="ad-autocomplete-input"\r
          ref={(n) => {\r
            inputNode.current = n;\r
            assignRef(inputRef, n);\r
          }}\r
          value={current}\r
          role="combobox"\r
          aria-autocomplete="list"\r
          aria-expanded={open}\r
          aria-controls={open ? listId : undefined}\r
          onFocus={() => setOpen(true)}\r
          onChange={(e) => {\r
            setCurrent(e.currentTarget.value);\r
            setOpen(true);\r
            setActive(0);\r
          }}\r
          onKeyDown={(e) => {\r
            if (e.key === "ArrowDown") {\r
              e.preventDefault();\r
              setOpen(true);\r
              setActive((i) => Math.min(filtered.length - 1, i + 1));\r
            } else if (e.key === "ArrowUp") {\r
              e.preventDefault();\r
              setActive((i) => Math.max(0, i - 1));\r
            } else if (e.key === "Enter" && open && filtered[active]) {\r
              e.preventDefault();\r
              choose(filtered[active].value);\r
            } else if (e.key === "Escape") setOpen(false);\r
          }}\r
        />\r
      </InputBase>\r
      <Popover\r
        open={open && filtered.length > 0}\r
        onOpenChange={setOpen}\r
        anchorRef={box}\r
        autoFocus={false}\r
        role="listbox"\r
        align="start"\r
        matchAnchorWidth\r
        className="ad-option-popover ad-autocomplete-popover"\r
        label={typeof label === "string" ? label : "Подсказки"}\r
      >\r
        <OptionList\r
          id={listId}\r
          options={filtered}\r
          selected={current}\r
          active={active}\r
          onChoose={choose}\r
          onHover={setActive}\r
        />\r
      </Popover>\r
    </FieldFrame>\r
  );\r
};\r
`,R=`import {\r
  Playground,\r
  U,\r
  expr,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
const options = [\r
  "WASAPI Shared",\r
  "WASAPI Exclusive",\r
  "ASIO",\r
  "DirectSound",\r
  "Core Audio",\r
];\r
\r
export default function AutocompleteExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        floating: { value: true },\r
        clearable: { value: true },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        \`const options = \${JSON.stringify(options)};\\n\\n\` +\r
        jsx("Autocomplete", {\r
          label: "Аудиодрайвер",\r
          placeholder: "Начните вводить…",\r
          description: "Подсказки фильтруются по мере ввода",\r
          options: expr("options"),\r
          startAdornment: expr('<Icon name="search" />'),\r
          variant: c.variant,\r
          size: c.size,\r
          labelPlacement: v.floating ? "floating" : undefined,\r
          clearable: v.clearable,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Autocomplete\r
          label="Аудиодрайвер"\r
          placeholder="Начните вводить…"\r
          description="Подсказки фильтруются по мере ввода"\r
          options={options}\r
          startAdornment={<U.Icon name="search" />}\r
          variant={v.variant}\r
          size={v.size}\r
          labelPlacement={v.floating ? "floating" : "top"}\r
          clearable={v.clearable}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,E=`export default {\r
  name: "Autocomplete",\r
  description:\r
    "TextField с подсказками вариантов; отдельная логика только для выбора.",\r
  category: "fields",\r
};\r
`,A=`import { buttonView, type ButtonProps } from "../shared";\r
\r
export const Button = (p: ButtonProps) => buttonView(p);\r
`,B=`import {\r
  Playground,\r
  U,\r
  buttonVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
export default function ButtonExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        variant: { options: buttonVariants, value: "primary" },\r
        size: { options: sizes, value: "md" },\r
        icon: { value: true },\r
        loading: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx(\r
          "Button",\r
          {\r
            variant: v.variant === "secondary" ? undefined : v.variant,\r
            size: c.size,\r
            icon: v.icon ? "save" : undefined,\r
            loading: v.loading,\r
            disabled: v.disabled,\r
          },\r
          "Сохранить",\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Button\r
          variant={v.variant}\r
          size={v.size}\r
          icon={v.icon ? "save" : undefined}\r
          loading={v.loading}\r
          disabled={v.disabled}\r
        >\r
          Сохранить\r
        </U.Button>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,I=`export default {\r
  name: "Button",\r
  description: "Primary, secondary, ghost, danger и размеры",\r
  category: "buttons",\r
} as const;\r
`,N=`import { BooleanControl, type BooleanProps } from "../shared";\r
\r
export const Checkbox = (p: BooleanProps) => (\r
  <BooleanControl kind="Checkbox" {...p} />\r
);\r
`,z=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function CheckboxExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("Checkbox", {\r
          label: "Сохранять запись после выступления",\r
          defaultChecked: true,\r
          size: c.size,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack gap={3}>\r
          <U.Checkbox\r
            label="Сохранять запись после выступления"\r
            defaultChecked\r
            size={v.size}\r
            disabled={v.disabled}\r
          />\r
          <U.Checkbox\r
            label="Отправлять анализ на почту"\r
            size={v.size}\r
            disabled={v.disabled}\r
          />\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,L=`export default {\r
  name: "Checkbox",\r
  description: "Отметка параметра или согласия",\r
  category: "fields",\r
} as const;\r
`,D=`import { useRef, useState } from "react";
import { mark } from "../../../core/base";
import { Button } from "../Button/Button";
import { Icon } from "../../layout/Icon/Icon";
import type { FilePickerProps } from "../shared";
export const FilePicker = (p: FilePickerProps) => {
  const input = useRef<HTMLInputElement>(null),
    [names, setNames] = useState(""),
    [over, setOver] = useState(false);
  const choose = () => (p.onPick ? p.onPick() : input.current?.click());
  const take = (files: File[]) => {
    setNames(files.map((f) => f.name).join(", "));
    p.onFiles?.(files);
  };
  const picked = p.value ?? names;
  if (p.variant === "zone")
    return (
      <button
        type="button"
        {...mark("FilePicker", p)}
        data-variant="zone"
        data-over={over || undefined}
        disabled={p.disabled}
        onClick={choose}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(Array.from(e.dataTransfer.files));
        }}
      >
        <Icon name={p.icon ?? "upload"} />
        <span className="ad-file-picker-text">
          <strong>{p.label ?? "Выбрать файл"}</strong>
          <small key={picked} data-picked={!!picked || undefined}>
            {picked || p.description || "или перетащите его сюда"}
          </small>
        </span>
        <input
          type="file"
          ref={input}
          hidden
          accept={p.accept}
          multiple={p.multiple}
          onChange={(e) => {
            take(Array.from(e.currentTarget.files ?? []) as File[]);
            e.currentTarget.value = "";
          }}
        />
      </button>
    );
  return (
    <div {...mark("FilePicker", p)}>
      <Button
        size={p.size}
        icon={p.icon ?? "folder"}
        disabled={p.disabled}
        onClick={choose}
      >
        {p.label ?? "Выбрать файл"}
      </Button>
      <small key={picked} data-picked={!!picked || undefined}>
        {picked || p.description || "Файл не выбран"}
      </small>
      <input
        type="file"
        ref={input}
        hidden
        accept={p.accept}
        multiple={p.multiple}
        onChange={(e) => {
          take(Array.from(e.currentTarget.files ?? []) as File[]);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
};
`,F=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function FilePickerExample() {
  return (
    <Playground
      knobs={{
        variant: { options: ["button", "zone"], value: "button" },
        size: { options: sizes, value: "md" },
        multiple: { value: false },
      }}
      code={(v, c) =>
        jsx("FilePicker", {
          label: "Выбрать запись",
          description: "WAV, MP3 или FLAC",
          accept: "audio/*",
          multiple: v.multiple,
          size: c.size,
          variant: v.variant === "button" ? undefined : v.variant,
        })
      }
    >
      {(v) => (
        <U.FilePicker
          label="Выбрать запись"
          description="WAV, MP3 или FLAC"
          accept="audio/*"
          multiple={v.multiple}
          size={v.size}
          variant={v.variant as "button" | "zone"}
        />
      )}
    </Playground>
  );
}
`,V=`export default {\r
  name: "FilePicker",\r
  description: "Локальный выбор файлов без отправки",\r
  category: "fields",\r
} as const;\r
`,$=`import { buttonView, type IconButtonProps } from "../shared";\r
\r
export const IconButton = (p: IconButtonProps) =>\r
  buttonView(\r
    {\r
      ...p,\r
      icon: p.icon ?? "more",\r
      children: p.children ?? null,\r
      label: undefined,\r
      "aria-label": p.label,\r
      title: p.title ?? p.label,\r
    },\r
    "IconButton",\r
  );\r
`,O=`import {\r
  Playground,\r
  U,\r
  buttonVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
const icons = {\r
  primary: "play",\r
  secondary: "settings",\r
  ghost: "more",\r
  danger: "trash",\r
};\r
\r
export default function IconButtonExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        variant: { options: buttonVariants, value: "primary" },\r
        size: { options: sizes, value: "md" },\r
        round: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("IconButton", {\r
          icon: icons[v.variant as keyof typeof icons],\r
          label: "Воспроизвести",\r
          variant: v.variant === "secondary" ? undefined : v.variant,\r
          size: c.size,\r
          round: v.round,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.IconButton\r
          icon={icons[v.variant as keyof typeof icons]}\r
          label="Воспроизвести"\r
          variant={v.variant}\r
          size={v.size}\r
          round={v.round}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,H=`export default {\r
  name: "IconButton",\r
  description: "Компактная кнопка с одной иконкой",\r
  category: "buttons",\r
} as const;\r
`,U=`import type { MouseEventHandler, ReactNode, Ref } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import type { InputVariant } from "../shared";\r
\r
export interface InputBaseProps extends CommonProps {\r
  startAdornment?: ReactNode;\r
  endAdornment?: ReactNode;\r
  disabled?: boolean;\r
  readOnly?: boolean;\r
  error?: boolean;\r
  multiline?: boolean;\r
  variant?: InputVariant;\r
  /** Floating label drawn inside the box; it rises when focused or filled. */\r
  label?: ReactNode;\r
  /** Id of the floating label, for the control's aria-labelledby. */\r
  labelId?: string;\r
  /** The control has a value, so a floating label stays raised. */\r
  filled?: boolean;\r
  ref?: Ref<HTMLDivElement>;\r
  onClick?: MouseEventHandler<HTMLDivElement>;\r
}\r
\r
export const InputBase = ({\r
  startAdornment,\r
  endAdornment,\r
  disabled,\r
  readOnly,\r
  error,\r
  multiline,\r
  variant = "outlined",\r
  label,\r
  labelId,\r
  filled,\r
  ref,\r
  onClick,\r
  children,\r
  ...p\r
}: InputBaseProps) => (\r
  <div\r
    {...mark("InputBase", p, "input")}\r
    ref={ref}\r
    data-disabled={disabled || undefined}\r
    data-readonly={readOnly || undefined}\r
    data-invalid={error || undefined}\r
    data-multiline={multiline || undefined}\r
    data-ad-variant={variant}\r
    data-floating={label ? "" : undefined}\r
    data-filled={filled || undefined}\r
    onClick={onClick}\r
  >\r
    {startAdornment && (\r
      <span className="ad-input-adornment" data-position="start">\r
        {startAdornment}\r
      </span>\r
    )}\r
    <span className="ad-input-base-content">\r
      {label && <span className="ad-input-label" id={labelId}>{label}</span>}\r
      {children}\r
    </span>\r
    {endAdornment && (\r
      <span className="ad-input-adornment" data-position="end">\r
        {endAdornment}\r
      </span>\r
    )}\r
  </div>\r
);\r
`,W=`import {\r
  Playground,\r
  U,\r
  expr,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
/** InputBase is the bare box behind every field: use it for custom controls. */\r
export default function InputBaseExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        error: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx(\r
          "InputBase",\r
          {\r
            startAdornment: expr('<Icon name="search" />'),\r
            variant: c.variant,\r
            size: c.size,\r
            error: v.error,\r
            disabled: v.disabled,\r
          },\r
          '<input placeholder="Своё поле" />',\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.InputBase\r
          startAdornment={<U.Icon name="search" />}\r
          variant={v.variant}\r
          size={v.size}\r
          error={v.error}\r
          disabled={v.disabled}\r
        >\r
          <input\r
            aria-label="Своё поле"\r
            placeholder="Своё поле"\r
            disabled={v.disabled}\r
          />\r
        </U.InputBase>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,K=`export default {\r
  name: "InputBase",\r
  description:\r
    "Низкоуровневая база всех полей: общий material, focus, размеры и adornments.",\r
  category: "fields",\r
};\r
`,G=`import type { AnchorHTMLAttributes, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
\r
export interface LinkProps\r
  extends\r
    CommonProps,\r
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "color"> {\r
  href?: string;\r
  icon?: string;\r
  endIcon?: string;\r
  external?: boolean;\r
  underline?: "none" | "hover" | "always";\r
  children?: ReactNode;\r
}\r
\r
export function Link({\r
  href = "#",\r
  icon,\r
  endIcon,\r
  external,\r
  underline = "hover",\r
  children,\r
  ...props\r
}: LinkProps) {\r
  return (\r
    <a\r
      {...props}\r
      {...mark("Link", props)}\r
      href={href}\r
      target={external ? "_blank" : props.target}\r
      rel={external ? "noreferrer" : props.rel}\r
      data-ad-underline={underline}\r
    >\r
      {icon && <Icon name={icon} />}\r
      {children}\r
      {endIcon && <Icon name={endIcon} />}\r
    </a>\r
  );\r
}\r
`,j=`import { Link, Stack } from "@ad-voice/ui";\r
\r
export default function LinkExample() {\r
  return (\r
    <Stack direction="row" gap={4} wrap>\r
      <Link href="#/components/button">Документация</Link>\r
      <Link href="#/components/button" icon="document">\r
        С иконкой\r
      </Link>\r
      <Link href="https://react.dev" external underline="always">\r
        Внешняя ссылка\r
      </Link>\r
    </Stack>\r
  );\r
}\r
`,q=`export default {
  name: "Link",
  description: "Семантическая ссылка для навигации и inline-actions.",
  category: "navigation",
};
`,Y=`import { classes, clamp, useControllable } from "../../../core/base";\r
import { IconButton } from "../IconButton/IconButton";\r
import { TextField } from "../TextField/TextField";\r
import type { NumberFieldProps } from "../shared";\r
\r
export const NumberField = ({\r
  value,\r
  defaultValue = 0,\r
  onValueChange,\r
  min,\r
  max,\r
  step = 1,\r
  endAdornment,\r
  className,\r
  controls = true,\r
  ...p\r
}: NumberFieldProps) => {\r
  const [current, setCurrent] = useControllable<number | "">(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const low = min === undefined ? -Infinity : Number(min);\r
  const high = max === undefined ? Infinity : Number(max);\r
  const locked = p.disabled || p.readOnly;\r
  // toFixed avoids 0.1 + 0.2 style drift when stepping by fractions.\r
  const nudge = (direction: 1 | -1) =>\r
    setCurrent(\r
      clamp(\r
        Number(((current || 0) + direction * Number(step)).toFixed(10)),\r
        low,\r
        high,\r
      ),\r
    );\r
  return (\r
    <TextField\r
      {...p}\r
      className={classes("ad-number-field", className)}\r
      type="number"\r
      inputMode="decimal"\r
      min={min}\r
      max={max}\r
      step={step}\r
      value={String(current)}\r
      onValueChange={(v) => setCurrent(v === "" ? "" : Number(v))}\r
      endAdornment={\r
        <>\r
          {endAdornment}\r
          {controls && <>\r
          <IconButton\r
            size="xs"\r
            variant="ghost"\r
            icon="minus"\r
            label="Уменьшить"\r
            disabled={locked || (current !== "" && current <= low)}\r
            onClick={() => nudge(-1)}\r
          />\r
          <IconButton\r
            size="xs"\r
            variant="ghost"\r
            icon="plus"\r
            label="Увеличить"\r
            disabled={locked || (current !== "" && current >= high)}\r
            onClick={() => nudge(1)}\r
          />\r
          </>}\r
        </>\r
      }\r
    />\r
  );\r
};\r
`,X=`import {\r
  Playground,\r
  U,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
export default function NumberFieldExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        floating: { value: true },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("NumberField", {\r
          label: "Задержка, мс",\r
          description: "От 0 до 500 с шагом 10",\r
          min: 0,\r
          max: 500,\r
          step: 10,\r
          defaultValue: 120,\r
          variant: c.variant,\r
          size: c.size,\r
          labelPlacement: v.floating ? "floating" : undefined,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.NumberField\r
          label="Задержка, мс"\r
          description="От 0 до 500 с шагом 10"\r
          min={0}\r
          max={500}\r
          step={10}\r
          defaultValue={120}\r
          variant={v.variant}\r
          size={v.size}\r
          labelPlacement={v.floating ? "floating" : "top"}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Z=`export default {\r
  name: "NumberField",\r
  description: "Число с диапазоном и шагом",\r
  category: "fields",\r
} as const;\r
`,J=`import { mark } from "../../../core/base";
import { type TabItem, type TabsProps } from "../shared";
import { Tabs } from "../Tabs/Tabs";

export const SegmentedControl = <V extends string = string>(
  p: TabsProps<V>,
) => (
  <div {...mark("SegmentedControl", p)}>
    <Tabs<V>
      {...p}
      items={
        p.items ??
        ([
          { value: "list", label: "Список", icon: "list" },
          { value: "grid", label: "Плитка", icon: "grid" },
        ] as TabItem<V>[])
      }
    />
  </div>
);
`,Q=`import { useState } from "react";\r
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
const items = [\r
  { value: "list", label: "Список", icon: "list" },\r
  { value: "grid", label: "Плитка", icon: "grid" },\r
  { value: "wave", label: "Волна", icon: "wave" },\r
];\r
\r
export default function SegmentedControlExample() {\r
  const [view, setView] = useState("list");\r
  return (\r
    <Playground\r
      knobs={{ size: { options: sizes, value: "md" } }}\r
      code={(_, c) =>\r
        \`const items = \${JSON.stringify(items)};\\n\\n\` +\r
        jsx("SegmentedControl", {\r
          label: "Вид",\r
          items: expr("items"),\r
          value: expr("view"),\r
          onValueChange: expr("setView"),\r
          size: c.size,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.SegmentedControl\r
          label="Вид"\r
          items={items}\r
          value={view}\r
          onValueChange={setView}\r
          size={v.size}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,nn=`export default {\r
  name: "SegmentedControl",\r
  description: "Выбор представления или инструмента",\r
  category: "navigation",\r
} as const;\r
`,en=`import { useRef, useState } from "react";\r
import { assignRef, useControllable } from "../../../core/base";\r
import { Popover } from "../../feedback/Popover/Popover";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { FieldFrame, fieldLabel, useFieldIds, OptionList, toOption } from "../internal";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { SelectProps } from "../shared";\r
\r
export function Select<V extends string = string>(p: SelectProps<V>) {\r
  const ids = useFieldIds(p.label, p.description || p.error);\r
  const floating = p.labelPlacement === "floating" && !!p.label;\r
  const options = (p.options ?? ["Первый вариант", "Второй вариант"]).map(\r
    toOption,\r
  );\r
  const [value, setValue] = useControllable<string>(\r
    p.value,\r
    p.defaultValue ?? (p.placeholder ? "" : (options[0]?.value ?? "")),\r
    p.onValueChange as ((value: string) => void) | undefined,\r
  );\r
  const [open, setOpen] = useState(false);\r
  const anchor = useRef<HTMLButtonElement>(null);\r
  const box = useRef<HTMLDivElement>(null);\r
  const selected = options.find((option) => option.value === value);\r
  const choose = (next: string) => {\r
    setValue(next);\r
    setOpen(false);\r
    anchor.current?.focus();\r
  };\r
  return (\r
    <FieldFrame\r
      ids={ids}\r
      className={\`ad-select-shell \${p.className ?? ""}\`}\r
      label={floating ? undefined : p.label}\r
      required={p.required}\r
      description={p.description}\r
      error={p.error}\r
    >\r
      <InputBase\r
        ref={box}\r
        size={p.size}\r
        variant={p.variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(p.label, p.required) : undefined}\r
        filled={!!selected}\r
        disabled={p.disabled}\r
        error={!!p.error}\r
        startAdornment={\r
          p.startAdornment ?? (p.icon ? <Icon name={p.icon} /> : undefined)\r
        }\r
        endAdornment={\r
          <>\r
            {p.endAdornment}\r
            <Icon name="chevron" className="ad-select-chevron" />\r
          </>\r
        }\r
      >\r
        <button\r
          ref={(n) => {\r
            anchor.current = n;\r
            assignRef(p.ref, n);\r
          }}\r
          type="button"\r
          id={\`\${ids.label}control\`}\r
          // The name reads as "label, chosen value", like a native select.\r
          aria-labelledby={p.label ? \`\${ids.label} \${ids.label}control\` : undefined}\r
          aria-describedby={ids.aria["aria-describedby"]}\r
          className="ad-input-control ad-select-control"\r
          disabled={p.disabled}\r
          aria-haspopup="listbox"\r
          aria-expanded={open}\r
          aria-required={p.required || undefined}\r
          data-placeholder={!selected || undefined}\r
          onClick={() => setOpen((v) => !v)}\r
        >\r
          {selected?.label ?? p.placeholder ?? "Выберите значение"}\r
        </button>\r
      </InputBase>\r
      {p.name && <input type="hidden" name={p.name} value={value} />}\r
      <Popover\r
        open={open}\r
        onOpenChange={(next) => {\r
          setOpen(next);\r
          if (!next) anchor.current?.focus();\r
        }}\r
        anchorRef={box}\r
        role="listbox"\r
        align="start"\r
        matchAnchorWidth\r
        className="ad-option-popover"\r
        label={typeof p.label === "string" ? p.label : "Варианты"}\r
      >\r
        <OptionList options={options} selected={value} onChoose={choose} />\r
      </Popover>\r
    </FieldFrame>\r
  );\r
}\r
`,rn=`import {\r
  Playground,\r
  U,\r
  expr,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
const options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO", "DirectSound"];\r
\r
export default function SelectExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        floating: { value: true },\r
        icon: { value: true },\r
        error: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        \`const options = \${JSON.stringify(options)};\\n\\n\` +\r
        jsx("Select", {\r
          label: "Аудиодрайвер",\r
          placeholder: "Выберите драйвер",\r
          options: expr("options"),\r
          icon: v.icon ? "audio" : undefined,\r
          variant: c.variant,\r
          size: c.size,\r
          labelPlacement: v.floating ? "floating" : undefined,\r
          description: v.error ? undefined : "ASIO даёт минимальную задержку",\r
          error: v.error ? "Драйвер недоступен" : undefined,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Select\r
          label="Аудиодрайвер"\r
          placeholder="Выберите драйвер"\r
          options={options}\r
          icon={v.icon ? "audio" : undefined}\r
          variant={v.variant}\r
          size={v.size}\r
          labelPlacement={v.floating ? "floating" : "top"}\r
          description={v.error ? undefined : "ASIO даёт минимальную задержку"}\r
          error={v.error ? "Драйвер недоступен" : undefined}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,tn=`export default {\r
  name: "Select",\r
  description: "Выбор значения из списка",\r
  category: "fields",\r
} as const;\r
`,on=`import React from "react";\r
import { clamp, mark, useControllable } from "../../../core/base";\r
import type { SliderProps } from "../shared";\r
export const Slider = (p: SliderProps) => {\r
  const min = p.min ?? 0,\r
    max = Math.max(min, p.max ?? 100);\r
  const [value, setValue] = useControllable(\r
    p.value,\r
    p.defaultValue ?? 35,\r
    p.onValueChange,\r
  );\r
  const current = clamp(value, min, max),\r
    percent = max === min ? 0 : ((current - min) / (max - min)) * 100;\r
  return (\r
    <input\r
      {...mark("Slider", p)}\r
      ref={p.ref}\r
      id={p.id}\r
      type="range"\r
      value={current}\r
      min={min}\r
      max={max}\r
      step={p.step ?? 1}\r
      disabled={p.disabled}\r
      aria-label={p.label ?? "Значение"}\r
      style={{ "--ad-level": \`\${percent}%\`, ...p.style } as React.CSSProperties}\r
      onChange={(e) => setValue(Number(e.currentTarget.value))}\r
    />\r
  );\r
};\r
`,an=`import { useState } from "react";\r
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function SliderExample() {\r
  const [volume, setVolume] = useState(65);\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("Slider", {\r
          label: "Громкость",\r
          value: expr("volume"),\r
          onValueChange: expr("setVolume"),\r
          size: c.size,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack gap={2}>\r
          <U.Stack direction="row" justify="between" align="center">\r
            <U.Typography variant="label">Громкость</U.Typography>\r
            <U.Typography variant="mono" tone="muted">\r
              {volume}%\r
            </U.Typography>\r
          </U.Stack>\r
          <U.Slider\r
            label="Громкость"\r
            value={volume}\r
            onValueChange={setVolume}\r
            size={v.size}\r
            disabled={v.disabled}\r
          />\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,sn=`export default {\r
  name: "Slider",\r
  description: "Изменение значения ползунком",\r
  category: "fields",\r
} as const;\r
`,ln=`import { useRef, useState } from "react";\r
import { mark } from "../../../core/base";\r
import { Menu } from "../../feedback/Menu/Menu";\r
import { Button } from "../Button/Button";\r
import { IconButton } from "../IconButton/IconButton";\r
import { variantMaterial } from "../internal";\r
import type { SplitButtonProps } from "../shared";\r
\r
export const SplitButton = (p: SplitButtonProps) => {\r
  const [open, setOpen] = useState(false);\r
  const anchor = useRef<HTMLButtonElement>(null);\r
  const variant = p.variant ?? "primary";\r
  return (\r
    <div\r
      {...mark("SplitButton", p, variantMaterial[variant])}\r
      data-ad-variant={variant}\r
    >\r
      <Button\r
        className="ad-split-button-main"\r
        size={p.size}\r
        variant="ghost"\r
        icon={p.icon ?? "save"}\r
        onClick={p.onClick}\r
      >\r
        {p.children ?? p.label ?? "Сохранить"}\r
      </Button>\r
      <IconButton\r
        className="ad-split-button-trigger"\r
        size={p.size}\r
        ref={anchor}\r
        variant="ghost"\r
        icon="chevron"\r
        label="Другие действия"\r
        aria-haspopup="menu"\r
        aria-expanded={open}\r
        onClick={() => setOpen((v) => !v)}\r
      />\r
      <Menu\r
        open={open}\r
        onOpenChange={setOpen}\r
        anchorRef={anchor}\r
        align="end"\r
        items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]}\r
      />\r
    </div>\r
  );\r
};\r
`,cn=`import {\r
  Playground,\r
  U,\r
  buttonVariants,\r
  expr,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
const items = [\r
  { label: "Сохранить как…", icon: "save" },\r
  { label: "Экспорт в WAV", icon: "download" },\r
  { label: "Экспорт в MP3", icon: "download" },\r
];\r
\r
export default function SplitButtonExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        variant: { options: buttonVariants, value: "primary" },\r
        size: { options: sizes, value: "md" },\r
      }}\r
      code={(v, c) =>\r
        \`const items = \${JSON.stringify(items)};\\n\\n\` +\r
        jsx(\r
          "SplitButton",\r
          {\r
            icon: "save",\r
            items: expr("items"),\r
            variant: c.variant,\r
            size: c.size,\r
          },\r
          "Сохранить",\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.SplitButton\r
          icon="save"\r
          items={items}\r
          variant={v.variant}\r
          size={v.size}\r
        >\r
          Сохранить\r
        </U.SplitButton>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,dn=`export default {\r
  name: "SplitButton",\r
  description: "Основное действие и отдельное меню",\r
  category: "buttons",\r
} as const;\r
`,pn=`import { BooleanControl, type BooleanProps } from "../shared";\r
\r
export const Switch = (p: BooleanProps) => (\r
  <BooleanControl kind="Switch" {...p} />\r
);\r
`,un=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function SwitchExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("Switch", {\r
          label: "Мониторинг голоса",\r
          defaultChecked: true,\r
          size: c.size,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack gap={3}>\r
          <U.Switch\r
            label="Мониторинг голоса"\r
            defaultChecked\r
            size={v.size}\r
            disabled={v.disabled}\r
          />\r
          <U.Switch\r
            label="Шумоподавление"\r
            size={v.size}\r
            disabled={v.disabled}\r
          />\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,mn=`export default {\r
  name: "Switch",\r
  description: "Переключатель логического параметра",\r
  category: "fields",\r
} as const;\r
`,fn=`import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import type { TabProps } from "../shared";\r
\r
export const Tab = ({\r
  selected = false,\r
  panelId,\r
  icon,\r
  endIcon,\r
  label,\r
  children,\r
  ref,\r
  variant: _variant,\r
  loading: _loading,\r
  round: _round,\r
  size: _size,\r
  tone: _tone,\r
  material: _material,\r
  ...p\r
}: TabProps) => (\r
  <button\r
    {...p}\r
    {...mark("Tab", { ...p, size: _size })}\r
    ref={ref}\r
    type="button"\r
    role="tab"\r
    aria-selected={selected}\r
    aria-controls={panelId}\r
    tabIndex={selected ? 0 : -1}\r
  >\r
    {icon && <Icon name={icon} />}\r
    <span className="ad-tab-label">{children ?? label}</span>\r
    {endIcon && <Icon name={endIcon} />}\r
  </button>\r
);\r
`,gn=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
/** A single Tab is the building block of Tabs; most screens use Tabs directly. */\r
export default function TabExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        selected: { value: true },\r
      }}\r
      code={(v, c) =>\r
        jsx(\r
          "Tab",\r
          { icon: "audio", selected: v.selected, size: c.size },\r
          "Аудио",\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <div role="tablist" aria-label="Пример вкладки">\r
          <U.Tab icon="audio" selected={v.selected} size={v.size}>\r
            Аудио\r
          </U.Tab>\r
        </div>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,hn=`export default {\r
  name: "Tab",\r
  description: "Отдельная вкладка с состоянием выбора",\r
  category: "navigation",\r
} as const;\r
`,vn=`import { createResizeObserver } from "../../../core/environment";
import { useLayoutEffect, useRef, useState } from "react";
import {
  mark,
  ripple,
  useControllable,
  type TokenStyle,
} from "../../../core/base";
import { type TabItem, type TabsProps } from "../shared";
import { Tab } from "../Tab/Tab";

export function Tabs<V extends string = string>(p: TabsProps<V>) {
  const items =
    p.items ??
    ([
      { value: "appearance", label: "Внешний вид", icon: "palette" },
      { value: "audio", label: "Аудио", icon: "audio" },
      { value: "advanced", label: "Дополнительно", icon: "wrench" },
    ] as TabItem<V>[]);
  const [value, setValue] = useControllable<V>(
    p.value,
    p.defaultValue ?? items[0]?.value ?? ("" as V),
    p.onValueChange,
  );
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = items.findIndex((item) => item.value === value);

  // The blade follows the selected tab and is told when it is travelling, to squash and flare.
  const [place, setPlace] = useState<TokenStyle>();
  const [moving, setMoving] = useState(false);
  const first = useRef(true);
  useLayoutEffect(() => {
    const tab = buttons.current[selected];
    if (!tab) return setPlace(undefined);
    const update = () =>
      setPlace({
        "--ad-tabs-x": \`\${tab.offsetLeft}px\`,
        "--ad-tabs-w": \`\${tab.offsetWidth}px\`,
      });
    update();
    const observer = createResizeObserver(update);
    observer.observe(tab);
    if (tab.parentElement) observer.observe(tab.parentElement);
    let timer = 0;
    if (!first.current) {
      setMoving(true);
      timer = window.setTimeout(() => setMoving(false), 420);
    }
    first.current = false;
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [selected, items.length]);

  return (
    <nav
      {...mark("Tabs", p)}
      role="tablist"
      aria-label={p.label ?? "Разделы"}
      data-moving={moving || undefined}
      onPointerDown={(e) => {
        const tab = (e.target as HTMLElement).closest<HTMLElement>(".ad-tab");
        if (tab && !tab.matches(":disabled")) ripple(tab, e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        const available = items
          .map((item, index) => ({ item, index }))
          .filter((x) => !x.item.disabled);
        if (!available.length) return;
        e.preventDefault();
        const current = available.findIndex(
          (x) => buttons.current[x.index] === document.activeElement,
        );
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? available.length - 1
              : (current +
                  (e.key === "ArrowRight" ? 1 : -1) +
                  available.length) %
                available.length;
        setValue(available[next].item.value);
        buttons.current[available[next].index]?.focus();
      }}
    >
      {place && (
        <>
          <span className="ad-tabs-trail" style={place} aria-hidden />
          <span className="ad-tabs-indicator" style={place} aria-hidden>
            <span className="ad-tabs-blade" />
          </span>
          <span className="ad-tabs-rail" style={place} aria-hidden />
        </>
      )}
      {items.map((item, index) => (
        <Tab
          key={item.value}
          id={item.id}
          ref={(n) => {
            buttons.current[index] = n;
          }}
          icon={item.icon}
          panelId={item.panelId}
          disabled={item.disabled}
          size={p.size}
          selected={item.value === value}
          onClick={() => setValue(item.value)}
        >
          {item.label}
        </Tab>
      ))}
    </nav>
  );
}
`,bn=`import { useState } from "react";\r
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
const items = [\r
  { value: "view", label: "Внешний вид", icon: "palette", id: "tab-view" },\r
  { value: "audio", label: "Аудио", icon: "audio", id: "tab-audio" },\r
  { value: "keys", label: "Ключи", icon: "key", id: "tab-keys" },\r
];\r
const panels: Record<string, string> = {\r
  view: "Тема, акцентный цвет и анимации интерфейса.",\r
  audio: "Драйвер, задержка и мониторинг голоса.",\r
  keys: "API-ключи сервисов обработки.",\r
};\r
\r
export default function TabsExample() {\r
  const [tab, setTab] = useState("audio");\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{ size: { options: sizes, value: "md" } }}\r
      code={(_, c) =>\r
        \`const items = \${JSON.stringify(items.map(({ value, label, icon }) => ({ value, label, icon })))};\\n\\n\` +\r
        jsx("Tabs", {\r
          label: "Настройки",\r
          items: expr("items"),\r
          value: expr("tab"),\r
          onValueChange: expr("setTab"),\r
          size: c.size,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack gap={3}>\r
          <U.Tabs\r
            label="Настройки"\r
            items={items}\r
            value={tab}\r
            onValueChange={setTab}\r
            size={v.size}\r
          />\r
          <U.TabPanel labelledBy={\`tab-\${tab}\`}>\r
            <U.Typography variant="body-sm" tone="muted">\r
              {panels[tab]}\r
            </U.Typography>\r
          </U.TabPanel>\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,yn=`export default {\r
  name: "Tabs",\r
  description: "Переключение вкладок с фигурной подсветкой",\r
  category: "navigation",\r
  wide: true,\r
} as const;\r
`,xn=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel, useFieldIds } from "../internal";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { TextAreaProps } from "../shared";\r
\r
export const TextArea = ({\r
  value,\r
  defaultValue = "",\r
  onValueChange,\r
  label,\r
  description,\r
  error,\r
  startAdornment,\r
  endAdornment,\r
  className,\r
  size,\r
  variant,\r
  labelPlacement = "top",\r
  resize = "vertical",\r
  tone: _tone,\r
  material: _material,\r
  style: _style,\r
  ...textarea\r
}: TextAreaProps) => {\r
  const [current, setCurrent] = useControllable(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const ids = useFieldIds(label, description || error);\r
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      ids={ids}\r
      className={\`ad-text-area ad-text-area--resize-\${resize} \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={textarea.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(label, textarea.required) : undefined}\r
        filled={!!current}\r
        multiline\r
        disabled={textarea.disabled}\r
        readOnly={textarea.readOnly}\r
        error={!!error}\r
        startAdornment={startAdornment}\r
        endAdornment={endAdornment}\r
      >\r
        <textarea\r
          {...ids.aria}\r
          {...textarea}\r
          value={current}\r
          onChange={(e) => setCurrent(e.currentTarget.value)}\r
        />\r
      </InputBase>\r
    </FieldFrame>\r
  );\r
};\r
`,kn=`import {
  Playground,
  U,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

export default function TextAreaExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        resize: {
          options: ["vertical", "both", "none"] as const,
          value: "vertical",
        },
        error: { value: false },
        readOnly: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("TextArea", {
          label: "Комментарий к записи",
          placeholder: "Что получилось, что исправить…",
          variant: c.variant,
          size: c.size,
          labelPlacement: v.floating ? "floating" : undefined,
          resize: c.resize,
          description: v.error ? undefined : "Видят только участники комнаты",
          error: v.error ? "Не больше 500 символов" : undefined,
          readOnly: v.readOnly,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.TextArea
          label="Комментарий к записи"
          placeholder="Что получилось, что исправить…"
          variant={v.variant}
          size={v.size}
          labelPlacement={v.floating ? "floating" : "top"}
          resize={v.resize}
          description={v.error ? undefined : "Видят только участники комнаты"}
          error={v.error ? "Не больше 500 символов" : undefined}
          readOnly={v.readOnly}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
`,_n=`export default {\r
  name: "TextArea",\r
  description: "Многострочный текстовый ввод с теми же adornments.",\r
  category: "fields",\r
  wide: true,\r
};\r
`,wn=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel, useFieldIds } from "../internal";\r
import { IconButton } from "../IconButton/IconButton";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { TextFieldProps } from "../shared";\r
\r
export const TextField = ({\r
  label,\r
  description,\r
  error,\r
  clearable,\r
  startAdornment,\r
  endAdornment,\r
  value,\r
  defaultValue = "",\r
  onValueChange,\r
  inputRef,\r
  className,\r
  size,\r
  variant,\r
  labelPlacement = "top",\r
  tone: _tone,\r
  material: _material,\r
  style: _style,\r
  children: _children,\r
  ...input\r
}: TextFieldProps) => {\r
  const [current, setCurrent] = useControllable(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const ids = useFieldIds(label, description || error);\r
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      ids={ids}\r
      className={\`ad-text-field-shell \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={input.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(label, input.required) : undefined}\r
        filled={!!current}\r
        disabled={input.disabled}\r
        readOnly={input.readOnly}\r
        error={!!error}\r
        startAdornment={startAdornment}\r
        endAdornment={\r
          <>\r
            {clearable && current && (\r
              <IconButton\r
                size="xs"\r
                variant="ghost"\r
                icon="close"\r
                label="Очистить"\r
                disabled={input.disabled || input.readOnly}\r
                onClick={() => setCurrent("")}\r
              />\r
            )}\r
            {endAdornment}\r
          </>\r
        }\r
      >\r
        <input\r
          {...ids.aria}\r
          {...input}\r
          ref={inputRef}\r
          value={current}\r
          aria-invalid={!!error || undefined}\r
          onChange={(e) => setCurrent(e.currentTarget.value)}\r
        />\r
      </InputBase>\r
    </FieldFrame>\r
  );\r
};\r
`,Pn=`import {\r
  Playground,\r
  U,\r
  expr,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
export default function TextFieldExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        floating: { value: true },\r
        icon: { value: true },\r
        clearable: { value: true },\r
        required: { value: false },\r
        error: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("TextField", {\r
          label: "Имя в комнате",\r
          placeholder: "Как вас называть?",\r
          variant: c.variant,\r
          size: c.size,\r
          labelPlacement: v.floating ? "floating" : undefined,\r
          startAdornment: v.icon ? expr('<Icon name="user" />') : undefined,\r
          clearable: v.clearable,\r
          required: v.required,\r
          description: v.error ? undefined : "Видно другим участникам",\r
          error: v.error ? "Имя уже занято" : undefined,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.TextField\r
          label="Имя в комнате"\r
          placeholder="Как вас называть?"\r
          defaultValue="Дмитрий"\r
          variant={v.variant}\r
          size={v.size}\r
          labelPlacement={v.floating ? "floating" : "top"}\r
          startAdornment={v.icon ? <U.Icon name="user" /> : undefined}\r
          clearable={v.clearable}\r
          required={v.required}\r
          description={v.error ? undefined : "Видно другим участникам"}\r
          error={v.error ? "Имя уже занято" : undefined}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Sn=`export default {\r
  name: "TextField",\r
  description:\r
    "Основное текстовое поле с label, helper/error и start/end adornments.",\r
  category: "fields",\r
  wide: true,\r
};\r
`,Tn=`import type { CSSProperties } from "react";
import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Button } from "../Button/Button";
import { Icon } from "../../layout/Icon/Icon";
import { ImageShine } from "../../effects/ImageShine/ImageShine";
import {
  themes,
  type ThemeName,
} from "../../foundation/ThemeProvider/ThemeProvider";
export type { ThemeName };

/** A theme shown as a card: its picture, name, a line about it and its own colour. */
export interface ThemePickerOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  /** Picture of the theme (with transparency); the chosen one gets a moving shine. */
  image?: string;
  /** The theme's own colour for the card's edge and glow. */
  color?: string;
}

export interface ThemePickerProps<V extends string = ThemeName> extends CommonProps {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Own themes as picture cards; without them the built-in themes are offered as swatches. */
  options?: readonly ThemePickerOption<V>[];
  disabled?: boolean;
  label?: string;
}

const builtIn: Record<ThemeName, string> = {
  ruby: "Ruby",
  light: "Light",
  green: "Green",
  violet: "Violet",
};

/** Choosing a theme: compact swatches for the built-in themes, or a gallery of picture cards. */
export function ThemePicker<V extends string = ThemeName>(p: ThemePickerProps<V>) {
  const first = (p.options?.[0]?.value ?? "ruby") as V;
  const [value, setValue] = useControllable<V>(p.value, p.defaultValue ?? first, p.onValueChange);

  if (!p.options)
    return (
      <div {...mark("ThemePicker", p)} role="radiogroup" aria-label={p.label ?? "Тема"}>
        {(Object.keys(builtIn) as ThemeName[]).map((key) => (
          <Button key={key} size={p.size ?? "sm"} aria-pressed={key === value} disabled={p.disabled}
            onClick={() => setValue(key as unknown as V)}>
            <span className="ad-theme-swatch" style={{ background: themes[key][0] }} />
            {builtIn[key]}
          </Button>
        ))}
      </div>
    );

  return (
    <div {...mark("ThemePicker", p)} data-gallery="" role="radiogroup" aria-label={p.label ?? "Тема"}>
      {p.options.map((option) => {
        const chosen = option.value === value;
        return (
          <button key={option.value} type="button" className="ad-theme-card" aria-pressed={chosen} aria-label={option.label}
            disabled={p.disabled} style={option.color ? ({ "--ad-theme-card": option.color } as CSSProperties) : undefined}
            onClick={() => setValue(option.value)}>
            <span className="ad-theme-card-preview">
              {option.image && (chosen
                ? <ImageShine src={option.image} glow={false} />
                : <img src={option.image} alt="" loading="lazy" />)}
            </span>
            <span className="ad-theme-card-caption">
              <strong>{option.label}</strong>
              {option.description && <span aria-hidden="true">{option.description}</span>}
            </span>
            {chosen && <span className="ad-theme-card-check" aria-hidden="true"><Icon name="check" /></span>}
          </button>
        );
      })}
    </div>
  );
}
`,Cn=`import {
  Playground,
  U,
  jsx,
  sizes,
  useSiteTheme,
} from "../../../dev/exampleHelpers";

/** On the docs site the picker switches the theme of the whole site. */
export default function ThemePickerExample() {
  const site = useSiteTheme();
  return (
    <Playground
      knobs={{ size: { options: sizes, value: "sm" } }}
      code={(_, c) =>
        jsx("ThemePicker", {
          value: { expr: "theme" },
          onValueChange: { expr: "setTheme" },
          size: c.size,
        })
      }
    >
      {(v) => (
        <U.ThemePicker
          size={v.size}
          value={site.theme}
          onValueChange={(theme) => site.set({ theme })}
        />
      )}
    </Playground>
  );
}
`,Mn=`export default {\r
  name: "ThemePicker",\r
  description: "Переключатель готовых тем; пара цветов каждой темы задаёт всю палитру.",\r
  category: "typography",\r
};\r
`,Rn=`import { useControllable } from "../../../core/base";\r
import { buttonView, type ToggleButtonProps } from "../shared";\r
\r
export const ToggleButton = ({\r
  checked,\r
  defaultChecked = false,\r
  onValueChange,\r
  onClick,\r
  ...p\r
}: ToggleButtonProps) => {\r
  const [value, setValue] = useControllable(\r
    checked,\r
    defaultChecked,\r
    onValueChange,\r
  );\r
  return buttonView(\r
    {\r
      ...p,\r
      "aria-label": p["aria-label"] ?? (!p.children ? p.label : undefined),\r
      "aria-pressed": value,\r
      children: p.children ?? (p.icon ? null : p.label),\r
      label: undefined,\r
      onClick: (e) => {\r
        onClick?.(e);\r
        if (!e.defaultPrevented) setValue(!value);\r
      },\r
    },\r
    "ToggleButton",\r
  );\r
};\r
`,En=`import { useState } from "react";\r
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function ToggleButtonExample() {\r
  const [on, setOn] = useState(true);\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        icon: { value: true },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx(\r
          "ToggleButton",\r
          {\r
            checked: expr("on"),\r
            onValueChange: expr("setOn"),\r
            icon: v.icon ? "mic" : undefined,\r
            size: c.size,\r
            disabled: v.disabled,\r
          },\r
          "Микрофон",\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.ToggleButton\r
          checked={on}\r
          onValueChange={setOn}\r
          icon={v.icon ? "mic" : undefined}\r
          size={v.size}\r
          disabled={v.disabled}\r
        >\r
          Микрофон\r
        </U.ToggleButton>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,An=`export default {\r
  name: "ToggleButton",\r
  description: "Кнопка с выбранным состоянием",\r
  category: "buttons",\r
} as const;\r
`,Bn=`import { useId, type ReactNode } from "react";\r
import type { Material, Variant } from "../../core/base";\r
import { Icon } from "../layout/Icon/Icon";\r
\r
export const variantMaterial: Record<Variant, Material> = {\r
  primary: "ruby",\r
  secondary: "glass",\r
  danger: "danger",\r
  ghost: "ghost",\r
};\r
\r
type Option = { value: string; label: string; disabled?: boolean };\r
export const toOption = (option: string | Option): Option =>\r
  typeof option === "string" ? { value: option, label: option } : option;\r
\r
/** Field label with the required mark, used above the field or floating inside it. */\r
export const fieldLabel = (label: ReactNode, required?: boolean) => (\r
  <>\r
    {label}\r
    {required && (\r
      <span className="ad-field-required" aria-hidden="true">\r
        *\r
      </span>\r
    )}\r
  </>\r
);\r
\r
/**\r
 * Ids that tie a control to its own label and message. The frame is a wrapping label (a click\r
 * anywhere on the field focuses the control), but its text also holds the message and any\r
 * adornment buttons, so the accessible name is pointed at the label text alone.\r
 */\r
export const useFieldIds = (label: ReactNode, message: ReactNode) => {\r
  const id = useId();\r
  const ids = { label: \`\${id}label\`, message: \`\${id}message\` };\r
  return {\r
    ...ids,\r
    aria: {\r
      "aria-labelledby": label ? ids.label : undefined,\r
      "aria-describedby": message ? ids.message : undefined,\r
    },\r
  };\r
};\r
export type FieldIds = ReturnType<typeof useFieldIds>;\r
\r
/** Label, control and description/error line shared by every text-like field. */\r
export function FieldFrame({\r
  className,\r
  label,\r
  required,\r
  description,\r
  error,\r
  ids,\r
  children,\r
}: {\r
  className: string;\r
  ids: FieldIds;\r
  label?: ReactNode;\r
  required?: boolean;\r
  description?: ReactNode;\r
  error?: ReactNode;\r
  children: ReactNode;\r
}) {\r
  return (\r
    <label className={\`ad-field \${className}\`}>\r
      {label && (\r
        <span className="ad-field-label" id={ids.label}>{fieldLabel(label, required)}</span>\r
      )}\r
      {children}\r
      {(description || error) && (\r
        <small id={ids.message} className="ad-field-message" data-error={!!error || undefined}>\r
          {error && <Icon name="warning" />}\r
          {error || description}\r
        </small>\r
      )}\r
    </label>\r
  );\r
}\r
\r
/** Flat option rows shared by Select and Autocomplete; the chosen one carries a check mark. */\r
export function OptionList({\r
  id,\r
  options,\r
  selected,\r
  active,\r
  onChoose,\r
  onHover,\r
}: {\r
  id?: string;\r
  options: Option[];\r
  selected?: string;\r
  active?: number;\r
  onChoose: (value: string) => void;\r
  onHover?: (index: number) => void;\r
}) {\r
  return (\r
    <div\r
      id={id}\r
      className="ad-option-list"\r
      onKeyDown={(e) => {\r
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];\r
        if (!keys.includes(e.key)) return;\r
        e.preventDefault();\r
        const items = [\r
          ...e.currentTarget.querySelectorAll<HTMLButtonElement>(\r
            "button:not(:disabled)",\r
          ),\r
        ];\r
        const at = items.indexOf(document.activeElement as HTMLButtonElement);\r
        const next =\r
          e.key === "Home"\r
            ? 0\r
            : e.key === "End"\r
              ? items.length - 1\r
              : (at + (e.key === "ArrowDown" ? 1 : -1) + items.length) %\r
                items.length;\r
        items[next]?.focus();\r
      }}\r
    >\r
      {options.map((option, index) => (\r
        <button\r
          key={option.value}\r
          type="button"\r
          role="option"\r
          className="ad-option"\r
          aria-selected={option.value === selected}\r
          data-active={index === active || undefined}\r
          disabled={option.disabled}\r
          onPointerMove={() => onHover?.(index)}\r
          onClick={() => onChoose(option.value)}\r
        >\r
          <span className="ad-option-label">{option.label}</span>\r
          {option.value === selected && <Icon name="check" />}\r
        </button>\r
      ))}\r
    </div>\r
  );\r
}\r
`,In=`import React, { useEffect, useRef } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import {
  mark,
  ripple,
  useControllable,
  type CommonProps,
  type Variant,
} from "../../core/base";
import { Icon } from "../layout/Icon/Icon";
import { variantMaterial } from "./internal";

export interface ButtonProps
  extends
    CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> {
  variant?: Variant;
  icon?: string;
  endIcon?: string;
  loading?: boolean;
  round?: boolean;
  label?: string;
  ref?: Ref<HTMLButtonElement>;
}
export function buttonView(p: ButtonProps, name = "Button") {
  const {
    variant = "secondary",
    icon,
    endIcon,
    loading,
    round,
    label,
    children,
    ref,
    onPointerMove,
    onPointerDown,
    onPointerLeave,
    ...rest
  } = p;
  const { size: _s, tone: _t, material: _m, ...dom } = rest;
  const trackLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--ad-button-x",
      \`\${((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100}%\`,
    );
    event.currentTarget.style.setProperty(
      "--ad-button-y",
      \`\${((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100}%\`,
    );
    onPointerMove?.(event);
  };
  const resetLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    event.currentTarget.style.removeProperty("--ad-button-x");
    event.currentTarget.style.removeProperty("--ad-button-y");
    onPointerLeave?.(event);
  };
  const content = children ?? label;
  return (
    <button
      {...dom}
      {...mark(name, p, variantMaterial[variant])}
      ref={ref}
      type={p.type ?? "button"}
      disabled={p.disabled || loading}
      aria-busy={loading || undefined}
      data-ad-variant={variant}
      data-ad-round={round || undefined}
      onPointerDown={(event) => {
        ripple(event.currentTarget, event.clientX, event.clientY);
        onPointerDown?.(event);
      }}
      onPointerMove={trackLight}
      onPointerLeave={resetLight}
    >
      <span className="ad-button-fx" aria-hidden="true" />
      <span className="ad-button-orbit" aria-hidden="true" />
      {loading && <span className="ad-spinner" aria-hidden="true" />}
      {icon && <Icon name={icon} />}{" "}
      {content != null && <span className="ad-button-label">{content}</span>}
      {endIcon && <Icon name={endIcon} />}
    </button>
  );
}
export interface IconButtonProps extends ButtonProps {
  label: string;
}
export interface ToggleButtonProps extends ButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
}
export interface SplitButtonProps extends CommonProps {
  variant?: Variant;
  icon?: string;
  label?: string;
  items?: any[];
  onClick?: () => void;
  children?: ReactNode;
}
export interface TabProps extends ButtonProps {
  selected?: boolean;
  panelId?: string;
}
export interface TabItem<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: string;
  disabled?: boolean;
  panelId?: string;
  id?: string;
}
/** \`V\` narrows the values, e.g. \`Tabs<"audio" | "video">\`, so handlers get the exact type. */
export interface TabsProps<V extends string = string> extends CommonProps {
  items?: TabItem<V>[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  label?: string;
}
/** Field appearance: boxed outline, tinted fill or a single bottom line. */
export type InputVariant = "outlined" | "filled" | "underlined";
/** Label above the field, or inside it rising on focus like Material inputs. */
export type LabelPlacement = "top" | "floating";
export interface FieldProps
  extends
    CommonProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof CommonProps | "size" | "value" | "defaultValue" | "onChange"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
}
export interface TextFieldProps extends FieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  clearable?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
}
export interface NumberFieldProps extends Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onValueChange" | "type"
> {
  value?: number | "";
  defaultValue?: number | "";
  onValueChange?: (value: number | "") => void;
  /** The − and + buttons; off for values applied only when typing ends. */
  controls?: boolean;
}
export interface TextAreaProps
  extends
    Omit<CommonProps, "children">,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      keyof CommonProps | "value" | "defaultValue" | "onChange"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
  /** Which way the reader may drag the corner; \`both\` lets the field follow the width too. */
  resize?: "vertical" | "both" | "none";
}
export interface AutocompleteOption {
  value: string;
  label: string;
}
export interface AutocompleteProps extends TextFieldProps {
  options?: Array<string | AutocompleteOption>;
  onOptionSelect?: (value: string) => void;
}
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
/** \`V\` narrows the values, e.g. \`Select<"asc" | "desc">\`, so the handler gets the exact type. */
export interface SelectProps<V extends string = string> extends CommonProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  options?: Array<V | (SelectOption & { value: V })>;
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
}
export interface BooleanProps extends CommonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  /** Checkbox only: neither on nor off, e.g. "select all" when some rows are chosen. */
  indeterminate?: boolean;
}
export function BooleanControl({
  kind,
  ...p
}: BooleanProps & { kind: "Switch" | "Checkbox" }) {
  const [checked, setChecked] = useControllable(
    p.checked,
    p.defaultChecked ?? false,
    p.onValueChange,
  );
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current) input.current.indeterminate = !!p.indeterminate;
  }, [p.indeterminate]);
  return (
    <label {...mark(kind, p)}>
      <input
        ref={input}
        name={p.name}
        type="checkbox"
        role={kind === "Switch" ? "switch" : undefined}
        checked={checked}
        disabled={p.disabled}
        required={p.required}
        onChange={(e) => setChecked(e.currentTarget.checked)}
      />
      <span className="ad-toggle-track" aria-hidden="true">
        <i />
      </span>
      <span>{p.label}</span>
    </label>
  );
}
export interface SliderProps extends CommonProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  ref?: Ref<HTMLInputElement>;
}
export interface FilePickerProps extends CommonProps {
  label?: string;
  description?: string;
  icon?: string;
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** "zone" is a large drop area: icon, title, the picked name or hint; files can be dropped on it. */
  variant?: "button" | "zone";
  /** Your own chooser instead of the browser's file input (e.g. a native dialog of a desktop app). */
  onPick?: () => void;
  /** Name of the chosen file, when the choice is kept outside (with \`onPick\`). */
  value?: string;
  disabled?: boolean;
}
`,Nn=`import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";
import { PianoKeyboard, isBlackKey } from "../../media/PianoKeyboard/PianoKeyboard";

export interface PianoRollNote {
  id: string;
  /** Seconds. */
  start: number;
  end: number;
  /** MIDI pitch: 60 is C4. */
  pitch: number;
}
export interface PianoRollWord {
  id: string;
  text: string;
  start: number;
  end: number;
}
/** A drag in progress, measured from where it started; the owner applies its own rules (snapping, limits). */
export type PianoRollGesture =
  | { kind: "move"; ids: readonly string[]; pitch: number; seconds: number }
  | { kind: "resize"; id: string; edge: "start" | "end"; seconds: number };

export interface PianoRollProps extends CommonProps {
  notes?: readonly PianoRollNote[];
  words?: readonly PianoRollWord[];
  /** Length of the song, seconds. */
  duration?: number;
  /** Playback position, seconds. */
  position?: number;
  selected?: ReadonlySet<string>;
  /** Horizontal zoom, 1 = a comfortable default; Ctrl + wheel changes it. */
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** Pitch range, lowest to highest MIDI note. */
  minPitch?: number;
  maxPitch?: number;
  /** Keep the playhead in view while it moves. */
  follow?: boolean;
  /** Show the beat grid. */
  grid?: boolean;
  /** Seconds an arrow key moves a note. */
  nudgeSeconds?: number;
  onSelect?: (id: string, additive: boolean) => void;
  onSelectArea?: (ids: string[], additive: boolean) => void;
  onSeek?: (seconds: number) => void;
  onNoteDrag?: (gesture: PianoRollGesture) => void;
  onNoteDragEnd?: () => void;
  onNudge?: (id: string, pitch: number, seconds: number) => void;
  /** Pressing a key, e.g. to hear its pitch. */
  onKeyPress?: (midi: number) => void;
  label?: string;
}

const DEMO: PianoRollNote[] = [
  { id: "1", start: 0.4, end: 1.1, pitch: 64 },
  { id: "2", start: 1.2, end: 1.6, pitch: 67 },
  { id: "3", start: 1.7, end: 2.6, pitch: 69 },
  { id: "4", start: 2.8, end: 3.4, pitch: 67 },
  { id: "5", start: 3.5, end: 4.4, pitch: 64 },
  { id: "6", start: 4.6, end: 6, pitch: 62 },
];
const DEMO_WORDS: PianoRollWord[] = [
  { id: "a", text: "Ночь", start: 0.4, end: 1.1 },
  { id: "b", text: "горит", start: 1.2, end: 2.6 },
  { id: "c", text: "огнями", start: 2.8, end: 6 },
];

type Drag =
  | { kind: "move"; ids: string[]; x: number; y: number; secondPx: number; rowPx: number }
  | { kind: "resize"; id: string; edge: "start" | "end"; x: number; secondPx: number }
  | { kind: "area"; x: number; y: number; additive: boolean; box: DOMRect };

/**
 * A melody editor: notes on a piano grid with the keyboard at the left, a ruler to seek, the
 * syllables under the notes and the playhead. Drag a note to move it in time and pitch, drag its
 * edges to change its length, drag on the empty grid to select an area, Ctrl + wheel to zoom.
 */
export const PianoRoll = ({
  notes = DEMO,
  words = notes === DEMO ? DEMO_WORDS : [],
  duration = 8,
  position = 2,
  selected,
  zoom: zoomProp,
  defaultZoom = 1,
  onZoomChange,
  minPitch = 55,
  maxPitch = 79,
  follow = false,
  grid = true,
  nudgeSeconds = 0.05,
  onSelect,
  onSelectArea,
  onSeek,
  onNoteDrag,
  onNoteDragEnd,
  onNudge,
  onKeyPress,
  label,
  ...p
}: PianoRollProps) => {
  const [zoom, setZoom] = useControllable(zoomProp, defaultZoom, onZoomChange);
  const scroller = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const areaBox = useRef<HTMLDivElement>(null);
  const rows = maxPitch - minPitch + 1;
  const length = Math.max(duration, 1);
  const at = (seconds: number) => \`calc(var(--ad-pps) * \${seconds})\`;
  const row = (pitch: number) => \`calc(100% * \${(maxPitch - pitch) / rows})\`;
  const seconds = Array.from({ length: Math.ceil(length) + 1 }, (_, i) => i);

  // Following playback keeps the playhead a third of the way across the view.
  useEffect(() => {
    const box = scroller.current;
    const area = world.current;
    if (!follow || !box || !area) return;
    const x = (position / length) * area.offsetWidth;
    if (x < box.scrollLeft || x > box.scrollLeft + box.clientWidth * 0.8) box.scrollLeft = Math.max(0, x - box.clientWidth * 0.3);
  }, [follow, position, length, zoom]);

  const scale = () => {
    const area = world.current?.getBoundingClientRect();
    return { secondPx: (area?.width ?? 1) / length, rowPx: (area?.height ?? rows) / rows, area };
  };
  const startMove = (event: PointerEvent<HTMLElement>, note: PianoRollNote) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const ids = selected?.has(note.id) && !additive ? [...selected] : [note.id];
    onSelect?.(note.id, additive);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const { secondPx, rowPx } = scale();
    drag.current = { kind: "move", ids, x: event.clientX, y: event.clientY, secondPx, rowPx };
  };
  const startResize = (event: PointerEvent<HTMLElement>, note: PianoRollNote, edge: "start" | "end") => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { kind: "resize", id: note.id, edge, x: event.clientX, secondPx: scale().secondPx };
  };
  const startArea = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !world.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { kind: "area", x: event.clientX, y: event.clientY, additive: event.ctrlKey || event.shiftKey, box: world.current.getBoundingClientRect() };
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    if (current.kind === "move")
      onNoteDrag?.({ kind: "move", ids: current.ids, seconds: (event.clientX - current.x) / current.secondPx, pitch: -Math.round((event.clientY - current.y) / current.rowPx) });
    else if (current.kind === "resize")
      onNoteDrag?.({ kind: "resize", id: current.id, edge: current.edge, seconds: (event.clientX - current.x) / current.secondPx });
    else if (areaBox.current) {
      const left = Math.min(current.x, event.clientX) - current.box.left;
      const top = Math.min(current.y, event.clientY) - current.box.top;
      Object.assign(areaBox.current.style, {
        display: "block",
        left: \`\${left}px\`,
        top: \`\${top}px\`,
        width: \`\${Math.abs(event.clientX - current.x)}px\`,
        height: \`\${Math.abs(event.clientY - current.y)}px\`,
      });
    }
  };
  const end = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (current.kind !== "area") return onNoteDragEnd?.();
    if (areaBox.current) areaBox.current.style.display = "none";
    const { secondPx, rowPx } = scale();
    const x0 = (Math.min(current.x, event.clientX) - current.box.left) / secondPx;
    const x1 = (Math.max(current.x, event.clientX) - current.box.left) / secondPx;
    const top = maxPitch - (Math.max(current.y, event.clientY) - current.box.top) / rowPx;
    const bottom = maxPitch - (Math.min(current.y, event.clientY) - current.box.top) / rowPx;
    // A click without a drag seeks; a drag picks the notes inside the area.
    if (Math.abs(event.clientX - current.x) < 4 && Math.abs(event.clientY - current.y) < 4) return onSeek?.(clamp(x0, 0, length));
    onSelectArea?.(notes.filter((note) => note.end >= x0 && note.start <= x1 && note.pitch >= top - 1 && note.pitch <= bottom).map((note) => note.id), current.additive);
  };
  const nudge = (event: KeyboardEvent<HTMLElement>, note: PianoRollNote) => {
    const steps: Record<string, [number, number]> = {
      ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -nudgeSeconds], ArrowRight: [0, nudgeSeconds],
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    onNudge?.(note.id, step[0], step[1]);
  };
  const wheel = (event: WheelEvent<HTMLElement>) => {
    if (!event.ctrlKey || !event.deltaY) return;
    event.preventDefault();
    setZoom(clamp(zoom * (event.deltaY > 0 ? 1 / 1.15 : 1.15), 0.25, 6));
  };

  return (
    <div
      {...mark("PianoRoll", p)}
      role="application"
      aria-label={label ?? "Редактор мелодии"}
      data-grid={grid || undefined}
      style={{ ...p.style, "--ad-pps": \`\${4 * zoom}rem\`, "--ad-roll-rows": rows } as CSSProperties}
    >
      <div className="ad-piano-roll-scroll" ref={scroller} onWheel={wheel}>
        <div className="ad-piano-roll-corner" />
        <div className="ad-piano-roll-ruler" style={{ width: at(length) }}
          onPointerDown={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            onSeek?.(clamp(((event.clientX - box.left) / box.width) * length, 0, length));
          }}>
          {seconds.map((second) => (
            <span key={second} style={{ left: at(second) }} data-major={second % 5 === 0 || undefined}>{second}</span>
          ))}
          <i className="ad-piano-roll-head-mark" style={{ left: at(position) }} />
        </div>
        <PianoKeyboard className="ad-piano-roll-keys" minMidi={minPitch} maxMidi={maxPitch} labels="octaves" onKeyPress={onKeyPress} />
        <div className="ad-piano-roll-world" ref={world} style={{ width: at(length) }}
          onPointerDown={startArea} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
          {Array.from({ length: rows }, (_, i) => maxPitch - i).filter(isBlackKey).map((pitch) => (
            <i key={pitch} className="ad-piano-roll-row" style={{ top: row(pitch) }} />
          ))}
          {notes.map((note) => (
            <div key={note.id} className="ad-piano-roll-note" data-selected={selected?.has(note.id) || undefined}
              data-now={(position >= note.start && position <= note.end) || undefined}
              style={{ left: at(note.start), width: \`max(0.25rem, \${at(note.end - note.start)})\`, top: row(note.pitch) }}>
              <button type="button" className="ad-piano-roll-note-body" aria-label={\`Нота \${note.pitch}\`} aria-pressed={selected?.has(note.id) ?? false}
                onPointerDown={(event) => startMove(event, note)} onKeyDown={(event) => nudge(event, note)} />
              <span className="ad-piano-roll-edge" data-edge="start" aria-hidden="true" onPointerDown={(event) => startResize(event, note, "start")} />
              <span className="ad-piano-roll-edge" data-edge="end" aria-hidden="true" onPointerDown={(event) => startResize(event, note, "end")} />
            </div>
          ))}
          <div className="ad-piano-roll-area" ref={areaBox} />
          <span className="ad-piano-roll-playhead" style={{ left: at(position) }} />
        </div>
        {words.length > 0 && <>
          <div className="ad-piano-roll-corner" />
          <div className="ad-piano-roll-words" style={{ width: at(length) }}>
            {words.map((word) => (
              <span key={word.id} style={{ left: at(word.start), width: at(word.end - word.start) }}
                data-sung={position > word.end || undefined} data-now={(position >= word.start && position <= word.end) || undefined}>
                {word.text}
              </span>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
};
`,zn=`import { useRef, useState } from "react";
import { PianoRoll, type PianoRollGesture, type PianoRollNote } from "@ad-voice/ui";

const start: PianoRollNote[] = [
  { id: "1", start: 0.4, end: 1.1, pitch: 64 },
  { id: "2", start: 1.2, end: 1.6, pitch: 67 },
  { id: "3", start: 1.7, end: 2.6, pitch: 69 },
  { id: "4", start: 2.8, end: 3.4, pitch: 67 },
  { id: "5", start: 3.5, end: 4.4, pitch: 64 },
  { id: "6", start: 4.6, end: 6, pitch: 62 },
];
const snap = (seconds: number) => Math.round(seconds / 0.05) * 0.05;

/** The editor owns the notes: each drag is applied to the notes as they were when it began. */
export default function PianoRollExample() {
  const [notes, setNotes] = useState(start);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(["3"]));
  const [position, setPosition] = useState(2);
  const before = useRef<PianoRollNote[] | null>(null);
  const drag = (gesture: PianoRollGesture) => {
    const origin = (before.current ??= notes);
    setNotes(origin.map((note) => {
      if (gesture.kind === "move" && gesture.ids.includes(note.id))
        return { ...note, start: snap(note.start + gesture.seconds), end: snap(note.end + gesture.seconds), pitch: note.pitch + gesture.pitch };
      if (gesture.kind === "resize" && gesture.id === note.id)
        return gesture.edge === "start"
          ? { ...note, start: Math.min(note.end - 0.1, snap(note.start + gesture.seconds)) }
          : { ...note, end: Math.max(note.start + 0.1, snap(note.end + gesture.seconds)) };
      return note;
    }));
  };
  return (
    <div style={{ width: "100%", height: "22rem" }}>
      <PianoRoll notes={notes} selected={selected} position={position} duration={8}
        onSelect={(id, additive) => setSelected((current) => additive ? new Set([...current, id]) : new Set([id]))}
        onSelectArea={(ids) => setSelected(new Set(ids))}
        onSeek={setPosition} onNoteDrag={drag} onNoteDragEnd={() => (before.current = null)}
        onNudge={(id, pitch, seconds) => setNotes((all) => all.map((note) => note.id === id
          ? { ...note, pitch: note.pitch + pitch, start: note.start + seconds, end: note.end + seconds } : note))} />
    </div>
  );
}
`,Ln=`export default {
  name: "PianoRoll",
  description: "Редактор мелодии: перетаскивание и растягивание нот, рамочное выделение, масштаб Ctrl + колесо, перемотка.",
  category: "editor",
} as const;
`,Dn=`import { createElement, useRef } from "react";\r
import type { ElementType, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useBorder } from "../../../core/motion/hooks";\r
\r
export interface AnimatedBorderProps extends CommonProps {\r
  as?: ElementType;\r
  children?: ReactNode;\r
  shell?: boolean;\r
  round?: boolean;\r
}\r
\r
export function AnimatedBorder({\r
  as = "div",\r
  shell = false,\r
  round = false,\r
  children,\r
  ...props\r
}: AnimatedBorderProps) {\r
  const ref = useRef<HTMLElement>(null);\r
  useBorder(ref, true, shell, round);\r
\r
  return createElement(\r
    as,\r
    {\r
      ...mark("AnimatedBorder", props),\r
      ref,\r
    },\r
    children,\r
  );\r
}\r
`,Fn=`import { AnimatedBorder, Card, Typography } from "@ad-voice/ui";\r
\r
/** Wraps any block in the animated neon outline; Card has the same effect as \`border\`. */\r
export default function AnimatedBorderExample() {\r
  return (\r
    <AnimatedBorder style={{ borderRadius: "var(--ad-radius)" }}>\r
      <Card material="glass" title="Выступление в эфире">\r
        <Typography variant="body-sm" tone="muted">\r
          Обводка привлекает внимание к активному блоку.\r
        </Typography>\r
      </Card>\r
    </AnimatedBorder>\r
  );\r
}\r
`,Vn=`export default {\r
  name: "AnimatedBorder",\r
  description:\r
    "Анимированная неоновая обводка для любого контейнера, не только Card.",\r
  category: "motion",\r
};\r
`,$n=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface BeaconProps extends CommonProps {\r
  /** Rings run only while active. */\r
  active?: boolean;\r
  /** Ring colour; defaults to the theme accent. */\r
  color?: string;\r
}\r
\r
/** Radar rings spreading from behind the content, to draw attention to it. */\r
export function Beacon({\r
  active = true,\r
  color,\r
  style,\r
  children,\r
  ...p\r
}: BeaconProps) {\r
  return (\r
    <span\r
      {...mark("Beacon", p)}\r
      style={{ ...style, "--ad-beacon": color } as CSSProperties}\r
      data-active={active || undefined}\r
    >\r
      <i aria-hidden />\r
      <i aria-hidden />\r
      <i aria-hidden />\r
      {children}\r
    </span>\r
  );\r
}\r
`,On=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function BeaconExample() {\r
  return (\r
    <Playground\r
      knobs={{ active: { value: true } }}\r
      code={(v) =>\r
        jsx(\r
          "Beacon",\r
          { active: v.active ? undefined : expr("false") },\r
          '<IconButton variant="primary" round icon="mic" label="Ваша очередь" />',\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Beacon active={v.active}>\r
          <U.IconButton\r
            variant="primary"\r
            round\r
            icon="mic"\r
            label="Ваша очередь"\r
          />\r
        </U.Beacon>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Hn=`export default {\r
  name: "Beacon",\r
  description: "Радар-волны вокруг элемента, чтобы привлечь к нему внимание.",\r
  category: "motion",\r
} as const;\r
`,Un=`import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface EqualizerProps extends CommonProps {\r
  /** Number of bars. */\r
  bars?: number;\r
  /** Bars move only while playing. */\r
  playing?: boolean;\r
  /** Bar heights 0–1 from a live spectrum; they replace the built-in bounce. */\r
  levels?: readonly number[];\r
  /** Shifts the bounce, in seconds, so neighbouring equalizers do not move in step. */\r
  phase?: number;\r
  label?: string;\r
}\r
\r
/** "Now playing" bars that bounce at different tempos. */\r
export function Equalizer({\r
  bars = 5,\r
  playing = true,\r
  levels,\r
  phase = 0,\r
  label,\r
  ...p\r
}: EqualizerProps) {\r
  return (\r
    <span\r
      {...mark("Equalizer", p)}\r
      role="img"\r
      aria-label={label ?? (playing ? "Играет" : "Пауза")}\r
      data-playing={(playing && !levels) || undefined}\r
      data-live={levels ? "" : undefined}\r
    >\r
      {Array.from({ length: bars }, (_, i) => (\r
        <i\r
          key={i}\r
          style={\r
            levels\r
              ? { scale: \`1 \${Math.max(0.08, Math.min(1, levels[Math.floor((i / bars) * levels.length)] ?? 0))}\` }\r
              : {\r
                  animationDuration: \`\${0.55 + ((i * 37) % 50) / 100}s\`,\r
                  animationDelay: \`\${-((i * 53) % 70) / 100 - phase}s\`,\r
                }\r
          }\r
        />\r
      ))}\r
    </span>\r
  );\r
}\r
`,Wn=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function EqualizerExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        bars: { options: ["3", "5", "8"], value: "5" },\r
        playing: { value: true },\r
      }}\r
      code={(v) =>\r
        jsx("Equalizer", {\r
          bars: v.bars === "5" ? undefined : Number(v.bars),\r
          playing: v.playing ? undefined : expr("false"),\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack direction="row" gap={3} align="center">\r
          <U.Equalizer\r
            bars={Number(v.bars)}\r
            playing={v.playing}\r
            style={{ fontSize: "2rem" }}\r
          />\r
          <U.Stack gap={0}>\r
            <U.Typography variant="title">Ночь горит огнями</U.Typography>\r
            <U.Typography variant="caption" tone="muted">\r
              Release Host · 02:41\r
            </U.Typography>\r
          </U.Stack>\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Kn=`export default {\r
  name: "Equalizer",\r
  description: "Живые столбики «сейчас играет» для треков и комнат.",\r
  category: "motion",\r
} as const;\r
`,Gn=`import { createElement, type ElementType } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface GlowTextProps extends CommonProps {
  as?: ElementType;
  /** Flicker now and then like a neon sign. */
  flicker?: boolean;
}

/** Neon text: a gradient flows through the letters under a soft halo. */
export function GlowText({
  as = "span",
  flicker = false,
  children,
  ...p
}: GlowTextProps) {
  return createElement(
    as,
    {
      ...mark("GlowText", p),
      "data-flicker": flicker || undefined,
      // Plain text gets its halo from a still copy behind it, so the flowing gradient never re-filters.
      "data-text": typeof children === "string" ? children : undefined,
    },
    children,
  );
}
`,jn=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function GlowTextExample() {\r
  return (\r
    <Playground\r
      knobs={{ flicker: { value: true } }}\r
      code={(v) =>\r
        jsx("GlowText", { as: "h2", flicker: v.flicker }, "Karaoke Night")\r
      }\r
    >\r
      {(v) => (\r
        <U.GlowText\r
          as="h2"\r
          flicker={v.flicker}\r
          style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}\r
        >\r
          Karaoke Night\r
        </U.GlowText>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,qn=`export default {\r
  name: "GlowText",\r
  description: "Неоновый текст с переливом и мерцанием вывески.",\r
  category: "motion",\r
} as const;\r
`,Yn=`import type { CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface ImageShineProps extends CommonProps {
  /** A picture with transparency (an icon, a logo): the light runs over its visible pixels only. */
  src: string;
  /** Breathe and glow around the picture as well. */
  glow?: boolean;
  label?: string;
}

/**
 * A band of light sweeps across a picture's shape, as on a polished badge; the picture breathes.
 * Built from stacked layers that only move and fade, so the browser composites it on the GPU.
 */
export function ImageShine({ src, glow = true, label, style, ...p }: ImageShineProps) {
  return (
    <span
      {...mark("ImageShine", p)}
      style={{ ...style, "--ad-shine-src": \`url("\${src}")\` } as CSSProperties}
      data-glow={glow || undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {glow && <img className="ad-image-shine-glow" src={src} alt="" draggable={false} />}
      <img className="ad-image-shine-picture" src={src} alt="" draggable={false} />
      <span className="ad-image-shine-sweep">
        <i />
      </span>
    </span>
  );
}
`,Xn=`import { ImageShine } from "@ad-voice/ui";

// Any picture with transparency works; this one is a neon note drawn inline.
const note = \`data:image/svg+xml,\${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#7a0b24"/><path d="M42 24v36a10 10 0 1 0 6 9V38l20-6v20a10 10 0 1 0 6 9V18z" fill="#ff4d76"/></svg>',
)}\`;

export default function ImageShineExample() {
  return (
    <div style={{ width: "12rem" }}>
      <ImageShine src={note} label="Нота" />
    </div>
  );
}
`,Zn=`export default {
  name: "ImageShine",
  description: "Пробег света по форме картинки (иконки, логотипа); картинка дышит и светится.",
  category: "motion",
} as const;
`,Jn=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface MarqueeProps extends CommonProps {\r
  /** Seconds for one full loop. */\r
  duration?: number;\r
  /** Scroll to the right instead of the left. */\r
  reverse?: boolean;\r
}\r
\r
/** Endless ticker with faded edges; pauses while hovered so it can be read. */\r
export function Marquee({\r
  duration = 20,\r
  reverse = false,\r
  style,\r
  children,\r
  ...p\r
}: MarqueeProps) {\r
  return (\r
    <div\r
      {...mark("Marquee", p)}\r
      style={{ ...style, "--ad-marquee-time": \`\${duration}s\` } as CSSProperties}\r
      data-reverse={reverse || undefined}\r
    >\r
      {/* Two copies make the loop seamless; the second one is hidden from assistive tech. */}\r
      <div className="ad-marquee-track">\r
        <div className="ad-marquee-group">{children}</div>\r
        <div className="ad-marquee-group" aria-hidden>\r
          {children}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
}\r
`,Qn=`import { Equalizer, Marquee, Stack, Typography } from "@ad-voice/ui";\r
\r
const queue = [\r
  "Ночь горит огнями — Release Host",\r
  "Звёзды над городом — Анна",\r
  "Последний танец — Богдан",\r
  "Без тебя — Дмитрий",\r
];\r
\r
export default function MarqueeExample() {\r
  return (\r
    <Marquee duration={18}>\r
      {queue.map((song) => (\r
        <Stack key={song} direction="row" gap={2} align="center">\r
          <Equalizer bars={3} />\r
          <Typography variant="label">{song}</Typography>\r
        </Stack>\r
      ))}\r
    </Marquee>\r
  );\r
}\r
`,ne=`export default {\r
  name: "Marquee",\r
  description:\r
    "Бесконечная бегущая строка с затуханием краёв, пауза при наведении.",\r
  category: "motion",\r
} as const;\r
`,ee=`import { canObserveIntersection } from "../../../core/environment";
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface RevealProps extends CommonProps {
  as?: ElementType;
  /** How children arrive. */
  effect?: "rise" | "fade" | "zoom" | "blur";
  /** Delay between consecutive children, ms. */
  stagger?: number;
  /** Play again every time the block re-enters the viewport. */
  repeat?: boolean;
}

/** Children arrive one after another when the block scrolls into view. */
export function Reveal({
  as = "div",
  effect = "rise",
  stagger = 90,
  repeat = false,
  style,
  children,
  ...p
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Without visibility tracking there is no "scrolled into view": show at once.
    if (!canObserveIntersection()) return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (!repeat) observer.disconnect();
        } else if (repeat) setShown(false);
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);
  return createElement(
    as,
    {
      ...mark("Reveal", p),
      ref,
      style: { ...style, "--ad-reveal-stagger": \`\${stagger}ms\` },
      "data-effect": effect,
      "data-shown": shown || undefined,
    },
    // Each child learns its order so the CSS can delay it.
    Children.map(children, (child, index) =>
      isValidElement(child)
        ? cloneElement(child as ReactElement<{ style?: CSSProperties }>, {
            style: {
              ...(child.props as { style?: CSSProperties }).style,
              "--ad-reveal-i": index,
            } as CSSProperties,
          })
        : child,
    ),
  );
}
`,re=`import { useEffect, useState } from "react";\r
import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
const effects = ["rise", "fade", "zoom", "blur"] as const;\r
const titles = ["Вокал", "Минус", "Мелодия"];\r
\r
export default function RevealExample() {\r
  const [run, setRun] = useState(0);\r
  // Replays on its own, so the arrival is always there to watch.\r
  useEffect(() => {\r
    const timer = setInterval(() => setRun((n) => n + 1), 4000);\r
    return () => clearInterval(timer);\r
  }, []);\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{ effect: { options: effects, value: "rise" } }}\r
      code={(v) =>\r
        jsx(\r
          "Reveal",\r
          { effect: v.effect === "rise" ? undefined : v.effect },\r
          titles.map((t) => \`<Card title="\${t}" />\`).join("\\n  "),\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Reveal key={\`\${v.effect}-\${run}\`} effect={v.effect}>\r
          {titles.map((title) => (\r
            <U.Card key={title} title={title} icon="audio" padding="sm" />\r
          ))}\r
        </U.Reveal>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,te=`export default {\r
  name: "Reveal",\r
  description: "Каскадное появление содержимого при прокрутке к нему.",\r
  category: "motion",\r
} as const;\r
`,oe=`import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface ShimmerProps extends CommonProps {\r
  /** Text lines to imitate. */\r
  lines?: number;\r
  /** Add a round placeholder, e.g. for an avatar. */\r
  circle?: boolean;\r
  label?: string;\r
}\r
\r
/** Loading placeholder: the shape of the coming content with a light running over it. */\r
export function Shimmer({\r
  lines = 3,\r
  circle = false,\r
  label = "Загрузка",\r
  ...p\r
}: ShimmerProps) {\r
  return (\r
    <div\r
      {...mark("Shimmer", p)}\r
      role="status"\r
      aria-label={label}\r
      aria-busy="true"\r
    >\r
      {circle && <i className="ad-shimmer-circle" />}\r
      <span className="ad-shimmer-lines">\r
        {Array.from({ length: lines }, (_, i) => (\r
          <i\r
            key={i}\r
            style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}\r
          />\r
        ))}\r
      </span>\r
    </div>\r
  );\r
}\r
`,ae=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function ShimmerExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        lines: { options: ["1", "2", "3", "4"], value: "3" },\r
        circle: { value: true },\r
      }}\r
      code={(v) =>\r
        jsx("Shimmer", {\r
          lines: v.lines === "3" ? undefined : Number(v.lines),\r
          circle: v.circle,\r
        })\r
      }\r
    >\r
      {(v) => <U.Shimmer lines={Number(v.lines)} circle={v.circle} />}\r
    </Playground>\r
  );\r
}\r
`,se=`export default {\r
  name: "Shimmer",\r
  description: "Заглушка загрузки: форма будущего контента и бегущий блик.",\r
  category: "motion",\r
} as const;\r
`,ie=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface SparklesProps extends CommonProps {\r
  /** Number of sparks. */\r
  count?: number;\r
  /** Spark colour; defaults to a warm white. */\r
  color?: string;\r
}\r
\r
/** Twinkling four-point stars scattered around the content. */\r
export function Sparkles({\r
  count = 10,\r
  color,\r
  style,\r
  children,\r
  ...p\r
}: SparklesProps) {\r
  return (\r
    <span\r
      {...mark("Sparkles", p)}\r
      style={{ ...style, "--ad-sparkle": color } as CSSProperties}\r
    >\r
      {children}\r
      {Array.from({ length: count }, (_, i) => {\r
        // Golden-angle spread gives an even but irregular scatter without randomness.\r
        const angle = i * 137.5;\r
        const reach = 55 + ((i * 29) % 40);\r
        return (\r
          <svg\r
            key={i}\r
            className="ad-sparkle"\r
            viewBox="0 0 10 10"\r
            aria-hidden\r
            style={{\r
              left: \`\${50 + Math.cos((angle * Math.PI) / 180) * reach}%\`,\r
              top: \`\${50 + Math.sin((angle * Math.PI) / 180) * reach * 0.8}%\`,\r
              width: \`\${0.45 + ((i * 7) % 5) / 10}em\`,\r
              animationDelay: \`\${((i * 0.37) % 2.4).toFixed(2)}s\`,\r
            }}\r
          >\r
            <path d="M5 0C5.6 3.6 6.4 4.4 10 5C6.4 5.6 5.6 6.4 5 10C4.4 6.4 3.6 5.6 0 5C3.6 4.4 4.4 3.6 5 0Z" />\r
          </svg>\r
        );\r
      })}\r
    </span>\r
  );\r
}\r
`,le=`import { Badge, Sparkles, Stack, Typography } from "@ad-voice/ui";\r
\r
export default function SparklesExample() {\r
  return (\r
    <Stack direction="row" gap={6} align="center" wrap>\r
      <Sparkles count={12} style={{ fontSize: "1.5rem" }}>\r
        <Typography variant="h3">Лучший вокал</Typography>\r
      </Sparkles>\r
      <Sparkles count={6}>\r
        <Badge tone="warning">Топ-1</Badge>\r
      </Sparkles>\r
    </Stack>\r
  );\r
}\r
`,ce=`export default {\r
  name: "Sparkles",\r
  description: "Мерцающие искры вокруг значка, награды или заголовка.",\r
  category: "motion",\r
} as const;\r
`,de=`import { createElement, type ElementType } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface SpotlightProps extends CommonProps {\r
  as?: ElementType;\r
  /** Light colour; defaults to the theme accent. */\r
  color?: string;\r
  /** Radius of the light circle, any CSS length. */\r
  radius?: string;\r
}\r
\r
/** A light that follows the pointer across the surface and lights the edge nearest to it. */\r
export function Spotlight({\r
  as = "div",\r
  color,\r
  radius,\r
  style,\r
  children,\r
  ...p\r
}: SpotlightProps) {\r
  return createElement(\r
    as,\r
    {\r
      ...mark("Spotlight", p),\r
      style: { ...style, "--ad-spot-color": color, "--ad-spot-r": radius },\r
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {\r
        const box = event.currentTarget.getBoundingClientRect();\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-x",\r
          \`\${event.clientX - box.left}px\`,\r
        );\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-y",\r
          \`\${event.clientY - box.top}px\`,\r
        );\r
      },\r
    },\r
    children,\r
  );\r
}\r
`,pe=`import { Card, Grid, Spotlight, Typography } from "@ad-voice/ui";\r
\r
export default function SpotlightExample() {\r
  return (\r
    <Grid minChildWidth="12rem" gap={3}>\r
      {["Комната", "Очередь", "Записи"].map((title) => (\r
        <Spotlight key={title}>\r
          <Card title={title} icon="music">\r
            <Typography variant="body-sm" tone="muted">\r
              Проведите курсором над карточкой.\r
            </Typography>\r
          </Card>\r
        </Spotlight>\r
      ))}\r
    </Grid>\r
  );\r
}\r
`,ue=`export default {\r
  name: "Spotlight",\r
  description: "Свет и подсветка кромки, которые следуют за курсором.",\r
  category: "motion",\r
} as const;\r
`,me=`import { createElement, type ElementType } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface TiltProps extends CommonProps {\r
  as?: ElementType;\r
  /** Largest tilt in degrees. */\r
  max?: number;\r
  /** Show a glare that follows the pointer. */\r
  glare?: boolean;\r
}\r
\r
/** Leans toward the pointer in 3D, with a glossy glare, and springs back when left. */\r
export function Tilt({\r
  as = "div",\r
  max = 14,\r
  glare = true,\r
  children,\r
  ...p\r
}: TiltProps) {\r
  const set = (el: HTMLElement, x: number, y: number) => {\r
    el.style.setProperty("--ad-tilt-x", \`\${(-y * max).toFixed(2)}deg\`);\r
    el.style.setProperty("--ad-tilt-y", \`\${(x * max).toFixed(2)}deg\`);\r
    el.style.setProperty("--ad-glare-x", \`\${(x + 0.5) * 100}%\`);\r
    el.style.setProperty("--ad-glare-y", \`\${(y + 0.5) * 100}%\`);\r
  };\r
  return createElement(\r
    as,\r
    {\r
      ...mark("Tilt", p),\r
      "data-glare": glare || undefined,\r
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {\r
        const box = event.currentTarget.getBoundingClientRect();\r
        set(\r
          event.currentTarget,\r
          (event.clientX - box.left) / box.width - 0.5,\r
          (event.clientY - box.top) / box.height - 0.5,\r
        );\r
      },\r
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) =>\r
        set(event.currentTarget, 0, 0),\r
    },\r
    children,\r
  );\r
}\r
`,fe=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function TiltExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        max: { options: ["8", "14", "24"], value: "14" },\r
        glare: { value: true },\r
      }}\r
      code={(v) =>\r
        jsx(\r
          "Tilt",\r
          {\r
            max: v.max === "14" ? undefined : Number(v.max),\r
            glare: v.glare ? undefined : expr("false"),\r
          },\r
          '<Card material="ruby" title="Сейчас поёт" icon="mic" />',\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Tilt max={Number(v.max)} glare={v.glare}>\r
          <U.Card\r
            material="ruby"\r
            title="Сейчас поёт"\r
            icon="mic"\r
            description="Release Host · 02:41"\r
          />\r
        </U.Tilt>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,ge=`export default {\r
  name: "Tilt",\r
  description: "3D-наклон к курсору с бликом и пружинным возвратом.",\r
  category: "motion",\r
} as const;\r
`,he=`import { mark } from "../../../core/base";
import { type BadgeProps } from "../shared";

/** A tone adds a live status dot in front of the label. */
export const Badge = (p: BadgeProps) => (
  <span {...mark("Badge", p)}>
    {p.tone && <i className="ad-badge-dot" aria-hidden />}
    {p.children ?? p.label ?? "GPU"}
  </span>
);
`,ve=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

const tones = ["none", "success", "warning", "error", "info"] as const;

export default function BadgeExample() {
  return (
    <Playground
      knobs={{
        tone: { options: tones, value: "success" },
        size: { options: sizes, value: "md" },
      }}
      code={(v, c) =>
        jsx(
          "Badge",
          { tone: v.tone === "none" ? undefined : v.tone, size: c.size },
          "Готово",
        )
      }
    >
      {(v) => (
        <U.Badge tone={v.tone === "none" ? undefined : v.tone} size={v.size}>
          Готово
        </U.Badge>
      )}
    </Playground>
  );
}
`,be=`export default {\r
  name: "Badge",\r
  description: "Короткая метка или роль",\r
  category: "feedback",\r
} as const;\r
`,ye=`import { mark, useControllable } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type CollapsibleSectionProps } from "../shared";\r
\r
export const CollapsibleSection = (p: CollapsibleSectionProps) => {\r
  const [open, setOpen] = useControllable(\r
    p.open,\r
    p.defaultOpen ?? false,\r
    p.onOpenChange,\r
  );\r
  return (\r
    <details\r
      {...mark("CollapsibleSection", p, "card")}\r
      open={open}\r
      onToggle={(e) => {\r
        if (e.currentTarget.open !== open) setOpen(e.currentTarget.open);\r
      }}\r
    >\r
      <summary>\r
        <Icon name={p.icon ?? "braces"} />\r
        <span className="ad-collapse-heading">\r
          <span>{p.title ?? "Технический JSON"}</span>\r
          {p.description && <small>{p.description}</small>}\r
        </span>\r
        <Icon name="chevron" size={18} />\r
      </summary>\r
      <div className="ad-collapse-content">\r
        {p.children ?? "Содержимое раскрывающегося раздела."}\r
      </div>\r
    </details>\r
  );\r
};\r
`,xe=`import { CollapsibleSection, KeyValueList } from "@ad-voice/ui";

export default function CollapsibleSectionExample() {
  return (
    <CollapsibleSection title="Технические детали" icon="braces">
      <KeyValueList
        items={[
          ["Частота", "48 kHz"],
          ["Буфер", "128 сэмплов"],
          ["Задержка", "6.7 мс"],
        ]}
      />
    </CollapsibleSection>
  );
}
`,ke=`export default {\r
  name: "CollapsibleSection",\r
  description: "Раскрывающийся раздел",\r
  category: "feedback",\r
} as const;\r
`,_e=`import { useMemo, useState, type ReactNode } from "react";
import { mark, useControllable } from "../../../core/base";
import { Checkbox } from "../../controls/Checkbox/Checkbox";
import { IconButton } from "../../controls/IconButton/IconButton";
import { TextField } from "../../controls/TextField/TextField";
import { Icon } from "../../layout/Icon/Icon";
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRow,
  DataTableSort,
} from "../shared";

const field = (row: DataTableRow, key: string) =>
  (row as Record<string, unknown>)[key];

/** Text of a cell for sorting and search: numbers stay numbers. */
function cellValue(column: DataTableColumn, row: DataTableRow) {
  const raw = column.value ? column.value(row) : field(row, column.key);
  return typeof raw === "number" ? raw : raw == null ? "" : String(raw);
}

/**
 * A data table: sortable columns, row selection with "select all", search, pages, a sticky
 * header when it scrolls, loading and empty states. Plain \`columns: string[]\` with array
 * rows still works.
 */
export function DataTable<T extends DataTableRow = DataTableRow>({
  columns = ["Дата", "Событие", "Статус"],
  rows = [] as unknown as T[],
  caption,
  rowKey = (_, index) => String(index),
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selected: controlledSelection,
  defaultSelected = [],
  onSelectionChange,
  searchable = false,
  pageSize,
  maxHeight,
  dense = false,
  striped = false,
  loading = false,
  empty = "Нет данных",
  onRowClick,
  ...p
}: DataTableProps<T>) {
  const cols = useMemo(
    () =>
      columns.map((column, index) =>
        typeof column === "string"
          ? ({ key: String(index), title: column } as DataTableColumn<T>)
          : column,
      ),
    [columns],
  );
  const [sort, setSort] = useControllable<DataTableSort | null>(
    controlledSort,
    defaultSort,
    onSortChange,
  );
  const [selection, setSelection] = useControllable(
    controlledSelection,
    defaultSelected,
    onSelectionChange,
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const keyed = rows.map((row, index) => ({
    row,
    index,
    key: rowKey(row, index),
  }));
  const found = query
    ? keyed.filter(({ row }) =>
        cols.some((column) =>
          String(cellValue(column as DataTableColumn, row))
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      )
    : keyed;
  const sortColumn = sort && cols.find((column) => column.key === sort.key);
  const sorted = sortColumn
    ? [...found].sort((a, b) => {
        const x = cellValue(sortColumn as DataTableColumn, a.row);
        const y = cellValue(sortColumn as DataTableColumn, b.row);
        const order =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort!.direction === "asc" ? order : -order;
      })
    : found;
  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const current = Math.min(page, pages - 1);
  const visible = pageSize
    ? sorted.slice(current * pageSize, (current + 1) * pageSize)
    : sorted;

  const chosen = new Set(selection);
  const allChosen =
    found.length > 0 && found.every(({ key }) => chosen.has(key));
  const someChosen = !allChosen && found.some(({ key }) => chosen.has(key));
  const toggleAll = () =>
    setSelection(
      allChosen
        ? selection.filter((key) => !found.some((item) => item.key === key))
        : [...new Set([...selection, ...found.map(({ key }) => key)])],
    );
  const toggle = (key: string) =>
    setSelection(
      chosen.has(key)
        ? selection.filter((k) => k !== key)
        : [...selection, key],
    );
  // Ascending, descending, then back to the original order.
  const cycleSort = (key: string) =>
    setSort(
      sort?.key !== key
        ? { key, direction: "asc" }
        : sort.direction === "asc"
          ? { key, direction: "desc" }
          : null,
    );

  const span = cols.length + (selectable ? 1 : 0);
  const body: ReactNode = loading ? (
    Array.from({ length: Math.min(pageSize ?? 4, 6) }, (_, i) => (
      <tr key={i} className="ad-data-table-loading">
        {Array.from({ length: span }, (__, j) => (
          <td key={j}>
            <i />
          </td>
        ))}
      </tr>
    ))
  ) : visible.length === 0 ? (
    <tr>
      <td className="ad-data-table-empty" colSpan={span}>
        {empty}
      </td>
    </tr>
  ) : (
    visible.map(({ row, index, key }) => (
      <tr
        key={key}
        data-selected={chosen.has(key) || undefined}
        data-clickable={onRowClick ? true : undefined}
        onClick={onRowClick && (() => onRowClick(row, index))}
      >
        {selectable && (
          <td
            className="ad-data-table-check"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              size="sm"
              checked={chosen.has(key)}
              onValueChange={() => toggle(key)}
              label={<span className="ad-sr-only">Выбрать строку</span>}
            />
          </td>
        )}
        {cols.map((column) => (
          <td key={column.key} data-align={column.align}>
            {column.render
              ? column.render(row, index)
              : (field(row, column.key) as ReactNode)}
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <div
      {...mark("DataTable", p)}
      data-dense={dense || undefined}
      data-striped={striped || undefined}
    >
      {(caption || searchable) && (
        <div className="ad-data-table-bar">
          {caption && <strong>{caption}</strong>}
          {searchable && (
            <TextField
              size="sm"
              placeholder="Поиск…"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              startAdornment={<Icon name="search" />}
              clearable
              aria-label="Поиск по таблице"
            />
          )}
        </div>
      )}
      <div className="ad-data-table-scroll" style={{ maxHeight }}>
        <table>
          <thead>
            <tr>
              {selectable && (
                <th className="ad-data-table-check">
                  <Checkbox
                    size="sm"
                    checked={allChosen}
                    indeterminate={someChosen}
                    onValueChange={toggleAll}
                    label={<span className="ad-sr-only">Выбрать все</span>}
                  />
                </th>
              )}
              {cols.map((column) => {
                const sortable = column.sortable ?? true;
                const direction =
                  sort?.key === column.key ? sort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-align={column.align}
                    style={{ width: column.width }}
                    aria-sort={
                      direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="ad-data-table-sort"
                        data-direction={direction}
                        onClick={() => cycleSort(column.key)}
                      >
                        {column.title}
                        <Icon name="chevron" />
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {(pageSize || (selectable && selection.length > 0)) && (
        <div className="ad-data-table-foot">
          <span>
            {selectable && selection.length > 0
              ? \`Выбрано: \${selection.length}\`
              : \`\${sorted.length} \${query ? "найдено" : "всего"}\`}
          </span>
          {pageSize && pages > 1 && (
            <span className="ad-data-table-pages">
              <IconButton
                size="xs"
                variant="ghost"
                icon="prev"
                label="Предыдущая страница"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              />
              <span>
                {current + 1} / {pages}
              </span>
              <IconButton
                size="xs"
                variant="ghost"
                icon="prev"
                label="Следующая страница"
                className="ad-data-table-next"
                disabled={current >= pages - 1}
                onClick={() => setPage(current + 1)}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
`,we=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";
import type { DataTableColumn } from "@ad-voice/ui";

type Track = {
  id: string;
  title: string;
  artist: string;
  seconds: number;
  plays: number;
  status: "ready" | "processing" | "error";
};

const tracks: Track[] = [
  ["Ночь горит огнями", "Аура", 214, 1840, "ready"],
  ["Сквозь бетон", "Норд", 187, 920, "ready"],
  ["Рубиновый рассвет", "Мия", 242, 3110, "processing"],
  ["Шёпот волн", "Аура", 199, 640, "ready"],
  ["Город без сна", "Кай", 228, 2405, "error"],
  ["Лёд и пламя", "Мия", 176, 1290, "ready"],
  ["Последний трамвай", "Норд", 205, 455, "processing"],
  ["Неон", "Кай", 231, 5020, "ready"],
].map(([title, artist, seconds, plays, status], i) => ({
  id: \`t\${i}\`,
  title,
  artist,
  seconds,
  plays,
  status,
})) as Track[];

const statuses = {
  ready: ["Готово", "success"],
  processing: ["Обработка", "processing"],
  error: ["Ошибка", "error"],
} as const;

const columns: DataTableColumn<Track>[] = [
  { key: "title", title: "Трек" },
  { key: "artist", title: "Исполнитель" },
  {
    key: "seconds",
    title: "Длина",
    align: "end",
    render: (t) =>
      \`\${Math.floor(t.seconds / 60)}:\${String(t.seconds % 60).padStart(2, "0")}\`,
  },
  {
    key: "plays",
    title: "Прослушивания",
    align: "end",
    render: (t) => t.plays.toLocaleString("ru-RU"),
  },
  {
    key: "status",
    title: "Статус",
    value: (t) => statuses[t.status][0],
    render: (t) => (
      <U.Badge size="sm" tone={statuses[t.status][1]}>
        {statuses[t.status][0]}
      </U.Badge>
    ),
  },
];

export default function DataTableExample() {
  return (
    <Playground
      stretch
      knobs={{
        selectable: { value: true },
        searchable: { value: true },
        dense: { value: false },
        striped: { value: false },
        loading: { value: false },
      }}
      code={(v) =>
        jsx("DataTable", {
          caption: "Треки",
          columns: expr("columns"),
          rows: expr("tracks"),
          rowKey: expr("(t) => t.id"),
          defaultSort: expr('{ key: "plays", direction: "desc" }'),
          pageSize: 4,
          selectable: v.selectable,
          searchable: v.searchable,
          dense: v.dense,
          striped: v.striped,
          loading: v.loading,
        })
      }
    >
      {(v) => (
        <U.DataTable
          style={{ width: "min(100%, 48rem)" }}
          caption="Треки"
          columns={columns}
          rows={tracks}
          rowKey={(t) => t.id}
          defaultSort={{ key: "plays", direction: "desc" }}
          pageSize={4}
          selectable={v.selectable}
          searchable={v.searchable}
          dense={v.dense}
          striped={v.striped}
          loading={v.loading}
        />
      )}
    </Playground>
  );
}
`,Pe=`export default {\r
  name: "DataTable",\r
  description: "Таблица истории и состояния данных",\r
  category: "feedback",\r
  wide: true,\r
} as const;\r
`,Se=`import { useId, useLayoutEffect, useRef, useState } from "react";
import { mark, useControllable } from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Header } from "../../layout/Header/Header";
import { DialogBody } from "../../layout/DialogBody/DialogBody";
import { DialogActions } from "../../layout/DialogActions/DialogActions";
import { MessageBar } from "../MessageBar/MessageBar";
import type { DialogProps } from "../shared";
/** The backdrop belongs to the dialog element itself: a press on it lands on the dialog, outside its box. */
const outside = (dialog: HTMLDialogElement, x: number, y: number, target: EventTarget) => {
  if (target !== dialog) return false;
  const box = dialog.getBoundingClientRect();
  return x < box.left || x > box.right || y < box.top || y > box.bottom;
};

export const Dialog = (p: DialogProps) => {
  const [open, setOpen] = useControllable(
      p.open,
      p.defaultOpen ?? false,
      p.onOpenChange,
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string>();
  const ref = useRef<HTMLDialogElement>(null),
    // Where the press began: a click closes the window only when it both starts and ends outside it.
    pressedOutside = useRef(false),
    titleId = useId(),
    descId = useId();
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    // Environments without the modal dialog API (jsdom) just toggle the open attribute.
    const modal = typeof d.showModal === "function";
    if (open && !d.open) {
      if (modal) d.showModal();
      else d.setAttribute("open", "");
    } else if (!open && d.open) {
      if (modal) d.close();
      else d.removeAttribute("open");
    }
    return () => {
      if (d.open && modal) d.close();
      else d.removeAttribute("open");
    };
  }, [open]);
  return (
    <dialog
      {...mark("Dialog", p, "dialog")}
      ref={ref}
      data-ad-width={p.width}
      aria-labelledby={titleId}
      onPointerDown={(e) => {
        pressedOutside.current = outside(e.currentTarget, e.clientX, e.clientY, e.target);
      }}
      onClick={(e) => {
        if (p.dismissible !== false && !pending && pressedOutside.current && outside(e.currentTarget, e.clientX, e.clientY, e.target))
          setOpen(false);
        pressedOutside.current = false;
      }}
      onPointerMove={(e) => {
        // A soft light follows the pointer across the window.
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--ad-spot-x", \`\${e.clientX - box.left}px\`);
        e.currentTarget.style.setProperty("--ad-spot-y", \`\${e.clientY - box.top}px\`);
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.removeProperty("--ad-spot-x");
        e.currentTarget.style.removeProperty("--ad-spot-y");
      }}
      aria-describedby={p.description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) setOpen(false);
      }}
    >
      {p.art && (
        <div className="ad-dialog-art" aria-hidden="true">
          {p.art}
        </div>
      )}
      <Header
        title={<span id={titleId}>{p.title ?? "Подтверждение"}</span>}
        icon={p.icon}
        level={2}
        actions={
          <IconButton
            variant="ghost"
            icon="close"
            label={p.closeLabel ?? "Закрыть"}
            disabled={pending}
            onClick={() => setOpen(false)}
          />
        }
      />
      <DialogBody>
        {p.description && <p id={descId}>{p.description}</p>}
        {p.children}
        {error && <MessageBar tone="error">{error}</MessageBar>}
      </DialogBody>
      {(p.cancelLabel !== false || p.confirmLabel !== false) && (
        <DialogActions>
          {p.cancelLabel !== false && (
            <Button disabled={pending} onClick={() => setOpen(false)}>
              {p.cancelLabel ?? "Отмена"}
            </Button>
          )}
          {p.confirmLabel !== false && (
            <Button
              variant={p.danger ? "danger" : "primary"}
              loading={pending}
              onClick={async () => {
                setError(undefined);
                try {
                  const outcome = p.onConfirm?.();
                  // Only an asynchronous action holds the dialog busy; a plain one closes at once.
                  if (!(outcome instanceof Promise)) {
                    if (outcome !== false) setOpen(false);
                    return;
                  }
                  setPending(true);
                  if ((await outcome) !== false) setOpen(false);
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Не удалось выполнить действие",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {p.confirmLabel ?? "Готово"}
            </Button>
          )}
        </DialogActions>
      )}
    </dialog>
  );
};
`,Te=`import { useState } from "react";
import { Button, Dialog } from "@ad-voice/ui";

export default function DialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" icon="trash" onClick={() => setOpen(true)}>
        Удалить запись
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        danger
        title="Удалить запись?"
        description="Файл и результаты анализа будут удалены без возможности восстановления."
        confirmLabel="Удалить"
        onConfirm={() => new Promise((done) => setTimeout(done, 800))}
      />
    </>
  );
}
`,Ce=`export default {\r
  name: "Dialog",\r
  description: "Модальное окно и управление фокусом",\r
  category: "layout",\r
} as const;\r
`,Me=`import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type EmptyStateProps } from "../shared";

export const EmptyState = (p: EmptyStateProps) => (
  <div {...mark("EmptyState", p)}>
    <Icon name={p.icon ?? "music"} size={44} />
    <h3>{p.title ?? "Пока нет записей"}</h3>
    <p>{p.description ?? "Добавьте запись, чтобы начать."}</p>
    {p.action}
  </div>
);
`,Re=`import { Button, EmptyState } from "@ad-voice/ui";

export default function EmptyStateExample() {
  return (
    <EmptyState
      icon="music"
      title="Пока нет записей"
      description="Спойте первую песню — запись появится здесь."
      action={
        <Button variant="primary" icon="plus">
          Новое выступление
        </Button>
      }
    />
  );
}
`,Ee=`export default {\r
  name: "EmptyState",\r
  description: "Пустой список и действие для начала",\r
  category: "feedback",\r
} as const;\r
`,Ae=`import { mark } from "../../../core/base";
import { type KeyValueListProps } from "../shared";

export const KeyValueList = (p: KeyValueListProps) => (
  <dl {...mark("KeyValueList", p)}>
    {(
      p.items ?? [
        ["Python Backend", "Ready"],
        ["AudioService", "Running"],
        ["База данных", "Исправно"],
      ]
    ).map(([key, value], i) => (
      <div key={i}>
        <dt>{key}</dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
);
`,Be=`import { KeyValueList, StatusIndicator } from "@ad-voice/ui";

export default function KeyValueListExample() {
  return (
    <KeyValueList
      items={[
        [
          "Python backend",
          <StatusIndicator status="success" label="Работает" />,
        ],
        ["Аудиосервис", <StatusIndicator status="processing" label="Запуск" />],
        ["База данных", <StatusIndicator status="success" label="Исправна" />],
      ]}
    />
  );
}
`,Ie=`export default {\r
  name: "KeyValueList",\r
  description: "Пары названий и значений",\r
  category: "feedback",\r
} as const;\r
`,Ne=`import { Divider } from "../../layout/Divider/Divider";
import { Popover } from "../Popover/Popover";
import { MenuItem } from "../MenuItem/MenuItem";
import type { MenuProps } from "../shared";
export const Menu = (p: MenuProps) => (
  <Popover
    {...p}
    role="menu"
    className={\`ad-menu \${p.className ?? ""}\`}
    onKeyDown={(e) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(e.key))
        return;
      if (e.key === "Tab") {
        p.onOpenChange?.(false);
        return;
      }
      e.preventDefault();
      const buttons = Array.from(
        e.currentTarget.querySelectorAll("button:not(:disabled)"),
      ) as HTMLButtonElement[];
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? buttons.length - 1
            : (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next]?.focus();
    }}
  >
    {(p.items ?? []).map((item, i) =>
      item.separator ? (
        <Divider key={item.id ?? String(i)} />
      ) : (
        <MenuItem
          key={item.id ?? String(i)}
          {...item}
          onSelect={() => {
            p.onOpenChange?.(false);
            p.anchorRef?.current?.focus();
            item.onSelect?.();
          }}
        />
      ),
    )}
  </Popover>
);
`,ze=`import { useRef, useState } from "react";
import { Button, Menu } from "@ad-voice/ui";

export default function MenuExample() {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={anchor}
        icon="more"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Действия
      </Button>
      <Menu
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        items={[
          { label: "Переименовать", icon: "pencil" },
          { label: "Скачать", icon: "download" },
          { separator: true },
          { label: "Удалить", icon: "trash", danger: true },
        ]}
      />
    </>
  );
}
`,Le=`export default {\r
  name: "Menu",\r
  description: "Меню действий с клавиатурной навигацией",\r
  category: "navigation",\r
} as const;\r
`,De=`import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import type { MenuItemProps } from "../shared";

export const MenuItem = (p: MenuItemProps) => {
  const label = p.label ?? p.children ?? "Действие";
  return (
    <button
      {...mark("MenuItem", { ...p, tone: p.danger ? "error" : p.tone })}
      type="button"
      role="menuitem"
      disabled={p.disabled}
      onClick={p.onSelect}
    >
      <span className="ad-menu-item-icon" aria-hidden="true">
        <Icon name={p.icon ?? "more"} />
      </span>
      <span className="ad-menu-item-label">{label}</span>
      {p.endIcon && (
        <span className="ad-menu-item-end" aria-hidden="true">
          <Icon name={p.endIcon} />
        </span>
      )}
    </button>
  );
};
`,Fe=`import { Card, Divider, MenuItem, Stack } from "@ad-voice/ui";

/** MenuItem is what Menu renders for each entry; use it to build a custom menu surface. */
export default function MenuItemExample() {
  return (
    <Card material="dialog" padding="sm">
      <Stack role="menu" aria-label="Действия с записью" gap={1}>
        <MenuItem label="Переименовать" icon="pencil" />
        <MenuItem label="Скачать" icon="download" />
        <Divider />
        <MenuItem label="Удалить" icon="trash" danger />
      </Stack>
    </Card>
  );
}
`,Ve=`export default {\r
  name: "MenuItem",\r
  description: "Действие меню, иконка и опасное состояние",\r
  category: "navigation",\r
} as const;\r
`,$e=`import { mark } from "../../../core/base";
import type { MessageBarProps } from "../shared";
import { Icon } from "../../layout/Icon/Icon";

const icons = { success: "check", error: "warning", warning: "warning" };

export const MessageBar = ({ action, ...p }: MessageBarProps) => (
  <div
    {...mark("MessageBar", { ...p, tone: p.tone ?? "warning" })}
    role={p.tone === "error" ? "alert" : "status"}
  >
    <span className="ad-message-bar-icon" aria-hidden>
      <Icon name={icons[p.tone as keyof typeof icons] ?? "info"} />
    </span>
    <span className="ad-message-bar-text">
      {p.children ?? "Для операции нужно больше свободного места."}
    </span>
    {action && <span className="ad-message-bar-action">{action}</span>}
  </div>
);
`,Oe=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const tones = ["warning", "error", "success", "info"] as const;
const text = {
  warning: "Осталось меньше 1 ГБ свободного места",
  error: "Не удалось сохранить запись",
  success: "Все параметры сохранены",
  info: "Новая версия модели доступна",
};

export default function MessageBarExample() {
  return (
    <Playground
      stretch
      knobs={{ tone: { options: tones, value: "warning" } }}
      code={(v) => jsx("MessageBar", { tone: v.tone }, text[v.tone])}
    >
      {(v) => <U.MessageBar tone={v.tone}>{text[v.tone]}</U.MessageBar>}
    </Playground>
  );
}
`,He=`export default {\r
  name: "MessageBar",\r
  description: "Сообщение внутри карточки",\r
  category: "feedback",\r
} as const;\r
`,Ue=`import { useLayoutEffect, useRef } from "react";
import { cssRem, mark } from "../../../core/base";
import { type PopoverProps } from "../shared";

export const Popover = (p: PopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const change = useRef(p.onOpenChange);
  change.current = p.onOpenChange;
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !p.open) return;
    const position = () => {
      const target = p.anchorRef?.current?.getBoundingClientRect();
      const gap = 8;
      if (target && p.matchAnchorWidth)
        node.style.minWidth = cssRem(target.width);
      const r = node.getBoundingClientRect();
      const desired = target
        ? p.align === "start"
          ? target.left
          : target.right - r.width
        : innerWidth / 2 - r.width / 2;
      const left = Math.max(8, Math.min(innerWidth - r.width - 8, desired));
      const roomBelow = target ? innerHeight - target.bottom : innerHeight / 2;
      const roomAbove = target ? target.top : innerHeight / 2;
      const placeAbove =
        !!target && roomBelow < r.height + gap + 8 && roomAbove > roomBelow;
      const rawTop = target
        ? placeAbove
          ? target.top - r.height - gap
          : target.bottom + gap
        : innerHeight / 2 - r.height / 2;
      const top = Math.max(8, Math.min(innerHeight - r.height - 8, rawTop));
      node.style.left = cssRem(left);
      node.style.top = cssRem(top);
      node.dataset.adSide = placeAbove ? "above" : "below";
      if (target) {
        const anchorX = Math.max(
          24,
          Math.min(r.width - 24, target.left + target.width / 2 - left),
        );
        node.style.setProperty("--ad-popover-anchor-x", cssRem(anchorX));
      } else {
        node.style.removeProperty("--ad-popover-anchor-x");
      }
    };
    const supports = typeof node.showPopover === "function";
    if (supports) node.showPopover();
    position();
    if (p.autoFocus !== false)
      (
        node.querySelector<HTMLElement>(
          '[aria-selected="true"]:not(:disabled)',
        ) ??
        node.querySelector<HTMLElement>(
          'button:not(:disabled),input,[tabindex="0"]',
        )
      )?.focus();
    const dismiss = (e: PointerEvent) => {
      const path = e.composedPath();
      if (
        !path.includes(node) &&
        !path.includes(p.anchorRef?.current as EventTarget)
      )
        change.current?.(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        change.current?.(false);
        p.anchorRef?.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      if (supports && node.matches(":popover-open")) node.hidePopover();
    };
  }, [p.open, p.anchorRef]);
  if (!p.open) return null;
  return (
    <div
      {...mark("Popover", p, "dialog")}
      ref={ref}
      role={p.role ?? "dialog"}
      aria-label={p.label}
      popover="manual"
      onKeyDown={p.onKeyDown}
      style={{ margin: 0, position: "fixed", ...p.style }}
    >
      {p.children}
    </div>
  );
};
`,We=`import { useRef, useState } from "react";
import { Button, Popover, Slider, Stack, Typography } from "@ad-voice/ui";

export default function PopoverExample() {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(65);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={anchor} icon="volume" onClick={() => setOpen((v) => !v)}>
        Громкость {volume}%
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        label="Громкость"
      >
        <Stack gap={2}>
          <Typography variant="label">Громкость</Typography>
          <Slider value={volume} onValueChange={setVolume} label="Громкость" />
        </Stack>
      </Popover>
    </>
  );
}
`,Ke=`export default {\r
  name: "Popover",\r
  description: "Привязанная всплывающая поверхность",\r
  category: "navigation",\r
} as const;\r
`,Ge=`import { useId } from "react";
import { clamp, mark } from "../../../core/base";
import { type ProgressBarProps } from "../shared";

/** A fixed, natural-looking row of wave bars; its loudness varies like a song's. */
const WAVE = Array.from({ length: 64 }, (_, i) =>
  0.25 + 0.75 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 1.3)),
);
const wavePath = WAVE.map((level, i) => {
  const half = level * 10;
  return \`M\${i * 2 + 0.4} \${12 - half}h1.2v\${half * 2}h-1.2z\`;
}).join("");

export const ProgressBar = (p: ProgressBarProps) => {
  const max = Math.max(0.0001, p.max ?? 100);
  const value = clamp(p.value ?? 56, 0, max);
  const share = p.indeterminate ? 35 : (value / max) * 100;
  const clip = \`ad-wave-\${useId().replace(/:/g, "")}\`;
  return (
    <div
      {...mark("ProgressBar", p)}
      role="progressbar"
      aria-label={p.label ?? "Прогресс"}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={p.indeterminate ? undefined : value}
      data-indeterminate={p.indeterminate || undefined}
      data-variant={p.variant === "wave" ? "wave" : undefined}
    >
      {p.variant === "wave" ? (
        <svg viewBox="0 0 128 24" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <clipPath id={clip}>
              <rect width={(128 * share) / 100} height="24" />
            </clipPath>
          </defs>
          <path className="ad-progress-wave-idle" d={wavePath} />
          <path className="ad-progress-wave-done" d={wavePath} clipPath={\`url(#\${clip})\`} />
        </svg>
      ) : (
        <span style={{ width: \`\${share}%\` }} />
      )}
    </div>
  );
};
`,je=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ProgressBarExample() {
  return (
    <Playground
      stretch
      knobs={{
        value: { options: ["0", "35", "70", "100"], value: "35" },
        indeterminate: { value: false },
      }}
      code={(v) =>
        jsx("ProgressBar", {
          label: "Обработка записи",
          value: v.indeterminate ? undefined : Number(v.value),
          indeterminate: v.indeterminate,
        })
      }
    >
      {(v) => (
        <U.Stack gap={2}>
          <U.Stack direction="row" justify="between">
            <U.Typography variant="label">Обработка записи</U.Typography>
            <U.Typography variant="mono" tone="muted">
              {v.indeterminate ? "…" : \`\${v.value}%\`}
            </U.Typography>
          </U.Stack>
          <U.ProgressBar
            label="Обработка записи"
            value={Number(v.value)}
            indeterminate={v.indeterminate}
          />
        </U.Stack>
      )}
    </Playground>
  );
}
`,qe=`export default {\r
  name: "ProgressBar",\r
  description: "Отображение выполнения операции",\r
  category: "feedback",\r
} as const;\r
`,Ye=`import { mark, type CommonProps } from "../../../core/base";

export interface SignalBarsProps extends CommonProps {
  /** How many bars are lit, 0…\`bars\`. */
  level?: number;
  bars?: number;
  /** A weak or broken link: the lit bars turn to the warning colour. */
  weak?: boolean;
  label?: string;
}

/** Signal strength as rising bars, like a phone's reception; the lit ones glow. */
export function SignalBars({ level = 3, bars = 4, weak = false, label, ...p }: SignalBarsProps) {
  return (
    <span
      {...mark("SignalBars", p)}
      role="img"
      aria-label={label ?? \`Сигнал: \${level} из \${bars}\`}
      data-weak={weak || undefined}
    >
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} data-lit={i < level || undefined} style={{ height: \`\${((i + 1) / bars) * 100}%\` }} />
      ))}
    </span>
  );
}
`,Xe=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function SignalBarsExample() {
  return (
    <Playground
      knobs={{
        level: { options: ["1", "2", "3", "4"], value: "3" },
        weak: { value: false },
      }}
      code={(v) =>
        jsx("SignalBars", {
          level: expr(v.level),
          weak: v.weak ? true : undefined,
        })
      }
    >
      {(v) => (
        <U.Stack direction="row" gap={3} align="center">
          <U.SignalBars level={Number(v.level)} weak={v.weak} style={{ fontSize: "2rem" }} />
          <U.Typography variant="title">{v.weak ? "Связь неустойчива" : "Связь хорошая"}</U.Typography>
        </U.Stack>
      )}
    </Playground>
  );
}
`,Ze=`export default {
  name: "SignalBars",
  description: "Качество связи палочками, как приём у телефона.",
  category: "feedback",
} as const;
`,Je=`import { mark, type Tone } from "../../../core/base";
import type { StatusIndicatorProps } from "../shared";
export const StatusIndicator = ({
  status = "success",
  ...p
}: StatusIndicatorProps) => {
  const labels: Record<Tone, string> = {
    success: "Готово",
    error: "Ошибка",
    warning: "Внимание",
    processing: "Обработка",
    pending: "В очереди",
    offline: "Не подключено",
    info: "Информация",
  };
  return (
    <span {...mark("StatusIndicator", { ...p, tone: status })}>
      <span className="ad-status-dot" aria-hidden>
        <i />
      </span>
      <span>{p.label ?? labels[status]}</span>
    </span>
  );
};
`,Qe=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const statuses = [
  "success",
  "processing",
  "pending",
  "warning",
  "error",
  "offline",
  "info",
] as const;

export default function StatusIndicatorExample() {
  return (
    <Playground
      knobs={{ status: { options: statuses, value: "processing" } }}
      code={(v) => jsx("StatusIndicator", { status: v.status })}
    >
      {(v) => <U.StatusIndicator status={v.status} />}
    </Playground>
  );
}
`,nr=`export default {\r
  name: "StatusIndicator",\r
  description: "Готовность, обработка, очередь и ошибка",\r
  category: "feedback",\r
} as const;\r
`,er=`import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type StepsProps } from "../shared";

export const Steps = (p: StepsProps) => {
  const steps = p.steps ?? [
    "Подготовка",
    "Анализ",
    "Модель",
    "Обработка",
    "Проверка",
  ];
  const current = p.current ?? 3;
  return (
    <ol {...mark("Steps", p)}>
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li
            key={\`\${i}-\${label}\`}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="ad-step-node" aria-hidden>
              {state === "done" ? <Icon name="check" /> : i + 1}
            </span>
            <span className="ad-step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
};
`,rr=`import { Steps } from "@ad-voice/ui";

export default function StepsExample() {
  return (
    <Steps
      steps={["Загрузка", "Анализ", "Модель", "Обработка", "Готово"]}
      current={2}
    />
  );
}
`,tr=`export default {\r
  name: "Steps",\r
  description: "Этапы с завершённым, активным и ожидающим состояниями",\r
  category: "feedback",\r
  wide: true,\r
} as const;\r
`,or=`import { useEffect, useRef } from "react";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type ToastProps } from "../shared";

export const Toast = ({
  open = true,
  duration = 3600,
  onClose,
  ...p
}: ToastProps) => {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !onClose || duration <= 0) return;
    const id = window.setTimeout(() => close.current?.(), duration);
    return () => clearTimeout(id);
  }, [open, duration, !!onClose]);
  if (!open) return null;
  return (
    <div
      {...mark(
        "Toast",
        { ...p, tone: p.tone ?? "success" },
        "dialog",
        p.floating ? "ad-toast-floating" : undefined,
      )}
      role={p.tone === "error" ? "alert" : "status"}
      aria-live={p.tone === "error" ? "assertive" : "polite"}
    >
      <span className="ad-toast-icon" aria-hidden>
        <Icon
          name={
            p.tone === "error" || p.tone === "warning"
              ? "warning"
              : p.tone === "info"
                ? "info"
                : "check"
          }
        />
      </span>
      <span>{p.message ?? p.children ?? "Настройки сохранены"}</span>
      {onClose && duration > 0 && (
        <span
          className="ad-toast-timer"
          style={{ animationDuration: \`\${duration}ms\` }}
          aria-hidden
        />
      )}
    </div>
  );
};
`,ar=`import { useState } from "react";
import { Button, Toast } from "@ad-voice/ui";

export default function ToastExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon="save" onClick={() => setOpen(true)}>
        Сохранить
      </Button>
      <Toast
        floating
        open={open}
        message="Настройки сохранены"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
`,sr=`export default {\r
  name: "Toast",\r
  description: "Короткое уведомление без изменения разметки",\r
  category: "feedback",\r
} as const;\r
`,ir=`import {
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cssRem, mark, type CommonProps } from "../../../core/base";

export interface TooltipProps extends CommonProps {
  /** What the tooltip says. */
  content: ReactNode;
  /** The element it explains; it gets \`aria-describedby\`. */
  children: ReactElement;
  /** Preferred side; it flips when there is no room. */
  placement?: "top" | "bottom";
}

/**
 * A short explanation that appears on hover or keyboard focus. It lives in the top layer, so
 * no scrolling or clipping container can cut it off, and it flips to the side with room.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  ...p
}: TooltipProps) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const node = tip.current;
    const anchor = trigger.current?.getBoundingClientRect();
    if (!open || !node || !anchor) return;
    if (typeof node.showPopover === "function") node.showPopover();
    const box = node.getBoundingClientRect();
    const gap = 8;
    const above =
      placement === "top"
        ? anchor.top > box.height + gap * 2
        : innerHeight - anchor.bottom < box.height + gap * 2;
    const left = Math.max(
      gap,
      Math.min(
        innerWidth - box.width - gap,
        anchor.left + anchor.width / 2 - box.width / 2,
      ),
    );
    node.style.left = cssRem(left);
    node.style.top = cssRem(
      above ? anchor.top - box.height - gap : anchor.bottom + gap,
    );
    node.dataset.adSide = above ? "above" : "below";
    return () => {
      if (
        typeof node.hidePopover === "function" &&
        node.matches(":popover-open")
      )
        node.hidePopover();
    };
  }, [open, placement]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  return (
    <span
      ref={trigger}
      className="ad-tooltip-trigger"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => event.key === "Escape" && hide()}
    >
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{ "aria-describedby"?: string }>,
            {
              "aria-describedby": id,
            },
          )
        : children}
      {open && (
        <span
          {...mark("Tooltip", p)}
          ref={tip}
          id={id}
          role="tooltip"
          popover="manual"
        >
          {content}
        </span>
      )}
    </span>
  );
}
`,lr=`import { IconButton, Stack, Tooltip } from "@ad-voice/ui";

export default function TooltipExample() {
  return (
    <Stack direction="row" gap={4} align="center">
      <Tooltip content="Оценка без физической задержки колонок и микрофона">
        <IconButton icon="info" label="Что это" variant="ghost" />
      </Tooltip>
      <Tooltip content="Сохранить запись" placement="bottom">
        <IconButton icon="save" label="Сохранить" />
      </Tooltip>
    </Stack>
  );
}
`,cr=`export default {
  name: "Tooltip",
  description: "Подсказка при наведении и фокусе; не обрезается контейнерами",
  category: "feedback",
} as const;
`,dr=`import type { ReactNode, RefObject, KeyboardEventHandler } from "react";
import type { CommonProps, Tone } from "../../core/base";
export interface DialogProps extends CommonProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  /** \`false\` (with \`cancelLabel={false}\`) leaves the dialog without a footer, e.g. for settings that apply at once. */
  confirmLabel?: string | false;
  cancelLabel?: string | false;
  /** Icon tile beside the title. */
  icon?: string;
  /** Label of the close button, for localisation. */
  closeLabel?: string;
  /** Decoration painted across the whole window behind its content (artwork, glows, frames). */
  art?: ReactNode;
  /** Close on a click outside the window (default); \`false\` keeps it open until a button closes it. */
  dismissible?: boolean;
  /** Window width: "narrow" for a short question, "wide" and "large" for forms and lists, "full" for a workspace. */
  width?: "narrow" | "normal" | "wide" | "large" | "full";
  danger?: boolean;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
}
export interface PopoverProps extends CommonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorRef?: RefObject<HTMLElement | null>;
  label?: string;
  role?: "dialog" | "menu" | "listbox";
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  align?: "start" | "end";
  matchAnchorWidth?: boolean;
  /** Move focus into the popover when it opens (default). Off for comboboxes that keep typing focus. */
  autoFocus?: boolean;
}
export interface MenuItemData {
  id?: string;
  label?: string;
  icon?: string;
  endIcon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}
export interface MenuItemProps extends CommonProps, MenuItemData {}
export interface MenuProps extends PopoverProps {
  items?: MenuItemData[];
}
export interface ToastProps extends CommonProps {
  message?: ReactNode;
  open?: boolean;
  duration?: number;
  onClose?: () => void;
  floating?: boolean;
}
export interface BadgeProps extends CommonProps {
  label?: string;
}
export interface MessageBarProps extends CommonProps {
  /** A button or link that resolves the message, e.g. "Повторить". */
  action?: ReactNode;
}
export interface StatusIndicatorProps extends CommonProps {
  status?: Tone;
  label?: ReactNode;
}
export interface ProgressBarProps extends CommonProps {
  value?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
  /** A bar, or a sound wave that fills with colour from the left (e.g. audio being processed). */
  variant?: "bar" | "wave";
}
export interface StepsProps extends CommonProps {
  steps?: string[];
  current?: number;
}
export interface EmptyStateProps extends CommonProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}
export interface KeyValueListProps extends CommonProps {
  items?: Array<[ReactNode, ReactNode]>;
}
/** A row of a table: named fields, or the cells in column order. */
export type DataTableRow = Record<string, unknown> | ReactNode[];
export interface DataTableColumn<T extends DataTableRow = DataTableRow> {
  /** Field of the row (or the cell index for array rows). */
  key: string;
  title: ReactNode;
  align?: "start" | "center" | "end";
  width?: string;
  /** Click the header to sort; on by default. */
  sortable?: boolean;
  /** Cell content; the raw field by default. */
  render?: (row: T, index: number) => ReactNode;
  /** What sorting and search look at; the raw field by default. */
  value?: (row: T) => string | number;
}
export type DataTableSort = { key: string; direction: "asc" | "desc" };
export interface DataTableProps<
  T extends DataTableRow = DataTableRow,
> extends CommonProps {
  /** Column titles, or full column descriptions. */
  columns?: Array<string | DataTableColumn<T>>;
  rows?: T[];
  caption?: ReactNode;
  /** Stable id of a row, for selection; its index by default. */
  rowKey?: (row: T, index: number) => string;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Checkboxes to pick rows, with "select all" in the header. */
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** A search field over every column. */
  searchable?: boolean;
  /** Rows per page; everything on one page by default. */
  pageSize?: number;
  /** Scroll inside the table with a sticky header beyond this height. */
  maxHeight?: string;
  dense?: boolean;
  striped?: boolean;
  /** Placeholder rows while data loads. */
  loading?: boolean;
  /** Shown when there are no rows (or none match the search). */
  empty?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
}
export interface CollapsibleSectionProps extends CommonProps {
  title?: string;
  /** Muted line under the title, e.g. what the section holds. */
  description?: ReactNode;
  icon?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
`,pr=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useMemo,\r
  useRef,\r
  useState,\r
  type FormEvent,\r
  type ReactNode,\r
} from "react";\r
export type FormErrors<T> = Partial<Record<keyof T, string>> &\r
  Record<string, string | undefined>;\r
export interface FormApi<T extends Record<string, unknown>> {\r
  values: T;\r
  errors: FormErrors<T>;\r
  touched: Record<string, boolean>;\r
  submitting: boolean;\r
  setValue: (path: string, value: unknown) => void;\r
  setTouched: (path: string, touched?: boolean) => void;\r
  reset: (values?: T) => void;\r
  submit: () => Promise<boolean>;\r
  field: (path: string) => {\r
    value: unknown;\r
    error?: string;\r
    touched: boolean;\r
    onValueChange: (value: unknown) => void;\r
    onBlur: () => void;\r
  };\r
}\r
export interface UseFormOptions<T extends Record<string, unknown>> {\r
  initialValues: T;\r
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;\r
  onSubmit?: (values: T, form: FormApi<T>) => void | Promise<void>;\r
  reinitialize?: boolean;\r
  validateOnChange?: boolean;\r
  validateOnBlur?: boolean;\r
}\r
const getPath = (value: any, path: string) =>\r
    path.split(".").reduce((current, key) => current?.[key], value),\r
  setPath = (value: any, path: string, next: unknown) => {\r
    const root = structuredClone(value),\r
      keys = path.split(".");\r
    let cursor = root;\r
    keys.slice(0, -1).forEach((key) => (cursor = cursor[key] ??= {}));\r
    cursor[keys.at(-1)!] = next;\r
    return root;\r
  };\r
export function useForm<T extends Record<string, unknown>>(\r
  options: UseFormOptions<T>,\r
): FormApi<T> {\r
  const [values, setValues] = useState(options.initialValues),\r
    [errors, setErrors] = useState<FormErrors<T>>({}),\r
    [touched, setTouchedState] = useState<Record<string, boolean>>({}),\r
    [submitting, setSubmitting] = useState(false),\r
    // The latest values and options: several changes in one event all land, submit sees them at\r
    // once, and the methods below keep one identity for the life of the form (safe in effect deps).\r
    latest = useRef(values),\r
    settings = useRef(options),\r
    initialKey = JSON.stringify(options.initialValues);\r
  settings.current = options;\r
  useEffect(() => {\r
    if (settings.current.reinitialize !== false) {\r
      latest.current = settings.current.initialValues;\r
      setValues(settings.current.initialValues);\r
      setErrors({});\r
      setTouchedState({});\r
    }\r
  }, [initialKey]);\r
  const methods = useMemo(() => {\r
    const validate = async (next: T) => {\r
      const result = (await settings.current.validate?.(next)) ?? {};\r
      setErrors(result);\r
      return result;\r
    };\r
    const setValue = (path: string, value: unknown) => {\r
      const next = setPath(latest.current, path, value);\r
      latest.current = next;\r
      setValues(next);\r
      if (settings.current.validateOnChange) void validate(next);\r
    };\r
    const setTouched = (path: string, state = true) => {\r
      setTouchedState((current) => ({ ...current, [path]: state }));\r
      if (state && settings.current.validateOnBlur !== false) void validate(latest.current);\r
    };\r
    const reset = (next = settings.current.initialValues) => {\r
      latest.current = next;\r
      setValues(next);\r
      setErrors({});\r
      setTouchedState({});\r
    };\r
    return { validate, setValue, setTouched, reset };\r
  }, []);\r
  const api: FormApi<T> = useMemo(\r
    () => ({\r
      values,\r
      errors,\r
      touched,\r
      submitting,\r
      setValue: methods.setValue,\r
      setTouched: methods.setTouched,\r
      reset: methods.reset,\r
      submit: async () => {\r
        const result = await methods.validate(latest.current);\r
        if (Object.values(result).some(Boolean)) return false;\r
        setSubmitting(true);\r
        try {\r
          await settings.current.onSubmit?.(latest.current, api);\r
          return true;\r
        } finally {\r
          setSubmitting(false);\r
        }\r
      },\r
      field: (path: string) => ({\r
        value: getPath(values, path),\r
        error: getPath(errors, path),\r
        touched: !!touched[path],\r
        onValueChange: (value: unknown) => methods.setValue(path, value),\r
        onBlur: () => methods.setTouched(path),\r
      }),\r
    }),\r
    [values, errors, touched, submitting, methods],\r
  );\r
  return api;\r
}\r
export interface FormProps<T extends Record<string, unknown>> {\r
  form: FormApi<T>;\r
  children: ReactNode;\r
  className?: string;\r
}\r
const Context = createContext<FormApi<any> | null>(null);\r
export function Form<T extends Record<string, unknown>>({\r
  form,\r
  children,\r
  className,\r
}: FormProps<T>) {\r
  return (\r
    <Context.Provider value={form}>\r
      <form\r
        className={className}\r
        onSubmit={(event: FormEvent) => {\r
          event.preventDefault();\r
          void form.submit();\r
        }}\r
      >\r
        {children}\r
      </form>\r
    </Context.Provider>\r
  );\r
}\r
export function useFormContext<T extends Record<string, unknown>>() {\r
  const value = useContext(Context);\r
  if (!value) throw new Error("useFormContext must be used inside <Form>");\r
  return value as FormApi<T>;\r
}\r
`,ur=`import { Button, Stack, TextField } from "@ad-voice/ui";\r
import { Form, useForm } from "@ad-voice/ui/forms";\r
\r
export default function FormExample() {\r
  const form = useForm({\r
    initialValues: { name: "" },\r
    validate: (values) => (values.name ? {} : { name: "Введите имя" }),\r
    onSubmit: (values) => alert(\`Привет, \${values.name}!\`),\r
  });\r
  const name = form.field("name");\r
  return (\r
    <Form form={form}>\r
      <Stack gap={3}>\r
        <TextField\r
          label="Имя в комнате"\r
          required\r
          value={String(name.value)}\r
          onValueChange={name.onValueChange}\r
          onBlur={name.onBlur}\r
          error={name.touched ? name.error : undefined}\r
        />\r
        <Button type="submit" variant="primary" loading={form.submitting}>\r
          Войти\r
        </Button>\r
      </Stack>\r
    </Form>\r
  );\r
}\r
`,mr=`export default {\r
  name: "Form",\r
  description:\r
    "Typed form state, validation, submit and field bindings without coupling controls to Formik.",\r
  category: "fields",\r
};\r
`,fr=`import { type ComponentType, type ReactNode } from "react";\r
import { Grid, type GridResponsive } from "../../layout/Grid/Grid";\r
import { TextField } from "../../controls/TextField/TextField";\r
import { NumberField } from "../../controls/NumberField/NumberField";\r
import { TextArea } from "../../controls/TextArea/TextArea";\r
import { Select } from "../../controls/Select/Select";\r
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";\r
import { Checkbox } from "../../controls/Checkbox/Checkbox";\r
import { Switch } from "../../controls/Switch/Switch";\r
import { useFormContext, type FormApi } from "../Form/Form";\r
export type FieldKind =\r
  | "text"\r
  | "number"\r
  | "textarea"\r
  | "select"\r
  | "autocomplete"\r
  | "checkbox"\r
  | "switch";\r
export interface FormFieldDefinition<\r
  T extends Record<string, unknown> = Record<string, unknown>,\r
> {\r
  name: string;\r
  kind?: FieldKind;\r
  label?: ReactNode;\r
  span?: GridResponsive<number | "full">;\r
  showWhen?: (values: T) => boolean;\r
  props?: Record<string, unknown>;\r
}\r
export type FieldRegistry = Record<string, ComponentType<any>>;\r
export const defaultFieldRegistry: FieldRegistry = {\r
  text: TextField,\r
  number: NumberField,\r
  textarea: TextArea,\r
  select: Select,\r
  autocomplete: Autocomplete,\r
  checkbox: Checkbox,\r
  switch: Switch,\r
};\r
export interface FormFieldsProps<T extends Record<string, unknown>> {\r
  fields: readonly FormFieldDefinition<T>[];\r
  registry?: FieldRegistry;\r
  columns?: number;\r
  gap?: number;\r
}\r
export function FormFields<T extends Record<string, unknown>>({\r
  fields,\r
  registry = defaultFieldRegistry,\r
  columns = 12,\r
  gap = 3,\r
}: FormFieldsProps<T>) {\r
  const form = useFormContext<T>();\r
  return (\r
    <Grid columns={columns} gap={gap}>\r
      {fields\r
        .filter((field) => field.showWhen?.(form.values) ?? true)\r
        .map((field) => (\r
          <Slot\r
            key={field.name}\r
            field={field}\r
            form={form}\r
            registry={registry}\r
          />\r
        ))}\r
    </Grid>\r
  );\r
}\r
function Slot<T extends Record<string, unknown>>({\r
  field,\r
  form,\r
  registry,\r
}: {\r
  field: FormFieldDefinition<T>;\r
  form: FormApi<T>;\r
  registry: FieldRegistry;\r
}) {\r
  const Component = registry[field.kind ?? "text"] ?? registry.text,\r
    b = form.field(field.name),\r
    boolean = field.kind === "checkbox" || field.kind === "switch",\r
    props = boolean\r
      ? { checked: !!b.value, onValueChange: b.onValueChange }\r
      : {\r
          value: b.value ?? "",\r
          onValueChange: b.onValueChange,\r
          error: b.touched ? b.error : undefined,\r
          onBlur: b.onBlur,\r
        };\r
  return (\r
    <Grid span={field.span ?? "full"}>\r
      <Component label={field.label} {...field.props} {...props} />\r
    </Grid>\r
  );\r
}\r
`,gr=`import { Button, Stack } from "@ad-voice/ui";\r
import {\r
  Form,\r
  FormFields,\r
  useForm,\r
  type FormFieldDefinition,\r
} from "@ad-voice/ui/forms";\r
\r
type Values = { name: string; delay: number; driver: string; monitor: boolean };\r
\r
const fields: FormFieldDefinition<Values>[] = [\r
  { name: "name", label: "Имя", span: { base: "full", sm: 6 } },\r
  {\r
    name: "delay",\r
    kind: "number",\r
    label: "Задержка, мс",\r
    span: { base: "full", sm: 6 },\r
    props: { min: 0, max: 500, step: 10 },\r
  },\r
  {\r
    name: "driver",\r
    kind: "select",\r
    label: "Драйвер",\r
    span: { base: "full", sm: 6 },\r
    props: { options: ["WASAPI", "ASIO", "DirectSound"] },\r
  },\r
  {\r
    name: "monitor",\r
    kind: "switch",\r
    label: "Мониторинг",\r
    span: { base: "full", sm: 6 },\r
  },\r
];\r
\r
export default function FormFieldsExample() {\r
  const form = useForm<Values>({\r
    initialValues: {\r
      name: "Дмитрий",\r
      delay: 120,\r
      driver: "ASIO",\r
      monitor: true,\r
    },\r
  });\r
  return (\r
    <Form form={form}>\r
      <Stack gap={4}>\r
        <FormFields fields={fields} />\r
        <Button type="submit" variant="primary" icon="save">\r
          Сохранить\r
        </Button>\r
      </Stack>\r
    </Form>\r
  );\r
}\r
`,hr=`export default {\r
  name: "FormFields",\r
  description:\r
    "Declarative field schema renderer with registry, conditional visibility and responsive Grid spans.",\r
  category: "fields",\r
  wide: true,\r
};\r
`,vr=`import { type CommonProps, type TokenStyle } from "../../../core/base";

/** Ready colour pairs: [primary, secondary]. Everything else is derived from the pair. */
export const themes = {
  ruby: ["#ff244c", "#ff7c97"],
  light: ["#e0a43a", "#f3d38f"],
  green: ["#10c99a", "#7cf3d0"],
  violet: ["#9b5cff", "#d3a8ff"],
} as const;
export type ThemeName = keyof typeof themes;

export interface ThemeProviderProps extends CommonProps {
  theme?: ThemeName;
  /** Main colour; overrides the theme's. The whole palette is built from it and \`secondary\`. */
  primary?: string;
  /** Light accent colour for highlights and glints; overrides the theme's. */
  secondary?: string;
  /** Older name for \`primary\`. */
  accent?: string;
  /** Any token by name (\`primary-700\`, \`neutral-900\`, \`--ad-text\`…), for full control. */
  tokens?: Record<string, string>;
}

/** HSL hue of a #rrggbb colour, in degrees. */
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  const h =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

/**
 * Applies a theme: the primary/secondary pair sets the palette, painted artwork (canvas and
 * vector illustrations, drawn in ruby) is turned to the primary's hue.
 */
export const ThemeProvider = ({
  theme = "ruby",
  primary,
  secondary,
  accent,
  tokens = {},
  style,
  children,
  id,
  className,
}: ThemeProviderProps) => {
  const main = primary ?? accent ?? themes[theme][0];
  const vars: TokenStyle = {
    ...style,
    "--ad-primary": main,
    "--ad-secondary": secondary ?? themes[theme][1],
  };
  if (/^#[0-9a-f]{6}$/i.test(main))
    vars["--ad-hue-shift"] =
      \`\${Math.round(hue(main) - hue(themes.ruby[0]))}deg\`;
  for (const [key, value] of Object.entries(tokens))
    vars[(key.startsWith("--") ? key : \`--ad-\${key}\`) as \`--\${string}\`] = value;
  return (
    <div
      id={id}
      className={\`ad-theme \${className ?? ""}\`}
      style={vars}
      data-ad-component="ThemeProvider"
      data-ad-theme={theme}
    >
      {children}
    </div>
  );
};
`,br=`import { useEffect } from "react";
import { Playground, U, jsx, useSiteTheme } from "../../../dev/exampleHelpers";

const names = ["ruby", "light", "green", "violet"] as const;

/** The chosen theme also becomes the theme of the docs site. */
function FollowSite({ theme }: { theme: (typeof names)[number] }) {
  const site = useSiteTheme();
  useEffect(() => {
    if (theme !== site.theme) site.set({ theme });
  }, [theme]);
  return null;
}

export default function ThemeProviderExample() {
  const site = useSiteTheme();
  return (
    <Playground
      stretch
      knobs={{ theme: { options: names, value: site.theme } }}
      code={(v) =>
        jsx(
          "ThemeProvider",
          { theme: v.theme },
          '<Button variant="primary">Применить</Button>',
        )
      }
    >
      {(v) => (
        <U.ThemeProvider theme={v.theme}>
          <FollowSite theme={v.theme} />
          <U.Card material="glass" title="Предпросмотр темы">
            <U.Stack gap={3}>
              <U.Stack direction={{ base: "column", sm: "row" }} gap={2}>
                <U.TextField placeholder="Поле ввода" />
                <U.Button variant="primary">Применить</U.Button>
              </U.Stack>
              <U.Slider defaultValue={60} label="Уровень" />
              <U.Typography variant="caption" tone="muted">
                Свои цвета — в «Тема» в верхней панели сайта.
              </U.Typography>
            </U.Stack>
          </U.Card>
        </U.ThemeProvider>
      )}
    </Playground>
  );
}
`,yr=`export default {
  name: "ThemeProvider",
  description:
    "Тема и цветовые токены; находится рядом с типографикой как часть foundation.",
  category: "typography",
  wide: true,
};
`,xr=`import { createElement } from "react";\r
import type { CSSProperties, ElementType, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export type TypographyVariant =\r
  | "display"\r
  | "h1"\r
  | "h2"\r
  | "h3"\r
  | "title"\r
  | "subtitle"\r
  | "body"\r
  | "body-sm"\r
  | "label"\r
  | "caption"\r
  | "eyebrow"\r
  | "mono";\r
\r
export type TypographyTone =\r
  "default" | "muted" | "accent" | "success" | "warning" | "danger";\r
export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";\r
\r
export interface TypographyProps extends Omit<CommonProps, "tone"> {\r
  as?: ElementType;\r
  variant?: TypographyVariant;\r
  tone?: TypographyTone;\r
  weight?: TypographyWeight;\r
  align?: CSSProperties["textAlign"];\r
  truncate?: boolean;\r
  text?: ReactNode;\r
  /** Hover text; a truncated plain string shows itself in full by default. */\r
  title?: string;\r
}\r
\r
const defaultElement: Record<TypographyVariant, ElementType> = {\r
  display: "h1",\r
  h1: "h1",\r
  h2: "h2",\r
  h3: "h3",\r
  title: "h4",\r
  subtitle: "p",\r
  body: "p",\r
  "body-sm": "p",\r
  label: "span",\r
  caption: "span",\r
  eyebrow: "span",\r
  mono: "code",\r
};\r
\r
export function Typography({\r
  as,\r
  variant = "body",\r
  tone = "default",\r
  weight,\r
  align,\r
  truncate = false,\r
  text,\r
  title,\r
  children,\r
  style,\r
  ...props\r
}: TypographyProps) {\r
  const content = children ?? text;\r
  return createElement(\r
    as ?? defaultElement[variant],\r
    {\r
      ...mark("Typography", props),\r
      "data-ad-variant": variant,\r
      "data-ad-tone": tone,\r
      "data-ad-weight": weight,\r
      "data-ad-truncate": truncate || undefined,\r
      title: title ?? (truncate && typeof content === "string" ? content : undefined),\r
      style: { ...style, textAlign: align },\r
    },\r
    content,\r
  );\r
}\r
`,kr=`import { Grid, Stack, Typography } from "@ad-voice/ui";\r
\r
const headings = [\r
  ["display", "Neo UI"],\r
  ["h1", "Главный заголовок"],\r
  ["h2", "Заголовок раздела"],\r
  ["h3", "Заголовок блока"],\r
  ["title", "Название карточки"],\r
] as const;\r
const text = [\r
  ["body", "Основной текст интерфейса."],\r
  ["body-sm", "Компактный вспомогательный текст."],\r
  ["label", "Подпись поля"],\r
  ["caption", "Обновлено в 12:48"],\r
  ["eyebrow", "Neo UI"],\r
  ["mono", "48 kHz · 24 bit"],\r
] as const;\r
\r
export default function TypographyExample() {\r
  return (\r
    <Stack gap={4}>\r
      <Grid minChildWidth="min(100%, 18rem)" gap={5}>\r
        {[headings, text].map((scale) => (\r
          <Grid\r
            key={scale[0][0]}\r
            columns="minmax(4.5rem, auto) minmax(0, 1fr)"\r
            gap={3}\r
            align="baseline"\r
          >\r
            {scale.map(([variant, sample]) => [\r
              <Typography key={\`\${variant}-key\`} variant="mono" tone="muted">\r
                {variant}\r
              </Typography>,\r
              <Typography key={variant} variant={variant}>\r
                {sample}\r
              </Typography>,\r
            ])}\r
          </Grid>\r
        ))}\r
      </Grid>\r
      <Stack direction="row" gap={3} wrap>\r
        {(["muted", "accent", "success", "warning", "danger"] as const).map(\r
          (tone) => (\r
            <Typography key={tone} variant="body-sm" tone={tone}>\r
              {tone}\r
            </Typography>\r
          ),\r
        )}\r
      </Stack>\r
    </Stack>\r
  );\r
}\r
`,_r=`export default {\r
  name: "Typography",\r
  description:\r
    "Единая шкала шрифтов, заголовков, подписей, цветов и весов текста",\r
  category: "typography",\r
  wide: true,\r
} as const;\r
`,wr=`import { mark } from "../../../core/base";\r
import { type AvatarProps } from "../shared";\r
import { HostSeal } from "./HostSeal";\r
\r
const initialOf = (name?: string) => (name ?? "Дмитрий").trim().slice(0, 1).toUpperCase();\r
\r
export const Avatar = ({ variant = "initials", src, badge, presence, ...p }: AvatarProps) => (\r
  <div\r
    {...mark("Avatar", p, "tile")}\r
    data-variant={variant}\r
    data-photo={src ? "" : undefined}\r
    role="img"\r
    aria-label={p.name ?? "Пользователь"}\r
  >\r
    {variant === "host" && <HostSeal photo={src} />}\r
    {variant !== "host" &&\r
      (src ? <img className="ad-avatar-photo" src={src} alt="" draggable={false} /> : initialOf(p.name))}\r
    {badge && variant !== "host" && <span className="ad-avatar-badge">{badge}</span>}\r
    {presence && <span className="ad-avatar-presence" data-presence={presence} />}\r
  </div>\r
);\r
`,Pr=`import { useMemo, useRef } from "react";\r
import { SvgAsset } from "../../../core/artwork";\r
import type { VectorNode } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
import { illustrations } from "../shared";\r
\r
/** The seal's face circle; a photo is clipped to it and drawn under the rings and label. */\r
const facePhoto = (src: string): VectorNode => ({\r
  tag: "image",\r
  props: {\r
    className: "host-emblem__photo",\r
    x: "20.65",\r
    y: "19.15",\r
    width: "88.7",\r
    height: "88.7",\r
    preserveAspectRatio: "xMidYMid slice",\r
    clipPath: "url(#hostv2-face-clip)",\r
    href: src,\r
  },\r
});\r
const withPhoto = (seal: VectorNode, src?: string): VectorNode => {\r
  if (!src || !seal.children) return seal;\r
  const children = [...seal.children];\r
  const crown = children.findIndex(\r
    (child) => typeof child !== "string" && child.props?.className === "host-emblem__crown",\r
  );\r
  children.splice(crown < 0 ? children.length : crown, 0, facePhoto(src));\r
  return { ...seal, children };\r
};\r
\r
/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */\r
export function HostSeal({ photo }: { photo?: string }) {\r
  const ref = useRef<HTMLSpanElement>(null);\r
  useDecoration(ref, (t) =>\r
    ref.current\r
      ?.querySelectorAll<SVGGElement>("[data-host-orbit]")\r
      .forEach((g) => {\r
        const inner =\r
          g.classList.contains("host-motion__inner-rear") ||\r
          g.classList.contains("host-motion__inner-front");\r
        g.setAttribute(\r
          "transform",\r
          \`rotate(\${t * (inner ? 360 / 5.6 : -360 / 8.4)} 65 65)\`,\r
        );\r
      }),\r
  );\r
  const node = useMemo(() => withPhoto(illustrations.host, photo), [photo]);\r
  return (\r
    <span ref={ref} className="ad-host-seal" aria-hidden="true">\r
      <SvgAsset node={node} />\r
    </span>\r
  );\r
}\r
`,Sr=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function AvatarExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        variant: { options: ["initials", "host"] as const, value: "host" },\r
        size: { options: sizes, value: "md" },\r
      }}\r
      code={(v, c) =>\r
        jsx("Avatar", {\r
          name: "Дмитрий",\r
          variant: v.variant === "host" ? "host" : undefined,\r
          size: c.size,\r
        })\r
      }\r
    >\r
      {(v) => <U.Avatar name="Дмитрий" variant={v.variant} size={v.size} />}\r
    </Playground>\r
  );\r
}\r
`,Tr=`export default {\r
  name: "Avatar",\r
  description: "Инициалы в неоновом кольце или анимированная печать ведущего с короной",\r
  category: "typography",\r
} as const;\r
`,Cr=`import { mark, type CommonProps } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { illustrations } from "../shared";\r
\r
export const BrandMark = (p: CommonProps) => (\r
  <div {...mark("BrandMark", p)}>\r
    <SvgAsset node={illustrations.brand} />\r
    <small>KARAOKE STUDIO</small>\r
  </div>\r
);\r
`,Mr=`import { BrandMark } from "@ad-voice/ui";\r
\r
export default function BrandMarkExample() {\r
  return <BrandMark />;\r
}\r
`,Rr=`export default {\r
  name: "BrandMark",\r
  description: "Фирменная надпись и подпись студии",\r
  category: "typography",\r
} as const;\r
`,Er=`import { part } from "../../../core/base";\r
\r
export const ButtonGroup = part("ButtonGroup", "div");\r
`,Ar=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function ButtonGroupExample() {\r
  return (\r
    <Playground\r
      knobs={{ size: { options: sizes, value: "sm" } }}\r
      code={(_, c) =>\r
        jsx(\r
          "ButtonGroup",\r
          {},\r
          [\r
            jsx("Button", { size: c.size, icon: "back" }, "Назад"),\r
            jsx("Button", { size: c.size, icon: "eye" }, "Предпросмотр"),\r
            jsx(\r
              "Button",\r
              { size: c.size, variant: "primary", icon: "save" },\r
              "Сохранить",\r
            ),\r
          ].join("\\n  "),\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.ButtonGroup>\r
          <U.Button size={v.size} icon="back">\r
            Назад\r
          </U.Button>\r
          <U.Button size={v.size} icon="eye">\r
            Предпросмотр\r
          </U.Button>\r
          <U.Button size={v.size} variant="primary" icon="save">\r
            Сохранить\r
          </U.Button>\r
        </U.ButtonGroup>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Br=`export default {\r
  name: "ButtonGroup",\r
  description: "Согласованная группа кнопок",\r
  category: "buttons",\r
} as const;\r
`,Ir=`import React, { createElement, useRef } from "react";\r
import { mark } from "../../../core/base";\r
import { useBorder } from "../../../core/motion/hooks";\r
import { Header } from "../Header/Header";\r
import type { CardProps } from "../shared";\r
export const Card = ({\r
  as = "section",\r
  border = false,\r
  shell = false,\r
  padding = "md",\r
  title,\r
  description,\r
  eyebrow,\r
  icon,\r
  actions,\r
  level = 3,\r
  children,\r
  ...p\r
}: CardProps) => {\r
  const ref = useRef<HTMLElement>(null);\r
  useBorder(ref, border, shell);\r
  return createElement(\r
    as,\r
    {\r
      ...mark(\r
        "Card",\r
        p,\r
        p.material ?? (shell ? "shell" : "card"),\r
        "ad-surface",\r
      ),\r
      ref,\r
      "data-ad-padding": padding,\r
      // A soft light follows the pointer across the surface.\r
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {\r
        const box = event.currentTarget.getBoundingClientRect();\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-x",\r
          \`\${event.clientX - box.left}px\`,\r
        );\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-y",\r
          \`\${event.clientY - box.top}px\`,\r
        );\r
      },\r
    },\r
    title && (\r
      <Header\r
        level={level as 1 | 2 | 3 | 4}\r
        title={title}\r
        description={description}\r
        eyebrow={eyebrow}\r
        icon={icon}\r
        actions={actions}\r
        compact={level > 2}\r
      />\r
    ),\r
    children,\r
  );\r
};\r
`,Nr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
const materials = ["card", "glass", "ruby", "tile", "shell"] as const;\r
\r
export default function CardExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        material: { options: materials, value: "card" },\r
        border: { value: false },\r
      }}\r
      code={(v) =>\r
        jsx(\r
          "Card",\r
          {\r
            title: "Микрофон",\r
            description: "Shure SM58 · 48 kHz",\r
            icon: "mic",\r
            material: v.material === "card" ? undefined : v.material,\r
            border: v.border,\r
          },\r
          '<Button size="sm">Проверить</Button>',\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Card\r
          title="Микрофон"\r
          description="Shure SM58 · 48 kHz"\r
          icon="mic"\r
          material={v.material}\r
          border={v.border}\r
        >\r
          <U.Button size="sm">Проверить</U.Button>\r
        </U.Card>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,zr=`export default {
  name: "Card",
  description:
    "Единая поверхность: card/glass/ruby/tile/shell через material и анимированная рамка через border.",
  category: "layout",
  wide: true,
};
`,Lr=`import { part } from "../../../core/base";\r
\r
export const DialogActions = part("DialogActions", "footer");\r
`,Dr=`import { Button, DialogActions } from "@ad-voice/ui";\r
\r
/** Footer row of a dialog; Dialog renders one for you, use it in custom dialogs. */\r
export default function DialogActionsExample() {\r
  return (\r
    <DialogActions>\r
      <Button>Отмена</Button>\r
      <Button variant="primary">Сохранить</Button>\r
    </DialogActions>\r
  );\r
}\r
`,Fr=`export default {\r
  name: "DialogActions",\r
  description: "Группа действий внизу диалога",\r
  category: "layout",\r
} as const;\r
`,Vr=`import { part } from "../../../core/base";\r
\r
export const DialogBody = part("DialogBody", "div");\r
`,$r=`import { DialogBody, TextField } from "@ad-voice/ui";\r
\r
/** Content area of a dialog with the standard spacing. */\r
export default function DialogBodyExample() {\r
  return (\r
    <DialogBody>\r
      <TextField label="Название записи" defaultValue="Ночь горит огнями" />\r
    </DialogBody>\r
  );\r
}\r
`,Or=`export default {\r
  name: "DialogBody",\r
  description: "Область содержимого диалога",\r
  category: "layout",\r
} as const;\r
`,Hr=`import { mark } from "../../../core/base";\r
import { type DividerProps } from "../shared";\r
\r
export const Divider = (p: DividerProps) => (\r
  <div\r
    {...mark("Divider", p)}\r
    role="separator"\r
    aria-orientation={p.vertical ? "vertical" : "horizontal"}\r
  />\r
);\r
`,Ur=`import { Divider, Stack, Typography } from "@ad-voice/ui";\r
\r
export default function DividerExample() {\r
  return (\r
    <Stack>\r
      <Typography>Аудио</Typography>\r
      <Divider />\r
      <Stack direction="row" align="center">\r
        <Typography>Вход</Typography>\r
        <Divider vertical />\r
        <Typography>Выход</Typography>\r
      </Stack>\r
    </Stack>\r
  );\r
}\r
`,Wr=`export default {\r
  name: "Divider",\r
  description: "Разделитель по горизонтали или вертикали",\r
  category: "layout",\r
} as const;\r
`,Kr=`import { useRef, type ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { resizeEdges, useFloatingPanel, type FloatingPanelOptions } from "./useFloatingPanel";\r
\r
export interface FloatingPanelProps extends CommonProps, FloatingPanelOptions {\r
  /** Resize handles on every edge and corner while the panel is selected. */\r
  resizable?: boolean;\r
  label?: string;\r
  children?: ReactNode;\r
}\r
\r
/**\r
 * A panel that floats over the page: drag it by its surface, select it with a click to resize it\r
 * from any edge or corner. Where it starts is up to its class; once moved, it keeps its place.\r
 */\r
export const FloatingPanel = ({ layout: saved, onLayoutChange, limits, onDragOutside, ignore, resizable = false, label, children, ...p }: FloatingPanelProps) => {\r
  const frame = useRef<HTMLDivElement>(null);\r
  const { layout, active, beginMove, beginResize, handleMove, handleUp } = useFloatingPanel(frame, {\r
    layout: saved,\r
    onLayoutChange,\r
    limits,\r
    onDragOutside,\r
    ignore,\r
  });\r
  return (\r
    <div\r
      {...mark("FloatingPanel", p)}\r
      ref={frame}\r
      role="group"\r
      aria-label={label}\r
      data-active={active || undefined}\r
      style={{ ...p.style, ...(layout ?? {}) }}\r
      onPointerDown={beginMove}\r
      onPointerMove={handleMove}\r
      onPointerUp={handleUp}\r
      onPointerCancel={handleUp}\r
    >\r
      {children}\r
      {resizable && active &&\r
        resizeEdges.map((edge) => (\r
          <span key={edge} className="ad-floating-panel-handle" data-edge={edge} aria-hidden="true" onPointerDown={beginResize(edge)} />\r
        ))}\r
    </div>\r
  );\r
};\r
`,Gr=`import { useState } from "react";
import { FloatingPanel, MelodyRoll, Typography, type PanelLayout } from "@ad-voice/ui";

export default function FloatingPanelExample() {
  const [layout, setLayout] = useState<PanelLayout | null>(null);
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Typography variant="caption" tone="muted">
        Тяните панель за поверхность; щёлкните, чтобы выделить и менять размер за края и углы.
      </Typography>
      <FloatingPanel resizable layout={layout} onLayoutChange={setLayout} limits={{ minWidth: 260, minHeight: 120 }}
        label="Мелодия" style={{ right: "2rem", bottom: "2rem", width: "26rem", height: "11rem" }}>
        <MelodyRoll position={1.6} livePitch={68.8} accuracy={0.8} hit />
      </FloatingPanel>
    </div>
  );
}
`,jr=`export default {
  name: "FloatingPanel",
  description: "Плавающая панель: перетаскивание и изменение размера за любой край.",
  category: "layout",
} as const;
`,qr=`import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/** Where a floating panel sits, in window pixels. */
export interface PanelLayout {
  left: number;
  top: number;
  width: number;
  height: number;
}
/** A point on the screen, in screen pixels. */
export interface ScreenPoint {
  screenX: number;
  screenY: number;
}
/** Which edges a resize handle moves; a corner combines its two edges. */
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export const resizeEdges: readonly ResizeEdge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export interface FloatingPanelOptions {
  /** The saved placement, or null for the panel's own default place. */
  layout?: PanelLayout | null;
  /** Called once a move or resize ends, with the new placement to keep. */
  onLayoutChange?(layout: PanelLayout): void;
  /** Size to start from before the panel can be measured (it has not been laid out yet). */
  defaultSize?: { width: number; height: number };
  /** Size limits while resizing. */
  limits?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number };
  /** The panel was dragged out of the window (e.g. to become a window of its own). */
  onDragOutside?(screenBounds: PanelLayout, pointer: ScreenPoint): void;
  /** More elements that keep their own pointer gestures instead of moving the panel. */
  ignore?: string;
}

// A drag this short is a plain click (select only).
const threshold = 3;
// Pressing a control inside the panel uses that control; only the panel's own surface moves it.
export const panelControls =
  "button, a, input, select, textarea, [role=slider], [role=button], [role=switch], [role=listbox], [contenteditable=true], .ad-rotary-knob";

type Drag =
  | { kind: "move"; x: number; y: number; origin: PanelLayout }
  | { kind: "resize"; edge: ResizeEdge; x: number; y: number; origin: PanelLayout };

/**
 * Click a panel to select it, drag it anywhere in the window, resize it from any edge or corner,
 * drag it past the window's edge to hand it over. The placement stays on screen when the window
 * shrinks; the caller keeps it (storage, preferences) through \`onLayoutChange\`.
 */
export const useFloatingPanel = (frameRef: RefObject<HTMLElement | null>, options: FloatingPanelOptions = {}) => {
  const [active, setActive] = useState(false);
  const [live, setLive] = useState<PanelLayout | null>(null);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const latest = useRef(options);
  latest.current = options;

  const [, setViewport] = useState(0);
  useEffect(() => {
    const onResize = () => setViewport((n) => n + 1);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const keepInWindow = (next: PanelLayout): PanelLayout => {
    const { limits = {} } = latest.current;
    const width = Math.min(Math.max(next.width, limits.minWidth ?? 0), limits.maxWidth ?? Infinity, window.innerWidth);
    const height = Math.min(Math.max(next.height, limits.minHeight ?? 0), limits.maxHeight ?? Infinity, window.innerHeight);
    return {
      left: Math.min(Math.max(next.left, 0), Math.max(0, window.innerWidth - width)),
      top: Math.min(Math.max(next.top, 0), Math.max(0, window.innerHeight - height)),
      width,
      height,
    };
  };
  const saved = options.layout;
  const layout = live ?? (saved ? keepInWindow(saved) : null);

  const box = (): PanelLayout => {
    if (layout) return layout;
    const rect = frameRef.current?.getBoundingClientRect();
    return rect?.width
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : { left: 0, top: 0, width: 0, height: 0, ...latest.current.defaultSize };
  };

  const resized = (origin: PanelLayout, edge: ResizeEdge, dx: number, dy: number): PanelLayout => {
    let { left, top, width, height } = origin;
    if (edge.includes("e")) width += dx;
    else if (edge.includes("w")) {
      // The right edge stays put while the left one moves.
      width -= dx;
      left = origin.left + origin.width - width;
    }
    if (edge.includes("s")) height += dy;
    else if (edge.includes("n")) {
      height -= dy;
      top = origin.top + origin.height - height;
    }
    return keepInWindow({ left, top, width, height });
  };

  const beginMove = (event: ReactPointerEvent<HTMLElement>) => {
    const { ignore } = latest.current;
    const skip = ignore ? \`\${panelControls}, \${ignore}\` : panelControls;
    if (event.button !== 0 || (event.target as Element | null)?.closest?.(skip)) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moved.current = false;
    drag.current = { kind: "move", x: event.clientX, y: event.clientY, origin: box() };
  };
  const beginResize = (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moved.current = false;
    drag.current = { kind: "resize", edge, x: event.clientX, y: event.clientY, origin: box() };
  };
  const handleMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!moved.current && Math.abs(dx) <= threshold && Math.abs(dy) <= threshold) return;
    moved.current = true;
    const { onDragOutside } = latest.current;
    const outside = event.clientX < 0 || event.clientY < 0 || event.clientX > window.innerWidth || event.clientY > window.innerHeight;
    if (current.kind === "move" && onDragOutside && outside) {
      drag.current = null;
      setLive(null);
      // The grab point stays under the pointer in the new place.
      onDragOutside(
        { ...current.origin, left: event.screenX - (current.x - current.origin.left), top: event.screenY - (current.y - current.origin.top) },
        { screenX: event.screenX, screenY: event.screenY },
      );
      return;
    }
    setLive(
      current.kind === "move"
        ? keepInWindow({ ...current.origin, left: current.origin.left + dx, top: current.origin.top + dy })
        : resized(current.origin, current.edge, dx, dy),
    );
  };
  const handleUp = () => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setActive(true);
    // A plain click only selects; it never changes the placement.
    if (!moved.current || !live) return;
    // Moving keeps the size the panel was given, not the size a small window squeezed it to,
    // so it grows back when the window does.
    const { layout: kept, defaultSize } = latest.current;
    const size = kept ?? defaultSize;
    latest.current.onLayoutChange?.(current.kind === "move" && size ? { ...live, width: size.width, height: size.height } : live);
  };

  const deactivate = useCallback(() => setActive(false), []);
  // A press anywhere else deselects the panel, like a selection on a canvas.
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !frameRef.current?.contains(event.target)) deactivate();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, deactivate, frameRef]);

  return { layout, active, beginMove, beginResize, handleMove, handleUp };
};
`,Yr=`import type { ElementType, HTMLAttributes } from "react";
import { classes } from "../../../core/base";
import {
  responsiveVars,
  spacing,
  type Breakpoint,
  type Responsive,
  type Spacing,
} from "../../../core/responsive";

export type GridBreakpoint = Breakpoint;
export type GridResponsive<T> = Responsive<T>;
export type GridSpacing = Spacing;
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type GridJustify =
  "start" | "center" | "end" | "stretch" | "between" | "around" | "evenly";

export interface GridProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  columns?: GridResponsive<number | string>;
  gap?: GridResponsive<GridSpacing>;
  rowGap?: GridResponsive<GridSpacing>;
  columnGap?: GridResponsive<GridSpacing>;
  minChildWidth?: string;
  dense?: boolean;
  align?: GridResponsive<GridAlign>;
  justify?: GridResponsive<GridJustify>;
  span?: GridResponsive<number | "full">;
  rowSpan?: GridResponsive<number>;
  columnStart?: GridResponsive<number>;
  rowStart?: GridResponsive<number>;
}

const justifyValue = (value: GridJustify) =>
  value === "between" || value === "around" || value === "evenly"
    ? \`space-\${value}\`
    : value;
const columnsValue = (value: number | string) =>
  typeof value === "number" ? \`repeat(\${value}, minmax(0, 1fr))\` : value;

/** Grid placement; anything not given is \`auto\`. */
const place = <T,>(
  name: string,
  value: GridResponsive<T> | undefined,
  format: (item: T) => string,
) =>
  responsiveVars<T | "auto">(
    name,
    value,
    (v) => (v === "auto" ? "auto" : format(v as T)),
    "auto",
  );

/** A Grid with placement props and no columns renders as a grid item, not a container. */
export function Grid({
  as: Component = "div",
  columns,
  gap,
  rowGap,
  columnGap,
  minChildWidth,
  dense = false,
  align,
  justify,
  span,
  rowSpan,
  columnStart,
  rowStart,
  className,
  style,
  ...props
}: GridProps) {
  const isItem =
    (span != null ||
      rowSpan != null ||
      columnStart != null ||
      rowStart != null) &&
    columns == null &&
    minChildWidth == null;

  const container = isItem
    ? {}
    : {
        ...responsiveVars("grid-columns", columns, columnsValue, 12),
        ...responsiveVars("grid-row-gap", rowGap ?? gap, spacing, 0),
        ...responsiveVars("grid-column-gap", columnGap ?? gap, spacing, 0),
        ...responsiveVars("grid-align", align, String, "stretch"),
        ...responsiveVars("grid-justify", justify, justifyValue, "stretch"),
      };
  const item = isItem
    ? {
        ...(columnStart != null
          ? place("grid-column-start", columnStart, String)
          : place("grid-column-start", span, (v) =>
              v === "full" ? "1" : "auto",
            )),
        ...place("grid-column-end", span, (v) =>
          v === "full" ? "-1" : \`span \${v}\`,
        ),
        ...place("grid-row-start", rowStart, String),
        ...place("grid-row-end", rowSpan, (v) => \`span \${v}\`),
      }
    : {};

  return (
    <Component
      {...props}
      className={classes(
        isItem ? "ad-grid-item" : "ad-grid",
        !isItem && !!minChildWidth && "ad-grid--auto-fit",
        !isItem && dense && "ad-grid--dense",
        className,
      )}
      style={{
        ...container,
        ...item,
        ...(minChildWidth && { "--ad-grid-min-child-width": minChildWidth }),
        ...style,
      }}
    />
  );
}
`,Xr=`import { Card, Grid } from "@ad-voice/ui";

export default function GridExample() {
  return (
    <Grid columns={{ base: 1, md: 12 }} gap={3}>
      <Grid span={{ base: "full", md: 8 }}>
        <Card title="Основная область" description="8 из 12 колонок" />
      </Grid>
      <Grid span={{ base: "full", md: 4 }}>
        <Card title="Сбоку" description="4 из 12" />
      </Grid>
      <Grid span="full">
        <Grid minChildWidth="9rem" gap={3}>
          {["Вокал", "Минус", "Мелодия", "Эффекты"].map((title) => (
            <Card key={title} title={title} description="auto-fit" />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
`,Zr=`export default {
  name: "Grid",
  description: "Responsive CSS Grid для колонок, span и auto-fit раскладок",
  category: "layout",
  wide: true,
} as const;
`,Jr=`import { mark } from "../../../core/base";\r
import { Icon } from "../Icon/Icon";\r
import {\r
  Typography,\r
  type TypographyVariant,\r
} from "../../foundation/Typography/Typography";\r
import type { HeaderProps } from "../shared";\r
\r
const headingVariant: Record<1 | 2 | 3 | 4, TypographyVariant> = {\r
  1: "h1",\r
  2: "h2",\r
  3: "h3",\r
  4: "title",\r
};\r
const headingTag: Record<1 | 2 | 3 | 4, "h1" | "h2" | "h3" | "h4"> = {\r
  1: "h1",\r
  2: "h2",\r
  3: "h3",\r
  4: "h4",\r
};\r
\r
export const Header = ({\r
  as = "header",\r
  level = 2,\r
  title,\r
  description,\r
  eyebrow,\r
  icon,\r
  actions,\r
  compact,\r
  ...p\r
}: HeaderProps) => {\r
  const Component = as;\r
  return (\r
    <Component {...mark("Header", p)} data-ad-compact={compact || undefined}>\r
      {icon && <Icon name={icon} surface="tile" />}\r
      <div className="ad-header-copy">\r
        {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}\r
        <Typography\r
          as={headingTag[level]}\r
          variant={headingVariant[level]}\r
          weight="bold"\r
        >\r
          {title ?? "Название раздела"}\r
        </Typography>\r
        {description && (\r
          <Typography variant="body-sm" tone="muted">\r
            {description}\r
          </Typography>\r
        )}\r
      </div>\r
      {actions && <div className="ad-header-actions">{actions}</div>}\r
    </Component>\r
  );\r
};\r
`,Qr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function HeaderExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        level: { options: ["1", "2", "3", "4"], value: "2" },\r
        icon: { value: true },\r
        compact: { value: false },\r
      }}\r
      code={(v) =>\r
        jsx("Header", {\r
          level: Number(v.level),\r
          eyebrow: "Настройки",\r
          title: "Аудио",\r
          description: "Драйвер, задержка и мониторинг",\r
          icon: v.icon ? "audio" : undefined,\r
          compact: v.compact,\r
          actions: { expr: '<Button size="sm">Сбросить</Button>' },\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Header\r
          level={Number(v.level) as 1 | 2 | 3 | 4}\r
          eyebrow="Настройки"\r
          title="Аудио"\r
          description="Драйвер, задержка и мониторинг"\r
          icon={v.icon ? "audio" : undefined}\r
          compact={v.compact}\r
          actions={<U.Button size="sm">Сбросить</U.Button>}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,nt=`export default {\r
  name: "Header",\r
  description: "Единый заголовок для страницы, секции, карточки и диалога.",\r
  category: "layout",\r
};\r
`,et=`import React from "react";\r
import { mark } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { icons, type IconProps } from "../shared";\r
/** Without \`size\` the icon takes --ad-icon-size from CSS, so buttons and fields can size it. */\r
export const Icon = ({\r
  name = "music",\r
  size,\r
  surface = "none",\r
  className,\r
  style,\r
  label,\r
  ...p\r
}: IconProps) => (\r
  <span\r
    {...mark("Icon", { ...p, className, style })}\r
    data-ad-surface={surface}\r
    style={\r
      {\r
        "--ad-icon-size":\r
          typeof size === "number" ? \`\${size / 16}rem\` : size || undefined,\r
        ...style,\r
      } as React.CSSProperties\r
    }\r
  >\r
    <SvgAsset\r
      node={icons[name] ?? icons.info}\r
      component="IconAsset"\r
      label={label}\r
    />\r
  </span>\r
);\r
`,rt=`import { Compare, Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
const names = ["mic", "headphones", "music", "wave", "settings", "trash"];\r
\r
export default function IconExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        surface: { options: ["none", "tile"], value: "none" },\r
        size: { options: ["1rem", "1.5rem", "2rem"], value: "1.5rem" },\r
      }}\r
      code={(v) =>\r
        jsx("Icon", {\r
          name: "mic",\r
          surface: v.surface === "none" ? undefined : v.surface,\r
          size: v.size === "1.5rem" ? undefined : v.size,\r
        })\r
      }\r
      extra={\r
        <Compare\r
          items={names.map((name) => ({\r
            label: name,\r
            node: <U.Icon name={name} />,\r
          }))}\r
        />\r
      }\r
    >\r
      {(v) => (\r
        <U.Icon\r
          name="mic"\r
          surface={v.surface as "none" | "tile"}\r
          size={v.size}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,tt=`export default {\r
  name: "Icon",\r
  description:\r
    'Иконка; surface="tile" добавляет контейнер вместо отдельного IconTile.',\r
  category: "typography",\r
};\r
`,ot=`import { mark } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { illustrations } from "../shared";\r
import type { IllustrationProps } from "../shared";\r
export const Illustration = ({\r
  variant = "planet",\r
  label,\r
  framed = false,\r
  fit = "contain",\r
  ...p\r
}: IllustrationProps) => (\r
  <div\r
    {...mark("Illustration", p)}\r
    data-ad-framed={framed || undefined}\r
    data-ad-fit={fit}\r
  >\r
    <SvgAsset\r
      node={illustrations[variant] ?? illustrations.planet}\r
      component="IllustrationAsset"\r
      label={label}\r
    />\r
  </div>\r
);\r
`,at=`import { Grid, Illustration } from "@ad-voice/ui";\r
\r
const height = { height: "clamp(9rem, 26dvh, 15rem)" };\r
\r
export default function IllustrationExample() {\r
  return (\r
    <Grid minChildWidth="12rem" gap={4}>\r
      <Illustration variant="planet" label="Планета" style={height} />\r
      <Illustration variant="mountains" framed label="Горы" style={height} />\r
    </Grid>\r
  );\r
}\r
`,st=`export default {
  name: "Illustration",
  description: "SVG-иллюстрация; framed заменяет отдельный ArtworkFrame.",
  category: "layout",
  wide: true,
};
`,it=`import { useRef } from "react";\r
import { mark } from "../../../core/base";\r
import { useSmoothWheel } from "../../../core/motion/hooks";\r
import { type ScrollAreaProps } from "../shared";\r
\r
const scrollHeight = (height: number | string | undefined) =>\r
  typeof height === "number"\r
    ? \`calc(var(--ad-fluid-unit) * \${height})\`\r
    : (height ?? "clamp(10rem, 32dvh, 18rem)");\r
\r
export function ScrollArea(p: ScrollAreaProps) {\r
  const ref = useRef<HTMLDivElement>(null);\r
  useSmoothWheel(ref);\r
  return (\r
    <div\r
      {...mark("ScrollArea", p)}\r
      ref={ref}\r
      tabIndex={0}\r
      aria-label={p.label}\r
      style={{ maxHeight: scrollHeight(p.height), ...p.style }}\r
    >\r
      {p.children}\r
    </div>\r
  );\r
}\r
`,lt=`import { Badge, ScrollArea, Stack, Typography } from "@ad-voice/ui";\r
\r
export default function ScrollAreaExample() {\r
  return (\r
    <ScrollArea height="12rem" label="Записи">\r
      <Stack gap={2}>\r
        {Array.from({ length: 12 }, (_, i) => (\r
          <Stack key={i} direction="row" justify="between" align="center">\r
            <Typography variant="body-sm">Запись {i + 1}</Typography>\r
            <Badge tone="success">Готово</Badge>\r
          </Stack>\r
        ))}\r
      </Stack>\r
    </ScrollArea>\r
  );\r
}\r
`,ct=`export default {\r
  name: "ScrollArea",\r
  description: "Прокрутка с согласованным оформлением",\r
  category: "layout",\r
} as const;\r
`,dt=`import { Children, Fragment } from "react";
import type { ElementType, HTMLAttributes, ReactNode, Ref } from "react";
import { classes } from "../../../core/base";
import {
  responsiveVars,
  spacing,
  type Breakpoint,
  type Responsive,
  type Spacing,
} from "../../../core/responsive";

export type StackDirection =
  "row" | "column" | "row-reverse" | "column-reverse";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";
export type StackBreakpoint = Breakpoint;
export type StackResponsive<T> = Responsive<T>;
export type StackSpacing = Spacing;

export interface StackProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  ref?: Ref<HTMLElement>;
  direction?: StackResponsive<StackDirection>;
  gap?: StackResponsive<StackSpacing>;
  align?: StackResponsive<StackAlign>;
  justify?: StackResponsive<StackJustify>;
  wrap?: StackResponsive<StackWrap | boolean>;
  divider?: ReactNode;
  inline?: boolean;
}

const flex = (value: string) =>
  value === "start" || value === "end"
    ? \`flex-\${value}\`
    : value === "between" || value === "around" || value === "evenly"
      ? \`space-\${value}\`
      : value;
const wrapValue = (value: StackWrap | boolean) =>
  value === true ? "wrap" : value === false ? "nowrap" : value;

export function Stack({
  as: Component = "div",
  direction = "column",
  gap = 0,
  align = "stretch",
  justify = "start",
  wrap = "nowrap",
  divider,
  inline = false,
  children,
  className,
  style,
  ...props
}: StackProps) {
  const content =
    divider == null
      ? children
      : Children.toArray(children).map((child, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span className="ad-stack__divider" aria-hidden="true">
                {divider}
              </span>
            )}
            {child}
          </Fragment>
        ));

  return (
    <Component
      {...props}
      className={classes("ad-stack", inline && "ad-stack--inline", className)}
      style={{
        ...responsiveVars("stack-direction", direction, String, "column"),
        ...responsiveVars("stack-gap", gap, spacing, 0),
        ...responsiveVars("stack-align", align, flex, "stretch"),
        ...responsiveVars("stack-justify", justify, flex, "start"),
        ...responsiveVars("stack-wrap", wrap, wrapValue, "nowrap"),
        ...style,
      }}
    >
      {content}
    </Component>
  );
}
`,pt=`import { Button, Stack } from "@ad-voice/ui";

/** Column on phones, row from md: one prop instead of media queries. */
export default function StackExample() {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: 2, md: 3 }}
      align={{ base: "stretch", md: "center" }}
    >
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
      <Button icon="eye">Предпросмотр</Button>
      <Button variant="ghost">Отмена</Button>
    </Stack>
  );
}
`,ut=`export default {
  name: "Stack",
  description:
    "Flex-layout для вертикальных и горизонтальных групп с responsive-настройками",
  category: "layout",
  wide: true,
} as const;
`,mt=`import type { ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Typography } from "../../foundation/Typography/Typography";
import { Tilt } from "../../effects/Tilt/Tilt";
import { Card } from "../Card/Card";
import { Icon } from "../Icon/Icon";

export interface StatTileProps extends CommonProps {
  /** Icon in the glowing ring. */
  icon?: string;
  /** The headline number or short value. */
  value: ReactNode;
  /** What the value counts. */
  label: ReactNode;
  /** Makes the whole tile a button, e.g. to open the list behind the number. */
  onClick?: () => void;
  /** Lean toward the pointer with a glare. */
  tilt?: boolean;
  /** A count bubble on the corner, e.g. new requests waiting. */
  badge?: ReactNode;
  /** Name of the badge for screen readers. */
  badgeLabel?: string;
}

/** A headline number: an icon in a glowing ring with a spark, the value large, its label below. */
export function StatTile({ icon = "music", value, label, onClick, tilt = true, badge, badgeLabel, ...p }: StatTileProps) {
  const card = (
    <Card border padding="sm" className="ad-stat-tile-card">
      <span className="ad-stat-tile-icon" aria-hidden="true">
        <Icon name={icon} />
        <Icon name="sparkle" className="ad-stat-tile-spark" />
      </span>
      <span className="ad-stat-tile-text">
        <Typography as="strong" variant="h2">{value}</Typography>
        <Typography variant="body-sm" tone="muted">{label}</Typography>
      </span>
    </Card>
  );
  const body = (
    <>
      {tilt ? <Tilt max={8}>{card}</Tilt> : card}
      {badge !== undefined && badge !== null && <span className="ad-stat-tile-badge" aria-label={badgeLabel}>{badge}</span>}
    </>
  );
  return onClick ? (
    <button type="button" {...mark("StatTile", p)} onClick={onClick}>{body}</button>
  ) : (
    <div {...mark("StatTile", p)}>{body}</div>
  );
}
`,ft=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function StatTileExample() {
  return (
    <Playground
      stretch
      knobs={{ tilt: { value: true } }}
      code={(v) => jsx("StatTile", { icon: "music", value: { expr: "128" }, label: "Всего песен", tilt: v.tilt ? undefined : { expr: "false" } })}
    >
      {(v) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <U.StatTile icon="music" value={128} label="Всего песен" tilt={v.tilt} />
          <U.StatTile icon="mic" value={96} label="Готово к караоке" tilt={v.tilt} />
          <U.StatTile icon="users" value={4} label="Друзья · 2 в сети" tilt={v.tilt} onClick={() => undefined} />
        </div>
      )}
    </Playground>
  );
}
`,gt=`export default {
  name: "StatTile",
  description: "Плитка с главной цифрой: иконка в светящемся кольце с искрой, значение и подпись; наклоняется за курсором.",
  category: "layout",
};
`,ht=`import { mark } from "../../../core/base";\r
import { type TabPanelProps } from "../shared";\r
\r
export const TabPanel = (p: TabPanelProps) => (\r
  <div\r
    {...mark("TabPanel", p)}\r
    role="tabpanel"\r
    aria-labelledby={p.labelledBy}\r
    hidden={p.hidden}\r
    tabIndex={0}\r
  >\r
    {/* Keyed by the tab, so the content plays its entrance on every switch. */}\r
    <div className="ad-tab-panel-content" key={p.labelledBy}>\r
      {p.children}\r
    </div>\r
  </div>\r
);\r
`,vt=`import { TabPanel, Typography } from "@ad-voice/ui";\r
\r
/** Content of one tab; pair it with Tabs (see the Tabs page for the full pattern). */\r
export default function TabPanelExample() {\r
  return (\r
    <TabPanel labelledBy="tab-audio">\r
      <Typography variant="body-sm" tone="muted">\r
        Драйвер, задержка и мониторинг голоса.\r
      </Typography>\r
    </TabPanel>\r
  );\r
}\r
`,bt=`export default {\r
  name: "TabPanel",\r
  description: "Содержимое выбранной вкладки",\r
  category: "navigation",\r
} as const;\r
`,yt=`import { createElement } from "react";\r
import { mark } from "../../../core/base";\r
import { type TextProps } from "../shared";\r
\r
export const Text = ({ as = "span", ...p }: TextProps) =>\r
  createElement(\r
    as,\r
    { ...mark("Text", p), "data-ad-variant": p.variant },\r
    p.children ?? p.text,\r
  );\r
`,xt=`import { Stack, Text } from "@ad-voice/ui";\r
\r
/** Lightweight text; Typography covers the full type scale. */\r
export default function TextExample() {\r
  return (\r
    <Stack gap={2}>\r
      <Text variant="eyebrow">Neo UI</Text>\r
      <Text as="h3" variant="title">\r
        Настройки комнаты\r
      </Text>\r
      <Text>Основной текст интерфейса</Text>\r
      <Text variant="muted">Вспомогательная подпись</Text>\r
    </Stack>\r
  );\r
}\r
`,kt=`export default {\r
  name: "Text",\r
  description: "Иерархия заголовков, подписей и описаний",\r
  category: "typography",\r
} as const;\r
`,_t=`import { part } from "../../../core/base";\r
\r
export const Toolbar = part("Toolbar", "div");\r
`,wt=`import {\r
  Button,\r
  ButtonGroup,\r
  Divider,\r
  IconButton,\r
  Select,\r
  ToggleButton,\r
  Toolbar,\r
} from "@ad-voice/ui";\r
\r
export default function ToolbarExample() {\r
  return (\r
    <Toolbar>\r
      <ButtonGroup>\r
        <ToggleButton icon="cursor" label="Выделение" defaultChecked />\r
        <IconButton icon="pencil" label="Карандаш" />\r
        <IconButton icon="eraser" label="Ластик" />\r
      </ButtonGroup>\r
      <Divider vertical />\r
      <Select\r
        size="sm"\r
        options={["C#4", "D4", "E4"]}\r
        defaultValue="D4"\r
        icon="note"\r
      />\r
      <Button variant="primary" icon="save" size="sm">\r
        Сохранить\r
      </Button>\r
    </Toolbar>\r
  );\r
}\r
`,Pt=`export default {
  name: "Toolbar",
  description: "Группы инструментов в общей панели",
  category: "layout",
  wide: true,
} as const;
`,St=`import type { ElementType, ReactNode } from "react";\r
import {\r
  type CommonProps,\r
  type Material,\r
  type VectorNode,\r
} from "../../core/base";\r
import iconData from "../../artwork/icons.json";\r
import artworkData from "../../artwork/illustrations.json";\r
\r
export type IconName = keyof typeof iconData;\r
export const icons = iconData as unknown as Record<string, VectorNode>;\r
export const illustrations = artworkData as unknown as Record<\r
  string,\r
  VectorNode\r
>;\r
\r
export interface IconProps extends Omit<CommonProps, "size"> {\r
  name?: IconName | string;\r
  size?: number | string;\r
  label?: string;\r
  surface?: "none" | "tile";\r
}\r
export interface TextProps extends CommonProps {\r
  as?: ElementType;\r
  variant?: "muted" | "eyebrow" | "body" | "title";\r
  text?: string;\r
}\r
export interface HeaderProps extends CommonProps {\r
  as?: "header" | "div";\r
  level?: 1 | 2 | 3 | 4;\r
  title?: ReactNode;\r
  description?: ReactNode;\r
  eyebrow?: ReactNode;\r
  icon?: IconName | string;\r
  actions?: ReactNode;\r
  compact?: boolean;\r
}\r
export interface CardProps extends CommonProps, Omit<HeaderProps, "as"> {\r
  as?: "section" | "div" | "article";\r
  border?: boolean;\r
  shell?: boolean;\r
  padding?: "none" | "sm" | "md" | "lg";\r
  material?: Material;\r
}\r
export interface AvatarProps extends CommonProps {\r
  name?: string;\r
  /** Initials in a turning ring, or the animated host seal with a crown. */\r
  variant?: "initials" | "host";\r
  /** Photo shown in place of the initials, or inside the host seal instead of its crown. */\r
  src?: string;\r
  /** Short tag on the lower edge of the ring, e.g. "ГОСТЬ". */\r
  badge?: string;\r
  /** A dot on the ring: online, busy (e.g. singing in a room) or offline. */\r
  presence?: "online" | "busy" | "offline";\r
}\r
export interface TabPanelProps extends CommonProps {\r
  labelledBy?: string;\r
  hidden?: boolean;\r
}\r
export interface ScrollAreaProps extends CommonProps {\r
  height?: number | string;\r
  label?: string;\r
}\r
export interface DividerProps extends CommonProps {\r
  vertical?: boolean;\r
}\r
export interface IllustrationProps extends CommonProps {\r
  variant?: keyof typeof artworkData;\r
  label?: string;\r
  framed?: boolean;\r
  fit?: "contain" | "cover";\r
}\r
`,Tt=`import { useEffect, useRef, useState } from "react";
import { clamp, mark, timeText, useControllable } from "../../../core/base";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import { Waveform } from "../Waveform/Waveform";
import type { AudioPlayerProps } from "../shared";
export const AudioPlayer = (p: AudioPlayerProps) => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [muted, setMuted] = useState(false);
  const [volume, setVolume] = useControllable(p.volume, p.defaultVolume ?? 0.7);
  const [fileDuration, setFileDuration] = useState<number>();
  const duration = p.duration ?? fileDuration ?? 51;
  useEffect(() => {
    if (!p.src) return;
    const media = new Audio(p.src);
    audio.current = media;
    const meta = () =>
      Number.isFinite(media.duration) && setFileDuration(media.duration);
    const ended = () => {
      setPlaying(false);
      p.onPlayingChange?.(false);
    };
    media.addEventListener("loadedmetadata", meta);
    media.addEventListener("ended", ended);
    return () => {
      media.pause();
      media.removeEventListener("loadedmetadata", meta);
      media.removeEventListener("ended", ended);
      audio.current = null;
      setFileDuration(undefined);
    };
  }, [p.src]);
  // While playing, the position is read every display refresh (timeupdate fires only ~4
  // times a second), so the cursor glides. Without a source the timeline runs on its own,
  // so the player can be shown alive in demos.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const media = audio.current;
      if (media) {
        setPosition(media.currentTime);
        p.onTimeChange?.(media.currentTime);
      } else
        setPosition((v) => {
          const next = v + (now - last) / 1000;
          if (next < duration) return next;
          setPlaying(false);
          return 0;
        });
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
  useEffect(() => {
    if (audio.current) {
      audio.current.muted = muted;
      audio.current.volume = clamp(volume, 0, 1);
    }
  }, [muted, volume]);
  const toggle = () => {
    const next = !playing;
    setPlaying(next);
    p.onPlayingChange?.(next);
    if (audio.current) {
      if (next) void audio.current.play();
      else audio.current.pause();
    }
  };
  const seek = (v: number) => {
    setPosition(v);
    if (audio.current) audio.current.currentTime = v;
    p.onTimeChange?.(v);
  };
  return (
    <div {...mark("AudioPlayer", p)} data-playing={playing || undefined}>
      <span className="ad-player-play">
        <IconButton
          variant="primary"
          round
          icon={playing ? "pause" : "play"}
          label={playing ? "Пауза" : "Воспроизвести"}
          onClick={toggle}
        />
      </span>
      <div className="ad-player-track">
        <Waveform
          duration={duration}
          position={position}
          onSeek={seek}
          points={p.points}
          src={p.points ? undefined : p.src}
        />
        <div className="ad-player-times">
          <span className="ad-time">{timeText(position)}</span>
          <span className="ad-time">−{timeText(duration - position)}</span>
        </div>
      </div>
      <div className="ad-player-volume">
        <IconButton
          variant="ghost"
          icon="volume"
          label={muted ? "Включить звук" : "Выключить звук"}
          aria-pressed={muted}
          data-muted={muted || undefined}
          onClick={() => setMuted((v) => !v)}
        />
        {p.showVolume !== false && (
          <Slider
            size="sm"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onValueChange={(v) => {
              setMuted(false);
              setVolume(v);
            }}
            label="Громкость"
          />
        )}
      </div>
    </div>
  );
};
`,Ct=`import { AudioPlayer } from "@ad-voice/ui";

/** Pass \`src\` to play a file; without it the player shows its timeline only. */
export default function AudioPlayerExample() {
  return <AudioPlayer duration={51} defaultVolume={0.7} />;
}
`,Mt=`export default {\r
  name: "AudioPlayer",\r
  description: "Воспроизведение, позиция, время и звук",\r
  category: "audio",\r
  wide: true,\r
} as const;\r
`,Rt=`import type { CSSProperties, ReactNode } from "react";
import { clamp, mark, type CommonProps } from "../../../core/base";

export interface LyricWord {
  id: string;
  text: string;
  /** How much of the word is sung, 0–1; it fills left to right. */
  progress?: number;
}

export interface KaraokeLyricsProps extends CommonProps {
  /** The line being sung now. */
  current?: readonly LyricWord[];
  /** The line after it, dimmed below. */
  next?: readonly LyricWord[];
  /** Shown in place of the current line, e.g. a countdown before it. */
  message?: ReactNode;
  /** Keys of the lines: a new key fades the line in, the same key keeps it in place. */
  currentKey?: string | number;
  nextKey?: string | number;
  /** The music's percussion, 0–1: the line swells and glows with the kick and flashes with the snare. */
  kick?: number;
  snare?: number;
  pulse?: number;
}

const DEMO: LyricWord[] = [
  { id: "1", text: "Ночь", progress: 1 },
  { id: "2", text: "горит", progress: 0.55 },
  { id: "3", text: "огнями", progress: 0 },
];

const line = (words: readonly LyricWord[], sung: boolean) =>
  words.map((word) => (
    <span
      key={word.id}
      className="ad-lyric-word"
      style={{ "--ad-lyric-fill": \`\${Math.round(clamp(sung ? (word.progress ?? 0) : 0, 0, 1) * 100)}%\` } as CSSProperties}
    >
      {word.text}{" "}
    </span>
  ));

/** Karaoke lyrics: the current line fills as it is sung and breathes with the drums; the next one waits below. */
export const KaraokeLyrics = ({
  current = DEMO,
  next = [{ id: "4", text: "и" }, { id: "5", text: "нас" }, { id: "6", text: "зовёт" }],
  message,
  currentKey,
  nextKey,
  kick = 0,
  snare = 0,
  pulse = 0,
  ...p
}: KaraokeLyricsProps) => (
  <div
    {...mark("KaraokeLyrics", p)}
    aria-live="off"
    style={{ ...p.style, "--ad-lyric-kick": kick, "--ad-lyric-snare": snare, "--ad-lyric-pulse": pulse } as CSSProperties}
  >
    <p key={currentKey} className="ad-lyrics-current" data-message={message !== undefined || undefined}>
      {message ?? line(current, true)}
    </p>
    <p key={nextKey} className="ad-lyrics-next" aria-hidden={message !== undefined || undefined}>
      {message === undefined && line(next, false)}
    </p>
  </div>
);
`,Et=`import { useEffect, useState } from "react";
import { KaraokeLyrics, type LyricWord } from "@ad-voice/ui";

const lines = [["Ночь", "горит", "огнями"], ["и", "нас", "зовёт"], ["домой", "сквозь", "тьму"]];
const wordSeconds = 0.6;

export default function KaraokeLyricsExample() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      setTime(((now - start) / 1000) % (lines.length * 3 * wordSeconds + 1.5));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const index = Math.min(lines.length - 1, Math.floor(time / (3 * wordSeconds)));
  const words = (row: number): LyricWord[] =>
    (lines[row] ?? []).map((text, i) => ({
      id: \`\${row}-\${i}\`,
      text,
      progress: (time - (row * 3 + i) * wordSeconds) / wordSeconds,
    }));
  const kick = Math.max(0, 1 - ((time * 2) % 1) * 4);
  return (
    <div style={{ width: "100%", padding: "2rem 0", background: "#000", borderRadius: "1rem" }}>
      <KaraokeLyrics current={words(index)} next={words(index + 1)} currentKey={index} nextKey={index + 1} kick={kick} pulse={kick / 2} />
    </div>
  );
}
`,At=`export default {
  name: "KaraokeLyrics",
  description: "Строки караоке: заливка по мере пения, следующая строка, отсчёт, реакция на барабаны.",
  category: "audio",
} as const;
`,Bt=`import { useSvgId } from "../../../core/artwork";
import { useEffect, useRef } from "react";
import { clamp, mark } from "../../../core/base";
import { type LevelMeterProps } from "../shared";

const SAMPLES = 64;
const WIDTH = 256;
const HEIGHT = 24;
const MID = HEIGHT / 2;
const STEP = WIDTH / (SAMPLES - 1);
/** A new sample enters every 28 ms; between samples the wave slides sub-pixel. */
const SAMPLE_MS = 28;

/** Mirrored outline of the samples around the midline; quiet parts keep a thin line. */
const wavePath = (samples: readonly number[]) => {
  const point = (i: number, level: number, side: 1 | -1) =>
    \`\${(i * STEP).toFixed(2)} \${(MID + side * (1 + level ** 0.68 * (MID - 3))).toFixed(2)}\`;
  const upper = samples.map((level, i) => point(i, level, -1));
  const lower = samples.map((level, i) => point(i, level, 1)).reverse();
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;
};

/** Root-mean-square loudness of an analyser's current window, scaled to 0..1. */
const loudness = (
  analyser: AnalyserNode,
  buffer: Float32Array<ArrayBuffer>,
) => {
  analyser.getFloatTimeDomainData(buffer);
  let sum = 0;
  for (const sample of buffer) sum += sample * sample;
  return Math.min(1, Math.sqrt(sum / buffer.length) * 4);
};

/**
 * Live input level as a scrolling mirrored wave. Feed it a changing \`value\` (0–100) or hand
 * it a \`stream\` (e.g. from getUserMedia) and it listens by itself. The wave is redrawn
 * outside React on every display refresh, so it never re-renders at the animation rate.
 */
export function LevelMeter({
  value = 0,
  stream,
  active = true,
  compact = false,
  label,
  ...p
}: LevelMeterProps) {
  const id = useSvgId();
  const path = useRef<SVGPathElement>(null);
  const target = useRef(0);
  const level = clamp(value) / 100;

  useEffect(() => {
    target.current = active ? level : 0;
  }, [active, level]);

  useEffect(() => {
    const shape = path.current;
    if (!shape) return;
    const samples = Array.from({ length: SAMPLES + 1 }, () => 0);
    shape.setAttribute("d", wavePath(samples));
    if (!active) return;

    let context: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    if (stream) {
      context = new AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source = context.createMediaStreamSource(stream);
      source.connect(analyser);
    }
    const buffer = new Float32Array(analyser?.fftSize ?? 0);

    let envelope = 0;
    let carry = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function draw(now) {
      carry += Math.min(250, now - last);
      last = now;
      const input = analyser ? loudness(analyser, buffer) : target.current;
      while (carry >= SAMPLE_MS) {
        carry -= SAMPLE_MS;
        // Fast attack, slow release, like a real meter's ballistics.
        envelope += (input - envelope) * (input > envelope ? 0.3 : 0.11);
        if (envelope < 0.001) envelope = 0;
        samples.shift();
        samples.push(envelope);
        shape.setAttribute("d", wavePath(samples));
      }
      shape.setAttribute(
        "transform",
        \`translate(\${(-(carry / SAMPLE_MS) * STEP).toFixed(3)} 0)\`,
      );
      frame = requestAnimationFrame(draw);
    });
    return () => {
      cancelAnimationFrame(frame);
      source?.disconnect();
      void context?.close();
    };
  }, [active, stream]);

  return (
    <div
      {...mark("LevelMeter", p)}
      role="meter"
      aria-label={label ?? "Уровень сигнала"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={stream ? undefined : Math.round(active ? level * 100 : 0)}
      data-active={active}
      data-compact={compact || undefined}
    >
      <svg
        viewBox={\`0 0 \${WIDTH} \${HEIGHT}\`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={\`\${id}-wave\`}>
            <stop stopColor="var(--ad-primary-700)" />
            <stop offset="0.52" stopColor="var(--ad-red)" />
            <stop offset="1" stopColor="var(--ad-secondary-100)" />
          </linearGradient>
        </defs>
        <line className="ad-level-meter-axis" x2={WIDTH} y1={MID} y2={MID} />
        <path
          ref={path}
          className="ad-level-meter-wave"
          fill={\`url(#\${id}-wave)\`}
        />
      </svg>
    </div>
  );
}
`,It=`import { useEffect, useState } from "react";
import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

/** A voice-like level: syllables rise and fall, with short pauses between phrases. */
function useDemoVoice(enabled: boolean) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const phrase = Math.sin(t * 0.9) > -0.35 ? 1 : 0.05;
      const syllable =
        Math.abs(Math.sin(t * 7.3)) * (0.55 + 0.45 * Math.sin(t * 2.1));
      setLevel(Math.round(phrase * syllable * 90 + Math.random() * 8));
    }, 60);
    return () => clearInterval(timer);
  }, [enabled]);
  return level;
}

export default function LevelMeterExample() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>();
  const level = useDemoVoice(!stream);
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const toggleMicrophone = async () => {
    if (stream) return setStream(null);
    try {
      setError(undefined);
      setStream(await navigator.mediaDevices.getUserMedia({ audio: true }));
    } catch {
      setError("Нет доступа к микрофону");
    }
  };

  return (
    <Playground
      stretch
      knobs={{ active: { value: true }, compact: { value: false } }}
      code={(v) =>
        jsx("LevelMeter", {
          label: "Микрофон",
          ...(stream ? { stream: expr("stream") } : { value: expr("level") }),
          active: v.active ? undefined : expr("false"),
          compact: v.compact,
        })
      }
      extra={
        <U.Stack direction="row" gap={3} align="center" wrap>
          <U.Button
            size="sm"
            icon="mic"
            variant={stream ? "primary" : "secondary"}
            onClick={toggleMicrophone}
          >
            {stream ? "Отключить микрофон" : "Подключить микрофон"}
          </U.Button>
          <U.Typography variant="caption" tone={error ? "danger" : "muted"}>
            {error ??
              (stream ? "Слушаю ваш микрофон" : "Сейчас — симуляция голоса")}
          </U.Typography>
        </U.Stack>
      }
    >
      {(v) => (
        <U.LevelMeter
          label="Микрофон"
          value={level}
          stream={stream}
          active={v.active}
          compact={v.compact}
        />
      )}
    </Playground>
  );
}
`,Nt=`export default {
  name: "LevelMeter",
  description: "Живой уровень сигнала: бегущая зеркальная волна, слушает микрофон сам",
  category: "audio",
} as const;
`,zt=`import type { ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Typography } from "../../foundation/Typography/Typography";
import { Equalizer } from "../../effects/Equalizer/Equalizer";
import { Tilt } from "../../effects/Tilt/Tilt";
import { Card } from "../../layout/Card/Card";

export interface MediaCardProps extends CommonProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Cover picture; without it an equalizer dances behind the card. */
  image?: string;
  /** Bar heights 0–1 from a live spectrum for the equalizer cover; without them it bounces on its own. */
  levels?: readonly number[];
  /** Shifts the equalizer's bounce so neighbouring cards do not move in step. */
  phase?: number;
  /** A status mark in the top corner. */
  badge?: ReactNode;
  /** Round buttons in the glass pill at the bottom. */
  actions?: ReactNode;
  /** Lean toward the pointer with a glossy glare; a number sets the largest lean in degrees. */
  tilt?: boolean | number;
}

/**
 * A song, album or take as a card: its cover (or a dancing equalizer) fills the card, the title and
 * a status sit on top, the actions ride in a glass pill at the bottom; children go into the pill
 * before the actions (e.g. a progress read-out).
 */
export function MediaCard({ title, subtitle, image, levels, phase = 0, badge, actions, tilt = true, children, ...p }: MediaCardProps) {
  const card = (
    <Card border padding="none" className="ad-media-card-card" data-image={image ? "" : undefined}>
      {image && <img className="ad-media-card-image" src={image} alt="" loading="lazy" />}
      <span className="ad-media-card-art" aria-hidden="true">
        <Equalizer bars={16} levels={levels} phase={phase} />
      </span>
      <div className="ad-media-card-content">
        <div className="ad-media-card-head">
          <div className="ad-media-card-title">
            <Typography as="strong" variant="title" truncate>{title}</Typography>
            {subtitle && <Typography variant="body-sm" tone="muted" truncate>{subtitle}</Typography>}
          </div>
          {badge}
        </div>
        {(children || actions) && <div className="ad-media-card-actions">{children}{actions}</div>}
      </div>
    </Card>
  );
  return <div {...mark("MediaCard", p)}>{tilt ? <Tilt max={typeof tilt === "number" ? tilt : 10}>{card}</Tilt> : card}</div>;
}
`,Lt=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function MediaCardExample() {
  return (
    <Playground
      stretch
      knobs={{ tilt: { value: true } }}
      code={(v) =>
        jsx("MediaCard", { title: "Небо", subtitle: "Звери", badge: { expr: '<Badge tone="success">Готово</Badge>' }, tilt: v.tilt ? undefined : { expr: "false" } },
          '<IconButton round size="sm" variant="primary" icon="play" label="Играть" />')
      }
    >
      {(v) => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "1rem", height: "12rem" }}>
          <U.MediaCard title="Небо" subtitle="Звери" tilt={v.tilt} badge={<U.Badge tone="success">Готово</U.Badge>}
            actions={<><U.IconButton round size="sm" variant="primary" icon="play" label="Играть" /><U.IconButton round size="sm" icon="more" label="Ещё" /></>} />
          <U.MediaCard title="Группа крови" subtitle="Кино" phase={0.4} tilt={v.tilt} badge={<U.Badge tone="warning">Обработка</U.Badge>}
            actions={<U.IconButton round size="sm" icon="stop" label="Отменить" />}>
            <U.ProgressBar value={46} label="Разделение · 46%" />
          </U.MediaCard>
        </div>
      )}
    </Playground>
  );
}
`,Dt=`export default {
  name: "MediaCard",
  description: "Карточка песни или записи: обложка (или танцующий эквалайзер) на весь фон, название и статус сверху, кнопки в стеклянной капсуле снизу.",
  category: "audio",
};
`,Ft=`import { useRef, type CSSProperties, type WheelEvent } from "react";\r
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";\r
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";\r
\r
export interface MelodyNote {\r
  id: string;\r
  /** Seconds. */\r
  start: number;\r
  end: number;\r
  /** MIDI pitch: 60 is C4. */\r
  pitch: number;\r
  /** Syllable sung on the note. */\r
  lyric?: string;\r
}\r
\r
export interface MelodyRollProps extends CommonProps {\r
  notes?: readonly MelodyNote[];\r
  /** Playback position, seconds. */\r
  position?: number;\r
  /** Seconds shown across the lane; the wheel zooms it when uncontrolled or with \`onWindowChange\`. */\r
  window?: number;\r
  defaultWindow?: number;\r
  onWindowChange?: (seconds: number) => void;\r
  /** Where the playhead sits across the lane, 0–1. */\r
  lead?: number;\r
  /** Pitch range shown; by default the notes' own range with a little air. */\r
  minPitch?: number;\r
  maxPitch?: number;\r
  /** The singer's pitch now, as a fractional MIDI note; nothing when silent. */\r
  livePitch?: number;\r
  /** How close the singer is to the note under the playhead, 0–1: colours the voice marker. */\r
  accuracy?: number;\r
  /** The singer is on the right note now: marker and key turn green. */\r
  hit?: boolean;\r
  /** Notes already sung right: they turn green with a burst. */\r
  hitIds?: ReadonlySet<string>;\r
  /** Loudness of the voice, 0–1: the marker swells with it. */\r
  level?: number;\r
  /** Pulse of the music, 0–1 (e.g. the kick drum): the playhead and lane flash with it. */\r
  beat?: number;\r
  /** Syllables inside the notes. */\r
  showLyrics?: boolean;\r
  /** Pressing a key, e.g. to hear its pitch. */\r
  onKeyPress?: (midi: number) => void;\r
  label?: string;\r
}\r
\r
const DEMO: MelodyNote[] = [\r
  { id: "1", start: 0.4, end: 1.1, pitch: 64, lyric: "Ночь" },\r
  { id: "2", start: 1.2, end: 1.6, pitch: 67, lyric: "го" },\r
  { id: "3", start: 1.7, end: 2.5, pitch: 69, lyric: "рит" },\r
  { id: "4", start: 2.7, end: 3.4, pitch: 67, lyric: "ог" },\r
  { id: "5", start: 3.5, end: 4.3, pitch: 64, lyric: "ня" },\r
  { id: "6", start: 4.5, end: 5.8, pitch: 62, lyric: "ми" },\r
  { id: "7", start: 6.2, end: 6.9, pitch: 60, lyric: "и" },\r
  { id: "8", start: 7, end: 8.2, pitch: 64, lyric: "нас" },\r
];\r
// The voice trail keeps this much of the past, in seconds.\r
const TRAIL = 3;\r
\r
/**\r
 * The karaoke melody lane: notes glide towards the playhead, the singer's voice is a marker that\r
 * leaves a trail, notes sung right flash green, and the lane breathes with the music. The keyboard\r
 * on the left shows which key the voice is on. Scroll the wheel to zoom in or out in time.\r
 */\r
export const MelodyRoll = ({\r
  notes = DEMO,\r
  position = 2,\r
  window: windowProp,\r
  defaultWindow = 8,\r
  onWindowChange,\r
  lead = 0.25,\r
  minPitch,\r
  maxPitch,\r
  livePitch,\r
  accuracy = 0,\r
  hit = false,\r
  hitIds,\r
  level = 0,\r
  beat = 0,\r
  showLyrics = false,\r
  onKeyPress,\r
  label,\r
  ...p\r
}: MelodyRollProps) => {\r
  const [span, setSpan] = useControllable(windowProp, defaultWindow, onWindowChange);\r
  const pitches = notes.map((note) => note.pitch);\r
  const low = minPitch ?? Math.min(...pitches, 60) - 2;\r
  const high = Math.max(low + 4, maxPitch ?? Math.max(...pitches, 64) + 2);\r
  const rows = high - low + 1;\r
  const from = position - span * lead;\r
  const x = (seconds: number) => ((seconds - from) / span) * 100;\r
  const y = (pitch: number) => ((high - pitch) / rows) * 100;\r
  const visible = notes.filter((note) => note.end >= from && note.start <= from + span);\r
\r
  // The voice trail: recent pitches, dropped on silence and when playback jumps back.\r
  const trail = useRef<{ t: number; pitch?: number }[]>([]);\r
  if (trail.current.at(-1)?.t !== position) {\r
    const kept = trail.current.filter((point) => point.t > position - TRAIL && point.t < position);\r
    trail.current = [...kept, { t: position, pitch: livePitch }];\r
  }\r
  const segments = trail.current.reduce<string[]>((paths, point, i, all) => {\r
    if (point.pitch === undefined) return paths;\r
    const joined = i > 0 && all[i - 1]?.pitch !== undefined;\r
    const at = \`\${x(point.t).toFixed(2)},\${(((high - point.pitch + 0.5) / rows) * 100).toFixed(2)}\`;\r
    if (joined) paths[paths.length - 1] += \` L\${at}\`;\r
    else paths.push(\`M\${at}\`);\r
    return paths;\r
  }, []);\r
\r
  const zoom = (event: WheelEvent<HTMLDivElement>) => {\r
    if (!event.deltaY) return;\r
    setSpan(clamp(span * (event.deltaY > 0 ? 1.12 : 1 / 1.12), 2, 20));\r
  };\r
\r
  return (\r
    <div\r
      {...mark("MelodyRoll", p)}\r
      role="img"\r
      aria-label={label ?? "Мелодия"}\r
      onWheel={zoom}\r
      style={\r
        {\r
          ...p.style,\r
          "--ad-roll-rows": rows,\r
          "--ad-roll-beat": clamp(beat, 0, 1),\r
          "--ad-roll-level": clamp(level, 0, 1),\r
          "--ad-roll-accuracy": clamp(accuracy, 0, 1),\r
          "--ad-roll-second": \`\${100 / span}%\`,\r
          "--ad-roll-shift": \`\${(-(from % 1) / span) * 100}%\`,\r
        } as CSSProperties\r
      }\r
    >\r
      <PianoKeyboard\r
        className="ad-melody-roll-keys"\r
        minMidi={low}\r
        maxMidi={high}\r
        activeMidi={livePitch === undefined ? undefined : Math.round(livePitch)}\r
        hit={hit}\r
        labels={rows > 30 ? "octaves" : "all"}\r
        onKeyPress={onKeyPress}\r
      />\r
      <div className="ad-melody-roll-lane" aria-hidden="true">\r
        {visible.map((note) => (\r
          <span\r
            key={note.id}\r
            className="ad-melody-note"\r
            data-hit={hitIds?.has(note.id) || undefined}\r
            data-now={(position >= note.start && position <= note.end) || undefined}\r
            data-past={position > note.end || undefined}\r
            style={{\r
              left: \`\${x(note.start)}%\`,\r
              width: \`\${Math.max(0.6, ((note.end - note.start) / span) * 100)}%\`,\r
              top: \`\${y(note.pitch)}%\`,\r
            }}\r
          >\r
            {showLyrics && note.lyric && <span>{note.lyric}</span>}\r
          </span>\r
        ))}\r
        <svg className="ad-melody-trail" viewBox="0 0 100 100" preserveAspectRatio="none">\r
          {segments.map((d, i) => (\r
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />\r
          ))}\r
        </svg>\r
        <span className="ad-melody-playhead" style={{ left: \`\${lead * 100}%\` }} />\r
        {livePitch !== undefined && (\r
          <span\r
            className="ad-melody-voice"\r
            data-hit={hit || undefined}\r
            style={{ left: \`\${lead * 100}%\`, top: \`\${((high - livePitch + 0.5) / rows) * 100}%\` }}\r
          />\r
        )}\r
      </div>\r
    </div>\r
  );\r
};\r
`,Vt=`import { useEffect, useRef, useState } from "react";
import { MelodyRoll, Switch, type MelodyNote } from "@ad-voice/ui";

const melody = [64, 67, 69, 67, 64, 62, 60, 64, 65, 67, 72, 71, 69, 67];
const syllables = ["Ночь", "го", "рит", "ог", "ня", "ми", "и", "нас", "зо", "вёт", "до", "мой", "сквозь", "тьму"];
const notes: MelodyNote[] = melody.map((pitch, i) => ({
  id: String(i), start: i * 0.85, end: i * 0.85 + 0.7, pitch, lyric: syllables[i],
}));
const length = notes.length * 0.85 + 1;

/** A singer imitated: wavers around the melody, sometimes off by a semitone, louder on long notes. */
export default function MelodyRollExample() {
  const [position, setPosition] = useState(0);
  const [lyrics, setLyrics] = useState(true);
  const hits = useRef(new Set<string>());
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPosition(((now - start) / 1000) % length);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const note = notes.find((item) => position >= item.start && position <= item.end);
  const off = note && Number(note.id) % 4 === 3 ? 1 : 0;
  const livePitch = note ? note.pitch + off + Math.sin(position * 9) * 0.25 : undefined;
  const accuracy = livePitch === undefined || !note ? 0 : Math.max(0, 1 - Math.abs(livePitch - note.pitch));
  const hit = accuracy > 0.6;
  if (position < 0.1) hits.current.clear();
  if (note && hit && position > note.start + 0.35) hits.current.add(note.id);
  const beat = Math.max(0, 1 - ((position * 2) % 1) * 3);

  return (
    <div style={{ display: "grid", gap: "0.75rem", width: "100%" }}>
      <div style={{ height: "14rem" }}>
        <MelodyRoll notes={notes} position={position} livePitch={livePitch} accuracy={accuracy} hit={hit}
          hitIds={hits.current} level={note ? 0.5 + Math.sin(position * 5) * 0.3 : 0} beat={beat} showLyrics={lyrics} />
      </div>
      <Switch label="Слоги на нотах" checked={lyrics} onValueChange={setLyrics} />
    </div>
  );
}
`,$t=`export default {
  name: "MelodyRoll",
  description: "Мелодирол караоке: ноты, голос со следом, зелёные попадания, реакция на бит, масштаб колесом.",
  category: "audio",
} as const;
`,Ot=`import { memo, useState, type CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

const BLACK = new Set([1, 3, 6, 8, 10]);
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Whether a MIDI note is a black key. */
export const isBlackKey = (midi: number): boolean => BLACK.has(((midi % 12) + 12) % 12);
/** Scientific pitch name of a MIDI note: 60 is "C4". */
export const noteName = (midi: number): string =>
  \`\${NAMES[((midi % 12) + 12) % 12]}\${Math.floor(midi / 12) - 1}\`;

export interface PianoKeyboardProps extends CommonProps {
  /** Lowest and highest MIDI notes shown, bottom to top. */
  minMidi?: number;
  maxMidi?: number;
  /** The note being sung or played now; its key lights up. */
  activeMidi?: number;
  /** The active note is the right one: the key turns green and pulses. */
  hit?: boolean;
  /** Which keys carry their name. */
  labels?: "all" | "octaves" | "none";
  /** Pressing a key, e.g. to hear its pitch. Without it the keyboard is a picture. */
  onKeyPress?: (midi: number) => void;
  label?: string;
}

/** Positions in semitone rows from the top; turned into percentages of the keyboard's height. */
const whiteKeys = (min: number, max: number) => {
  const rows = max - min + 1;
  const white = Array.from({ length: rows }, (_, i) => max - i).filter((midi) => !isBlackKey(midi));
  const centers = white.map((midi) => max - midi + 0.5);
  return white.map((midi, i) => {
    const center = centers[i] ?? 0;
    const top = i ? (center + (centers[i - 1] ?? 0)) / 2 : 0;
    const bottom = i === white.length - 1 ? rows : (center + (centers[i + 1] ?? rows)) / 2;
    return { midi, top, size: bottom - top };
  });
};

/**
 * A vertical piano keyboard that fills its box: the sung note's key glows, a correct one turns
 * green and pulses, a pressed key dips like a real one.
 */
export const PianoKeyboard = memo(function PianoKeyboard({
  minMidi = 55,
  maxMidi = 79,
  activeMidi,
  hit = false,
  labels = "all",
  onKeyPress,
  label,
  ...p
}: PianoKeyboardProps) {
  const [pressed, setPressed] = useState<number>();
  const rows = Math.max(1, maxMidi - minMidi + 1);
  const pct = (value: number) => \`\${(value / rows) * 100}%\`;
  const named = (midi: number) => labels === "all" || (labels === "octaves" && midi % 12 === 0);
  const press = (midi: number) => {
    setPressed(midi);
    onKeyPress?.(midi);
    window.setTimeout(() => setPressed((current) => (current === midi ? undefined : current)), 220);
  };
  const key = (midi: number, top: number, size: number, black: boolean) => {
    const props = {
      className: "ad-piano-key",
      "data-black": black || undefined,
      "data-active": midi === activeMidi || undefined,
      "data-hit": (midi === activeMidi && hit) || undefined,
      "data-pressed": midi === pressed || undefined,
      style: { top: pct(top), height: pct(size) } as CSSProperties,
      children: named(midi) ? <span>{noteName(midi)}</span> : null,
    };
    return onKeyPress ? (
      <button key={midi} type="button" aria-label={noteName(midi)} onPointerDown={() => press(midi)} {...props} />
    ) : (
      <span key={midi} {...props} />
    );
  };
  const blacks = Array.from({ length: rows }, (_, i) => maxMidi - i).filter(isBlackKey);

  return (
    <div
      {...mark("PianoKeyboard", p)}
      role={onKeyPress ? "group" : "img"}
      aria-label={label ?? \`Клавиатура \${noteName(minMidi)}–\${noteName(maxMidi)}\`}
      style={{ ...p.style, "--ad-keys": rows } as CSSProperties}
    >
      {whiteKeys(minMidi, maxMidi).map(({ midi, top, size }) => key(midi, top, size, false))}
      {blacks.map((midi) => key(midi, maxMidi - midi + 0.16, 0.68, true))}
    </div>
  );
});
`,Ht=`import { useState } from "react";
import { PianoKeyboard, Switch, Typography, noteName } from "@ad-voice/ui";

export default function PianoKeyboardExample() {
  const [active, setActive] = useState(67);
  const [hit, setHit] = useState(true);
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", height: "20rem" }}>
      <div style={{ width: "5rem", height: "100%" }}>
        <PianoKeyboard minMidi={55} maxMidi={79} activeMidi={active} hit={hit} onKeyPress={setActive} />
      </div>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Typography variant="title">Нота: {noteName(active)}</Typography>
        <Typography variant="caption" tone="muted">Нажмите на клавишу</Typography>
        <Switch label="Попадание" checked={hit} onValueChange={setHit} />
      </div>
    </div>
  );
}
`,Ut=`export default {
  name: "PianoKeyboard",
  description: "Вертикальная клавиатура: подсветка ноты, зелёное попадание, нажатие клавиш.",
  category: "audio",
} as const;
`,Wt=`import {\r
  canPaint,\r
  createResizeObserver,\r
  reducedMotionQuery,\r
} from "../../../core/environment";\r
import React, {\r
  useEffect,\r
  useLayoutEffect,\r
  useMemo,\r
  useRef,\r
  useState,\r
} from "react";\r
import { clamp, mark, normalizeSize } from "../../../core/base";\r
import { type RotaryKnobProps, type RotaryKnobController } from "../shared";\r
\r
export const RotaryKnob = (p: RotaryKnobProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const baseRef = useRef<HTMLCanvasElement>(null);\r
  const feedbackRef = useRef<HTMLCanvasElement>(null);\r
  const rotorRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<HTMLDivElement>(null);\r
  const readoutRef = useRef<HTMLDivElement>(null);\r
  const controllerRef = useRef<RotaryKnobController | null>(null);\r
  const onChangeRef = useRef(p.onValueChange);\r
  const onCommitRef = useRef(p.onValueCommit);\r
  const disabledRef = useRef(!!p.disabled);\r
  const readOnlyRef = useRef(!!p.readOnly);\r
  const numberFormat = useMemo(\r
    () => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }),\r
    [],\r
  );\r
  // The knob turns through positions 0–100; values in [min, max] map onto them at the edges.\r
  const min = p.min ?? 0;\r
  const span = (p.max ?? 100) - min || 1;\r
  const toPosition = (value: number) => clamp(((value - min) / span) * 100);\r
  const toValue = (position: number) =>\r
    Math.round((min + (position / 100) * span) * 1e6) / 1e6;\r
  const displayScale = p.displayScale ?? 1;\r
  const format = (value: number) =>\r
    \`\${numberFormat.format(value * displayScale)}\${p.suffix ?? "%"}\`;\r
  const scale = useRef({ toValue, format });\r
  scale.current = { toValue, format };\r
  const stepRef = useRef(1);\r
  const fineStepRef = useRef(0.1);\r
  onChangeRef.current = p.onValueChange;\r
  onCommitRef.current = p.onValueCommit;\r
  disabledRef.current = !!p.disabled;\r
  readOnlyRef.current = !!p.readOnly;\r
  stepRef.current = Math.max(0.001, ((p.step ?? span / 100) / span) * 100);\r
  fineStepRef.current = Math.max(0.001, ((p.fineStep ?? span / 1000) / span) * 100);\r
\r
  const initial = toPosition(p.defaultValue ?? p.value ?? min + span * 0.67);\r
  const initialRef = useRef(initial);\r
  const resetRef = useRef<number | undefined>(undefined);\r
  resetRef.current = p.resetValue === undefined ? undefined : toPosition(p.resetValue);\r
  const diameter =\r
    p.diameter ??\r
    { xs: 84, sm: 124, md: 220, lg: 320 }[normalizeSize(p.size) ?? "md"];\r
\r
  useLayoutEffect(() => {\r
    const root = rootRef.current!;\r
    const canvas = baseRef.current!;\r
    const rotor = rotorRef.current!;\r
    const feedback = feedbackRef.current!;\r
    const readout = readoutRef.current!;\r
    const control = controlRef.current!;\r
    if (!root || !canvas || !rotor || !feedback || !readout || !control) return;\r
\r
    // Without a 2D canvas (tests, server rendering) only the painting is skipped; the value,\r
    // keys, wheel and typed input keep working.\r
    const paintable = canPaint();\r
    const rotorCtx = (paintable ? rotor.getContext("2d") : null)!;\r
    const feedbackCtx = (paintable ? feedback.getContext("2d") : null)!;\r
    const ctx = (paintable ? canvas.getContext("2d", { alpha: true }) : null)!;\r
    const painted = Boolean(rotorCtx && feedbackCtx && ctx);\r
\r
    const TAU = Math.PI * 2;\r
    const localClamp = (value: number, min = 0, max = 1) =>\r
      Math.max(min, Math.min(max, value));\r
    const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;\r
    const fract = (value: number) => value - Math.floor(value);\r
    const noise = (value: number) =>\r
      fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);\r
    const defaultValue = localClamp(Number(initialRef.current) || 0, 0, 100);\r
    const startAngle = -135;\r
    const sweepAngle = 270;\r
    const valueAngle = (value: number) =>\r
      startAngle + (value * sweepAngle) / 100;\r
    const initialAngle = valueAngle(defaultValue);\r
    const degrees = 180 / Math.PI;\r
    const reducedMotion = reducedMotionQuery();\r
    const listeners = new AbortController();\r
    let value = defaultValue;\r
    let visualValue = value;\r
    let drag: null | {\r
      id: number;\r
      x: number;\r
      y: number;\r
      center: { x: number; y: number; radius: number };\r
      angle: number | null;\r
      mode: "circular" | "linear";\r
      value: number;\r
      start: number;\r
      /** Set by a click on the scale: the knob glides to the spot instead of snapping. */\r
      glide: boolean;\r
      distance: number;\r
    } = null;\r
    let renderTimer = 0;\r
    let animationFrame = 0;\r
    let previousFrame = 0;\r
    let disposed = false;\r
\r
    function render() {\r
      if (disposed || !painted) return;\r
      const cssSize = root.getBoundingClientRect().width;\r
      const size = Math.round(\r
        Math.min(\r
          1800,\r
          cssSize * Math.max(2, Math.min(devicePixelRatio || 1, 2.5)),\r
        ),\r
      );\r
      if (!size || (canvas.width === size && canvas.height === size)) return;\r
      canvas.width = canvas.height = size;\r
      const center = size / 2;\r
      const radius = size * 0.445;\r
      const pixels = ctx.createImageData(size, size);\r
      const data = pixels.data;\r
      const brush = new Float32Array(Math.ceil(radius * 5) + 8);\r
      for (let i = 0; i < brush.length; i++) brush[i] = noise(i + 17) - 0.5;\r
\r
      for (let y = 0; y < size; y++) {\r
        const yy = (y + 0.5 - center) / radius;\r
        for (let x = 0; x < size; x++) {\r
          const xx = (x + 0.5 - center) / radius;\r
          const r = Math.hypot(xx, yy);\r
          if (r > 1.055) continue;\r
          const index = (y * size + x) * 4;\r
          if (r > 1) {\r
            const a = Math.exp(-(r - 1) * 135) * 0.09;\r
            data[index] = 130;\r
            data[index + 1] = 0;\r
            data[index + 2] = 9;\r
            data[index + 3] = a * 255;\r
            continue;\r
          }\r
\r
          const angle = Math.atan2(yy, xx);\r
          const ringPosition = r * radius * 1.8;\r
          const bi = Math.floor(ringPosition);\r
          const grain = mix(\r
            brush[bi] ?? 0,\r
            brush[bi + 1] ?? 0,\r
            ringPosition - bi,\r
          );\r
          const grain2 = Math.sin(\r
            r * radius * 4.8 + Math.sin(angle * 17) * 0.3,\r
          );\r
          const directional = Math.pow(Math.abs(Math.cos(angle + 0.77)), 16);\r
          const broad = Math.pow(Math.abs(Math.cos(angle - 0.86)), 5);\r
          const edgeLight = 0.5 + 0.5 * Math.cos(angle + 2.15);\r
          const grainAmount = grain * 9.5 + grain2 * 2.2;\r
          let red = 0,\r
            green = 0,\r
            blue = 0,\r
            v = 0;\r
\r
          if (r < 0.704) {\r
            const radialLight = 0.7 + 0.3 * Math.sqrt(r / 0.704);\r
            const satin =\r
              84 * Math.max(0, Math.cos(angle - 1.01)) ** 28 +\r
              76 * Math.max(0, Math.cos(angle - 2.23)) ** 27 +\r
              116 * Math.max(0, Math.cos(angle - 4.07)) ** 29 +\r
              108 * Math.max(0, Math.cos(angle - 5.31)) ** 30;\r
            v = 7 + radialLight * satin + 11 * Math.abs(Math.cos(angle)) ** 14;\r
            v += grainAmount * (0.48 + v / 55);\r
            v += 9 * Math.exp(-r * 90);\r
            v *= 1 - 0.35 * Math.exp(-Math.pow((r - 0.699) / 0.009, 2));\r
            red = v;\r
            green = v * 0.995;\r
            blue = v * 1.025;\r
          } else if (r < 0.709) {\r
            v = 8 + 17 * edgeLight;\r
            red = v;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.715) {\r
            v = 85 + 133 * edgeLight + 25 * directional;\r
            red = v;\r
            green = v * 0.96;\r
            blue = v * 0.93;\r
          } else if (r < 0.729) {\r
            const t = (r - 0.715) / 0.014;\r
            v =\r
              (21 + 111 * directional + 55 * broad) * (1 - t * 0.55) +\r
              grainAmount;\r
            red = v + 5;\r
            green = v;\r
            blue = v * 0.98;\r
          } else if (r < 0.735) {\r
            v = 100 + 106 * edgeLight;\r
            red = v;\r
            green = v * 0.96;\r
            blue = v * 0.94;\r
          } else if (r < 0.743) {\r
            v = 5 + 11 * edgeLight;\r
            red = v + 10;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.814) {\r
            v = 9 + 8 * edgeLight + grainAmount;\r
            red = v + 8;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.819) {\r
            v = 72 + 115 * directional + 49 * edgeLight;\r
            red = v;\r
            green = v * 0.87;\r
            blue = v * 0.85;\r
          } else if (r < 0.872) {\r
            const t = (r - 0.819) / 0.053;\r
            const arc = Math.exp(-Math.pow((t - 0.39) / 0.16, 2));\r
            const thin = Math.exp(-Math.pow((t - 0.39) / 0.025, 2));\r
            const outerRim = Math.exp(-Math.pow((t - 0.94) / 0.035, 2));\r
            const bright = 0.4 + 0.6 * Math.pow(Math.abs(Math.sin(angle)), 12);\r
            const side = Math.pow(Math.abs(Math.cos(angle)), 34) * 0.65;\r
            const reflection = localClamp(bright + side);\r
            red = 29 + arc * 197 * reflection + thin * 83 + outerRim * 148;\r
            green =\r
              1 + arc * 11 * reflection + thin * 95 * reflection + outerRim * 2;\r
            blue =\r
              4 + arc * 13 * reflection + thin * 94 * reflection + outerRim * 6;\r
          } else if (r < 0.882) {\r
            v = 2 + 8 * edgeLight;\r
            red = v + 8;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.988) {\r
            v = 12 + 22 * directional + 11 * broad + grainAmount * 0.7;\r
            const innerEdge = Math.exp(-Math.pow((r - 0.885) / 0.003, 2));\r
            red = v + 9 * innerEdge;\r
            green = v;\r
            blue = v * 1.035;\r
          } else if (r < 0.9965) {\r
            v = 12 + 24 * edgeLight + 22 * directional;\r
            red = v;\r
            green = v;\r
            blue = v;\r
          } else {\r
            const t = (r - 0.9965) / 0.0035;\r
            v = (50 + 140 * edgeLight) * (1 - t);\r
            red = v;\r
            green = v;\r
            blue = v;\r
          }\r
\r
          data[index] = localClamp(red, 0, 255);\r
          data[index + 1] = localClamp(green, 0, 255);\r
          data[index + 2] = localClamp(blue, 0, 255);\r
          data[index + 3] = 255;\r
        }\r
      }\r
      ctx.putImageData(pixels, 0, 0);\r
      ctx.save();\r
      ctx.translate(center, center);\r
      ctx.scale(radius, radius);\r
      drawKnurl();\r
      drawReflections();\r
      drawTicks();\r
      ctx.restore();\r
\r
      rotor.width = rotor.height = size;\r
      feedback.width = feedback.height = size;\r
      rotorCtx.save();\r
      rotorCtx.beginPath();\r
      rotorCtx.arc(center, center, radius * 0.819, 0, TAU);\r
      rotorCtx.clip();\r
      rotorCtx.drawImage(canvas, 0, 0);\r
      rotorCtx.restore();\r
      paintFeedback();\r
    }\r
\r
    function drawKnurl() {\r
      const columns = 184;\r
      const rows = 6;\r
      const start = 0.744;\r
      const end = 0.813;\r
      const step = (end - start) / rows;\r
      const pitch = TAU / columns;\r
      const point = (radius: number, angle: number): [number, number] => [\r
        Math.cos(angle) * radius,\r
        Math.sin(angle) * radius,\r
      ];\r
      ctx.save();\r
      ctx.beginPath();\r
      ctx.arc(0, 0, end, 0, TAU);\r
      ctx.arc(0, 0, start, TAU, 0, true);\r
      ctx.clip("evenodd");\r
      for (let row = -1; row <= rows; row++) {\r
        const r = start + (row + 0.5) * step;\r
        for (let column = 0; column < columns; column++) {\r
          const a = (column + (row % 2 ? 0.5 : 0)) * pitch;\r
          const middle = point(r, a);\r
          const vertices = [\r
            point(r - step * 0.94, a),\r
            point(r, a + pitch * 0.47),\r
            point(r + step * 0.94, a),\r
            point(r, a - pitch * 0.47),\r
          ];\r
          const globalLight = 0.52 + 0.48 * Math.cos(a + 1.9);\r
          const variation = 0.88 + noise(column * 19 + row * 317) * 0.2;\r
          for (let side = 0; side < 4; side++) {\r
            const p1 = vertices[side];\r
            const p2 = vertices[(side + 1) % 4];\r
            const direction = a + [-2.36, -0.78, 0.78, 2.36][side];\r
            const light = Math.max(0, Math.cos(direction + 2.15));\r
            const metal = (6 + light ** 5 * 228 + globalLight * 10) * variation;\r
            const ruby = Math.pow(Math.max(0, Math.sin(a)), 3) * 27;\r
            ctx.fillStyle = \`rgb(\${metal + ruby},\${metal * 0.96},\${metal * 0.93})\`;\r
            ctx.beginPath();\r
            ctx.moveTo(...middle);\r
            ctx.lineTo(...p1);\r
            ctx.lineTo(...p2);\r
            ctx.closePath();\r
            ctx.fill();\r
          }\r
        }\r
      }\r
      ctx.restore();\r
    }\r
\r
    function drawReflections() {\r
      const r = 0.8395;\r
      const glow = ctx.createRadialGradient(0, 0, 0.809, 0, 0, 0.896);\r
      glow.addColorStop(0, "#ff001800");\r
      glow.addColorStop(0.3, "#f8002020");\r
      glow.addColorStop(0.47, "#ff123f55");\r
      glow.addColorStop(0.7, "#d900141d");\r
      glow.addColorStop(1, "#ff001800");\r
      ctx.fillStyle = glow;\r
      ctx.beginPath();\r
      ctx.arc(0, 0, 0.896, 0, TAU);\r
      ctx.arc(0, 0, 0.809, TAU, 0, true);\r
      ctx.fill("evenodd");\r
      for (const angle of [-Math.PI / 2, Math.PI / 2, Math.PI, 0]) {\r
        const pointX = Math.cos(angle) * r;\r
        const py = Math.sin(angle) * r;\r
        const halo = ctx.createRadialGradient(pointX, py, 0, pointX, py, 0.055);\r
        halo.addColorStop(0, "#fff1f1b8");\r
        halo.addColorStop(0.2, "#ff315b72");\r
        halo.addColorStop(1, "#ff001800");\r
        ctx.fillStyle = halo;\r
        ctx.beginPath();\r
        ctx.arc(pointX, py, 0.055, 0, TAU);\r
        ctx.fill();\r
      }\r
    }\r
\r
    function roundRect(\r
      x: number,\r
      y: number,\r
      width: number,\r
      height: number,\r
      radius: number,\r
    ) {\r
      ctx.beginPath();\r
      ctx.roundRect(x, y, width, height, radius);\r
      ctx.fill();\r
    }\r
\r
    function drawTicks() {\r
      const scale = canvas.width * 0.445;\r
      for (let i = 0; i < 16; i++) {\r
        const major = i % 4 === 0;\r
        const width = major ? 0.012 : 0.01;\r
        const length = major ? 0.078 : 0.066;\r
        ctx.save();\r
        ctx.rotate((i * TAU) / 16);\r
        ctx.fillStyle = "#020101";\r
        roundRect(\r
          -width / 2 - 0.004,\r
          -0.933 - length / 2 - 0.004,\r
          width + 0.008,\r
          length + 0.008,\r
          0.006,\r
        );\r
        ctx.strokeStyle = "#71312c";\r
        ctx.lineWidth = 0.0017;\r
        ctx.stroke();\r
        ctx.shadowColor = major ? "#ff1029" : "#e9152470";\r
        ctx.shadowBlur = scale * (major ? 0.034 : 0.01);\r
        ctx.fillStyle = major ? "#ff2447" : "#ff6c7d";\r
        roundRect(-width / 2, -0.933 - length / 2, width, length, 0.003);\r
        ctx.shadowBlur = 0;\r
        const fill = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);\r
        fill.addColorStop(0, "#ff2539");\r
        fill.addColorStop(0.38, major ? "#fff8eb" : "#ffa19c");\r
        fill.addColorStop(0.7, major ? "#fff6e9" : "#ff938d");\r
        fill.addColorStop(1, "#f82538");\r
        ctx.fillStyle = fill;\r
        roundRect(\r
          -width * 0.34,\r
          -0.933 - length * 0.47,\r
          width * 0.68,\r
          length * 0.94,\r
          0.002,\r
        );\r
        ctx.restore();\r
      }\r
    }\r
\r
    function paintFeedback() {\r
      if (!painted || !feedback.width || disposed) return;\r
      const scale = feedback.width * 0.445;\r
      const start = (startAngle - 90) / degrees;\r
      const end = (valueAngle(visualValue) - 90) / degrees;\r
      feedbackCtx.clearRect(0, 0, feedback.width, feedback.height);\r
      feedbackCtx.save();\r
      feedbackCtx.translate(feedback.width / 2, feedback.height / 2);\r
      feedbackCtx.scale(scale, scale);\r
      feedbackCtx.beginPath();\r
      feedbackCtx.arc(0, 0, 0.846, end, start + TAU);\r
      feedbackCtx.strokeStyle = "rgba(0, 0, 0, 0.78)";\r
      feedbackCtx.lineWidth = 0.052;\r
      feedbackCtx.stroke();\r
      if (visualValue > 0) paintValue(start, end, scale);\r
      feedbackCtx.restore();\r
    }\r
\r
    /**\r
     * The value as a neon tube: deep ruby at the start heating up to white at the end,\r
     * a comet head of light on its tip, and every scale tick it has passed lit up.\r
     */\r
    function paintValue(start: number, end: number, scale: number) {\r
      const sweep = Math.max(0.0001, (end - start) / TAU);\r
      const tube = feedbackCtx.createConicGradient(start, 0, 0);\r
      tube.addColorStop(0, "rgba(110, 0, 22, 0.9)");\r
      tube.addColorStop(sweep * 0.65, "rgba(255, 36, 72, 1)");\r
      tube.addColorStop(sweep, "rgba(255, 238, 242, 1)");\r
      tube.addColorStop(Math.min(1, sweep + 0.0001), "rgba(255, 238, 242, 0)");\r
      const stroke = (width: number, alpha: number, blur: number) => {\r
        feedbackCtx.beginPath();\r
        feedbackCtx.arc(0, 0, 0.8395, start, end);\r
        feedbackCtx.lineCap = "round";\r
        feedbackCtx.lineWidth = width;\r
        feedbackCtx.globalAlpha = alpha;\r
        feedbackCtx.shadowColor = "#ff163d";\r
        feedbackCtx.shadowBlur = scale * blur;\r
        feedbackCtx.strokeStyle = tube;\r
        feedbackCtx.stroke();\r
      };\r
      stroke(0.05, 0.35, 0.06);\r
      stroke(0.017, 0.95, 0.03);\r
      stroke(0.006, 1, 0.012);\r
      feedbackCtx.globalAlpha = 1;\r
      feedbackCtx.shadowBlur = 0;\r
\r
      const tipX = Math.cos(end) * 0.8395;\r
      const tipY = Math.sin(end) * 0.8395;\r
      const head = feedbackCtx.createRadialGradient(\r
        tipX,\r
        tipY,\r
        0,\r
        tipX,\r
        tipY,\r
        0.12,\r
      );\r
      head.addColorStop(0, "rgba(255, 255, 255, 1)");\r
      head.addColorStop(0.12, "rgba(255, 220, 228, 0.9)");\r
      head.addColorStop(0.35, "rgba(255, 60, 100, 0.45)");\r
      head.addColorStop(1, "rgba(255, 0, 40, 0)");\r
      feedbackCtx.fillStyle = head;\r
      feedbackCtx.beginPath();\r
      feedbackCtx.arc(tipX, tipY, 0.12, 0, TAU);\r
      feedbackCtx.fill();\r
\r
      const reached = valueAngle(visualValue);\r
      for (let i = 0; i < 16; i += 1) {\r
        const angle = normalizeAngle(i * 22.5);\r
        if (angle < startAngle || angle > -startAngle) continue;\r
        const x = Math.sin(angle / degrees) * 0.933;\r
        const y = -Math.cos(angle / degrees) * 0.933;\r
        // Ticks still ahead of the value are dimmed, so the passed ones read as lit.\r
        if (angle > reached - 0.5) {\r
          const shade = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.05);\r
          shade.addColorStop(0, "rgba(8, 3, 4, 0.72)");\r
          shade.addColorStop(0.55, "rgba(8, 3, 4, 0.55)");\r
          shade.addColorStop(1, "rgba(8, 3, 4, 0)");\r
          feedbackCtx.fillStyle = shade;\r
          feedbackCtx.beginPath();\r
          feedbackCtx.arc(x, y, 0.05, 0, TAU);\r
          feedbackCtx.fill();\r
          continue;\r
        }\r
        const heat = 0.5 + 0.5 * Math.exp(-(reached - angle) / 28);\r
        const glow = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.075);\r
        glow.addColorStop(0, \`rgba(255, 255, 255, \${heat})\`);\r
        glow.addColorStop(0.16, \`rgba(255, 210, 220, \${0.85 * heat})\`);\r
        glow.addColorStop(0.42, \`rgba(255, 40, 76, \${0.55 * heat})\`);\r
        glow.addColorStop(1, "rgba(255, 0, 40, 0)");\r
        feedbackCtx.fillStyle = glow;\r
        feedbackCtx.beginPath();\r
        feedbackCtx.arc(x, y, 0.075, 0, TAU);\r
        feedbackCtx.fill();\r
      }\r
    }\r
\r
    function paint() {\r
      root.style.setProperty("--angle", \`\${valueAngle(visualValue)}deg\`);\r
      root.style.setProperty(\r
        "--rotation",\r
        \`\${valueAngle(visualValue) - initialAngle}deg\`,\r
      );\r
      paintFeedback();\r
    }\r
\r
    function animate(timestamp: number) {\r
      animationFrame = 0;\r
      if (disposed) return;\r
      const elapsed = previousFrame\r
        ? Math.min(64, timestamp - previousFrame)\r
        : 16;\r
      previousFrame = timestamp;\r
      const immediate = (!!drag && !drag.glide) || reducedMotion.matches;\r
      visualValue = immediate\r
        ? value\r
        : visualValue + (value - visualValue) * (1 - Math.exp(-elapsed / 42));\r
      if (Math.abs(value - visualValue) < 0.005) visualValue = value;\r
      paint();\r
      if (visualValue !== value)\r
        animationFrame = requestAnimationFrame(animate);\r
      else previousFrame = 0;\r
    }\r
\r
    function schedulePaint() {\r
      if (!animationFrame && !disposed)\r
        animationFrame = requestAnimationFrame(animate);\r
    }\r
\r
    function setValue(next: number, notify = true) {\r
      if (disposed) return false;\r
      const numeric = Number(next);\r
      if (!Number.isFinite(numeric)) return false;\r
      const nextValue = Math.round(localClamp(numeric, 0, 100) * 1000) / 1000;\r
      const changed = nextValue !== value;\r
      value = nextValue;\r
      const shown = scale.current.toValue(value);\r
      const text = scale.current.format(shown);\r
      root.dataset.value = String(shown);\r
      control.setAttribute("aria-valuenow", String(shown));\r
      control.setAttribute("aria-valuetext", text);\r
      control.title = \`\${p.label ?? "Громкость"}: \${text} · ведите по кругу или тяните за центр\`;\r
      readout.textContent = text;\r
      schedulePaint();\r
      if (changed && notify) onChangeRef.current?.(shown);\r
      return changed;\r
    }\r
\r
    function commit() {\r
      if (!disposed) onCommitRef.current?.(scale.current.toValue(value));\r
    }\r
\r
    function geometry() {\r
      const rect = control.getBoundingClientRect();\r
      return {\r
        x: rect.left + rect.width / 2,\r
        y: rect.top + rect.height / 2,\r
        radius: rect.width / 2,\r
      };\r
    }\r
    function polar(event: PointerEvent, center: ReturnType<typeof geometry>) {\r
      return (\r
        Math.atan2(event.clientY - center.y, event.clientX - center.x) * degrees\r
      );\r
    }\r
    function normalizeAngle(angle: number) {\r
      return ((((angle + 180) % 360) + 360) % 360) - 180;\r
    }\r
\r
    function pointerDown(event: PointerEvent) {\r
      if (\r
        disabledRef.current ||\r
        readOnlyRef.current ||\r
        event.button !== 0 ||\r
        !event.isPrimary ||\r
        drag ||\r
        disposed\r
      )\r
        return;\r
      const center = geometry();\r
      const distance =\r
        Math.hypot(event.clientX - center.x, event.clientY - center.y) /\r
        center.radius;\r
      if (distance > 1.04) return;\r
      event.preventDefault();\r
      control.focus({ preventScroll: true });\r
      drag = {\r
        id: event.pointerId,\r
        x: event.clientX,\r
        y: event.clientY,\r
        center,\r
        angle: polar(event, center),\r
        mode: distance >= 0.36 ? "circular" : "linear",\r
        value,\r
        start: value,\r
        distance: localClamp(center.radius * 1.2, 160, 420),\r
        glide: false,\r
      };\r
      control.setPointerCapture(event.pointerId);\r
      root.classList.add("is-dragging");\r
      tilt(0, 0);\r
      // A press on the glowing scale ring or the ticks sets the value right there.\r
      if (distance >= 0.8) {\r
        drag.glide = true;\r
        let angle = normalizeAngle((drag.angle ?? 0) + 90);\r
        if (Math.abs(angle) > 179.99) angle = value >= 50 ? 180 : -180;\r
        drag.value = localClamp(\r
          ((angle - startAngle) / sweepAngle) * 100,\r
          0,\r
          100,\r
        );\r
        setValue(drag.value);\r
      }\r
    }\r
\r
    /** The knob leans a little towards the pointer, like a real object under a light. */\r
    function tilt(x: number, y: number) {\r
      root.style.setProperty("--tilt-x", \`\${(-y * 7).toFixed(2)}deg\`);\r
      root.style.setProperty("--tilt-y", \`\${(x * 7).toFixed(2)}deg\`);\r
    }\r
    function hover(event: PointerEvent) {\r
      if (\r
        drag ||\r
        disabledRef.current ||\r
        reducedMotion.matches ||\r
        document.documentElement.dataset.adMotion === "off"\r
      )\r
        return;\r
      const center = geometry();\r
      tilt(\r
        localClamp((event.clientX - center.x) / center.radius, -1, 1),\r
        localClamp((event.clientY - center.y) / center.radius, -1, 1),\r
      );\r
    }\r
\r
    function pointerMove(event: PointerEvent) {\r
      if (!drag || event.pointerId !== drag.id) return;\r
      drag.glide = false;\r
      event.preventDefault();\r
      const precision = event.shiftKey ? 0.1 : 1;\r
      const angle = polar(event, drag.center);\r
      const radius = Math.hypot(\r
        event.clientX - drag.center.x,\r
        event.clientY - drag.center.y,\r
      );\r
      let delta = 0;\r
      if (drag.mode === "circular") {\r
        if (radius > drag.center.radius * 0.12 && drag.angle !== null)\r
          delta = (normalizeAngle(angle - drag.angle) / sweepAngle) * 100;\r
        drag.angle = radius > drag.center.radius * 0.12 ? angle : null;\r
      } else {\r
        delta =\r
          ((event.clientX - drag.x - (event.clientY - drag.y)) /\r
            drag.distance) *\r
          100;\r
      }\r
      drag.x = event.clientX;\r
      drag.y = event.clientY;\r
      drag.value = localClamp(drag.value + delta * precision, 0, 100);\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      setValue(Math.round(drag.value / step) * step);\r
    }\r
\r
    function finishDrag(cancelled = false) {\r
      if (!drag) return;\r
      const gesture = drag;\r
      drag = null;\r
      root.classList.remove("is-dragging");\r
      if (control.hasPointerCapture(gesture.id))\r
        control.releasePointerCapture(gesture.id);\r
      if (cancelled) setValue(gesture.start);\r
      else if (value !== gesture.start) commit();\r
    }\r
\r
    function pointerEnd(event: PointerEvent) {\r
      if (!drag || event.pointerId !== drag.id) return;\r
      finishDrag(event.type === "pointercancel");\r
    }\r
\r
    function keyDown(event: KeyboardEvent) {\r
      if (disabledRef.current || readOnlyRef.current) return;\r
      if (event.key === "Escape" && drag) {\r
        event.preventDefault();\r
        finishDrag(true);\r
        return;\r
      }\r
      if (drag || event.ctrlKey || event.altKey || event.metaKey) return;\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      const keys: Record<string, number> = {\r
        ArrowUp: value + step,\r
        ArrowRight: value + step,\r
        ArrowDown: value - step,\r
        ArrowLeft: value - step,\r
        PageUp: value + 10,\r
        PageDown: value - 10,\r
        Home: 0,\r
        End: 100,\r
      };\r
      if (!Object.hasOwn(keys, event.key)) return;\r
      event.preventDefault();\r
      if (setValue(keys[event.key])) commit();\r
    }\r
\r
    function wheel(event: WheelEvent) {\r
      if (\r
        disabledRef.current ||\r
        readOnlyRef.current ||\r
        event.ctrlKey ||\r
        event.metaKey ||\r
        event.deltaY === 0 ||\r
        drag ||\r
        disposed\r
      )\r
        return;\r
      event.preventDefault();\r
      control.focus({ preventScroll: true });\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      if (setValue(value - Math.sign(event.deltaY) * step)) commit();\r
    }\r
\r
    function doubleClick(event: MouseEvent) {\r
      if (disabledRef.current || readOnlyRef.current) return;\r
      event.preventDefault();\r
      finishDrag();\r
      if (setValue(resetRef.current ?? defaultValue)) commit();\r
    }\r
\r
    function scheduleRender() {\r
      clearTimeout(renderTimer);\r
      if (!disposed) renderTimer = window.setTimeout(render, 80);\r
    }\r
\r
    const events: Record<string, EventListener> = {\r
      pointerdown: pointerDown as EventListener,\r
      pointermove: pointerMove as EventListener,\r
      pointerup: pointerEnd as EventListener,\r
      pointercancel: pointerEnd as EventListener,\r
      lostpointercapture: pointerEnd as EventListener,\r
      keydown: keyDown as EventListener,\r
      dblclick: doubleClick as EventListener,\r
    };\r
    for (const [event, handler] of Object.entries(events))\r
      control.addEventListener(event, handler, { signal: listeners.signal });\r
    control.addEventListener("wheel", wheel, {\r
      passive: false,\r
      signal: listeners.signal,\r
    });\r
    root.addEventListener("pointermove", hover as EventListener, {\r
      signal: listeners.signal,\r
    });\r
    root.addEventListener("pointerleave", () => tilt(0, 0), {\r
      signal: listeners.signal,\r
    });\r
    window.addEventListener("blur", () => finishDrag(true), {\r
      signal: listeners.signal,\r
    });\r
    document.addEventListener(\r
      "visibilitychange",\r
      () => {\r
        if (document.hidden) finishDrag(true);\r
      },\r
      { signal: listeners.signal },\r
    );\r
    window.addEventListener("resize", scheduleRender, {\r
      signal: listeners.signal,\r
    });\r
    const observer = createResizeObserver(scheduleRender);\r
    observer.observe(root);\r
\r
    controllerRef.current = {\r
      get value() {\r
        return value;\r
      },\r
      setValue(next: number, notify = false) {\r
        setValue(next, notify);\r
      },\r
      reset() {\r
        if (setValue(resetRef.current ?? defaultValue)) commit();\r
      },\r
    };\r
    setValue(value, false);\r
    render();\r
    paint();\r
\r
    return () => {\r
      finishDrag();\r
      disposed = true;\r
      listeners.abort();\r
      observer.disconnect();\r
      clearTimeout(renderTimer);\r
      cancelAnimationFrame(animationFrame);\r
      animationFrame = 0;\r
      controllerRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (p.value !== undefined)\r
      controllerRef.current?.setValue(toPosition(p.value), false);\r
    // The scale is read on every render; a new value or range moves the knob.\r
  }, [p.value, min, span]);\r
\r
  // Typing a value, as in studio plug-ins: click the readout, Enter applies, Escape cancels.\r
  const [draft, setDraft] = useState<string | null>(null);\r
  const cancelled = useRef(false);\r
  const editable = !p.disabled && !p.readOnly;\r
  const applyDraft = () => {\r
    if (cancelled.current) return;\r
    const next = Number(draft?.replace(",", ".").replace(/[^\\d.+-]/g, ""));\r
    setDraft(null);\r
    const controller = controllerRef.current;\r
    if (!draft?.trim() || !controller || !Number.isFinite(next)) return;\r
    const before = controller.value;\r
    controller.setValue(toPosition(next / displayScale), true);\r
    if (controller.value !== before) p.onValueCommit?.(toValue(controller.value));\r
  };\r
\r
  const rootProps = mark("RotaryKnob", p, undefined, "knob");\r
  return (\r
    <div\r
      {...rootProps}\r
      ref={rootRef}\r
      data-value={toValue(initial)}\r
      data-disabled={p.disabled || undefined}\r
      data-readonly={p.readOnly || undefined}\r
      data-labelled={p.showLabel || undefined}\r
      style={\r
        {\r
          ...p.style,\r
          "--size": \`\${diameter / 16}rem\`,\r
          "--angle": \`\${-135 + initial * 2.7}deg\`,\r
          "--rotation": "0deg",\r
        } as React.CSSProperties\r
      }\r
    >\r
      <canvas\r
        className="knob__surface knob__base"\r
        aria-hidden="true"\r
        ref={baseRef}\r
      />\r
      <canvas\r
        className="knob__surface knob__feedback"\r
        aria-hidden="true"\r
        ref={feedbackRef}\r
      />\r
      <canvas\r
        className="knob__surface knob__rotor"\r
        aria-hidden="true"\r
        ref={rotorRef}\r
      />\r
      <span className="knob__sheen" aria-hidden="true" />\r
      <div\r
        ref={controlRef}\r
        className="knob__control"\r
        role={p.readOnly ? "meter" : "slider"}\r
        tabIndex={p.disabled || p.readOnly ? -1 : 0}\r
        aria-disabled={p.disabled || undefined}\r
        aria-readonly={p.readOnly || undefined}\r
        aria-label={p.label ?? "Громкость"}\r
        aria-valuemin={min}\r
        aria-valuemax={min + span}\r
        aria-valuenow={toValue(initial)}\r
        aria-valuetext={format(toValue(initial))}\r
        aria-orientation={p.readOnly ? undefined : "vertical"}\r
      >\r
        <div className="knob__indicator" aria-hidden="true">\r
          <div className="knob__slot" />\r
        </div>\r
      </div>\r
      {p.showValue !== false && (\r
        <div\r
          ref={readoutRef}\r
          className="knob__value"\r
          data-editable={editable || undefined}\r
          data-editing={draft !== null || undefined}\r
          title={editable ? "Нажмите, чтобы ввести значение" : undefined}\r
          onClick={() => {\r
            if (!editable) return;\r
            cancelled.current = false;\r
            setDraft(\r
              numberFormat.format(toValue(controllerRef.current?.value ?? initial) * displayScale),\r
            );\r
          }}\r
        >\r
          {format(toValue(initial))}\r
        </div>\r
      )}\r
      {draft !== null && (\r
        <input\r
          className="knob__input"\r
          aria-label={\`\${p.label ?? "Громкость"}, значение\`}\r
          inputMode="decimal"\r
          autoFocus\r
          value={draft}\r
          onFocus={(event) => event.currentTarget.select()}\r
          onChange={(event) => setDraft(event.currentTarget.value)}\r
          onBlur={applyDraft}\r
          onKeyDown={(event) => {\r
            if (event.key === "Enter") event.currentTarget.blur();\r
            if (event.key === "Escape") {\r
              cancelled.current = true;\r
              setDraft(null);\r
            }\r
          }}\r
        />\r
      )}\r
      {p.showLabel && p.label && (\r
        <span className="knob__label" aria-hidden="true">\r
          {p.label}\r
        </span>\r
      )}\r
      <span className="ad-sr-only">\r
        Зажмите ручку ближе к краю и ведите мышью по кругу. За центр можно\r
        тянуть вверх или вниз. Нажатие на внешнюю шкалу устанавливает значение.\r
        Колесо мыши и стрелки меняют громкость. Shift — точная регулировка.\r
        Двойной щелчок — исходное значение.\r
      </span>\r
    </div>\r
  );\r
};\r
`,Kt=`import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

export default function RotaryKnobExample() {
  return (
    <Playground
      knobs={{
        size: { options: sizes, value: "md" },
        readOnly: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("RotaryKnob", {
          label: "Громкость",
          value: expr("volume"),
          onValueChange: expr("setVolume"),
          size: c.size,
          readOnly: v.readOnly,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.RotaryKnob
          label="Громкость"
          defaultValue={65}
          size={v.size}
          readOnly={v.readOnly}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
`,Gt=`export default {\r
  name: "RotaryKnob",\r
  description:\r
    "Студийная ручка: вращение, клик по шкале, ввод числа, колесо и клавиши",\r
  category: "audio",\r
} as const;\r
`,jt=`import { useSvgId } from "../../../core/artwork";\r
import { type CSSProperties } from "react";\r
import { mark } from "../../../core/base";\r
import { type SparklineProps } from "../shared";\r
\r
/** Line that draws itself in, an area glow below it and a beacon on the latest value. */\r
export const Sparkline = (p: SparklineProps) => {\r
  const values = p.values ?? [\r
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,\r
  ];\r
  const id = useSvgId();\r
  const max = p.fit ? Math.max(...values) : Math.max(...values, 1);\r
  const min = p.fit ? Math.min(...values) : Math.min(...values, 0);\r
  // A steady line runs through the middle when the values fill their own range.\r
  const share = (v: number) => (max > min ? (v - min) / (max - min) : p.fit ? 0.5 : 0);\r
  const points = values.map((v, i) => [\r
    (i / Math.max(1, values.length - 1)) * 240,\r
    66 - share(v) * 58,\r
  ]);\r
  const line = points.map(([x, y], i) => \`\${i ? "L" : "M"}\${x},\${y}\`).join("");\r
  const [lastX, lastY] = points[points.length - 1];\r
  return (\r
    <svg\r
      {...mark("Sparkline", p)}\r
      viewBox="0 0 240 70"\r
      preserveAspectRatio="none"\r
      role={p.label ? "img" : undefined}\r
      aria-label={p.label}\r
      aria-hidden={!p.label}\r
      style={\r
        { ...p.style, "--ad-spark": p.color ?? "var(--ad-primary)" } as CSSProperties\r
      }\r
    >\r
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
      <circle className="ad-sparkline-ping" cx={lastX} cy={lastY} r="3" />\r
      <circle className="ad-sparkline-dot" cx={lastX} cy={lastY} r="3" />\r
    </svg>\r
  );\r
};\r
`,qt=`import { Sparkline, Stack, Typography } from "@ad-voice/ui";

export default function SparklineExample() {
  return (
    <Stack gap={1}>
      <Typography variant="label">Задержка сети, мс</Typography>
      <Sparkline
        label="Задержка сети"
        values={[18, 22, 19, 31, 44, 26, 24, 21, 38, 27, 23, 20]}
      />
    </Stack>
  );
}
`,Yt=`export default {\r
  name: "Sparkline",\r
  description: "Небольшой график без осей",\r
  category: "audio",\r
} as const;\r
`,Xt=`import { useSvgId } from "../../../core/artwork";
import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";

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
        d += \`\${i ? "L" : "M"}\${x.toFixed(2)} \${y.toFixed(2)}\`;
      }
      path.setAttribute("d", d);
    });
  useDecoration(ref, paint);
  return (
    <svg
      {...mark("WaveDecoration", p)}
      ref={ref}
      viewBox="0 0 600 130"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={\`wave-\${uid}\`}>
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
          stroke={\`url(#wave-\${uid})\`}
          strokeWidth={j % 7 === 0 ? 1.2 : 0.65}
          opacity={0.5 + (j % 4) * 0.13}
        />
      ))}
    </svg>
  );
};
`,Zt=`import { WaveDecoration } from "@ad-voice/ui";

/** Decorative animated waves for hero areas; hidden from assistive tech. */
export default function WaveDecorationExample() {
  return <WaveDecoration />;
}
`,Jt=`export default {\r
  name: "WaveDecoration",\r
  description: "Декоративные линии с меняющейся формой",\r
  category: "motion",\r
} as const;\r
`,Qt=`import { useSvgId } from "../../../core/artwork";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { clamp, mark, timeText, useControllable } from "../../../core/base";
import { seeded } from "../../../core/noise";
import { type WaveformProps } from "../shared";
import { useWaveformPeaks } from "./useWaveformPeaks";

/** Drawing space: a symmetric track around the midline, like a studio editor shows it. */
const W = 1000;
const H = 100;
const MID = H / 2;
const COLUMNS = 400;
const KEY_STEP = 5;

/**
 * A believable song for when no audio is given: intro, verses and louder choruses, a
 * kick on every beat, and sample-level detail in between.
 */
const demoSong = (() => {
  const random = seeded(2741);
  return Array.from({ length: 600 }, (_, i) => {
    const t = i / 600;
    const section = 0.4 + 0.6 * Math.sin(t * Math.PI * 3.2) ** 2;
    const fade = Math.min(1, i / 24, (600 - i) / 30);
    const kick = Math.exp(-(i % 12) / 2.2);
    const detail = random() ** 0.7;
    return section * fade * (0.3 + 0.7 * (0.5 * kick + 0.5 * detail));
  });
})();

/**
 * Resamples to fixed columns: an outer outline and a core of average loudness. Mastered
 * tracks hit full scale almost everywhere, so drawing raw peaks gives a flat brick; like
 * streaming players, the outline follows loudness (never above the real peak) and the
 * range between quiet and loud passages is stretched, while true silence stays a line.
 */
function columns(peaks: readonly number[], rms?: readonly number[]) {
  const outer: number[] = [];
  const ratio: number[] = [];
  for (let c = 0; c < COLUMNS; c += 1) {
    const from = Math.floor((c / COLUMNS) * peaks.length);
    const to = Math.max(
      from + 1,
      Math.floor(((c + 1) / COLUMNS) * peaks.length),
    );
    let peak = 0;
    let mean = 0;
    for (let i = from; i < to; i += 1) {
      peak = Math.max(peak, Math.abs(peaks[i]));
      mean += rms ? rms[i] : Math.abs(peaks[i]) * 0.58;
    }
    mean /= to - from;
    const level = Math.min(peak, mean * 1.9);
    outer.push(level);
    ratio.push(level > 0 ? Math.min(1, mean / level) : 0);
  }
  const sorted = [...outer].sort((a, b) => a - b);
  const high = sorted[sorted.length - 1] || 0.0001;
  const low = Math.min(
    sorted[Math.floor(sorted.length * 0.05)] * 0.7,
    high * 0.6,
  );
  const top = outer.map((v) => clamp((v - low) / (high - low), 0, 1));
  return { top, core: top.map((v, i) => v * ratio[i]) };
}

/** A filled outline of the levels, mirrored above and below the midline. */
function mirrored(levels: readonly number[]) {
  const x = (i: number) => ((i / (levels.length - 1)) * W).toFixed(1);
  const y = (v: number, side: 1 | -1) =>
    (MID + side * (0.6 + v * (MID - 3))).toFixed(1);
  const upper = levels.map((v, i) => \`\${x(i)} \${y(v, -1)}\`);
  const lower = levels.map((v, i) => \`\${x(i)} \${y(v, 1)}\`).reverse();
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;
}

/**
 * Seekable waveform drawn the way studio editors show audio: a dense, symmetric track with
 * translucent peaks around a solid core of average loudness. The played part burns ruby
 * and brightens towards the light-beam cursor; hovering previews the seek point and its
 * time. Click or drag to seek, arrows step 5 s, Home/End jump to the edges. Peaks come
 * from \`points\` or are decoded from \`src\`.
 */
export function Waveform({
  duration: total,
  position: controlled,
  defaultPosition = 0,
  onSeek,
  points,
  src,
  bins = 600,
  color,
  label,
  disabled = false,
  ...p
}: WaveformProps) {
  const id = useSvgId();
  const surface = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const decoded = useWaveformPeaks(points ? null : src, bins);
  const loading = !points && !!src && decoded === null;
  const { peaksPath, corePath } = useMemo(() => {
    const { top, core } = points?.length
      ? columns(points)
      : decoded?.peaks.length
        ? columns(decoded.peaks, decoded.rms)
        : columns(demoSong);
    return { peaksPath: mirrored(top), corePath: mirrored(core) };
  }, [points, decoded]);
  const duration = Math.max(0.001, total ?? 231);
  const [position, seek] = useControllable(controlled, defaultPosition, onSeek);
  const progress = clamp(position / duration, 0, 1);
  const played = progress * W;
  const ahead = Math.max(0, (hover ?? 0) * W - played);
  // Playing = the position keeps creeping forward; sparks fly only then.
  const [playing, setPlaying] = useState(false);
  const previous = useRef(position);
  useEffect(() => {
    const step = position - previous.current;
    previous.current = position;
    if (step <= 0 || step > 1.5) return;
    setPlaying(true);
    const timer = setTimeout(() => setPlaying(false), 300);
    return () => clearTimeout(timer);
  }, [position]);
  const shape = points?.length
    ? "points"
    : decoded?.peaks.length
      ? "file"
      : "demo";

  const ratio = (event: PointerEvent<HTMLDivElement>) => {
    const box = surface.current?.getBoundingClientRect();
    return box?.width ? clamp((event.clientX - box.left) / box.width, 0, 1) : 0;
  };

  return (
    <div
      {...mark("Waveform", p)}
      ref={surface}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ?? "Позиция воспроизведения"}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(position)}
      aria-valuetext={timeText(position)}
      aria-disabled={disabled || undefined}
      data-loading={loading || undefined}
      data-playing={playing || undefined}
      style={
        {
          ...p.style,
          "--ad-wave-played": \`\${progress * 100}%\`,
          "--ad-wave-hover": hover === null ? undefined : \`\${hover * 100}%\`,
          ...(color ? { "--ad-wave-color": color } : {}),
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(ratio(event) * duration);
      }}
      onPointerMove={(event) => {
        if (disabled) return;
        setHover(ratio(event));
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          seek(ratio(event) * duration);
      }}
      onPointerLeave={() => setHover(null)}
      onKeyDown={(event) => {
        if (disabled) return;
        const next = {
          ArrowRight: position + KEY_STEP,
          ArrowLeft: position - KEY_STEP,
          Home: 0,
          End: duration,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        seek(clamp(next, 0, duration));
      }}
    >
      <span className="ad-waveform-floor" aria-hidden />
      <svg
        key={shape}
        viewBox={\`0 0 \${W} \${H}\`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={\`\${id}-track\`}>
            <path d={peaksPath} />
          </clipPath>
          <clipPath id={\`\${id}-played\`}>
            <rect width={played} height={H} />
          </clipPath>
          <clipPath id={\`\${id}-ahead\`}>
            <rect x={played} width={ahead} height={H} />
          </clipPath>
          {/* Brushed silver: brightest along the midline, fading to the edges. */}
          <linearGradient id={\`\${id}-silver\`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={\`\${id}-solid\`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="1" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />
          </linearGradient>
          {/* Light builds up along the played part and peaks at the cursor. */}
          <linearGradient
            id={\`\${id}-lit\`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2={Math.max(1, played)}
          >
            <stop offset="0" stopColor="var(--ad-primary-700)" />
            <stop
              offset="0.6"
              stopColor="var(--ad-wave-color, var(--ad-red))"
            />
            <stop offset="1" stopColor="var(--ad-secondary-100)" />
          </linearGradient>
          <linearGradient id={\`\${id}-depth\`} x1="0" x2="0" y1="0" y2="1">
            {/* Lit from above: the upper half catches light, the lower sinks into shadow. */}
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.56" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id={\`\${id}-spot\`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />
          </radialGradient>
          <filter
            id={\`\${id}-bloom\`}
            x="-5%"
            y="-50%"
            width="110%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <line className="ad-waveform-axis" x2={W} y1={MID} y2={MID} />
        <path
          className="ad-waveform-peaks"
          d={peaksPath}
          fill={\`url(#\${id}-silver)\`}
        />
        <path
          className="ad-waveform-core"
          d={corePath}
          fill={\`url(#\${id}-solid)\`}
        />
        <path className="ad-waveform-edge" d={peaksPath} />

        <g clipPath={\`url(#\${id}-ahead)\`} className="ad-waveform-ahead">
          <path d={peaksPath} />
          <path d={corePath} />
        </g>

        <g clipPath={\`url(#\${id}-played)\`}>
          <path
            className="ad-waveform-bloom"
            d={corePath}
            fill={\`url(#\${id}-lit)\`}
            filter={\`url(#\${id}-bloom)\`}
          />
          <path
            className="ad-waveform-lit-peaks"
            d={peaksPath}
            fill={\`url(#\${id}-lit)\`}
          />
          <path
            className="ad-waveform-lit-core"
            d={corePath}
            fill={\`url(#\${id}-lit)\`}
          />
          <g clipPath={\`url(#\${id}-track)\`}>
            <rect className="ad-waveform-sheen" width="160" height={H} />
          </g>
        </g>

        <rect
          className="ad-waveform-depth"
          width={W}
          height={H}
          fill={\`url(#\${id}-depth)\`}
          clipPath={\`url(#\${id}-track)\`}
        />
        <ellipse
          className="ad-waveform-spot"
          cx={played}
          cy={MID}
          rx="60"
          ry={H}
          fill={\`url(#\${id}-spot)\`}
          clipPath={\`url(#\${id}-track)\`}
        />
      </svg>
      <span className="ad-waveform-cursor" aria-hidden>
        <span className="ad-waveform-sparks">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </span>
      {hover !== null && !disabled && (
        <span className="ad-waveform-hover" aria-hidden>
          <span className="ad-waveform-tip">{timeText(hover * duration)}</span>
        </span>
      )}
    </div>
  );
}
`,no=`import { useEffect, useState } from "react";
import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

const DURATION = 231;

/** Plays along on its own, a frame at a time, so the cursor glides; seeking moves it. */
function PlayingWaveform({
  playing,
  disabled,
  file,
}: {
  playing: boolean;
  disabled: boolean;
  file: File | null;
}) {
  const [position, setPosition] = useState(64);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setPosition((v) => (v + (now - last) / 1000) % DURATION);
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  return (
    <U.Waveform
      style={{ width: "min(100%, 52rem)" }}
      label="Позиция в записи"
      src={file}
      duration={DURATION}
      position={position}
      onSeek={setPosition}
      disabled={disabled}
    />
  );
}

export default function WaveformExample() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <Playground
      stretch
      knobs={{ playing: { value: true }, disabled: { value: false } }}
      code={(v) =>
        jsx("Waveform", {
          label: "Позиция в записи",
          src: file ? expr("file") : undefined,
          duration: DURATION,
          position: expr("position"),
          onSeek: expr("setPosition"),
          disabled: v.disabled,
        })
      }
      extra={
        <U.FilePicker
          size="sm"
          label="Свой трек"
          description={file ? file.name : "Волна построится прямо в браузере"}
          icon="music"
          accept="audio/*"
          onFiles={([next]) => next && setFile(next)}
        />
      }
    >
      {(v) => (
        <PlayingWaveform
          playing={v.playing}
          disabled={v.disabled}
          file={file}
        />
      )}
    </Playground>
  );
}
`,eo=`export default {\r
  name: "Waveform",\r
  description: "Геометрия сигнала и позиция воспроизведения",\r
  category: "audio",\r
} as const;\r
`,ro=`import { useEffect, useState } from "react";\r
\r
/** Per slice of the track: the loudest sample (peak) and the average loudness (RMS), 0..1. */\r
export interface WaveformData {\r
  peaks: number[];\r
  rms: number[];\r
}\r
\r
/** Splits the track (all channels) into \`bins\` equal slices and measures each one. */\r
async function decode(src: string | Blob, bins: number): Promise<WaveformData> {\r
  const data =\r
    typeof src === "string"\r
      ? await (await fetch(src)).arrayBuffer()\r
      : await src.arrayBuffer();\r
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(\r
    data,\r
  );\r
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>\r
    audio.getChannelData(i),\r
  );\r
  const size = Math.max(1, Math.floor(audio.length / bins));\r
  const peaks: number[] = [];\r
  const rms: number[] = [];\r
  for (let bin = 0; bin < bins; bin += 1) {\r
    let peak = 0;\r
    let sum = 0;\r
    for (const channel of channels)\r
      for (let i = bin * size, end = i + size; i < end; i += 1) {\r
        const sample = Math.abs(channel[i] ?? 0);\r
        peak = Math.max(peak, sample);\r
        sum += sample * sample;\r
      }\r
    peaks.push(peak);\r
    rms.push(Math.sqrt(sum / (size * channels.length)));\r
  }\r
  const loudest = Math.max(...peaks, 0.0001);\r
  return {\r
    peaks: peaks.map((v) => v / loudest),\r
    rms: rms.map((v) => v / loudest),\r
  };\r
}\r
\r
/**\r
 * Peaks and average loudness of an audio file for a waveform, decoded in the browser.\r
 * \`null\` while loading, empty arrays when the file cannot be read; nothing is fetched\r
 * without a source.\r
 */\r
export function useWaveformPeaks(src?: string | Blob | null, bins = 600) {\r
  const [data, setData] = useState<WaveformData | null>(null);\r
  useEffect(() => {\r
    setData(null);\r
    if (!src) return;\r
    let alive = true;\r
    decode(src, bins).then(\r
      (values) => alive && setData(values),\r
      () => alive && setData({ peaks: [], rms: [] }),\r
    );\r
    return () => {\r
      alive = false;\r
    };\r
  }, [src, bins]);\r
  return src ? data : null;\r
}\r
`,to=`import type { CommonProps } from "../../core/base";\r
export interface WaveformProps extends CommonProps {\r
  duration?: number;\r
  position?: number;\r
  defaultPosition?: number;\r
  onSeek?: (time: number) => void;\r
  /** Ready peaks (any scale, any count); without them the shape is read from \`src\`. */\r
  points?: readonly number[];\r
  /** An audio file (URL, File or Blob) whose peaks are decoded in the browser. */\r
  src?: string | Blob | null;\r
  /** How many bars to decode from \`src\`. */\r
  bins?: number;\r
  color?: string;\r
  label?: string;\r
  disabled?: boolean;\r
}\r
export interface AudioPlayerProps extends CommonProps {\r
  src?: string;\r
  duration?: number;\r
  onTimeChange?: (time: number) => void;\r
  onPlayingChange?: (playing: boolean) => void;\r
  points?: number[];\r
  volume?: number;\r
  defaultVolume?: number;\r
  showVolume?: boolean;\r
}\r
export interface LevelMeterProps extends CommonProps {\r
  /** Current level, 0–100; change it as often as you like. */\r
  value?: number;\r
  /** A live input (e.g. from getUserMedia) the meter listens to by itself; overrides \`value\`. */\r
  stream?: MediaStream | null;\r
  /** Off (muted, disconnected): the wave settles and dims. */\r
  active?: boolean;\r
  /** Small pill-sized meter for lists and participant rows. */\r
  compact?: boolean;\r
  label?: string;\r
}\r
export interface RotaryKnobProps extends CommonProps {\r
  value?: number;\r
  defaultValue?: number;\r
  onValueChange?: (value: number) => void;\r
  onValueCommit?: (value: number) => void;\r
  disabled?: boolean;\r
  readOnly?: boolean;\r
  step?: number;\r
  fineStep?: number;\r
  resetValue?: number;\r
  /** Value range; 0–100 (percent) by default. */\r
  min?: number;\r
  max?: number;\r
  /** The readout and typed input show value × this (e.g. 100 for a 0–2 gain shown as 0–200 %). */\r
  displayScale?: number;\r
  /** Unit after the shown number; "%" by default. */\r
  suffix?: string;\r
  label?: string;\r
  /** Print the label under the knob (otherwise it is only read out and shown on hover). */\r
  showLabel?: boolean;\r
  showValue?: boolean;\r
  diameter?: number;\r
}\r
export type RotaryKnobController = {\r
  get value(): number;\r
  setValue(next: number, notify?: boolean): void;\r
  reset(): void;\r
};\r
export interface SparklineProps extends CommonProps {\r
  values?: number[];\r
  /** Scale to the values' own range instead of from zero, so small changes fill the height. */\r
  fit?: boolean;\r
  color?: string;\r
  label?: string;\r
}\r
`,oo=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useMemo,\r
  useState,\r
  type ReactNode,\r
} from "react";\r
import { flushSync } from "react-dom";\r
import { useMotion } from "../../../core/providers/context";\r
export interface RouteAccessContext {\r
  pathname: string;\r
  params: Record<string, string>;\r
  context?: unknown;\r
}\r
export interface RouteDefinition {\r
  path: string;\r
  element?: ReactNode | ((match: RouteMatch) => ReactNode);\r
  redirectTo?: string;\r
  access?: (value: RouteAccessContext) => boolean;\r
  denied?: ReactNode | ((match: RouteMatch) => ReactNode);\r
}\r
export interface RouteMatch {\r
  route: RouteDefinition;\r
  pathname: string;\r
  params: Record<string, string>;\r
}\r
export interface RouterValue extends RouteMatch {\r
  navigate: (to: string, replace?: boolean) => void;\r
}\r
export interface RouterProps {\r
  routes: readonly RouteDefinition[];\r
  fallback?: ReactNode;\r
  context?: unknown;\r
  mode?: "hash" | "history";\r
}\r
const Context = createContext<RouterValue | null>(null),\r
  clean = (v: string) => {\r
    const x = \`/\${v.replace(/^#?\\/?/, "").replace(/\\/+$/g, "")}\`;\r
    return x === "/" ? x : x.replace(/\\/$/, "");\r
  },\r
  current = (m: "hash" | "history") =>\r
    clean(m === "hash" ? location.hash.slice(1) || "/" : location.pathname);\r
/** With motion on, the page change morphs through a view transition where the browser has one. */\r
const morph = (motion: boolean, update: () => void) =>\r
  motion && "startViewTransition" in document\r
    ? void document.startViewTransition(() => flushSync(update))\r
    : update();\r
function matchPath(pattern: string, pathname: string) {\r
  const p = clean(pattern).split("/").filter(Boolean),\r
    v = clean(pathname).split("/").filter(Boolean),\r
    params: Record<string, string> = {};\r
  for (let i = 0, j = 0; i < p.length; i++, j++) {\r
    const token = p[i];\r
    if (token === "*") {\r
      params["*"] = decodeURIComponent(v.slice(j).join("/"));\r
      return params;\r
    }\r
    if (j >= v.length) return null;\r
    if (token.startsWith(":"))\r
      params[token.slice(1)] = decodeURIComponent(v[j]);\r
    else if (token !== v[j]) return null;\r
  }\r
  return p.at(-1) === "*" || p.length === v.length ? params : null;\r
}\r
export function matchRoute(\r
  routes: readonly RouteDefinition[],\r
  pathname: string,\r
): RouteMatch | null {\r
  for (const route of routes) {\r
    const params = matchPath(route.path, pathname);\r
    if (params) return { route, pathname: clean(pathname), params };\r
  }\r
  return null;\r
}\r
export function Router({\r
  routes,\r
  fallback = null,\r
  context,\r
  mode = "hash",\r
}: RouterProps) {\r
  const [pathname, setPathname] = useState(() => current(mode));\r
  const motion = useMotion();\r
  useEffect(() => {\r
    const event = mode === "hash" ? "hashchange" : "popstate",\r
      sync = () => morph(motion, () => setPathname(current(mode)));\r
    window.addEventListener(event, sync);\r
    return () => window.removeEventListener(event, sync);\r
  }, [mode, motion]);\r
  const match = useMemo(() => matchRoute(routes, pathname), [routes, pathname]);\r
  const navigate = (to: string, replace = false) => {\r
    const path = clean(to);\r
    if (mode === "hash") {\r
      const hash = \`#\${path}\`;\r
      if (replace) {\r
        history.replaceState(null, "", hash);\r
        setPathname(path);\r
      } else location.hash = path;\r
    } else {\r
      history[replace ? "replaceState" : "pushState"](null, "", path);\r
      morph(motion, () => setPathname(path));\r
    }\r
  };\r
  useEffect(() => {\r
    if (match?.route.redirectTo) navigate(match.route.redirectTo, true);\r
  }, [match?.route.redirectTo]);\r
  if (!match) return <>{fallback}</>;\r
  if (match.route.redirectTo) return null;\r
  const value = { ...match, navigate },\r
    allowed =\r
      match.route.access?.({\r
        pathname: match.pathname,\r
        params: match.params,\r
        context,\r
      }) ?? true,\r
    content = allowed ? match.route.element : match.route.denied;\r
  return (\r
    <Context.Provider value={value}>\r
      {typeof content === "function" ? content(match) : (content ?? fallback)}\r
    </Context.Provider>\r
  );\r
}\r
export function useRouter() {\r
  const value = useContext(Context);\r
  if (!value) throw new Error("useRouter must be used inside <Router>");\r
  return value;\r
}\r
`,ao=`import { Typography } from "@ad-voice/ui";\r
import { matchRoute, type RouteDefinition } from "@ad-voice/ui/router";\r
\r
const routes: RouteDefinition[] = [\r
  { path: "/rooms/:id", element: (m) => \`Комната \${m.params.id}\` },\r
  { path: "/settings", element: "Настройки" },\r
  { path: "*", redirectTo: "/settings" },\r
];\r
\r
/** <Router routes={routes} /> renders the match for the current hash; matchRoute is the same matcher. */\r
export default function RouterExample() {\r
  const match = matchRoute(routes, "/rooms/42");\r
  return (\r
    <Typography variant="mono">\r
      /rooms/42 → {match?.route.path} · id = {match?.params.id}\r
    </Typography>\r
  );\r
}\r
`,so=`export default {
  name: "Router",
  description:
    "Typed universal routing with params, redirects and an optional access predicate — without project-specific role keys.",
  category: "navigation",
};
`,io=`export {\r
  ThemeProvider,\r
  themes,\r
} from "./components/foundation/ThemeProvider/ThemeProvider";\r
export type {\r
  ThemeName,\r
  ThemeProviderProps,\r
} from "./components/foundation/ThemeProvider/ThemeProvider";\r
export { useReducedMotion, useMotion } from "./core/providers/context";\r
export {\r
  useBorder,\r
  useDecoration,\r
  useSmoothWheel,\r
  useTabShape,\r
} from "./core/motion/hooks";\r
export { getMotionStats } from "./core/motion-engine.js";\r
`,lo=`import React, { createElement, useId, useMemo } from "react";

/** React's id made safe for SVG references such as \`url(#id)\`. */
export const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");
import type { VectorNode } from "./base";

/** Prefixes ids and their #references so several copies of one SVG can coexist on a page. */
function scopeIds(value: unknown, prefix: string, key: string): unknown {
  if (typeof value !== "string") return value;
  if (key === "id") return prefix + value;
  if (key === "href" && value.startsWith("#"))
    return "#" + prefix + value.slice(1);
  return value.replace(/url\\(#([^)]*)\\)/g, \`url(#\${prefix}$1)\`);
}

/** Artwork JSON already stores React-ready SVG props; only ids are rewritten. */
export function vectorElement(
  node: VectorNode | string,
  prefix: string,
  key?: string | number,
): React.ReactNode {
  if (typeof node === "string") return node;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.props ?? {}))
    props[name] = scopeIds(value, prefix, name);
  return createElement(
    node.tag,
    props,
    node.children?.map((child, i) => vectorElement(child, prefix, i)),
  );
}
export function SvgAsset({
  node,
  className,
  style,
  label,
  component,
}: {
  node: VectorNode;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  component?: string;
}) {
  const prefix = \`svg-\${useSvgId()}-\`;
  const element = useMemo(
    () =>
      vectorElement(node, prefix) as React.ReactElement<
        Record<string, unknown>
      >,
    [node, prefix],
  );
  return React.cloneElement(element, {
    ...(className ? { className } : {}),
    ...(style ? { style } : {}),
    ...(label
      ? { role: "img", "aria-label": label, "aria-hidden": undefined }
      : {}),
    ...(component ? { "data-ad-component": component } : {}),
  });
}
`,co=`import { createElement, useCallback, useRef, useState } from "react";
import type { AriaRole, CSSProperties, ReactNode, Ref } from "react";

export type Material =
  | "shell"
  | "card"
  | "glass"
  | "ruby"
  | "tile"
  | "input"
  | "dialog"
  | "ghost"
  | "danger";
export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type ControlSize = "xs" | "sm" | "md" | "lg";
export type LegacySize = "small" | "medium" | "large";
export type Size = ControlSize | LegacySize;
export type Tone =
  | "success"
  | "warning"
  | "error"
  | "processing"
  | "pending"
  | "offline"
  | "info";
export type TokenStyle = CSSProperties & {
  [key: \`--\${string}\`]: string | number | undefined;
};
export interface CommonProps {
  children?: ReactNode;
  className?: string;
  style?: TokenStyle;
  id?: string;
  material?: Material;
  size?: Size;
  tone?: Tone;
  /** Accessibility and test hooks reach the root element of every component. */
  role?: AriaRole;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-live"?: "off" | "polite" | "assertive";
  [data: \`data-\${string}\`]: string | number | boolean | undefined;
}
export interface VectorNode {
  tag: string;
  props?: Record<string, unknown>;
  children?: Array<VectorNode | string>;
}

export function classes(...values: (string | undefined | false)[]): string {
  return values.filter(Boolean).join(" ");
}
export function normalizeSize(size?: Size): ControlSize | undefined {
  if (!size) return undefined;
  return (
    ({ small: "sm", medium: "md", large: "lg" } as const)[size as LegacySize] ??
    (size as ControlSize)
  );
}

/** Root attributes shared by every component: \`ad ad-<kebab-name>\` class and data-ad-* hooks for CSS. */
export function mark(
  name: string,
  p: CommonProps,
  material?: Material,
  extra?: string,
) {
  const passed: Record<string, unknown> = {};
  for (const key in p)
    if (key === "role" || key.startsWith("aria-") || key.startsWith("data-"))
      passed[key] = p[key as keyof CommonProps];
  return {
    ...passed,
    id: p.id,
    className: classes(
      "ad",
      "ad-" +
        name.replace(/[A-Z]/g, (v, i) => (i ? "-" : "") + v.toLowerCase()),
      extra,
      p.className,
    ),
    style: p.style,
    "data-ad-component": name,
    "data-ad-material": p.material ?? material,
    "data-ad-size": normalizeSize(p.size),
    "data-ad-tone": p.tone,
  };
}

/** Plain structural element with the standard component marks. */
export function part(name: string, tag: "header" | "div" | "footer") {
  const Part = (p: CommonProps) =>
    createElement(tag, mark(name, p), p.children);
  Part.displayName = name;
  return Part;
}

export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(initial);
  const current = value === undefined ? internal : value;
  const latest = useRef({ current, value, onChange });
  latest.current = { current, value, onChange };
  const update = useCallback((next: T | ((value: T) => T)) => {
    const old = latest.current;
    const resolved =
      typeof next === "function"
        ? (next as (value: T) => T)(old.current)
        : next;
    if (old.value === undefined) setInternal(resolved);
    if (!Object.is(resolved, old.current)) old.onChange?.(resolved);
    latest.current.current = resolved;
  }, []);
  return [current, update] as const;
}
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}
export const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
export const cssRem = (value: number) =>
  \`\${value / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)}rem\`;
export const timeText = (value: number) =>
  \`\${Math.floor(Math.max(0, value) / 60)}:\${String(Math.floor(Math.max(0, value)) % 60).padStart(2, "0")}\`;
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.cssText = "position:fixed;left:-100vw;top:0";
    const focus = document.activeElement as HTMLElement | null;
    document.body.append(field);
    field.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
      focus?.focus();
    }
  }
}
export function downloadFile(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Spreads a ring of light from the pointer inside \`host\` (which should clip its overflow). */
export function ripple(host: HTMLElement, clientX: number, clientY: number) {
  const rect = host.getBoundingClientRect();
  const ring = document.createElement("span");
  ring.className = "ad-ripple";
  ring.style.left = \`\${clientX - rect.left}px\`;
  ring.style.top = \`\${clientY - rect.top}px\`;
  ring.addEventListener("animationend", () => ring.remove());
  host.append(ring);
}
`,po=`/**\r
 * Browser APIs that tests (jsdom) and server rendering lack. Without them components lose\r
 * only the extra (re-measuring on resize, pausing off-screen, following the motion setting)\r
 * and keep working.\r
 */\r
const inert = { observe() {}, unobserve() {}, disconnect() {} };\r
\r
export const createResizeObserver = (callback: ResizeObserverCallback) =>\r
  typeof ResizeObserver === "undefined"\r
    ? (inert as unknown as ResizeObserver)\r
    : new ResizeObserver(callback);\r
\r
export const canObserveIntersection = () =>\r
  typeof IntersectionObserver !== "undefined";\r
\r
export const reducedMotionQuery = (): MediaQueryList =>\r
  typeof matchMedia === "function"\r
    ? matchMedia("(prefers-reduced-motion: reduce)")\r
    : ({\r
        matches: false,\r
        addEventListener() {},\r
        removeEventListener() {},\r
      } as unknown as MediaQueryList);\r
\r
/** jsdom has canvas elements but no 2D context unless the native canvas package is added. */\r
export const canPaint = () => typeof CanvasRenderingContext2D !== "undefined";\r
`,uo=`export interface MotionScope {
  root: Document | ShadowRoot | Element;
  enabled: boolean;
  time: number;
  previous: number | null;
  disposed?: boolean;
  callbacks: Map<Element, (time: number) => void>;
  add(node: Element, callback: (time: number) => void): () => void;
  set(enabled: boolean, explicit?: boolean): boolean;
  dispose(): void;
}
export interface BorderEffect {
  element: HTMLElement;
  overlay: SVGSVGElement;
  path: SVGPathElement;
  length: number;
  observer: ResizeObserver;
  sync(): void;
  paint(seconds: number): void;
  destroy(): void;
}
export function createMotion(
  root?: Document | ShadowRoot | Element,
): MotionScope;
export function attachBorder(
  element: HTMLElement,
  options: {
    shell?: boolean;
    round?: boolean;
    scope: MotionScope;
  },
): BorderEffect;
export function attachTabShape(element: HTMLButtonElement): {
  shape: SVGSVGElement;
  observer: ResizeObserver;
  sync(): void;
  destroy(): void;
};
export function getMotionStats(): {
  scopes: number;
  running: number;
  scheduled: boolean;
  callbacks: number;
};
`,mo=`import { reducedMotionQuery } from "../environment";\r
import React, { useEffect, useLayoutEffect, useRef } from "react";\r
import {\r
  attachBorder,\r
  attachTabShape,\r
  createMotion,\r
} from "../motion-engine.js";\r
import { useMotion } from "../providers/context";\r
\r
/** One scheduler in the engine; every observer and subscription is detached on unmount. */\r
export function useDecoration(\r
  ref: React.RefObject<Element | null>,\r
  paint: (time: number) => void,\r
) {\r
  const enabled = useMotion();\r
  const painter = useRef(paint);\r
  painter.current = paint;\r
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);\r
\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node) return;\r
\r
    const controller = createMotion(node);\r
    scope.current = controller;\r
    const unsubscribe = controller.add(node, (time: number) =>\r
      painter.current(time),\r
    );\r
\r
    return () => {\r
      unsubscribe();\r
      controller.dispose();\r
      scope.current = null;\r
    };\r
  }, [ref]);\r
\r
  useLayoutEffect(() => {\r
    scope.current?.set(enabled);\r
  }, [enabled]);\r
}\r
\r
export function useBorder(\r
  ref: React.RefObject<HTMLElement | null>,\r
  enabled = true,\r
  shell = false,\r
  round = false,\r
) {\r
  const motion = useMotion();\r
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);\r
\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node || !enabled) return;\r
\r
    const controller = createMotion(node);\r
    scope.current = controller;\r
    const border = attachBorder(node, { shell, round, scope: controller });\r
\r
    return () => {\r
      border.destroy();\r
      controller.dispose();\r
      scope.current = null;\r
    };\r
  }, [ref, enabled, shell, round]);\r
\r
  useLayoutEffect(() => {\r
    scope.current?.set(motion);\r
  }, [motion, enabled, shell, round]);\r
}\r
\r
export function useTabShape(ref: React.RefObject<HTMLButtonElement | null>) {\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node) return;\r
    const shape = attachTabShape(node);\r
    return () => shape.destroy();\r
  }, [ref]);\r
}\r
\r
/**\r
 * Mouse-wheel notches glide to their target instead of jumping. Trackpads already glide and\r
 * keep native scrolling; an inner scroller that can still move takes the wheel itself.\r
 */\r
export function useSmoothWheel(ref: React.RefObject<HTMLElement | null>) {\r
  const enabled = useMotion();\r
  useEffect(() => {\r
    const element = ref.current;\r
    if (\r
      !element ||\r
      !enabled ||\r
      reducedMotionQuery().matches\r
    )\r
      return;\r
    let target = element.scrollTop;\r
    let position = target;\r
    let applied = target;\r
    let frame = 0;\r
    let last = 0;\r
    const stop = () => {\r
      cancelAnimationFrame(frame);\r
      frame = 0;\r
      last = 0;\r
    };\r
    // Exponential easing on real elapsed time: the same glide at 60, 144 or 360 Hz,\r
    // and every refresh of the display gets its own sub-pixel step.\r
    const glide = (now: number) => {\r
      // Something else moved the scroller (the browser keeping the view anchored while\r
      // content above resizes, a scrollbar drag, keys): take that shift on board and glide\r
      // the remaining distance from there instead of fighting it.\r
      const shift = element.scrollTop - applied;\r
      if (Math.abs(shift) > 1.5) {\r
        position += shift;\r
        target += shift;\r
      }\r
      const elapsed = Math.min(64, now - (last || now - 16));\r
      last = now;\r
      target = Math.max(\r
        0,\r
        Math.min(element.scrollHeight - element.clientHeight, target),\r
      );\r
      position += (target - position) * (1 - Math.exp(-elapsed / 95));\r
      if (Math.abs(target - position) < 0.25) position = target;\r
      element.scrollTop = position;\r
      applied = element.scrollTop;\r
      if (position === target) return stop();\r
      frame = requestAnimationFrame(glide);\r
    };\r
    const onWheel = (event: WheelEvent) => {\r
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))\r
        return;\r
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;\r
      if (event.deltaMode === 0 && Math.abs(delta) < 40) return;\r
      for (\r
        let node = event.target as HTMLElement | null;\r
        node && node !== element;\r
        node = node.parentElement\r
      ) {\r
        const canScroll =\r
          node.scrollHeight > node.clientHeight + 1 &&\r
          /auto|scroll/.test(getComputedStyle(node).overflowY);\r
        if (\r
          canScroll &&\r
          (delta < 0\r
            ? node.scrollTop > 0\r
            : node.scrollTop + node.clientHeight < node.scrollHeight - 1)\r
        )\r
          return;\r
      }\r
      event.preventDefault();\r
      if (!frame) target = position = applied = element.scrollTop;\r
      target = Math.max(\r
        0,\r
        Math.min(element.scrollHeight - element.clientHeight, target + delta),\r
      );\r
      if (!frame) frame = requestAnimationFrame(glide);\r
    };\r
    element.addEventListener("wheel", onWheel, { passive: false });\r
    return () => {\r
      element.removeEventListener("wheel", onWheel);\r
      stop();\r
    };\r
  }, [ref, enabled]);\r
}\r
`,fo=`/** Deterministic randomness and value noise for procedural artwork (same picture on every render). */

export const clamp01 = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

/** Seeded generator (mulberry32): returns a function giving numbers in [0, 1). */
export function seeded(initialSeed: number) {
  let seed = initialSeed;
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

let table: Float32Array | null = null;

/** Smooth 2D value noise in [0, 1]. */
export function noise(x: number, y: number) {
  table ??= Float32Array.from({ length: 65536 }, seeded(7149));
  const ix = Math.floor(x),
    iy = Math.floor(y);
  let fx = x - ix,
    fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const at = (a: number, b: number) => table![(a & 255) + ((b & 255) << 8)];
  const a = at(ix, iy),
    b = at(ix + 1, iy),
    c = at(ix, iy + 1),
    d = at(ix + 1, iy + 1);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

/** Fractal noise: several octaves of value noise. */
export function fbm(initialX: number, initialY: number, octaves = 5) {
  let x = initialX,
    y = initialY,
    value = 0,
    amplitude = 0.5;
  for (let i = 0; i < octaves; i += 1) {
    value += noise(x, y) * amplitude;
    x = x * 2.03 + 13.2;
    y = y * 2.07 - 7.4;
    amplitude *= 0.5;
  }
  return value;
}

/** A procedural picture: rows of pixels computed one by one, then optional vector strokes. */
export interface Painting {
  /** Fill rows \`from\`..\`to\` of the image; scale from \`image.width\` to stay resolution-free. */
  pixels(image: ImageData, from: number, to: number): void;
  /** Draw on top of the pixels (stars, glows, outlines). */
  finish?(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void;
}

const paintings = new Map<string, Promise<HTMLCanvasElement>>();
const pause = () => new Promise<void>((resume) => setTimeout(resume));

/**
 * Paints a picture into an offscreen canvas in ~8 ms slices, so even a large one never
 * freezes the page, and keeps it: every instance of the same size reuses the result.
 */
export function paintCanvas(
  key: string,
  width: number,
  height: number,
  painting: Painting,
) {
  const id = \`\${key}:\${width}x\${height}\`;
  let done = paintings.get(id);
  if (!done) {
    done = (async () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return canvas;
      const image = context.createImageData(width, height);
      for (let row = 0; row < height;) {
        const started = performance.now();
        while (row < height && performance.now() - started < 8) {
          painting.pixels(image, row, row + 1);
          row += 1;
        }
        if (row < height) await pause();
      }
      context.putImageData(image, 0, 0);
      painting.finish?.(context, width, height);
      return canvas;
    })();
    paintings.set(id, done);
  }
  return done;
}
`,go=`import { reducedMotionQuery } from "../environment";\r
import { useEffect, useState } from "react";\r
export function useReducedMotion() {\r
  const [reduced, setReduced] = useState(() => reducedMotionQuery().matches);\r
  useEffect(() => {\r
    const media = reducedMotionQuery(),\r
      update = () => setReduced(media.matches);\r
    media.addEventListener("change", update);\r
    update();\r
    return () => media.removeEventListener("change", update);\r
  }, []);\r
  return reduced;\r
}\r
export function useMotion() {\r
  const reduced = useReducedMotion();\r
  const [explicit, setExplicit] = useState<boolean | undefined>(() =>\r
    typeof document === "undefined"\r
      ? undefined\r
      : document.documentElement.dataset.adMotion === "off"\r
        ? false\r
        : document.documentElement.dataset.adMotion === "on"\r
          ? true\r
          : undefined,\r
  );\r
  useEffect(() => {\r
    if (typeof document === "undefined") return;\r
    const root = document.documentElement,\r
      update = () =>\r
        setExplicit(\r
          root.dataset.adMotion === "off"\r
            ? false\r
            : root.dataset.adMotion === "on"\r
              ? true\r
              : undefined,\r
        );\r
    const observer = new MutationObserver(update);\r
    observer.observe(root, {\r
      attributes: true,\r
      attributeFilter: ["data-ad-motion"],\r
    });\r
    update();\r
    return () => observer.disconnect();\r
  }, []);\r
  return explicit ?? !reduced;\r
}\r
`,ho=`import type { CSSProperties } from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
export type Spacing = number | string;

const BREAKPOINTS: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

/** Numbers are steps of the spacing scale; strings are raw CSS lengths. */
export function spacing(value: Spacing): string {
  if (typeof value !== "number") return value;
  if (value === 0) return "0";
  return \`var(--ad-space-\${value}, calc(var(--ad-space-unit, 0.25rem) * \${value}))\`;
}

/**
 * \`--ad-<name>\` plus \`--ad-<name>-<bp>\` for every breakpoint, each carrying the nearest
 * smaller value forward (starting from \`fallback\`). Every layout sets all of its own
 * variables, so nested layouts never inherit a parent's and CSS reads one variable per
 * breakpoint without fallback chains.
 */
export function responsiveVars<T>(
  name: string,
  value: Responsive<T> | undefined,
  format: (item: T) => string = String,
  fallback?: T,
): CSSProperties {
  const values: Partial<Record<Breakpoint, T>> =
    value != null && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<Record<Breakpoint, T>>)
      : { base: (value ?? fallback) as T };
  const result: Record<string, string> = {};
  let current = values.base ?? fallback;
  for (const bp of BREAKPOINTS) {
    current = values[bp] ?? current;
    if (current != null)
      result[\`--ad-\${name}\${bp === "base" ? "" : \`-\${bp}\`}\`] = format(current);
  }
  return result as CSSProperties;
}
`,vo=`import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as UI from "../index";
import * as Editor from "../editor";

export const U = { ...UI, ...Editor };

/** The docs site's own theme. Theme examples drive it, so the whole site follows them. */
export interface SiteTheme {
  theme: UI.ThemeName;
  primary: string;
  secondary: string;
  /** A new theme brings its own pair of colours unless colours are given too. */
  set: (patch: Partial<Omit<SiteTheme, "set">>) => void;
}
export const SiteThemeContext = createContext<SiteTheme | null>(null);

/** The site theme when the docs provide one, otherwise a local theme of the example. */
export function useSiteTheme(): SiteTheme {
  const site = useContext(SiteThemeContext);
  const [local, setLocal] = useState({
    theme: "ruby" as UI.ThemeName,
    primary: UI.themes.ruby[0] as string,
    secondary: UI.themes.ruby[1] as string,
  });
  return (
    site ?? {
      ...local,
      set: (patch) =>
        setLocal((current) => ({
          ...current,
          ...(patch.theme && {
            primary: UI.themes[patch.theme][0],
            secondary: UI.themes[patch.theme][1],
          }),
          ...patch,
        })),
    }
  );
}

/** True inside overview tiles: a playground shows only its specimens, without controls. */
export const ExamplePreviewContext = createContext(false);

/** Knobs that pick a look rather than tune it: all of their options are shown side by side. */
const spreadKeys = ["variant", "tone", "status", "material", "effect"];

/** The docs page listens here to show the code of the current playground state. */
export const ExampleCodeContext = createContext<
  ((code: string) => void) | null
>(null);

/** A prop the reader can change: a list of options (segmented) or a flag (switch). */
export type Knob =
  { options: readonly string[]; value: string } | { value: boolean };
type KnobValue<K> = K extends { options: readonly (infer O)[] }
  ? O
  : K extends { value: infer V }
    ? V
    : never;
export type KnobValues<K extends Record<string, Knob>> = {
  [P in keyof K]: KnobValue<K[P]>;
};

/** Marks a prop value that is printed as an expression: \`{...}\` instead of \`"..."\`. */
export const expr = (code: string) => ({ expr: code });

/** Prints a JSX element; undefined/false props are left out, short elements stay on one line. */
export function jsx(
  name: string,
  props: Record<string, unknown>,
  children?: string,
): string {
  const attrs = Object.entries(props).flatMap(([key, value]) => {
    if (value === undefined || value === false) return [];
    if (value === true) return [key];
    if (typeof value === "string") return [\`\${key}="\${value}"\`];
    if (value && typeof value === "object" && "expr" in value)
      return [\`\${key}={\${(value as { expr: string }).expr}}\`];
    return [\`\${key}={\${JSON.stringify(value)}}\`];
  });
  const close = children ? \`>\${children}</\${name}>\` : " />";
  const inline = \`<\${name}\${attrs.map((a) => " " + a).join("")}\${close}\`;
  if (inline.length <= 56) return inline;
  const body = attrs.map((a) => \`\\n  \${a}\`).join("");
  if (!children) return \`<\${name}\${body}\\n/>\`;
  const open = attrs.length ? \`<\${name}\${body}\\n>\` : \`<\${name}>\`;
  return \`\${open}\\n  \${children}\\n</\${name}>\`;
}

/** Values that differ from the knob defaults, so generated code shows only what was changed. */
function changed<K extends Record<string, Knob>>(
  knobs: K,
  values: KnobValues<K>,
): Partial<KnobValues<K>> {
  const out: Partial<KnobValues<K>> = {};
  for (const key in knobs)
    if (values[key] !== knobs[key].value) out[key] = values[key];
  return out;
}

const knobLabels: Record<string, string> = {
  size: "Размер",
  variant: "Вид",
  disabled: "Disabled",
  readOnly: "Read only",
  error: "Ошибка",
  required: "Обязательное",
  clearable: "Очистка",
  loading: "Загрузка",
  icon: "Иконка",
  description: "Подсказка",
  round: "Круглая",
  multiple: "Несколько файлов",
  selected: "Выбрана",
  tone: "Тон",
  status: "Статус",
  value: "Значение",
  indeterminate: "Без значения",
  material: "Материал",
  border: "Анимированная рамка",
  level: "Уровень",
  compact: "Компактный",
  surface: "Подложка",
  segmented: "Сегменты",
  role: "Роль",
  active: "Активен",
  bars: "Столбики",
  playing: "Играет",
  flicker: "Мерцание",
  lines: "Строки",
  circle: "Аватар",
  effect: "Эффект",
  max: "Наклон, °",
  glare: "Блик",
  floating: "Подпись внутри",
  resize: "Ресайз",
  theme: "Тема",
  selectable: "Выбор строк",
  searchable: "Поиск",
  dense: "Плотная",
  striped: "Зебра",
  strands: "Нити",
  stars: "Звёзды",
  shape: "Форма",
  comets: "Кометы",
  upload: "Облако загрузки",
};

/**
 * One live specimen with its props as controls. Replaces grids of near-identical copies:
 * the reader changes a prop and sees the component and its code update together.
 */
export function Playground<K extends Record<string, Knob>>({
  knobs,
  code,
  children,
  stretch = false,
  extra,
}: {
  knobs: K;
  code: (values: KnobValues<K>, changes: Partial<KnobValues<K>>) => string;
  children: (values: KnobValues<K>) => ReactNode;
  /** Let the specimen take the stage width (fields) instead of its own size (buttons). */
  stretch?: boolean;
  /** Short comparison shown under the controls, e.g. all variants side by side. */
  extra?: ReactNode;
}) {
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(
        Object.entries(knobs).map(([k, v]) => [k, v.value]),
      ) as KnobValues<K>,
  );
  const report = useContext(ExampleCodeContext);
  const preview = useContext(ExamplePreviewContext);
  const spread = Object.keys(knobs).find(
    (key) => spreadKeys.includes(key) && "options" in knobs[key],
  ) as keyof K | undefined;
  const looks = spread
    ? (knobs[spread] as { options: readonly string[] }).options.map(
        (option) => ({ option, values: { ...values, [spread]: option } }),
      )
    : [{ option: "", values }];
  const source = looks
    .map((look) => code(look.values, changed(knobs, look.values)))
    .join("\\n\\n");
  const reported = useRef("");
  useEffect(() => {
    if (report && reported.current !== source) {
      reported.current = source;
      report(source);
    }
  }, [report, source]);
  const set = (key: keyof K, value: string | boolean) =>
    setValues((old) => ({ ...old, [key]: value }));

  return (
    <div className="example-playground">
      <div
        className="example-stage"
        data-stretch={stretch || undefined}
        data-spread={spread ? true : undefined}
      >
        {spread
          ? looks.map((look) => (
              <figure key={look.option}>
                {children(look.values)}
                <figcaption>{look.option}</figcaption>
              </figure>
            ))
          : children(values)}
      </div>
      {!preview && (
        <div className="example-knobs">
          {Object.entries(knobs)
            .filter(([key]) => key !== spread)
            .map(([key, knob]) =>
              "options" in knob ? (
                <div className="example-knob" key={key}>
                  <span>{knobLabels[key] ?? key}</span>
                  <U.SegmentedControl
                    size="xs"
                    label={knobLabels[key] ?? key}
                    value={values[key] as string}
                    onValueChange={(v) => set(key, v)}
                    items={knob.options.map((o) => ({ value: o, label: o }))}
                  />
                </div>
              ) : (
                <U.Switch
                  key={key}
                  size="xs"
                  label={knobLabels[key] ?? key}
                  checked={values[key] as boolean}
                  onValueChange={(v) => set(key, v)}
                />
              ),
            )}
        </div>
      )}
      {extra && !preview && <div className="example-extra">{extra}</div>}
    </div>
  );
}

/** Captioned specimens in one row, for comparisons that are clearer side by side. */
export function Compare({
  items,
  captions = true,
}: {
  items: Array<{ label: string; node: ReactNode }>;
  /** Hide captions when the specimens already show their name. */
  captions?: boolean;
}) {
  return (
    <div className="example-compare">
      {items.map((item) => (
        <figure key={item.label}>
          {item.node}
          {captions && <figcaption>{item.label}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export const sizes = ["xs", "sm", "md", "lg"] as const;
export const buttonVariants = [
  "primary",
  "secondary",
  "ghost",
  "danger",
] as const;
export const inputVariants = ["outlined", "filled", "underlined"] as const;
`,bo=`export { PianoRoll } from "./components/editor/PianoRoll/PianoRoll";
export type { PianoRollProps, PianoRollNote, PianoRollWord, PianoRollGesture } from "./components/editor/PianoRoll/PianoRoll";
`,yo=`export { Form, useForm, useFormContext } from "./components/forms/Form/Form";
export type {
  FormApi,
  FormErrors,
  FormProps,
  UseFormOptions,
} from "./components/forms/Form/Form";
export {
  FormFields,
  defaultFieldRegistry,
} from "./components/forms/FormFields/FormFields";
export type {
  FormFieldsProps,
  FormFieldDefinition,
  FieldKind,
  FieldRegistry,
} from "./components/forms/FormFields/FormFields";
`,xo=`export { copyText } from "./core/base";
export * from "./core/base";
export * from "./core/artwork";
export { useReducedMotion, useMotion } from "./core/providers/context";
export {
  useBorder,
  useDecoration,
  useSmoothWheel,
  useTabShape,
} from "./core/motion/hooks";
export {
  ThemeProvider,
  themes,
} from "./components/foundation/ThemeProvider/ThemeProvider";
export type {
  ThemeName,
  ThemeProviderProps,
} from "./components/foundation/ThemeProvider/ThemeProvider";
export { Typography } from "./components/foundation/Typography/Typography";
export type {
  TypographyProps,
  TypographyTone,
  TypographyVariant,
  TypographyWeight,
} from "./components/foundation/Typography/Typography";
export { typography } from "./theme/typography";
export { Header } from "./components/layout/Header/Header";
export { Illustration } from "./components/layout/Illustration/Illustration";
export { Avatar } from "./components/layout/Avatar/Avatar";
export { BrandMark } from "./components/layout/BrandMark/BrandMark";
export { ButtonGroup } from "./components/layout/ButtonGroup/ButtonGroup";
export { Card } from "./components/layout/Card/Card";
export { StatTile } from "./components/layout/StatTile/StatTile";
export type { StatTileProps } from "./components/layout/StatTile/StatTile";
export { MediaCard } from "./components/media/MediaCard/MediaCard";
export type { MediaCardProps } from "./components/media/MediaCard/MediaCard";
export { DialogActions } from "./components/layout/DialogActions/DialogActions";
export { DialogBody } from "./components/layout/DialogBody/DialogBody";
export { Divider } from "./components/layout/Divider/Divider";
export { Grid } from "./components/layout/Grid/Grid";
export { Icon } from "./components/layout/Icon/Icon";
export { ScrollArea } from "./components/layout/ScrollArea/ScrollArea";
export { Stack } from "./components/layout/Stack/Stack";
export { TabPanel } from "./components/layout/TabPanel/TabPanel";
export { Text } from "./components/layout/Text/Text";
export { Toolbar } from "./components/layout/Toolbar/Toolbar";
export * from "./components/layout/shared";
export { Autocomplete } from "./components/controls/Autocomplete/Autocomplete";
export { Button } from "./components/controls/Button/Button";
export { Checkbox } from "./components/controls/Checkbox/Checkbox";
export { FilePicker } from "./components/controls/FilePicker/FilePicker";
export { IconButton } from "./components/controls/IconButton/IconButton";
export { InputBase } from "./components/controls/InputBase/InputBase";
export { Link } from "./components/controls/Link/Link";
export type { LinkProps } from "./components/controls/Link/Link";
export type { InputBaseProps } from "./components/controls/InputBase/InputBase";
export { NumberField } from "./components/controls/NumberField/NumberField";
export { SegmentedControl } from "./components/controls/SegmentedControl/SegmentedControl";
export { Select } from "./components/controls/Select/Select";
export { Slider } from "./components/controls/Slider/Slider";
export { SplitButton } from "./components/controls/SplitButton/SplitButton";
export { Switch } from "./components/controls/Switch/Switch";
export { Tab } from "./components/controls/Tab/Tab";
export { Tabs } from "./components/controls/Tabs/Tabs";
export { TextArea } from "./components/controls/TextArea/TextArea";
export { TextField } from "./components/controls/TextField/TextField";
export { ThemePicker } from "./components/controls/ThemePicker/ThemePicker";
export type { ThemePickerProps, ThemePickerOption } from "./components/controls/ThemePicker/ThemePicker";
export { ToggleButton } from "./components/controls/ToggleButton/ToggleButton";
export * from "./components/controls/shared";
export { Badge } from "./components/feedback/Badge/Badge";
export { CollapsibleSection } from "./components/feedback/CollapsibleSection/CollapsibleSection";
export { DataTable } from "./components/feedback/DataTable/DataTable";
export { Dialog } from "./components/feedback/Dialog/Dialog";
export { EmptyState } from "./components/feedback/EmptyState/EmptyState";
export { KeyValueList } from "./components/feedback/KeyValueList/KeyValueList";
export { Menu } from "./components/feedback/Menu/Menu";
export { MenuItem } from "./components/feedback/MenuItem/MenuItem";
export { MessageBar } from "./components/feedback/MessageBar/MessageBar";
export { Tooltip } from "./components/feedback/Tooltip/Tooltip";
export type { TooltipProps } from "./components/feedback/Tooltip/Tooltip";
export { Popover } from "./components/feedback/Popover/Popover";
export { ProgressBar } from "./components/feedback/ProgressBar/ProgressBar";
export { StatusIndicator } from "./components/feedback/StatusIndicator/StatusIndicator";
export { Steps } from "./components/feedback/Steps/Steps";
export { Toast } from "./components/feedback/Toast/Toast";
export * from "./components/feedback/shared";
export { AnimatedBorder } from "./components/effects/AnimatedBorder/AnimatedBorder";
export type { AnimatedBorderProps } from "./components/effects/AnimatedBorder/AnimatedBorder";
export { Spotlight } from "./components/effects/Spotlight/Spotlight";
export type { SpotlightProps } from "./components/effects/Spotlight/Spotlight";
export { Tilt } from "./components/effects/Tilt/Tilt";
export type { TiltProps } from "./components/effects/Tilt/Tilt";
export { Reveal } from "./components/effects/Reveal/Reveal";
export type { RevealProps } from "./components/effects/Reveal/Reveal";
export { GlowText } from "./components/effects/GlowText/GlowText";
export type { GlowTextProps } from "./components/effects/GlowText/GlowText";
export { SignalBars } from "./components/feedback/SignalBars/SignalBars";
export type { SignalBarsProps } from "./components/feedback/SignalBars/SignalBars";
export { ImageShine } from "./components/effects/ImageShine/ImageShine";
export type { ImageShineProps } from "./components/effects/ImageShine/ImageShine";
export { Equalizer } from "./components/effects/Equalizer/Equalizer";
export type { EqualizerProps } from "./components/effects/Equalizer/Equalizer";
export { Shimmer } from "./components/effects/Shimmer/Shimmer";
export type { ShimmerProps } from "./components/effects/Shimmer/Shimmer";
export { Sparkles } from "./components/effects/Sparkles/Sparkles";
export type { SparklesProps } from "./components/effects/Sparkles/Sparkles";
export { Beacon } from "./components/effects/Beacon/Beacon";
export type { BeaconProps } from "./components/effects/Beacon/Beacon";
export { Marquee } from "./components/effects/Marquee/Marquee";
export type { MarqueeProps } from "./components/effects/Marquee/Marquee";
export { Landscape } from "./components/artwork/Landscape/Landscape";
export type { LandscapeProps } from "./components/artwork/Landscape/Landscape";
export { Planet } from "./components/artwork/Planet/Planet";
export type { PlanetProps } from "./components/artwork/Planet/Planet";
export { NeonWaves } from "./components/artwork/NeonWaves/NeonWaves";
export type { NeonWavesProps } from "./components/artwork/NeonWaves/NeonWaves";
export { Spectrum } from "./components/artwork/Spectrum/Spectrum";
export type { SpectrumProps } from "./components/artwork/Spectrum/Spectrum";
export { DatabaseArt } from "./components/artwork/DatabaseArt/DatabaseArt";
export type { DatabaseArtProps } from "./components/artwork/DatabaseArt/DatabaseArt";
export { ServerArt } from "./components/artwork/ServerArt/ServerArt";
export type { ServerArtProps } from "./components/artwork/ServerArt/ServerArt";
export { AudioPlayer } from "./components/media/AudioPlayer/AudioPlayer";
export { LevelMeter } from "./components/media/LevelMeter/LevelMeter";
export { RotaryKnob } from "./components/media/RotaryKnob/RotaryKnob";
export { PianoKeyboard, isBlackKey, noteName } from "./components/media/PianoKeyboard/PianoKeyboard";
export type { PianoKeyboardProps } from "./components/media/PianoKeyboard/PianoKeyboard";
export { KaraokeLyrics } from "./components/media/KaraokeLyrics/KaraokeLyrics";
export type { KaraokeLyricsProps, LyricWord } from "./components/media/KaraokeLyrics/KaraokeLyrics";
export { PianoRoll } from "./components/editor/PianoRoll/PianoRoll";
export type { PianoRollProps, PianoRollNote, PianoRollWord, PianoRollGesture } from "./components/editor/PianoRoll/PianoRoll";
export { MelodyRoll } from "./components/media/MelodyRoll/MelodyRoll";
export type { MelodyRollProps, MelodyNote } from "./components/media/MelodyRoll/MelodyRoll";
export { FloatingPanel } from "./components/layout/FloatingPanel/FloatingPanel";
export type { FloatingPanelProps } from "./components/layout/FloatingPanel/FloatingPanel";
export { useFloatingPanel, resizeEdges, panelControls } from "./components/layout/FloatingPanel/useFloatingPanel";
export type { PanelLayout, ScreenPoint, ResizeEdge, FloatingPanelOptions } from "./components/layout/FloatingPanel/useFloatingPanel";
export { Sparkline } from "./components/media/Sparkline/Sparkline";
export { WaveDecoration } from "./components/media/WaveDecoration/WaveDecoration";
export { Waveform } from "./components/media/Waveform/Waveform";
export { useWaveformPeaks } from "./components/media/Waveform/useWaveformPeaks";
export * from "./components/media/shared";
export { getMotionStats } from "./core/motion-engine.js";
export {
  Router,
  useRouter,
  matchRoute,
} from "./components/navigation/Router/Router";
export type {
  RouterProps,
  RouterValue,
  RouteDefinition,
  RouteMatch,
  RouteAccessContext,
} from "./components/navigation/Router/Router";
export { Form, useForm, useFormContext } from "./components/forms/Form/Form";
export type {
  FormApi,
  FormErrors,
  UseFormOptions,
} from "./components/forms/Form/Form";
export {
  FormFields,
  defaultFieldRegistry,
} from "./components/forms/FormFields/FormFields";
export type {
  FormFieldDefinition,
  FieldKind,
  FieldRegistry,
} from "./components/forms/FormFields/FormFields";
`,ko=`export {
  Router,
  useRouter,
  matchRoute,
} from "./components/navigation/Router/Router";
export type {
  RouterProps,
  RouterValue,
  RouteDefinition,
  RouteMatch,
  RouteAccessContext,
} from "./components/navigation/Router/Router";
`,_o=`export const typography = {
  fontFamily: {
    sans: "var(--ad-font-family-sans)",
    mono: "var(--ad-font-family-mono)",
  },
  size: {
    display: "var(--ad-font-size-display)",
    h1: "var(--ad-font-size-h1)",
    h2: "var(--ad-font-size-h2)",
    h3: "var(--ad-font-size-h3)",
    title: "var(--ad-font-size-title)",
    subtitle: "var(--ad-font-size-subtitle)",
    body: "var(--ad-font-size-body)",
    bodySmall: "var(--ad-font-size-body-sm)",
    label: "var(--ad-font-size-label)",
    caption: "var(--ad-font-size-caption)",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
`,l=Object.entries(Object.assign({"../../../../packages/ui/src/components/artwork/DatabaseArt/DatabaseArt.tsx":c,"../../../../packages/ui/src/components/artwork/DatabaseArt/example.tsx":d,"../../../../packages/ui/src/components/artwork/DatabaseArt/meta.ts":p,"../../../../packages/ui/src/components/artwork/Landscape/Landscape.tsx":u,"../../../../packages/ui/src/components/artwork/Landscape/example.tsx":m,"../../../../packages/ui/src/components/artwork/Landscape/meta.ts":f,"../../../../packages/ui/src/components/artwork/NeonWaves/NeonWaves.tsx":g,"../../../../packages/ui/src/components/artwork/NeonWaves/example.tsx":h,"../../../../packages/ui/src/components/artwork/NeonWaves/meta.ts":v,"../../../../packages/ui/src/components/artwork/Planet/Planet.tsx":b,"../../../../packages/ui/src/components/artwork/Planet/example.tsx":y,"../../../../packages/ui/src/components/artwork/Planet/meta.ts":x,"../../../../packages/ui/src/components/artwork/ServerArt/ServerArt.tsx":k,"../../../../packages/ui/src/components/artwork/ServerArt/example.tsx":_,"../../../../packages/ui/src/components/artwork/ServerArt/meta.ts":w,"../../../../packages/ui/src/components/artwork/Spectrum/Spectrum.tsx":P,"../../../../packages/ui/src/components/artwork/Spectrum/example.tsx":S,"../../../../packages/ui/src/components/artwork/Spectrum/meta.ts":T,"../../../../packages/ui/src/components/artwork/useArtwork.ts":C,"../../../../packages/ui/src/components/controls/Autocomplete/Autocomplete.tsx":M,"../../../../packages/ui/src/components/controls/Autocomplete/example.tsx":R,"../../../../packages/ui/src/components/controls/Autocomplete/meta.ts":E,"../../../../packages/ui/src/components/controls/Button/Button.tsx":A,"../../../../packages/ui/src/components/controls/Button/example.tsx":B,"../../../../packages/ui/src/components/controls/Button/meta.ts":I,"../../../../packages/ui/src/components/controls/Checkbox/Checkbox.tsx":N,"../../../../packages/ui/src/components/controls/Checkbox/example.tsx":z,"../../../../packages/ui/src/components/controls/Checkbox/meta.ts":L,"../../../../packages/ui/src/components/controls/FilePicker/FilePicker.tsx":D,"../../../../packages/ui/src/components/controls/FilePicker/example.tsx":F,"../../../../packages/ui/src/components/controls/FilePicker/meta.ts":V,"../../../../packages/ui/src/components/controls/IconButton/IconButton.tsx":$,"../../../../packages/ui/src/components/controls/IconButton/example.tsx":O,"../../../../packages/ui/src/components/controls/IconButton/meta.ts":H,"../../../../packages/ui/src/components/controls/InputBase/InputBase.tsx":U,"../../../../packages/ui/src/components/controls/InputBase/example.tsx":W,"../../../../packages/ui/src/components/controls/InputBase/meta.ts":K,"../../../../packages/ui/src/components/controls/Link/Link.tsx":G,"../../../../packages/ui/src/components/controls/Link/example.tsx":j,"../../../../packages/ui/src/components/controls/Link/meta.ts":q,"../../../../packages/ui/src/components/controls/NumberField/NumberField.tsx":Y,"../../../../packages/ui/src/components/controls/NumberField/example.tsx":X,"../../../../packages/ui/src/components/controls/NumberField/meta.ts":Z,"../../../../packages/ui/src/components/controls/SegmentedControl/SegmentedControl.tsx":J,"../../../../packages/ui/src/components/controls/SegmentedControl/example.tsx":Q,"../../../../packages/ui/src/components/controls/SegmentedControl/meta.ts":nn,"../../../../packages/ui/src/components/controls/Select/Select.tsx":en,"../../../../packages/ui/src/components/controls/Select/example.tsx":rn,"../../../../packages/ui/src/components/controls/Select/meta.ts":tn,"../../../../packages/ui/src/components/controls/Slider/Slider.tsx":on,"../../../../packages/ui/src/components/controls/Slider/example.tsx":an,"../../../../packages/ui/src/components/controls/Slider/meta.ts":sn,"../../../../packages/ui/src/components/controls/SplitButton/SplitButton.tsx":ln,"../../../../packages/ui/src/components/controls/SplitButton/example.tsx":cn,"../../../../packages/ui/src/components/controls/SplitButton/meta.ts":dn,"../../../../packages/ui/src/components/controls/Switch/Switch.tsx":pn,"../../../../packages/ui/src/components/controls/Switch/example.tsx":un,"../../../../packages/ui/src/components/controls/Switch/meta.ts":mn,"../../../../packages/ui/src/components/controls/Tab/Tab.tsx":fn,"../../../../packages/ui/src/components/controls/Tab/example.tsx":gn,"../../../../packages/ui/src/components/controls/Tab/meta.ts":hn,"../../../../packages/ui/src/components/controls/Tabs/Tabs.tsx":vn,"../../../../packages/ui/src/components/controls/Tabs/example.tsx":bn,"../../../../packages/ui/src/components/controls/Tabs/meta.ts":yn,"../../../../packages/ui/src/components/controls/TextArea/TextArea.tsx":xn,"../../../../packages/ui/src/components/controls/TextArea/example.tsx":kn,"../../../../packages/ui/src/components/controls/TextArea/meta.ts":_n,"../../../../packages/ui/src/components/controls/TextField/TextField.tsx":wn,"../../../../packages/ui/src/components/controls/TextField/example.tsx":Pn,"../../../../packages/ui/src/components/controls/TextField/meta.ts":Sn,"../../../../packages/ui/src/components/controls/ThemePicker/ThemePicker.tsx":Tn,"../../../../packages/ui/src/components/controls/ThemePicker/example.tsx":Cn,"../../../../packages/ui/src/components/controls/ThemePicker/meta.ts":Mn,"../../../../packages/ui/src/components/controls/ToggleButton/ToggleButton.tsx":Rn,"../../../../packages/ui/src/components/controls/ToggleButton/example.tsx":En,"../../../../packages/ui/src/components/controls/ToggleButton/meta.ts":An,"../../../../packages/ui/src/components/controls/internal.tsx":Bn,"../../../../packages/ui/src/components/controls/shared.tsx":In,"../../../../packages/ui/src/components/editor/PianoRoll/PianoRoll.tsx":Nn,"../../../../packages/ui/src/components/editor/PianoRoll/example.tsx":zn,"../../../../packages/ui/src/components/editor/PianoRoll/meta.ts":Ln,"../../../../packages/ui/src/components/effects/AnimatedBorder/AnimatedBorder.tsx":Dn,"../../../../packages/ui/src/components/effects/AnimatedBorder/example.tsx":Fn,"../../../../packages/ui/src/components/effects/AnimatedBorder/meta.ts":Vn,"../../../../packages/ui/src/components/effects/Beacon/Beacon.tsx":$n,"../../../../packages/ui/src/components/effects/Beacon/example.tsx":On,"../../../../packages/ui/src/components/effects/Beacon/meta.ts":Hn,"../../../../packages/ui/src/components/effects/Equalizer/Equalizer.tsx":Un,"../../../../packages/ui/src/components/effects/Equalizer/example.tsx":Wn,"../../../../packages/ui/src/components/effects/Equalizer/meta.ts":Kn,"../../../../packages/ui/src/components/effects/GlowText/GlowText.tsx":Gn,"../../../../packages/ui/src/components/effects/GlowText/example.tsx":jn,"../../../../packages/ui/src/components/effects/GlowText/meta.ts":qn,"../../../../packages/ui/src/components/effects/ImageShine/ImageShine.tsx":Yn,"../../../../packages/ui/src/components/effects/ImageShine/example.tsx":Xn,"../../../../packages/ui/src/components/effects/ImageShine/meta.ts":Zn,"../../../../packages/ui/src/components/effects/Marquee/Marquee.tsx":Jn,"../../../../packages/ui/src/components/effects/Marquee/example.tsx":Qn,"../../../../packages/ui/src/components/effects/Marquee/meta.ts":ne,"../../../../packages/ui/src/components/effects/Reveal/Reveal.tsx":ee,"../../../../packages/ui/src/components/effects/Reveal/example.tsx":re,"../../../../packages/ui/src/components/effects/Reveal/meta.ts":te,"../../../../packages/ui/src/components/effects/Shimmer/Shimmer.tsx":oe,"../../../../packages/ui/src/components/effects/Shimmer/example.tsx":ae,"../../../../packages/ui/src/components/effects/Shimmer/meta.ts":se,"../../../../packages/ui/src/components/effects/Sparkles/Sparkles.tsx":ie,"../../../../packages/ui/src/components/effects/Sparkles/example.tsx":le,"../../../../packages/ui/src/components/effects/Sparkles/meta.ts":ce,"../../../../packages/ui/src/components/effects/Spotlight/Spotlight.tsx":de,"../../../../packages/ui/src/components/effects/Spotlight/example.tsx":pe,"../../../../packages/ui/src/components/effects/Spotlight/meta.ts":ue,"../../../../packages/ui/src/components/effects/Tilt/Tilt.tsx":me,"../../../../packages/ui/src/components/effects/Tilt/example.tsx":fe,"../../../../packages/ui/src/components/effects/Tilt/meta.ts":ge,"../../../../packages/ui/src/components/feedback/Badge/Badge.tsx":he,"../../../../packages/ui/src/components/feedback/Badge/example.tsx":ve,"../../../../packages/ui/src/components/feedback/Badge/meta.ts":be,"../../../../packages/ui/src/components/feedback/CollapsibleSection/CollapsibleSection.tsx":ye,"../../../../packages/ui/src/components/feedback/CollapsibleSection/example.tsx":xe,"../../../../packages/ui/src/components/feedback/CollapsibleSection/meta.ts":ke,"../../../../packages/ui/src/components/feedback/DataTable/DataTable.tsx":_e,"../../../../packages/ui/src/components/feedback/DataTable/example.tsx":we,"../../../../packages/ui/src/components/feedback/DataTable/meta.ts":Pe,"../../../../packages/ui/src/components/feedback/Dialog/Dialog.tsx":Se,"../../../../packages/ui/src/components/feedback/Dialog/example.tsx":Te,"../../../../packages/ui/src/components/feedback/Dialog/meta.ts":Ce,"../../../../packages/ui/src/components/feedback/EmptyState/EmptyState.tsx":Me,"../../../../packages/ui/src/components/feedback/EmptyState/example.tsx":Re,"../../../../packages/ui/src/components/feedback/EmptyState/meta.ts":Ee,"../../../../packages/ui/src/components/feedback/KeyValueList/KeyValueList.tsx":Ae,"../../../../packages/ui/src/components/feedback/KeyValueList/example.tsx":Be,"../../../../packages/ui/src/components/feedback/KeyValueList/meta.ts":Ie,"../../../../packages/ui/src/components/feedback/Menu/Menu.tsx":Ne,"../../../../packages/ui/src/components/feedback/Menu/example.tsx":ze,"../../../../packages/ui/src/components/feedback/Menu/meta.ts":Le,"../../../../packages/ui/src/components/feedback/MenuItem/MenuItem.tsx":De,"../../../../packages/ui/src/components/feedback/MenuItem/example.tsx":Fe,"../../../../packages/ui/src/components/feedback/MenuItem/meta.ts":Ve,"../../../../packages/ui/src/components/feedback/MessageBar/MessageBar.tsx":$e,"../../../../packages/ui/src/components/feedback/MessageBar/example.tsx":Oe,"../../../../packages/ui/src/components/feedback/MessageBar/meta.ts":He,"../../../../packages/ui/src/components/feedback/Popover/Popover.tsx":Ue,"../../../../packages/ui/src/components/feedback/Popover/example.tsx":We,"../../../../packages/ui/src/components/feedback/Popover/meta.ts":Ke,"../../../../packages/ui/src/components/feedback/ProgressBar/ProgressBar.tsx":Ge,"../../../../packages/ui/src/components/feedback/ProgressBar/example.tsx":je,"../../../../packages/ui/src/components/feedback/ProgressBar/meta.ts":qe,"../../../../packages/ui/src/components/feedback/SignalBars/SignalBars.tsx":Ye,"../../../../packages/ui/src/components/feedback/SignalBars/example.tsx":Xe,"../../../../packages/ui/src/components/feedback/SignalBars/meta.ts":Ze,"../../../../packages/ui/src/components/feedback/StatusIndicator/StatusIndicator.tsx":Je,"../../../../packages/ui/src/components/feedback/StatusIndicator/example.tsx":Qe,"../../../../packages/ui/src/components/feedback/StatusIndicator/meta.ts":nr,"../../../../packages/ui/src/components/feedback/Steps/Steps.tsx":er,"../../../../packages/ui/src/components/feedback/Steps/example.tsx":rr,"../../../../packages/ui/src/components/feedback/Steps/meta.ts":tr,"../../../../packages/ui/src/components/feedback/Toast/Toast.tsx":or,"../../../../packages/ui/src/components/feedback/Toast/example.tsx":ar,"../../../../packages/ui/src/components/feedback/Toast/meta.ts":sr,"../../../../packages/ui/src/components/feedback/Tooltip/Tooltip.tsx":ir,"../../../../packages/ui/src/components/feedback/Tooltip/example.tsx":lr,"../../../../packages/ui/src/components/feedback/Tooltip/meta.ts":cr,"../../../../packages/ui/src/components/feedback/shared.tsx":dr,"../../../../packages/ui/src/components/forms/Form/Form.tsx":pr,"../../../../packages/ui/src/components/forms/Form/example.tsx":ur,"../../../../packages/ui/src/components/forms/Form/meta.ts":mr,"../../../../packages/ui/src/components/forms/FormFields/FormFields.tsx":fr,"../../../../packages/ui/src/components/forms/FormFields/example.tsx":gr,"../../../../packages/ui/src/components/forms/FormFields/meta.ts":hr,"../../../../packages/ui/src/components/foundation/ThemeProvider/ThemeProvider.tsx":vr,"../../../../packages/ui/src/components/foundation/ThemeProvider/example.tsx":br,"../../../../packages/ui/src/components/foundation/ThemeProvider/meta.ts":yr,"../../../../packages/ui/src/components/foundation/Typography/Typography.tsx":xr,"../../../../packages/ui/src/components/foundation/Typography/example.tsx":kr,"../../../../packages/ui/src/components/foundation/Typography/meta.ts":_r,"../../../../packages/ui/src/components/layout/Avatar/Avatar.tsx":wr,"../../../../packages/ui/src/components/layout/Avatar/HostSeal.tsx":Pr,"../../../../packages/ui/src/components/layout/Avatar/example.tsx":Sr,"../../../../packages/ui/src/components/layout/Avatar/meta.ts":Tr,"../../../../packages/ui/src/components/layout/BrandMark/BrandMark.tsx":Cr,"../../../../packages/ui/src/components/layout/BrandMark/example.tsx":Mr,"../../../../packages/ui/src/components/layout/BrandMark/meta.ts":Rr,"../../../../packages/ui/src/components/layout/ButtonGroup/ButtonGroup.tsx":Er,"../../../../packages/ui/src/components/layout/ButtonGroup/example.tsx":Ar,"../../../../packages/ui/src/components/layout/ButtonGroup/meta.ts":Br,"../../../../packages/ui/src/components/layout/Card/Card.tsx":Ir,"../../../../packages/ui/src/components/layout/Card/example.tsx":Nr,"../../../../packages/ui/src/components/layout/Card/meta.ts":zr,"../../../../packages/ui/src/components/layout/DialogActions/DialogActions.tsx":Lr,"../../../../packages/ui/src/components/layout/DialogActions/example.tsx":Dr,"../../../../packages/ui/src/components/layout/DialogActions/meta.ts":Fr,"../../../../packages/ui/src/components/layout/DialogBody/DialogBody.tsx":Vr,"../../../../packages/ui/src/components/layout/DialogBody/example.tsx":$r,"../../../../packages/ui/src/components/layout/DialogBody/meta.ts":Or,"../../../../packages/ui/src/components/layout/Divider/Divider.tsx":Hr,"../../../../packages/ui/src/components/layout/Divider/example.tsx":Ur,"../../../../packages/ui/src/components/layout/Divider/meta.ts":Wr,"../../../../packages/ui/src/components/layout/FloatingPanel/FloatingPanel.tsx":Kr,"../../../../packages/ui/src/components/layout/FloatingPanel/example.tsx":Gr,"../../../../packages/ui/src/components/layout/FloatingPanel/meta.ts":jr,"../../../../packages/ui/src/components/layout/FloatingPanel/useFloatingPanel.ts":qr,"../../../../packages/ui/src/components/layout/Grid/Grid.tsx":Yr,"../../../../packages/ui/src/components/layout/Grid/example.tsx":Xr,"../../../../packages/ui/src/components/layout/Grid/meta.ts":Zr,"../../../../packages/ui/src/components/layout/Header/Header.tsx":Jr,"../../../../packages/ui/src/components/layout/Header/example.tsx":Qr,"../../../../packages/ui/src/components/layout/Header/meta.ts":nt,"../../../../packages/ui/src/components/layout/Icon/Icon.tsx":et,"../../../../packages/ui/src/components/layout/Icon/example.tsx":rt,"../../../../packages/ui/src/components/layout/Icon/meta.ts":tt,"../../../../packages/ui/src/components/layout/Illustration/Illustration.tsx":ot,"../../../../packages/ui/src/components/layout/Illustration/example.tsx":at,"../../../../packages/ui/src/components/layout/Illustration/meta.ts":st,"../../../../packages/ui/src/components/layout/ScrollArea/ScrollArea.tsx":it,"../../../../packages/ui/src/components/layout/ScrollArea/example.tsx":lt,"../../../../packages/ui/src/components/layout/ScrollArea/meta.ts":ct,"../../../../packages/ui/src/components/layout/Stack/Stack.tsx":dt,"../../../../packages/ui/src/components/layout/Stack/example.tsx":pt,"../../../../packages/ui/src/components/layout/Stack/meta.ts":ut,"../../../../packages/ui/src/components/layout/StatTile/StatTile.tsx":mt,"../../../../packages/ui/src/components/layout/StatTile/example.tsx":ft,"../../../../packages/ui/src/components/layout/StatTile/meta.ts":gt,"../../../../packages/ui/src/components/layout/TabPanel/TabPanel.tsx":ht,"../../../../packages/ui/src/components/layout/TabPanel/example.tsx":vt,"../../../../packages/ui/src/components/layout/TabPanel/meta.ts":bt,"../../../../packages/ui/src/components/layout/Text/Text.tsx":yt,"../../../../packages/ui/src/components/layout/Text/example.tsx":xt,"../../../../packages/ui/src/components/layout/Text/meta.ts":kt,"../../../../packages/ui/src/components/layout/Toolbar/Toolbar.tsx":_t,"../../../../packages/ui/src/components/layout/Toolbar/example.tsx":wt,"../../../../packages/ui/src/components/layout/Toolbar/meta.ts":Pt,"../../../../packages/ui/src/components/layout/shared.tsx":St,"../../../../packages/ui/src/components/media/AudioPlayer/AudioPlayer.tsx":Tt,"../../../../packages/ui/src/components/media/AudioPlayer/example.tsx":Ct,"../../../../packages/ui/src/components/media/AudioPlayer/meta.ts":Mt,"../../../../packages/ui/src/components/media/KaraokeLyrics/KaraokeLyrics.tsx":Rt,"../../../../packages/ui/src/components/media/KaraokeLyrics/example.tsx":Et,"../../../../packages/ui/src/components/media/KaraokeLyrics/meta.ts":At,"../../../../packages/ui/src/components/media/LevelMeter/LevelMeter.tsx":Bt,"../../../../packages/ui/src/components/media/LevelMeter/example.tsx":It,"../../../../packages/ui/src/components/media/LevelMeter/meta.ts":Nt,"../../../../packages/ui/src/components/media/MediaCard/MediaCard.tsx":zt,"../../../../packages/ui/src/components/media/MediaCard/example.tsx":Lt,"../../../../packages/ui/src/components/media/MediaCard/meta.ts":Dt,"../../../../packages/ui/src/components/media/MelodyRoll/MelodyRoll.tsx":Ft,"../../../../packages/ui/src/components/media/MelodyRoll/example.tsx":Vt,"../../../../packages/ui/src/components/media/MelodyRoll/meta.ts":$t,"../../../../packages/ui/src/components/media/PianoKeyboard/PianoKeyboard.tsx":Ot,"../../../../packages/ui/src/components/media/PianoKeyboard/example.tsx":Ht,"../../../../packages/ui/src/components/media/PianoKeyboard/meta.ts":Ut,"../../../../packages/ui/src/components/media/RotaryKnob/RotaryKnob.tsx":Wt,"../../../../packages/ui/src/components/media/RotaryKnob/example.tsx":Kt,"../../../../packages/ui/src/components/media/RotaryKnob/meta.ts":Gt,"../../../../packages/ui/src/components/media/Sparkline/Sparkline.tsx":jt,"../../../../packages/ui/src/components/media/Sparkline/example.tsx":qt,"../../../../packages/ui/src/components/media/Sparkline/meta.ts":Yt,"../../../../packages/ui/src/components/media/WaveDecoration/WaveDecoration.tsx":Xt,"../../../../packages/ui/src/components/media/WaveDecoration/example.tsx":Zt,"../../../../packages/ui/src/components/media/WaveDecoration/meta.ts":Jt,"../../../../packages/ui/src/components/media/Waveform/Waveform.tsx":Qt,"../../../../packages/ui/src/components/media/Waveform/example.tsx":no,"../../../../packages/ui/src/components/media/Waveform/meta.ts":eo,"../../../../packages/ui/src/components/media/Waveform/useWaveformPeaks.ts":ro,"../../../../packages/ui/src/components/media/shared.tsx":to,"../../../../packages/ui/src/components/navigation/Router/Router.tsx":oo,"../../../../packages/ui/src/components/navigation/Router/example.tsx":ao,"../../../../packages/ui/src/components/navigation/Router/meta.ts":so,"../../../../packages/ui/src/core.ts":io,"../../../../packages/ui/src/core/artwork.tsx":lo,"../../../../packages/ui/src/core/base.tsx":co,"../../../../packages/ui/src/core/environment.ts":po,"../../../../packages/ui/src/core/motion-engine.d.ts":uo,"../../../../packages/ui/src/core/motion/hooks.ts":mo,"../../../../packages/ui/src/core/noise.ts":fo,"../../../../packages/ui/src/core/providers/context.ts":go,"../../../../packages/ui/src/core/responsive.ts":ho,"../../../../packages/ui/src/dev/exampleHelpers.tsx":vo,"../../../../packages/ui/src/editor.ts":bo,"../../../../packages/ui/src/forms.ts":yo,"../../../../packages/ui/src/index.ts":xo,"../../../../packages/ui/src/router.ts":ko,"../../../../packages/ui/src/theme/typography.ts":_o})),o=(n,t=`${n}.tsx`)=>l.find(([e])=>e.endsWith(`/${n}/${t}`)),wo=n=>o(n,"example.tsx")?.[1]??`// Нет example.tsx для ${n}`,Po=n=>o(n)?.[1]??"",So=n=>o(n)?.[0].replace(/^.*packages\/ui\/src\//,"src/")??"";function i(n,t){const e=n.indexOf(t);if(e<0)return"";const a=n.indexOf("{",e);if(a<0){const r=n.indexOf(";",e);return n.slice(e,r<0?n.length:r+1).trim()}let s=0;for(let r=a;r<n.length;r+=1)if(n[r]==="{"&&(s+=1),n[r]==="}"&&--s===0)return n.slice(e,r+1).trim();return n.slice(e).trim()}const To=n=>{for(const[,t]of l){const e=i(t,`export interface ${n}Props`)||i(t,`export type ${n}Props`);if(e)return e}return`// ${n} не объявляет отдельный Props-интерфейс.
// Компонент использует общие props или композицию дочерних компонентов.`};export{To as getComponentApiSource,Po as getComponentSource,So as getComponentSourcePath,wo as getExampleSource};
