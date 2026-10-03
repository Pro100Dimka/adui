const c=`import { useId, type CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface DatabaseArtProps extends CommonProps {\r
  label?: string;\r
}\r
\r
const SPARKS = [\r
  [42, 84, 1, -1],\r
  [44, 111, 1, -2.7],\r
  [132, 143, 1, -0.6],\r
  [15, 135, 0.75, -2],\r
  [64, 151, 0.8, -3],\r
  [156, 147, 0.75, -1.5],\r
];\r
\r
/** Neon database cylinder: light orbits run along its rings, sparks twinkle around it. */\r
export function DatabaseArt({ label, ...p }: DatabaseArtProps) {\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const ref = (name: string) => \`url(#\${id}-\${name})\`;\r
  const rings =\r
    "M39 83C39 106 134 106 134 83M39 108C39 132 134 132 134 108M39 133C39 155 134 155 134 133";\r
  return (\r
    <svg\r
      {...mark("DatabaseArt", p)}\r
      viewBox="0 0 170 179"\r
      fill="none"\r
      role={label ? "img" : undefined}\r
      aria-label={label}\r
      aria-hidden={!label}\r
    >\r
      <defs>\r
        <filter id={\`\${id}-bloom\`} x="-50%" y="-50%" width="200%" height="200%">\r
          <feGaussianBlur stdDeviation="3" />\r
        </filter>\r
        <linearGradient id={\`\${id}-body\`}>\r
          <stop stopColor="#9a1636" />\r
          <stop offset=".12" stopColor="#3b0313" />\r
          <stop offset=".3" stopColor="#19050d" />\r
          <stop offset=".72" stopColor="#090408" />\r
          <stop offset="1" stopColor="#5e071e" />\r
        </linearGradient>\r
        <radialGradient id={\`\${id}-top\`} cx=".3" cy=".27" r=".9">\r
          <stop stopColor="#a72649" />\r
          <stop offset=".23" stopColor="#38111d" />\r
          <stop offset=".66" stopColor="#10040a" />\r
          <stop offset="1" stopColor="#290610" />\r
        </radialGradient>\r
        <linearGradient id={\`\${id}-edge\`}>\r
          <stop stopColor="#fff1e9" />\r
          <stop offset=".16" stopColor="#ff6388" />\r
          <stop offset=".47" stopColor="#8b0730" />\r
          <stop offset=".8" stopColor="#ff285f" />\r
          <stop offset="1" stopColor="#ffabbc" />\r
        </linearGradient>\r
        <radialGradient id={\`\${id}-aura\`}>\r
          <stop stopColor="#fd1746" stopOpacity=".3" />\r
          <stop offset=".5" stopColor="#ff083c" stopOpacity=".12" />\r
          <stop offset="1" stopColor="#ff083c" stopOpacity="0" />\r
        </radialGradient>\r
        <g id={\`\${id}-spark\`}>\r
          <path d="M-7 0H7M0-8V8" stroke="#ffafbc" strokeWidth=".7" />\r
          <circle r="3.4" fill="#ff4264" filter={ref("bloom")} />\r
          <circle r="1.4" fill="#fff1eb" />\r
        </g>\r
      </defs>\r
      <ellipse\r
        cx="85"\r
        cy="120"\r
        rx="83"\r
        ry="71"\r
        fill={ref("aura")}\r
        className="ad-art-aura"\r
      />\r
      <g transform="translate(0 2)">\r
        <path\r
          d="M39 57V133C39 156 134 156 134 133V57Z"\r
          fill={ref("body")}\r
          stroke="#ff345b"\r
          strokeWidth=".75"\r
        />\r
        <path\r
          d={rings}\r
          stroke="#ff335d"\r
          strokeWidth="3.5"\r
          opacity=".7"\r
          filter={ref("bloom")}\r
        />\r
        <path d={rings} stroke={ref("edge")} strokeWidth="1.4" />\r
        <ellipse\r
          cx="86.5"\r
          cy="57"\r
          rx="47.5"\r
          ry="17"\r
          fill={ref("top")}\r
          stroke="#ff426b"\r
          strokeWidth="1.1"\r
        />\r
        <ellipse\r
          cx="86.5"\r
          cy="57"\r
          rx="47.5"\r
          ry="17"\r
          stroke="#ff2b57"\r
          strokeWidth="5"\r
          opacity=".75"\r
          filter={ref("bloom")}\r
        />\r
        <ellipse\r
          cx="86.5"\r
          cy="57"\r
          rx="42"\r
          ry="13.8"\r
          stroke={ref("edge")}\r
          strokeWidth=".5"\r
          opacity=".8"\r
        />\r
        {[81, 106, 132].map((cy) => (\r
          <ellipse\r
            key={cy}\r
            cx="86.5"\r
            cy={cy}\r
            rx="47.5"\r
            ry="17"\r
            stroke="#e4264f"\r
            strokeWidth=".7"\r
            opacity=".75"\r
          />\r
        ))}\r
        <g stroke="#ffe7ed" strokeWidth="1.45">\r
          {[57, 106, 132].map((cy, i) => (\r
            <ellipse\r
              key={cy}\r
              className="ad-art-orbit"\r
              cx="86.5"\r
              cy={cy}\r
              rx="47.5"\r
              ry="17"\r
              pathLength="100"\r
              style={{ animationDelay: \`\${-i * 1.3}s\` }}\r
            />\r
          ))}\r
        </g>\r
        <ellipse\r
          cx="86.5"\r
          cy="53.5"\r
          rx="5"\r
          ry="1.6"\r
          fill="#ff577b"\r
          filter={ref("bloom")}\r
        />\r
        <ellipse cx="86.5" cy="53.5" rx="3.4" ry=".8" fill="#ffb5c3" />\r
      </g>\r
      {SPARKS.map(([x, y, scale, delay]) => (\r
        <g\r
          key={\`\${x}-\${y}\`}\r
          className="ad-art-spark"\r
          style={{ "--ad-delay": \`\${delay}s\` } as CSSProperties}\r
        >\r
          <use\r
            href={\`#\${id}-spark\`}\r
            transform={\`translate(\${x} \${y}) scale(\${scale})\`}\r
          />\r
        </g>\r
      ))}\r
    </svg>\r
  );\r
}\r
`,p=`import { DatabaseArt } from "@ad-voice/ui";\r
\r
export default function DatabaseArtExample() {\r
  return <DatabaseArt label="Хранилище записей" />;\r
}\r
`,d=`export default {\r
  name: "DatabaseArt",\r
  description:\r
    "Неоновая база данных с бегущими орбитами и искрами — для хранилища и данных.",\r
  category: "motion",\r
} as const;\r
`,u=`import { useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { clamp01, fbm, seeded, type Painting } from "../../../core/noise";\r
import { useArtwork } from "../useArtwork";\r
\r
export interface LandscapeProps extends CommonProps {\r
  /** Darken the left side so text placed over it stays readable. */\r
  shade?: boolean;\r
}\r
\r
type Point = readonly [number, number];\r
const W = 1220;\r
const H = 168;\r
\r
const centerX = 1129,\r
  centerY = 309,\r
  radius = 346;\r
\r
/** Night nebula, a ruby-rimmed planet and two mountain ridges, painted procedurally. */\r
const landscape: Painting = {\r
  pixels(image, from, to) {\r
    const { width } = image;\r
    const scale = width / W;\r
    for (let py = from; py < to; py += 1)\r
      for (let px = 0; px < width; px += 1) {\r
        const x = px / scale,\r
          y = py / scale;\r
        const n = fbm(x * 0.012, y * 0.013 + 20),\r
          warp = fbm(x * 0.004, y * 0.005) * 70;\r
        const f = fbm(x * 0.025 + warp * 0.03, y * 0.032 + warp * 0.02);\r
        const ridge =\r
          1 - Math.abs(2 * fbm(x * 0.026 + n * 5, y * 0.034 + n * 5, 5) - 1);\r
        const threads =\r
          Math.pow(clamp01((ridge - 0.61) * 2.7), 4) *\r
          Math.pow(clamp01((f - 0.33) * 3), 1.3);\r
        const horizon = Math.exp(\r
          -(((x - 820) / 160) ** 2 + ((y - 171) / 40) ** 2),\r
        );\r
        const cloud =\r
          Math.exp(-(((x - 830) / 340) ** 2)) *\r
          (8 + 32 * n ** 2 + 95 * threads);\r
        let red = 6 + cloud + horizon * 170,\r
          green = 8 + cloud * 0.19 + horizon * 32,\r
          blue = 14 + cloud * 0.3 + horizon * 44;\r
        const dx = (x - centerX) / radius,\r
          dy = (y - centerY) / radius,\r
          radial = Math.hypot(dx, dy),\r
          edge = (1 - radial) * radius;\r
        const sideLight = clamp01(0.18 - dx * 0.98 - dy * 0.15, 0.08, 1.3);\r
        if (radial <= 1) {\r
          const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));\r
          const terrain = fbm(dx * 22 + z * 9, dy * 26 + z * 4, 6);\r
          const geology = fbm(dx * 78 + terrain * 9, dy * 82 + terrain * 7, 3);\r
          const vein =\r
            1 -\r
            Math.abs(\r
              fbm(dx * 83 + geology * 5, dy * 97 + geology * 5, 3) * 2 - 1,\r
            );\r
          const lava =\r
            Math.pow(clamp01((vein - 0.66) * 2.9), 5) *\r
            Math.pow(clamp01((terrain - 0.34) * 3.3), 1.6);\r
          const rim = Math.exp(-Math.max(0, edge) / 2.15) * sideLight;\r
          const atmosphere = Math.exp(-Math.max(0, edge) / 23) * sideLight;\r
          const face = clamp01(0.5 - dx * 0.32 - z * 0.5, 0.12, 0.6);\r
          red =\r
            7 +\r
            face * (26 + 46 * terrain) +\r
            lava * 82 +\r
            rim * 238 +\r
            atmosphere * 166;\r
          green =\r
            8 +\r
            face * (17 + 12 * terrain) +\r
            lava * 5 +\r
            rim * 202 +\r
            atmosphere * 38;\r
          blue =\r
            16 +\r
            face * (21 + 18 * terrain) +\r
            lava * 14 +\r
            rim * 211 +\r
            atmosphere * 62;\r
        } else if (radial < 1.12) {\r
          const halo = Math.exp(edge / 13) * sideLight;\r
          red += halo * 142;\r
          green += halo * 18;\r
          blue += halo * 34;\r
        }\r
        const pixel = (py * width + px) * 4;\r
        image.data[pixel] = red;\r
        image.data[pixel + 1] = green;\r
        image.data[pixel + 2] = blue;\r
        image.data[pixel + 3] = 255;\r
      }\r
  },\r
  finish(context, width) {\r
    context.save();\r
    context.scale(width / W, width / W);\r
\r
    // Stars above the ridge line.\r
    const next = seeded(840);\r
    for (let i = 0; i < 350; i += 1) {\r
      const x = 410 + next() * 810,\r
        y = next() * 168;\r
      if (Math.hypot(x - centerX, y - centerY) < radius) continue;\r
      context.fillStyle = \`rgba(255,\${55 + Math.round(next() * 68)},\${75 + Math.round(next() * 70)},\${0.1 + next() * 0.4})\`;\r
      context.beginPath();\r
      context.arc(x, y, 0.15 + next() * 0.57, 0, Math.PI * 2);\r
      context.fill();\r
    }\r
    glow(context, 828, 156, 96, "255,98,96", 0.26);\r
    glow(context, 828, 156, 38, "255,168,132", 0.4);\r
    mountain(context, FAR_RIDGE, 180, "#451320", "#ef56667a", 716);\r
    mountain(context, NEAR_RIDGE, 181, "#080a10", "#7f2635a0", 282);\r
    context.restore();\r
  },\r
};\r
\r
function glow(\r
  context: CanvasRenderingContext2D,\r
  x: number,\r
  y: number,\r
  radius: number,\r
  color: string,\r
  alpha: number,\r
) {\r
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);\r
  gradient.addColorStop(0, \`rgba(\${color},\${alpha})\`);\r
  gradient.addColorStop(1, \`rgba(\${color},0)\`);\r
  context.fillStyle = gradient;\r
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);\r
}\r
\r
function polygon(\r
  context: CanvasRenderingContext2D,\r
  points: readonly Point[],\r
  fill: string,\r
) {\r
  context.beginPath();\r
  points.forEach(([x, y], i) =>\r
    i ? context.lineTo(x, y) : context.moveTo(x, y),\r
  );\r
  context.closePath();\r
  context.fillStyle = fill;\r
  context.fill();\r
}\r
\r
/** A ridge with jittered detail, a glowing crest line and faceted slopes. */\r
function mountain(\r
  context: CanvasRenderingContext2D,\r
  points: readonly Point[],\r
  base: number,\r
  color: string,\r
  line: string,\r
  seed: number,\r
) {\r
  const rand = seeded(seed),\r
    fine: Point[] = [];\r
  for (let i = 0; i < points.length - 1; i += 1) {\r
    const [x1, y1] = points[i],\r
      [x2, y2] = points[i + 1];\r
    fine.push([x1, y1]);\r
    for (let d = 1; d <= 3; d += 1) {\r
      const t = d / 4;\r
      fine.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + (rand() - 0.5) * 6]);\r
    }\r
  }\r
  fine.push(points[points.length - 1]);\r
  polygon(context, [...fine, [W, base], [0, base]], color);\r
  context.beginPath();\r
  fine.forEach(([x, y], i) =>\r
    i ? context.lineTo(x, y) : context.moveTo(x, y),\r
  );\r
  context.strokeStyle = line;\r
  context.lineWidth = 0.8;\r
  context.stroke();\r
  for (let i = 1; i < fine.length - 1; i += 1) {\r
    const [x, y] = fine[i];\r
    if (fine[i - 1][1] < y || fine[i + 1][1] < y) continue;\r
    const foot: Point = [\r
      x + 8 + rand() * 27,\r
      Math.min(base + 8, y + 20 + rand() * 32),\r
    ];\r
    polygon(\r
      context,\r
      [fine[i - 1], [x, y], foot],\r
      \`rgba(52,33,45,\${0.12 + rand() * 0.26})\`,\r
    );\r
    context.beginPath();\r
    context.moveTo(x, y);\r
    context.lineTo(x + 5 + rand() * 8, y + 12 + rand() * 8);\r
    context.lineTo(...foot);\r
    context.strokeStyle = \`rgba(192,49,69,\${0.1 + rand() * 0.26})\`;\r
    context.lineWidth = 0.6;\r
    context.stroke();\r
  }\r
}\r
\r
const FAR_RIDGE: Point[] = [\r
  [0, 168],\r
  [410, 166],\r
  [475, 155],\r
  [518, 149],\r
  [548, 151],\r
  [582, 138],\r
  [610, 135],\r
  [650, 148],\r
  [697, 144],\r
  [725, 135],\r
  [749, 146],\r
  [768, 143],\r
  [788, 152],\r
  [825, 143],\r
  [843, 150],\r
  [868, 145],\r
  [891, 147],\r
  [918, 141],\r
  [945, 148],\r
  [989, 153],\r
  [1025, 149],\r
  [1100, 155],\r
  [1175, 144],\r
  [1220, 163],\r
];\r
const NEAR_RIDGE: Point[] = [\r
  [0, 169],\r
  [440, 168],\r
  [475, 153],\r
  [497, 151],\r
  [516, 138],\r
  [534, 123],\r
  [546, 128],\r
  [561, 114],\r
  [574, 112],\r
  [585, 100],\r
  [597, 94],\r
  [608, 96],\r
  [622, 113],\r
  [633, 113],\r
  [650, 132],\r
  [663, 121],\r
  [678, 117],\r
  [690, 129],\r
  [701, 141],\r
  [722, 145],\r
  [739, 155],\r
  [779, 158],\r
  [803, 148],\r
  [821, 153],\r
  [844, 149],\r
  [863, 145],\r
  [874, 135],\r
  [887, 129],\r
  [899, 128],\r
  [913, 140],\r
  [927, 145],\r
  [939, 144],\r
  [956, 151],\r
  [976, 154],\r
  [995, 164],\r
  [1110, 168],\r
  [1180, 152],\r
  [1202, 130],\r
  [1220, 132],\r
];\r
\r
/** Procedural night landscape with a planet; children are laid over it. */\r
export function Landscape({ shade = true, children, ...p }: LandscapeProps) {\r
  const ref = useRef<HTMLCanvasElement>(null);\r
  useArtwork(ref, "landscape", W, H, landscape);\r
  return (\r
    <div {...mark("Landscape", p)} data-shade={shade || undefined}>\r
      <canvas ref={ref} aria-hidden />\r
      <span className="ad-landscape-glow" aria-hidden />\r
      {children && <div className="ad-landscape-content">{children}</div>}\r
    </div>\r
  );\r
}\r
`,m=`import { Landscape } from "@ad-voice/ui";\r
\r
export default function LandscapeExample() {\r
  return <Landscape />;\r
}\r
`,f=`export default {\r
  name: "Landscape",\r
  description:\r
    "Процедурный ночной пейзаж: туманность, планета с рубиновой кромкой и горные хребты.",\r
  category: "motion",\r
  wide: true,\r
} as const;\r
`,g=`import { useId, useMemo, useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
import { seeded } from "../../../core/noise";\r
\r
export interface NeonWavesProps extends CommonProps {\r
  /** Number of strands in the bundle. */\r
  strands?: number;\r
  /** Scatter faint stars around the strands. */\r
  stars?: boolean;\r
  /** Shifts the wave shape, so neighbouring instances do not move in step. */\r
  phase?: number;\r
}\r
\r
const W = 600;\r
const H = 120;\r
\r
/** A bundle of neon strands that flow and twist slowly, with faint stars around them. */\r
export function NeonWaves({\r
  strands = 22,\r
  stars = true,\r
  phase = 0.9,\r
  ...p\r
}: NeonWavesProps) {\r
  const ref = useRef<SVGSVGElement>(null);\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const dots = useMemo(() => {\r
    if (!stars) return [];\r
    const next = seeded(7913 + Math.floor(phase * 713));\r
    return Array.from({ length: 60 }, () => ({\r
      x: next() * W,\r
      y: next() * H,\r
      r: 0.25 + next() * 0.55,\r
      o: 0.16 + next() * 0.42,\r
    }));\r
  }, [stars, phase]);\r
\r
  useDecoration(ref, (time) => {\r
    const paths = ref.current?.querySelectorAll("path");\r
    paths?.forEach((path, i) => {\r
      const t = i / Math.max(1, paths.length - 1);\r
      const drift = time * 0.42 + phase;\r
      const a = Math.sin(drift + t * 1.4) * H * 0.095;\r
      const b = Math.cos(drift * 0.8 + t * 1.8) * H * 0.08;\r
      const y = H * (0.38 + t * 0.58);\r
      // Most strands form the main twist; the rest run as a lower counter-current.\r
      path.setAttribute(\r
        "d",\r
        i < paths.length * 0.68\r
          ? \`M-12 \${y + a} C\${W * 0.2} \${H * 1.28 - t * H * 0.27 + a} \${W * 0.32} \${H * 0.34 + t * H * 0.21 + b} \${W * 0.46} \${H * 0.62 + t * H * 0.12} S\${W * 0.67} \${H * 1.14 - t * H * 0.09 + a} \${W * 0.8} \${H * 0.69 - t * H * 0.22 + b} S\${W * 0.94} \${H * 0.43 - t * H * 0.44 + a} \${W + 8} \${H * 0.21 + t * H * 0.45}\`\r
          : \`M-12 \${H * (0.9 + t * 0.12) + b} C\${W * 0.21} \${H * 0.98 + a} \${W * 0.33} \${H * 0.24 + t * H * 0.2 + a} \${W * 0.52} \${H * 0.75 + t * H * 0.25 + b} S\${W * 0.82} \${H * 0.38 + t * H * 0.27 + a} \${W + 8} \${H * (0.48 + t * 0.5) + b}\`,\r
      );\r
    });\r
  });\r
\r
  return (\r
    <svg\r
      {...mark("NeonWaves", p)}\r
      ref={ref}\r
      viewBox={\`0 0 \${W} \${H}\`}\r
      preserveAspectRatio="none"\r
      aria-hidden="true"\r
    >\r
      <defs>\r
        <linearGradient id={\`\${id}-strand\`}>\r
          <stop stopColor="#6d112b" stopOpacity="0" />\r
          <stop offset=".16" stopColor="#af153d" stopOpacity=".35" />\r
          <stop offset=".57" stopColor="var(--ad-red)" stopOpacity=".74" />\r
          <stop offset=".78" stopColor="var(--ad-pink)" stopOpacity=".85" />\r
          <stop offset="1" stopColor="#d91b43" stopOpacity=".44" />\r
        </linearGradient>\r
      </defs>\r
      {Array.from({ length: strands }, (_, i) => (\r
        <path\r
          key={i}\r
          fill="none"\r
          stroke={\`url(#\${id}-strand)\`}\r
          strokeWidth={i === 5 ? 1 : 0.55}\r
          opacity={i === 5 ? 0.95 : 0.52}\r
          vectorEffect="non-scaling-stroke"\r
        />\r
      ))}\r
      {dots.map((d, i) => (\r
        <circle\r
          key={i}\r
          className="ad-neon-waves-star"\r
          cx={d.x}\r
          cy={d.y}\r
          r={d.r}\r
          opacity={d.o}\r
          style={{ animationDelay: \`\${-(i % 9) * 0.45}s\` }}\r
        />\r
      ))}\r
    </svg>\r
  );\r
}\r
`,v=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function NeonWavesExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        strands: { options: ["12", "22", "34"], value: "22" },\r
        stars: { value: true },\r
      }}\r
      code={(v) =>\r
        jsx("NeonWaves", {\r
          strands: v.strands === "22" ? undefined : Number(v.strands),\r
          stars: v.stars ? undefined : { expr: "false" },\r
        })\r
      }\r
    >\r
      {(v) => <U.NeonWaves strands={Number(v.strands)} stars={v.stars} />}\r
    </Playground>\r
  );\r
}\r
`,b=`export default {\r
  name: "NeonWaves",\r
  description:\r
    "Пучок текущих неоновых нитей со звёздами — живой фон карточек и шапок.",\r
  category: "motion",\r
  wide: true,\r
} as const;\r
`,h=`import { useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { clamp01, fbm, noise, type Painting } from "../../../core/noise";\r
import { useArtwork } from "../useArtwork";\r
\r
export type PlanetProps = CommonProps;\r
\r
/** Size of the picture in its own units; it is painted at whatever resolution it is shown. */\r
const W = 515;\r
const H = 114;\r
\r
/** The rim of a dark planet rising from the bottom right, lit by a ruby atmosphere. */\r
const planet: Painting = {\r
  pixels(image, from, to) {\r
    const { width } = image;\r
    const scale = width / W,\r
      centerX = 344 * scale,\r
      centerY = 290 * scale,\r
      radius = 302 * scale;\r
    for (let y = from; y < to; y += 1)\r
      for (let x = 0; x < width; x += 1) {\r
        const dx = (x - centerX) / radius,\r
          dy = (y - centerY) / radius,\r
          radial = Math.hypot(dx, dy),\r
          edge = (1 - radial) * radius;\r
        const pixel = (y * width + x) * 4;\r
        if (radial > 1.12) continue;\r
        const light = clamp01(0.48 - dx * 0.8 - dy * 0.3, 0.08, 1.2);\r
        if (radial > 1) {\r
          const alpha = Math.exp(-(radial - 1) * 88) * 0.58 * light;\r
          image.data[pixel] = 255;\r
          image.data[pixel + 1] = 40;\r
          image.data[pixel + 2] = 82;\r
          image.data[pixel + 3] = 255 * alpha;\r
          continue;\r
        }\r
        const z = Math.sqrt(1 - dx * dx - dy * dy);\r
        const terrainNoise = fbm(dx * 18 + z * 7, dy * 21 + z * 5, 6);\r
        const crust = Math.pow(\r
          1 -\r
            Math.abs(\r
              noise(dx * 80 + 8 * terrainNoise, dy * 80 + 8 * terrainNoise) *\r
                2 -\r
                1,\r
            ),\r
          4,\r
        );\r
        const ridge = clamp01((terrainNoise - 0.38) * 5) * crust;\r
        const rim = Math.exp(-Math.max(0, edge) / (2.2 * scale)) * light;\r
        const bloom = Math.exp(-Math.max(0, edge) / (15 * scale)) * light;\r
        const shade = clamp01(0.48 - dx * 0.78 - z * 0.55, 0.07, 0.95);\r
        const terrain = (10 + 61 * ridge + 26 * terrainNoise) * shade;\r
        image.data[pixel] = terrain + rim * 239 + bloom * 75;\r
        image.data[pixel + 1] = terrain * 0.14 + rim * 165 + bloom * 8;\r
        image.data[pixel + 2] = terrain * 0.34 + rim * 183 + bloom * 25;\r
        image.data[pixel + 3] = 255;\r
      }\r
  },\r
};\r
\r
/** Planet horizon banner; children are laid over the dark side. */\r
export function Planet({ children, ...p }: PlanetProps) {\r
  const ref = useRef<HTMLCanvasElement>(null);\r
  useArtwork(ref, "planet", W, H, planet);\r
  return (\r
    <div {...mark("Planet", p)}>\r
      <canvas ref={ref} aria-hidden />\r
      {children && <div className="ad-planet-content">{children}</div>}\r
    </div>\r
  );\r
}\r
`,x=`import { Planet } from "@ad-voice/ui";\r
\r
export default function PlanetExample() {\r
  return <Planet />;\r
}\r
`,y=`export default {\r
  name: "Planet",\r
  description:\r
    "Кромка планеты в рубиновой атмосфере — фон для баннеров и слоганов.",\r
  category: "motion",\r
  wide: true,\r
} as const;\r
`,k=`import { useId } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface ServerArtProps extends CommonProps {\r
  /** Show an upload cloud above the rack (deployment scenes). */\r
  upload?: boolean;\r
  label?: string;\r
}\r
\r
/** Neon server rack: LEDs blink, a light runs along its edge, a spark twinkles above. */\r
export function ServerArt({ upload = false, label, ...p }: ServerArtProps) {\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const url = (name: string) => \`url(#\${id}-\${name})\`;\r
  return (\r
    <svg\r
      {...mark("ServerArt", p)}\r
      viewBox="0 0 180 170"\r
      fill="none"\r
      role={label ? "img" : undefined}\r
      aria-label={label}\r
      aria-hidden={!label}\r
    >\r
      <defs>\r
        <linearGradient id={\`\${id}-front\`} x1="0" y1="0" x2="1" y2="1">\r
          <stop stopColor="#592034" />\r
          <stop offset=".22" stopColor="#1b0611" />\r
          <stop offset=".72" stopColor="#0d040b" />\r
          <stop offset="1" stopColor="#360a1d" />\r
        </linearGradient>\r
        <linearGradient id={\`\${id}-side\`} x1="0" y1="0" x2=".9" y2="1">\r
          <stop stopColor="#481023" />\r
          <stop offset=".27" stopColor="#14040d" />\r
          <stop offset="1" stopColor="#020208" />\r
        </linearGradient>\r
        <linearGradient id={\`\${id}-top\`} x1="0" y1="0" x2=".7" y2="1">\r
          <stop stopColor="#ffa0c2" />\r
          <stop offset=".23" stopColor="#b1375f" />\r
          <stop offset=".57" stopColor="#481029" />\r
          <stop offset="1" stopColor="#16060f" />\r
        </linearGradient>\r
        <linearGradient id={\`\${id}-edge\`} x1="0" y1="0" x2="1" y2="1">\r
          <stop stopColor="#ffb0d3" />\r
          <stop offset=".29" stopColor="#c94367" />\r
          <stop offset=".52" stopColor="#6d1530" />\r
          <stop offset=".8" stopColor="#fc2451" />\r
          <stop offset="1" stopColor="#79213a" />\r
        </linearGradient>\r
        <radialGradient id={\`\${id}-aura\`}>\r
          <stop stopColor="#ff234d" stopOpacity=".28" />\r
          <stop offset=".6" stopColor="#ff1238" stopOpacity=".06" />\r
          <stop offset="1" stopColor="#ff1238" stopOpacity="0" />\r
        </radialGradient>\r
        <filter id={\`\${id}-bloom\`} x="-35%" y="-35%" width="170%" height="170%">\r
          <feGaussianBlur stdDeviation="2.4" />\r
        </filter>\r
      </defs>\r
      {upload && (\r
        <g className="ad-server-cloud">\r
          <path\r
            d="M57 40C37 42 40 16 58 20 63-5 96-4 102 18 120 13 132 32 117 42Z"\r
            fill="#260815"\r
            stroke="#ff7a9b"\r
            strokeOpacity=".65"\r
            strokeWidth=".7"\r
          />\r
          <path d="M80 37V18m-7 7 7-7 7 7" stroke="#ed6b91" strokeWidth="1.5" />\r
        </g>\r
      )}\r
      <g transform={upload ? "translate(0 15)" : undefined}>\r
        <ellipse\r
          cx="89"\r
          cy="124"\r
          rx="76"\r
          ry="22"\r
          fill={url("aura")}\r
          className="ad-art-aura"\r
        />\r
        <path\r
          d="M26 43 98 29 150 45 75 61Z"\r
          fill={url("top")}\r
          stroke={url("edge")}\r
          strokeWidth=".75"\r
        />\r
        <path\r
          d="M98 29 150 45 150 119 98 107Z"\r
          fill={url("side")}\r
          stroke="#741932"\r
          strokeWidth=".7"\r
        />\r
        <path\r
          d="M26 43 98 29 98 107 26 121Z"\r
          fill={url("front")}\r
          stroke={url("edge")}\r
          strokeWidth="1"\r
        />\r
        <path\r
          d="M29 46 94 33 94 105 29 117Z"\r
          fill="#0d050d"\r
          stroke="#9d3654"\r
          strokeOpacity=".45"\r
          strokeWidth=".65"\r
        />\r
        {Array.from({ length: 15 }, (_, row) => (\r
          <g key={row}>\r
            <path\r
              d={\`M33 \${50 + row * 3.35} 90 \${38.8 + row * 3.35}\`}\r
              stroke="#7e2844"\r
              strokeOpacity=".58"\r
            />\r
            {Array.from({ length: 9 }, (__, col) => (\r
              <path\r
                key={col}\r
                d={\`M\${34 + col * 6.15} \${49.8 + row * 3.35 - col * 1.205}l2.6-.51\`}\r
                stroke="#01040a"\r
                strokeWidth="1.65"\r
              />\r
            ))}\r
          </g>\r
        ))}\r
        <path\r
          d="M27 44 98 30 147 45"\r
          stroke="#ffc0d5"\r
          strokeWidth="3"\r
          opacity=".35"\r
          filter={url("bloom")}\r
        />\r
        <path d="M27 44 98 30 147 45" stroke="#ffc0d5" strokeWidth=".75" />\r
        {Array.from({ length: 8 }, (_, i) => (\r
          <g key={i}>\r
            <path\r
              d={\`M107 \${52 + i * 7.5}l34 9v4l-34-9Z\`}\r
              fill="#040309"\r
              stroke="#34101f"\r
              strokeWidth=".55"\r
            />\r
            <path\r
              d={\`M109 \${54 + i * 7.5}l3 .8\`}\r
              className="ad-server-led"\r
              strokeWidth="1.4"\r
              style={{ animationDelay: \`\${-i * 0.34}s\` }}\r
            />\r
          </g>\r
        ))}\r
        <path\r
          d="M31 108 93 96v8l-62 12Z"\r
          fill="#17050e"\r
          stroke="#5b1a2b"\r
          strokeWidth=".55"\r
        />\r
        <path d="M35 110l20-4" className="ad-server-glow" strokeWidth="1.1" />\r
        <circle cx="85" cy="103.5" r="1.5" className="ad-server-dot" />\r
        <path\r
          d="M27 43 98 29 98 107 27 121Z"\r
          pathLength="100"\r
          className="ad-server-orbit"\r
        />\r
        <path\r
          d="M26 125 98 112 150 126v14l-73 10-51-10Z"\r
          fill={url("side")}\r
          stroke="#65142f"\r
          strokeWidth=".6"\r
        />\r
        <path\r
          d="M26 125 98 112v15l-72 13Z"\r
          fill={url("front")}\r
          stroke="#9d2f4a"\r
          strokeWidth=".65"\r
        />\r
        <path\r
          d="M33 130 83 121m-50 13 41-7"\r
          stroke="#78273f"\r
          strokeWidth=".8"\r
        />\r
        <circle\r
          cx="91"\r
          cy="121.5"\r
          r="1.3"\r
          className="ad-server-dot"\r
          style={{ animationDelay: "-1.7s" }}\r
        />\r
      </g>\r
      <g className="ad-art-spark">\r
        <path d="M114 27h14m-7-10v20" stroke="#ffc6d5" strokeWidth=".65" />\r
        <circle cx="121" cy="27" r="2.6" fill="#fff6eb" />\r
      </g>\r
    </svg>\r
  );\r
}\r
`,_=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function ServerArtExample() {\r
  return (\r
    <Playground\r
      knobs={{ upload: { value: false } }}\r
      code={(v) =>\r
        jsx("ServerArt", { label: "Сервер комнат", upload: v.upload })\r
      }\r
    >\r
      {(v) => <U.ServerArt label="Сервер комнат" upload={v.upload} />}\r
    </Playground>\r
  );\r
}\r
`,P=`export default {\r
  name: "ServerArt",\r
  description:\r
    "Неоновая серверная стойка с мигающими светодиодами — для сервисов и развёртывания.",\r
  category: "motion",\r
} as const;\r
`,w=`import { useId, useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
\r
export interface SpectrumProps extends CommonProps {\r
  /** Segmented level columns, or smooth glowing bars in a bell shape. */\r
  variant?: "segmented" | "bars";\r
}\r
\r
const COLUMNS = 27;\r
const ROWS = 29;\r
const BARS = 23;\r
\r
/** A living audio spectrum used as decoration behind level and monitoring panels. */\r
export function Spectrum({ variant = "segmented", ...p }: SpectrumProps) {\r
  const ref = useRef<SVGSVGElement>(null);\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
\r
  useDecoration(ref, (time) => {\r
    const svg = ref.current;\r
    if (!svg) return;\r
    if (variant === "segmented") {\r
      // Columns rise more towards the edges, each on its own beat.\r
      svg.querySelectorAll<SVGRectElement>("[data-mask]").forEach((mask, i) => {\r
        const edge = Math.abs(i - 13) / 13;\r
        const height =\r
          12 +\r
          edge *\r
            (37 + (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.59)) ** 1.7 * 142);\r
        mask.setAttribute("y", (232 - height).toFixed(1));\r
        mask.setAttribute("height", height.toFixed(1));\r
      });\r
      return;\r
    }\r
    svg.querySelectorAll<SVGRectElement>("[data-bar]").forEach((bar, i) => {\r
      const envelope = Math.exp(-(((i - 16) / 6) ** 2));\r
      const rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);\r
      const height =\r
        9 +\r
        100 * envelope * (0.53 + 0.47 * rhythm) +\r
        15 * Math.sin(i * 0.67 + time * 0.58) ** 2;\r
      bar.setAttribute("y", (134 - height).toFixed(2));\r
      bar.setAttribute("height", height.toFixed(2));\r
    });\r
  });\r
\r
  return (\r
    <svg\r
      {...mark("Spectrum", p)}\r
      ref={ref}\r
      data-variant={variant}\r
      viewBox={variant === "segmented" ? "0 0 325 232" : "0 0 163 140"}\r
      preserveAspectRatio="none"\r
      aria-hidden="true"\r
    >\r
      {variant === "segmented" ? (\r
        <>\r
          <defs>\r
            {Array.from({ length: COLUMNS }, (_, i) => (\r
              <clipPath key={i} id={\`\${id}-c\${i}\`}>\r
                <rect data-mask x={i * 12 + 3} y="232" width="8" height="0" />\r
              </clipPath>\r
            ))}\r
          </defs>\r
          {Array.from({ length: COLUMNS }, (_, i) => (\r
            <g key={i} clipPath={\`url(#\${id}-c\${i})\`}>\r
              {Array.from({ length: ROWS }, (__, row) => (\r
                <rect\r
                  key={row}\r
                  x={i * 12 + 3}\r
                  y={224 - row * 7}\r
                  width="8"\r
                  height="5"\r
                  rx=".35"\r
                  opacity={0.17 + row / 35}\r
                />\r
              ))}\r
            </g>\r
          ))}\r
        </>\r
      ) : (\r
        <>\r
          <defs>\r
            <linearGradient id={\`\${id}-bar\`} x1="0" x2="0" y1="0" y2="1">\r
              <stop stopColor="#ffa7b9" />\r
              <stop offset=".24" stopColor="var(--ad-red)" />\r
              <stop offset="1" stopColor="#b40733" stopOpacity="0" />\r
            </linearGradient>\r
          </defs>\r
          {Array.from({ length: BARS }, (_, i) => (\r
            <rect\r
              key={i}\r
              data-bar\r
              x={4 + i * 6.75}\r
              y="40"\r
              width="2.8"\r
              height="100"\r
              rx="1.3"\r
              fill={\`url(#\${id}-bar)\`}\r
              opacity={0.55 + i / 55}\r
            />\r
          ))}\r
        </>\r
      )}\r
    </svg>\r
  );\r
}\r
`,S=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function SpectrumExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        variant: {\r
          options: ["segmented", "bars"] as const,\r
          value: "segmented",\r
        },\r
      }}\r
      code={(_, c) => jsx("Spectrum", { variant: c.variant })}\r
    >\r
      {(v) => <U.Spectrum variant={v.variant} />}\r
    </Playground>\r
  );\r
}\r
`,T=`export default {\r
  name: "Spectrum",\r
  description:\r
    "Живой спектр: сегментные колонки уровня или столбики «колоколом».",\r
  category: "motion",\r
} as const;\r
`,C=`import { useEffect, type RefObject } from "react";\r
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
    const observer = new ResizeObserver(paint);\r
    observer.observe(canvas);\r
    return () => {\r
      alive = false;\r
      observer.disconnect();\r
    };\r
  }, [ref, key, width, height, painting]);\r
}\r
`,R=`import { useRef, useState } from "react";\r
import { assignRef, useControllable } from "../../../core/base";\r
import { Popover } from "../../feedback/Popover/Popover";\r
import { FieldFrame, fieldLabel, OptionList, toOption } from "../internal";\r
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
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
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
`,M=`import {\r
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
`,F=`export default {\r
  name: "Checkbox",\r
  description: "Отметка параметра или согласия",\r
  category: "fields",\r
} as const;\r
`,L=`import { useRef, useState } from "react";\r
import { mark } from "../../../core/base";\r
import { Button } from "../Button/Button";\r
import type { FilePickerProps } from "../shared";\r
export const FilePicker = (p: FilePickerProps) => {\r
  const input = useRef<HTMLInputElement>(null),\r
    [names, setNames] = useState("");\r
  return (\r
    <div {...mark("FilePicker", p)}>\r
      <Button\r
        size={p.size}\r
        icon={p.icon ?? "folder"}\r
        onClick={() => input.current?.click()}\r
      >\r
        {p.label ?? "Выбрать файл"}\r
      </Button>\r
      <small key={names} data-picked={!!names || undefined}>\r
        {names || p.description || "Файл не выбран"}\r
      </small>\r
      <input\r
        type="file"\r
        ref={input}\r
        hidden\r
        accept={p.accept}\r
        multiple={p.multiple}\r
        onChange={(e) => {\r
          const files = Array.from(e.currentTarget.files ?? []) as File[];\r
          setNames(files.map((f) => f.name).join(", "));\r
          p.onFiles?.(files);\r
          e.currentTarget.value = "";\r
        }}\r
      />\r
    </div>\r
  );\r
};\r
`,D=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function FilePickerExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        multiple: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("FilePicker", {\r
          label: "Выбрать запись",\r
          description: "WAV, MP3 или FLAC",\r
          accept: "audio/*",\r
          multiple: v.multiple,\r
          size: c.size,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.FilePicker\r
          label="Выбрать запись"\r
          description="WAV, MP3 или FLAC"\r
          accept="audio/*"\r
          multiple={v.multiple}\r
          size={v.size}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,V=`export default {\r
  name: "FilePicker",\r
  description: "Локальный выбор файлов без отправки",\r
  category: "fields",\r
} as const;\r
`,H=`import { buttonView, type IconButtonProps } from "../shared";\r
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
`,$=`export default {\r
  name: "IconButton",\r
  description: "Компактная кнопка с одной иконкой",\r
  category: "buttons",\r
} as const;\r
`,G=`import type { MouseEventHandler, ReactNode, Ref } from "react";\r
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
      {label && <span className="ad-input-label">{label}</span>}\r
      {children}\r
    </span>\r
    {endAdornment && (\r
      <span className="ad-input-adornment" data-position="end">\r
        {endAdornment}\r
      </span>\r
    )}\r
  </div>\r
);\r
`,U=`import {\r
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
`,W=`export default {\r
  name: "InputBase",\r
  description:\r
    "Низкоуровневая база всех полей: общий material, focus, размеры и adornments.",\r
  category: "fields",\r
};\r
`,j=`import type { AnchorHTMLAttributes, ReactNode } from "react";\r
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
`,K=`import { Link, Stack } from "@ad-voice/ui";\r
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
`,J=`import { mark } from "../../../core/base";\r
import { type TabsProps } from "../shared";\r
import { Tabs } from "../Tabs/Tabs";\r
\r
export const SegmentedControl = (p: TabsProps) => (\r
  <div {...mark("SegmentedControl", p)}>\r
    <Tabs\r
      {...p}\r
      items={\r
        p.items ?? [\r
          { value: "list", label: "Список", icon: "list" },\r
          { value: "grid", label: "Плитка", icon: "grid" },\r
        ]\r
      }\r
    />\r
  </div>\r
);\r
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
`,rn=`import { useRef, useState } from "react";\r
import { assignRef, useControllable } from "../../../core/base";\r
import { Popover } from "../../feedback/Popover/Popover";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { FieldFrame, fieldLabel, OptionList, toOption } from "../internal";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { SelectProps } from "../shared";\r
\r
export const Select = (p: SelectProps) => {\r
  const floating = p.labelPlacement === "floating" && !!p.label;\r
  const options = (p.options ?? ["Первый вариант", "Второй вариант"]).map(\r
    toOption,\r
  );\r
  const [value, setValue] = useControllable(\r
    p.value,\r
    p.defaultValue ?? (p.placeholder ? "" : (options[0]?.value ?? "")),\r
    p.onValueChange,\r
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
};\r
`,en=`import {\r
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
`,pn=`export default {\r
  name: "SplitButton",\r
  description: "Основное действие и отдельное меню",\r
  category: "buttons",\r
} as const;\r
`,dn=`import { BooleanControl, type BooleanProps } from "../shared";\r
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
`,vn=`export default {\r
  name: "Tab",\r
  description: "Отдельная вкладка с состоянием выбора",\r
  category: "navigation",\r
} as const;\r
`,bn=`import { useLayoutEffect, useRef, useState } from "react";\r
import {\r
  mark,\r
  ripple,\r
  useControllable,\r
  type TokenStyle,\r
} from "../../../core/base";\r
import { type TabsProps } from "../shared";\r
import { Tab } from "../Tab/Tab";\r
\r
export const Tabs = (p: TabsProps) => {\r
  const items = p.items ?? [\r
    { value: "appearance", label: "Внешний вид", icon: "palette" },\r
    { value: "audio", label: "Аудио", icon: "audio" },\r
    { value: "advanced", label: "Дополнительно", icon: "wrench" },\r
  ];\r
  const [value, setValue] = useControllable(\r
    p.value,\r
    p.defaultValue ?? items[0]?.value ?? "",\r
    p.onValueChange,\r
  );\r
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);\r
  const selected = items.findIndex((item) => item.value === value);\r
\r
  // The blade follows the selected tab and is told when it is travelling, to squash and flare.\r
  const [place, setPlace] = useState<TokenStyle>();\r
  const [moving, setMoving] = useState(false);\r
  const first = useRef(true);\r
  useLayoutEffect(() => {\r
    const tab = buttons.current[selected];\r
    if (!tab) return setPlace(undefined);\r
    const update = () =>\r
      setPlace({\r
        "--ad-tabs-x": \`\${tab.offsetLeft}px\`,\r
        "--ad-tabs-w": \`\${tab.offsetWidth}px\`,\r
      });\r
    update();\r
    const observer = new ResizeObserver(update);\r
    observer.observe(tab);\r
    if (tab.parentElement) observer.observe(tab.parentElement);\r
    let timer = 0;\r
    if (!first.current) {\r
      setMoving(true);\r
      timer = window.setTimeout(() => setMoving(false), 420);\r
    }\r
    first.current = false;\r
    return () => {\r
      observer.disconnect();\r
      clearTimeout(timer);\r
    };\r
  }, [selected, items.length]);\r
\r
  return (\r
    <nav\r
      {...mark("Tabs", p)}\r
      role="tablist"\r
      aria-label={p.label ?? "Разделы"}\r
      data-moving={moving || undefined}\r
      onPointerDown={(e) => {\r
        const tab = (e.target as HTMLElement).closest<HTMLElement>(".ad-tab");\r
        if (tab && !tab.matches(":disabled")) ripple(tab, e.clientX, e.clientY);\r
      }}\r
      onKeyDown={(e) => {\r
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;\r
        const available = items\r
          .map((item, index) => ({ item, index }))\r
          .filter((x) => !x.item.disabled);\r
        if (!available.length) return;\r
        e.preventDefault();\r
        const current = available.findIndex(\r
          (x) => buttons.current[x.index] === document.activeElement,\r
        );\r
        const next =\r
          e.key === "Home"\r
            ? 0\r
            : e.key === "End"\r
              ? available.length - 1\r
              : (current +\r
                  (e.key === "ArrowRight" ? 1 : -1) +\r
                  available.length) %\r
                available.length;\r
        setValue(available[next].item.value);\r
        buttons.current[available[next].index]?.focus();\r
      }}\r
    >\r
      {place && (\r
        <>\r
          <span className="ad-tabs-trail" style={place} aria-hidden />\r
          <span className="ad-tabs-indicator" style={place} aria-hidden>\r
            <span className="ad-tabs-blade" />\r
          </span>\r
          <span className="ad-tabs-rail" style={place} aria-hidden />\r
        </>\r
      )}\r
      {items.map((item, index) => (\r
        <Tab\r
          key={item.value}\r
          id={item.id}\r
          ref={(n) => {\r
            buttons.current[index] = n;\r
          }}\r
          icon={item.icon}\r
          panelId={item.panelId}\r
          disabled={item.disabled}\r
          size={p.size}\r
          selected={item.value === value}\r
          onClick={() => setValue(item.value)}\r
        >\r
          {item.label}\r
        </Tab>\r
      ))}\r
    </nav>\r
  );\r
};\r
`,hn=`import { useState } from "react";\r
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
`,xn=`export default {\r
  name: "Tabs",\r
  description: "Переключение вкладок с фигурной подсветкой",\r
  category: "navigation",\r
  wide: true,\r
} as const;\r
`,yn=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel } from "../internal";\r
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
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      className={\`ad-text-area \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={textarea.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
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
          {...textarea}\r
          value={current}\r
          onChange={(e) => setCurrent(e.currentTarget.value)}\r
        />\r
      </InputBase>\r
    </FieldFrame>\r
  );\r
};\r
`,kn=`import {\r
  Playground,\r
  U,\r
  inputVariants,\r
  jsx,\r
  sizes,\r
} from "../../../dev/exampleHelpers";\r
\r
export default function TextAreaExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        variant: { options: inputVariants, value: "outlined" },\r
        size: { options: sizes, value: "md" },\r
        floating: { value: true },\r
        error: { value: false },\r
        readOnly: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("TextArea", {\r
          label: "Комментарий к записи",\r
          placeholder: "Что получилось, что исправить…",\r
          variant: c.variant,\r
          size: c.size,\r
          labelPlacement: v.floating ? "floating" : undefined,\r
          description: v.error ? undefined : "Видят только участники комнаты",\r
          error: v.error ? "Не больше 500 символов" : undefined,\r
          readOnly: v.readOnly,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.TextArea\r
          label="Комментарий к записи"\r
          placeholder="Что получилось, что исправить…"\r
          variant={v.variant}\r
          size={v.size}\r
          labelPlacement={v.floating ? "floating" : "top"}\r
          description={v.error ? undefined : "Видят только участники комнаты"}\r
          error={v.error ? "Не больше 500 символов" : undefined}\r
          readOnly={v.readOnly}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,_n=`export default {\r
  name: "TextArea",\r
  description: "Многострочный текстовый ввод с теми же adornments.",\r
  category: "fields",\r
  wide: true,\r
};\r
`,Pn=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel } from "../internal";\r
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
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      className={\`ad-text-field-shell \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={input.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
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
`,wn=`import {\r
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
`,Tn=`import { mark, useControllable, type CommonProps } from "../../../core/base";\r
import { Button } from "../Button/Button";\r
export type ThemeName = "ruby" | "light" | "green" | "violet";\r
export interface ThemePickerProps extends CommonProps {\r
  value?: ThemeName;\r
  defaultValue?: ThemeName;\r
  onValueChange?: (value: ThemeName) => void;\r
}\r
export const ThemePicker = (p: ThemePickerProps) => {\r
  const [value, setValue] = useControllable(\r
    p.value,\r
    p.defaultValue ?? "ruby",\r
    p.onValueChange,\r
  );\r
  const themes: Array<[ThemeName, string, string]> = [\r
    ["ruby", "Ruby", "#ff244c"],\r
    ["light", "Light", "#e6c98d"],\r
    ["green", "Green", "#10deae"],\r
    ["violet", "Violet", "#b680ff"],\r
  ];\r
  return (\r
    <div {...mark("ThemePicker", p)}>\r
      {themes.map(([key, name, color]) => (\r
        <Button\r
          key={key}\r
          size={p.size ?? "sm"}\r
          aria-pressed={key === value}\r
          onClick={() => setValue(key)}\r
        >\r
          <span className="ad-theme-swatch" style={{ background: color }} />\r
          {name}\r
        </Button>\r
      ))}\r
    </div>\r
  );\r
};\r
`,Cn=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function ThemePickerExample() {\r
  return (\r
    <Playground\r
      knobs={{ size: { options: sizes, value: "sm" } }}\r
      code={(_, c) =>\r
        jsx("ThemePicker", {\r
          value: { expr: "theme" },\r
          onValueChange: { expr: "setTheme" },\r
          size: c.size,\r
        })\r
      }\r
    >\r
      {(v) => <U.ThemePicker size={v.size} />}\r
    </Playground>\r
  );\r
}\r
`,Rn=`export default {\r
  name: "ThemePicker",\r
  description:\r
    "Выбор темы — это поле настройки, поэтому живёт в «Поля и ввод».",\r
  category: "fields",\r
};\r
`,Mn=`import { useControllable } from "../../../core/base";\r
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
`,Bn=`import type { ReactNode } from "react";\r
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
/** Label, control and description/error line shared by every text-like field. */\r
export function FieldFrame({\r
  className,\r
  label,\r
  required,\r
  description,\r
  error,\r
  children,\r
}: {\r
  className: string;\r
  label?: ReactNode;\r
  required?: boolean;\r
  description?: ReactNode;\r
  error?: ReactNode;\r
  children: ReactNode;\r
}) {\r
  return (\r
    <label className={\`ad-field \${className}\`}>\r
      {label && (\r
        <span className="ad-field-label">{fieldLabel(label, required)}</span>\r
      )}\r
      {children}\r
      {(description || error) && (\r
        <small className="ad-field-message" data-error={!!error || undefined}>\r
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
`,In=`import React from "react";\r
import type {\r
  ButtonHTMLAttributes,\r
  InputHTMLAttributes,\r
  ReactNode,\r
  Ref,\r
} from "react";\r
import {\r
  mark,\r
  ripple,\r
  useControllable,\r
  type CommonProps,\r
  type Variant,\r
} from "../../core/base";\r
import { Icon } from "../layout/Icon/Icon";\r
import { variantMaterial } from "./internal";\r
\r
export interface ButtonProps\r
  extends\r
    CommonProps,\r
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> {\r
  variant?: Variant;\r
  icon?: string;\r
  endIcon?: string;\r
  loading?: boolean;\r
  round?: boolean;\r
  label?: string;\r
  ref?: Ref<HTMLButtonElement>;\r
}\r
export function buttonView(p: ButtonProps, name = "Button") {\r
  const {\r
    variant = "secondary",\r
    icon,\r
    endIcon,\r
    loading,\r
    round,\r
    label,\r
    children,\r
    ref,\r
    onPointerMove,\r
    onPointerDown,\r
    onPointerLeave,\r
    ...rest\r
  } = p;\r
  const { size: _s, tone: _t, material: _m, ...dom } = rest;\r
  const trackLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {\r
    const rect = event.currentTarget.getBoundingClientRect();\r
    event.currentTarget.style.setProperty(\r
      "--ad-button-x",\r
      \`\${((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100}%\`,\r
    );\r
    event.currentTarget.style.setProperty(\r
      "--ad-button-y",\r
      \`\${((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100}%\`,\r
    );\r
    onPointerMove?.(event);\r
  };\r
  const resetLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {\r
    event.currentTarget.style.removeProperty("--ad-button-x");\r
    event.currentTarget.style.removeProperty("--ad-button-y");\r
    onPointerLeave?.(event);\r
  };\r
  const content = children ?? label;\r
  return (\r
    <button\r
      {...dom}\r
      {...mark(name, p, variantMaterial[variant])}\r
      ref={ref}\r
      type={p.type ?? "button"}\r
      disabled={p.disabled || loading}\r
      aria-busy={loading || undefined}\r
      data-ad-variant={variant}\r
      data-ad-round={round || undefined}\r
      onPointerDown={(event) => {\r
        ripple(event.currentTarget, event.clientX, event.clientY);\r
        onPointerDown?.(event);\r
      }}\r
      onPointerMove={trackLight}\r
      onPointerLeave={resetLight}\r
    >\r
      <span className="ad-button-fx" aria-hidden="true" />\r
      {loading && <span className="ad-spinner" aria-hidden="true" />}\r
      {icon && <Icon name={icon} />}{" "}\r
      {content != null && <span className="ad-button-label">{content}</span>}\r
      {endIcon && <Icon name={endIcon} />}\r
    </button>\r
  );\r
}\r
export interface IconButtonProps extends ButtonProps {\r
  label: string;\r
}\r
export interface ToggleButtonProps extends ButtonProps {\r
  checked?: boolean;\r
  defaultChecked?: boolean;\r
  onValueChange?: (value: boolean) => void;\r
}\r
export interface SplitButtonProps extends CommonProps {\r
  variant?: Variant;\r
  icon?: string;\r
  label?: string;\r
  items?: any[];\r
  onClick?: () => void;\r
  children?: ReactNode;\r
}\r
export interface TabProps extends ButtonProps {\r
  selected?: boolean;\r
  panelId?: string;\r
}\r
export interface TabItem {\r
  value: string;\r
  label: ReactNode;\r
  icon?: string;\r
  disabled?: boolean;\r
  panelId?: string;\r
  id?: string;\r
}\r
export interface TabsProps extends CommonProps {\r
  items?: TabItem[];\r
  value?: string;\r
  defaultValue?: string;\r
  onValueChange?: (value: string) => void;\r
  label?: string;\r
}\r
/** Field appearance: boxed outline, tinted fill or a single bottom line. */\r
export type InputVariant = "outlined" | "filled" | "underlined";\r
/** Label above the field, or inside it rising on focus like Material inputs. */\r
export type LabelPlacement = "top" | "floating";\r
export interface FieldProps\r
  extends\r
    CommonProps,\r
    Omit<\r
      InputHTMLAttributes<HTMLInputElement>,\r
      keyof CommonProps | "size" | "value" | "defaultValue" | "onChange"\r
    > {\r
  value?: string;\r
  defaultValue?: string;\r
  onValueChange?: (value: string) => void;\r
  startAdornment?: ReactNode;\r
  endAdornment?: ReactNode;\r
  inputRef?: Ref<HTMLInputElement>;\r
  variant?: InputVariant;\r
  labelPlacement?: LabelPlacement;\r
}\r
export interface TextFieldProps extends FieldProps {\r
  label?: ReactNode;\r
  description?: ReactNode;\r
  error?: ReactNode;\r
  clearable?: boolean;\r
  type?: InputHTMLAttributes<HTMLInputElement>["type"];\r
}\r
export interface NumberFieldProps extends Omit<\r
  TextFieldProps,\r
  "value" | "defaultValue" | "onValueChange" | "type"\r
> {\r
  value?: number | "";\r
  defaultValue?: number | "";\r
  onValueChange?: (value: number | "") => void;\r
}\r
export interface TextAreaProps\r
  extends\r
    Omit<CommonProps, "children">,\r
    Omit<\r
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,\r
      keyof CommonProps | "value" | "defaultValue" | "onChange"\r
    > {\r
  value?: string;\r
  defaultValue?: string;\r
  onValueChange?: (value: string) => void;\r
  label?: ReactNode;\r
  description?: ReactNode;\r
  error?: ReactNode;\r
  startAdornment?: ReactNode;\r
  endAdornment?: ReactNode;\r
  variant?: InputVariant;\r
  labelPlacement?: LabelPlacement;\r
}\r
export interface AutocompleteOption {\r
  value: string;\r
  label: string;\r
}\r
export interface AutocompleteProps extends TextFieldProps {\r
  options?: Array<string | AutocompleteOption>;\r
  onOptionSelect?: (value: string) => void;\r
}\r
export interface SelectOption {\r
  value: string;\r
  label: string;\r
  disabled?: boolean;\r
}\r
export interface SelectProps extends CommonProps {\r
  label?: ReactNode;\r
  description?: ReactNode;\r
  error?: ReactNode;\r
  placeholder?: string;\r
  startAdornment?: ReactNode;\r
  endAdornment?: ReactNode;\r
  options?: Array<string | SelectOption>;\r
  value?: string;\r
  defaultValue?: string;\r
  onValueChange?: (value: string) => void;\r
  icon?: string;\r
  disabled?: boolean;\r
  required?: boolean;\r
  name?: string;\r
  ref?: Ref<HTMLButtonElement>;\r
  variant?: InputVariant;\r
  labelPlacement?: LabelPlacement;\r
}\r
export interface BooleanProps extends CommonProps {\r
  checked?: boolean;\r
  defaultChecked?: boolean;\r
  onValueChange?: (value: boolean) => void;\r
  label?: ReactNode;\r
  disabled?: boolean;\r
  name?: string;\r
  required?: boolean;\r
}\r
export function BooleanControl({\r
  kind,\r
  ...p\r
}: BooleanProps & { kind: "Switch" | "Checkbox" }) {\r
  const [checked, setChecked] = useControllable(\r
    p.checked,\r
    p.defaultChecked ?? false,\r
    p.onValueChange,\r
  );\r
  return (\r
    <label {...mark(kind, p)}>\r
      <input\r
        name={p.name}\r
        type="checkbox"\r
        role={kind === "Switch" ? "switch" : undefined}\r
        checked={checked}\r
        disabled={p.disabled}\r
        required={p.required}\r
        onChange={(e) => setChecked(e.currentTarget.checked)}\r
      />\r
      <span className="ad-toggle-track" aria-hidden="true">\r
        <i />\r
      </span>\r
      <span>{p.label}</span>\r
    </label>\r
  );\r
}\r
export interface SliderProps extends CommonProps {\r
  value?: number;\r
  defaultValue?: number;\r
  min?: number;\r
  max?: number;\r
  step?: number;\r
  label?: string;\r
  disabled?: boolean;\r
  onValueChange?: (value: number) => void;\r
  ref?: Ref<HTMLInputElement>;\r
}\r
export interface FilePickerProps extends CommonProps {\r
  label?: string;\r
  description?: string;\r
  icon?: string;\r
  accept?: string;\r
  multiple?: boolean;\r
  onFiles?: (files: File[]) => void;\r
}\r
`,Nn=`import { useEffect, useRef, useState, type CSSProperties } from "react";\r
import { clamp, mark, useControllable } from "../../../core/base";\r
import { Toolbar } from "../../layout/Toolbar/Toolbar";\r
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { IconButton } from "../../controls/IconButton/IconButton";\r
import { Slider } from "../../controls/Slider/Slider";\r
import type { NoteGeometry, PianoRollGridProps } from "../shared";\r
\r
/** Geometry units: 6 per rem horizontally, 18 per pitch row vertically; one beat is 18 units. */\r
const UNIT = 6;\r
const ROW = 18;\r
const BEAT = 18;\r
const LENGTH = 252;\r
const KEYS = [\r
  "C5",\r
  "B4",\r
  "A#4",\r
  "A4",\r
  "G#4",\r
  "G4",\r
  "F#4",\r
  "F4",\r
  "E4",\r
  "D#4",\r
  "D4",\r
  "C#4",\r
];\r
const LYRICS = ["Ночь", "го", "рит", "ог", "ня", "ми"];\r
const DEFAULT_NOTES: NoteGeometry[] = [\r
  { x: 9, y: 8 * ROW, width: 30 },\r
  { x: 45, y: 5 * ROW, width: 15 },\r
  { x: 66, y: 3 * ROW, width: 30 },\r
  { x: 108, y: 5 * ROW, width: 27 },\r
  { x: 144, y: 8 * ROW, width: 33 },\r
  { x: 189, y: 10 * ROW, width: 45 },\r
];\r
\r
const rowOf = (note: NoteGeometry) =>\r
  clamp(Math.round(note.y / ROW), 0, KEYS.length - 1);\r
\r
export const PianoRollGrid = (p: PianoRollGridProps) => {\r
  const [notes, setNotes] = useControllable(p.notes, DEFAULT_NOTES, p.onChange);\r
  const [head, setHead] = useControllable(p.playhead, 100, p.onPlayheadChange);\r
  const [zoom, setZoom] = useState(1);\r
  const [playing, setPlaying] = useState(false);\r
  const [picked, setPicked] = useState<number | null>(null);\r
  const [box, setBox] = useState<{\r
    x: number;\r
    y: number;\r
    w: number;\r
    h: number;\r
  } | null>(null);\r
  const world = useRef<HTMLDivElement>(null);\r
\r
  // Playback: two beats per second, looping over the visible length.\r
  useEffect(() => {\r
    if (!playing) return;\r
    let last = performance.now();\r
    let frame = requestAnimationFrame(function tick(now) {\r
      setHead((h) => (h + ((now - last) / 1000) * BEAT * 2) % LENGTH);\r
      last = now;\r
      frame = requestAnimationFrame(tick);\r
    });\r
    return () => cancelAnimationFrame(frame);\r
  }, [playing, setHead]);\r
\r
  const rem = () =>\r
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;\r
  const toUnits = (px: number) => px / ((rem() / UNIT) * zoom);\r
\r
  const dragNote = (\r
    index: number,\r
    event: React.PointerEvent<HTMLButtonElement>,\r
  ) => {\r
    event.stopPropagation();\r
    setPicked(index);\r
    event.currentTarget.setPointerCapture(event.pointerId);\r
    const start = { x: event.clientX, y: event.clientY, note: notes[index] };\r
    const rowPx = event.currentTarget.parentElement\r
      ? event.currentTarget.parentElement.clientHeight / KEYS.length\r
      : 28;\r
    const move = (e: PointerEvent) =>\r
      setNotes((all) =>\r
        all.map((n, i) =>\r
          i === index\r
            ? {\r
                ...n,\r
                x: clamp(\r
                  start.note.x + toUnits(e.clientX - start.x),\r
                  0,\r
                  LENGTH - n.width,\r
                ),\r
                y:\r
                  clamp(\r
                    rowOf(start.note) +\r
                      Math.round((e.clientY - start.y) / rowPx),\r
                    0,\r
                    KEYS.length - 1,\r
                  ) * ROW,\r
              }\r
            : n,\r
        ),\r
      );\r
    const up = () => {\r
      window.removeEventListener("pointermove", move);\r
      window.removeEventListener("pointerup", up);\r
    };\r
    window.addEventListener("pointermove", move);\r
    window.addEventListener("pointerup", up);\r
  };\r
\r
  const startSelection = (event: React.PointerEvent<HTMLDivElement>) => {\r
    setPicked(null);\r
    if (!p.selection || !world.current) return;\r
    const r = world.current.getBoundingClientRect();\r
    const x = event.clientX - r.left;\r
    const y = event.clientY - r.top;\r
    setBox({ x, y, w: 0, h: 0 });\r
    const move = (e: PointerEvent) =>\r
      setBox({\r
        x: Math.min(x, e.clientX - r.left),\r
        y: Math.min(y, e.clientY - r.top),\r
        w: Math.abs(e.clientX - r.left - x),\r
        h: Math.abs(e.clientY - r.top - y),\r
      });\r
    const up = () => {\r
      window.removeEventListener("pointermove", move);\r
      window.removeEventListener("pointerup", up);\r
    };\r
    window.addEventListener("pointermove", move);\r
    window.addEventListener("pointerup", up);\r
  };\r
\r
  const at = (units: number) =>\r
    \`calc(\${units / UNIT}rem * var(--ad-editor-zoom))\`;\r
\r
  return (\r
    <div {...mark("PianoRollGrid", p)} data-playing={playing || undefined}>\r
      {p.showToolbar !== false && (\r
        <Toolbar>\r
          <IconButton\r
            variant="primary"\r
            round\r
            icon={playing ? "pause" : "play"}\r
            label={playing ? "Пауза" : "Воспроизвести"}\r
            onClick={() => setPlaying((v) => !v)}\r
          />\r
          <ButtonGroup>\r
            <IconButton variant="ghost" icon="undo" label="Отменить" />\r
            <IconButton variant="ghost" icon="redo" label="Повторить" />\r
          </ButtonGroup>\r
          <span className="ad-piano-roll-zoom">\r
            <Icon name="search" />\r
            <Slider\r
              size="sm"\r
              min={0.5}\r
              max={2}\r
              step={0.1}\r
              value={zoom}\r
              onValueChange={setZoom}\r
              label="Масштаб"\r
            />\r
          </span>\r
        </Toolbar>\r
      )}\r
      <div\r
        className="ad-piano-roll-stage"\r
        style={\r
          {\r
            "--ad-editor-zoom": zoom,\r
            "--ad-roll-rows": KEYS.length,\r
          } as CSSProperties\r
        }\r
      >\r
        <div className="ad-piano-roll-corner" />\r
        <div\r
          className="ad-piano-roll-ruler"\r
          onPointerDown={(e) => {\r
            const r = e.currentTarget.getBoundingClientRect();\r
            setHead(clamp(toUnits(e.clientX - r.left), 0, LENGTH));\r
          }}\r
        >\r
          {Array.from({ length: LENGTH / BEAT }, (_, i) => (\r
            <span\r
              key={i}\r
              style={{ left: at(i * BEAT) }}\r
              data-bar={i % 4 === 0 || undefined}\r
            >\r
              {i % 4 === 0 ? i / 4 + 1 : ""}\r
            </span>\r
          ))}\r
          <i className="ad-piano-roll-head-mark" style={{ left: at(head) }} />\r
        </div>\r
        <div className="ad-piano-roll-keyboard">\r
          {KEYS.map((key) => (\r
            <span key={key} data-sharp={key.includes("#") || undefined}>\r
              {key}\r
            </span>\r
          ))}\r
        </div>\r
        <div\r
          className="ad-note-world"\r
          ref={world}\r
          onPointerDown={startSelection}\r
        >\r
          {KEYS.map((key, i) => (\r
            <i\r
              key={key}\r
              className="ad-piano-roll-row"\r
              data-sharp={key.includes("#") || undefined}\r
              style={{ top: \`calc(\${i} * 100% / var(--ad-roll-rows))\` }}\r
            />\r
          ))}\r
          {notes.map((n, i) => (\r
            <button\r
              key={i}\r
              type="button"\r
              className="ad-note"\r
              aria-label={\`\${KEYS[rowOf(n)]}, \${LYRICS[i] ?? ""}\`}\r
              data-active={(head >= n.x && head <= n.x + n.width) || undefined}\r
              data-picked={picked === i || undefined}\r
              style={{\r
                left: at(n.x),\r
                width: at(n.width),\r
                top: \`calc(\${rowOf(n)} * 100% / var(--ad-roll-rows))\`,\r
              }}\r
              onPointerDown={(e) => dragNote(i, e)}\r
            />\r
          ))}\r
          {box && (\r
            <div\r
              className="ad-selection"\r
              style={{ left: box.x, top: box.y, width: box.w, height: box.h }}\r
            />\r
          )}\r
          <div className="ad-playhead" style={{ left: at(head) }} />\r
        </div>\r
        {p.showLyrics !== false && (\r
          <>\r
            <div className="ad-piano-roll-corner" />\r
            <div className="ad-lyrics-lane">\r
              {notes.map((n, i) => (\r
                <span\r
                  key={i}\r
                  style={{ left: at(n.x) }}\r
                  data-active={\r
                    (head >= n.x && head <= n.x + n.width) || undefined\r
                  }\r
                  data-sung={head > n.x + n.width || undefined}\r
                >\r
                  {LYRICS[i] ?? ""}\r
                </span>\r
              ))}\r
            </div>\r
          </>\r
        )}\r
      </div>\r
    </div>\r
  );\r
};\r
`,zn=`import { PianoRollGrid } from "@ad-voice/ui/editor";\r
\r
export default function PianoRollGridExample() {\r
  return <PianoRollGrid selection />;\r
}\r
`,Fn=`export default {
  name: "PianoRollGrid",
  description:
    "Полный сервис piano-roll: клавиатура, ruler, notes, lyrics, playhead, selection и toolbar внутри одного компонента.",
  category: "editor",
  wide: true,
};
`,Ln=`import type { CommonProps } from "../../core/base";
export interface NoteGeometry {
  x: number;
  y: number;
  width: number;
}
export interface PianoRollGridProps extends CommonProps {
  notes?: NoteGeometry[];
  onChange?: (notes: NoteGeometry[]) => void;
  selection?: boolean;
  showToolbar?: boolean;
  showLyrics?: boolean;
  playhead?: number;
  onPlayheadChange?: (x: number) => void;
}
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
`,Vn=`import { AnimatedBorder, Card, Typography } from "@ad-voice/ui";\r
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
`,Hn=`export default {\r
  name: "AnimatedBorder",\r
  description:\r
    "Анимированная неоновая обводка для любого контейнера, не только Card.",\r
  category: "motion",\r
};\r
`,On=`import type { CSSProperties } from "react";\r
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
`,$n=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
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
`,Gn=`export default {\r
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
  label?: string;\r
}\r
\r
/** "Now playing" bars that bounce at different tempos. */\r
export function Equalizer({\r
  bars = 5,\r
  playing = true,\r
  label,\r
  ...p\r
}: EqualizerProps) {\r
  return (\r
    <span\r
      {...mark("Equalizer", p)}\r
      role="img"\r
      aria-label={label ?? (playing ? "Играет" : "Пауза")}\r
      data-playing={playing || undefined}\r
    >\r
      {Array.from({ length: bars }, (_, i) => (\r
        <i\r
          key={i}\r
          style={{\r
            animationDuration: \`\${0.55 + ((i * 37) % 50) / 100}s\`,\r
            animationDelay: \`\${-((i * 53) % 70) / 100}s\`,\r
          }}\r
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
`,jn=`export default {\r
  name: "Equalizer",\r
  description: "Живые столбики «сейчас играет» для треков и комнат.",\r
  category: "motion",\r
} as const;\r
`,Kn=`import { createElement, type ElementType } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface GlowTextProps extends CommonProps {\r
  as?: ElementType;\r
  /** Flicker now and then like a neon sign. */\r
  flicker?: boolean;\r
}\r
\r
/** Neon text: a gradient flows through the letters under a soft halo. */\r
export function GlowText({\r
  as = "span",\r
  flicker = false,\r
  children,\r
  ...p\r
}: GlowTextProps) {\r
  return createElement(\r
    as,\r
    { ...mark("GlowText", p), "data-flicker": flicker || undefined },\r
    children,\r
  );\r
}\r
`,qn=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
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
`,Yn=`export default {\r
  name: "GlowText",\r
  description: "Неоновый текст с переливом и мерцанием вывески.",\r
  category: "motion",\r
} as const;\r
`,Xn=`import type { CSSProperties } from "react";\r
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
`,Zn=`import { Equalizer, Marquee, Stack, Typography } from "@ad-voice/ui";\r
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
`,Jn=`export default {\r
  name: "Marquee",\r
  description:\r
    "Бесконечная бегущая строка с затуханием краёв, пауза при наведении.",\r
  category: "motion",\r
} as const;\r
`,Qn=`import {\r
  Children,\r
  cloneElement,\r
  createElement,\r
  isValidElement,\r
  useEffect,\r
  useRef,\r
  useState,\r
  type CSSProperties,\r
  type ElementType,\r
  type ReactElement,\r
} from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface RevealProps extends CommonProps {\r
  as?: ElementType;\r
  /** How children arrive. */\r
  effect?: "rise" | "fade" | "zoom" | "blur";\r
  /** Delay between consecutive children, ms. */\r
  stagger?: number;\r
  /** Play again every time the block re-enters the viewport. */\r
  repeat?: boolean;\r
}\r
\r
/** Children arrive one after another when the block scrolls into view. */\r
export function Reveal({\r
  as = "div",\r
  effect = "rise",\r
  stagger = 90,\r
  repeat = false,\r
  style,\r
  children,\r
  ...p\r
}: RevealProps) {\r
  const ref = useRef<HTMLElement>(null);\r
  const [shown, setShown] = useState(false);\r
  useEffect(() => {\r
    const node = ref.current;\r
    if (!node) return;\r
    const observer = new IntersectionObserver(\r
      ([entry]) => {\r
        if (entry.isIntersecting) {\r
          setShown(true);\r
          if (!repeat) observer.disconnect();\r
        } else if (repeat) setShown(false);\r
      },\r
      { threshold: 0.15 },\r
    );\r
    observer.observe(node);\r
    return () => observer.disconnect();\r
  }, [repeat]);\r
  return createElement(\r
    as,\r
    {\r
      ...mark("Reveal", p),\r
      ref,\r
      style: { ...style, "--ad-reveal-stagger": \`\${stagger}ms\` },\r
      "data-effect": effect,\r
      "data-shown": shown || undefined,\r
    },\r
    // Each child learns its order so the CSS can delay it.\r
    Children.map(children, (child, index) =>\r
      isValidElement(child)\r
        ? cloneElement(child as ReactElement<{ style?: CSSProperties }>, {\r
            style: {\r
              ...(child.props as { style?: CSSProperties }).style,\r
              "--ad-reveal-i": index,\r
            } as CSSProperties,\r
          })\r
        : child,\r
    ),\r
  );\r
}\r
`,nr=`import { useEffect, useState } from "react";\r
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
`,rr=`export default {\r
  name: "Reveal",\r
  description: "Каскадное появление содержимого при прокрутке к нему.",\r
  category: "motion",\r
} as const;\r
`,er=`import { mark, type CommonProps } from "../../../core/base";\r
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
`,tr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
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
`,or=`export default {\r
  name: "Shimmer",\r
  description: "Заглушка загрузки: форма будущего контента и бегущий блик.",\r
  category: "motion",\r
} as const;\r
`,ar=`import type { CSSProperties } from "react";\r
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
`,sr=`import { Badge, Sparkles, Stack, Typography } from "@ad-voice/ui";\r
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
`,ir=`export default {\r
  name: "Sparkles",\r
  description: "Мерцающие искры вокруг значка, награды или заголовка.",\r
  category: "motion",\r
} as const;\r
`,lr=`import { createElement, type ElementType } from "react";\r
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
`,cr=`import { Card, Grid, Spotlight, Typography } from "@ad-voice/ui";\r
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
`,pr=`export default {\r
  name: "Spotlight",\r
  description: "Свет и подсветка кромки, которые следуют за курсором.",\r
  category: "motion",\r
} as const;\r
`,dr=`import { createElement, type ElementType } from "react";\r
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
`,ur=`import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
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
`,mr=`export default {\r
  name: "Tilt",\r
  description: "3D-наклон к курсору с бликом и пружинным возвратом.",\r
  category: "motion",\r
} as const;\r
`,fr=`import { mark } from "../../../core/base";\r
import { type BadgeProps } from "../shared";\r
\r
/** A tone adds a live status dot in front of the label. */\r
export const Badge = (p: BadgeProps) => (\r
  <span {...mark("Badge", p)}>\r
    {p.tone && <i className="ad-badge-dot" aria-hidden />}\r
    {p.children ?? p.label ?? "GPU"}\r
  </span>\r
);\r
`,gr=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
const tones = ["none", "success", "warning", "error", "info"] as const;\r
\r
export default function BadgeExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        tone: { options: tones, value: "success" },\r
        size: { options: sizes, value: "md" },\r
      }}\r
      code={(v, c) =>\r
        jsx(\r
          "Badge",\r
          { tone: v.tone === "none" ? undefined : v.tone, size: c.size },\r
          "Готово",\r
        )\r
      }\r
    >\r
      {(v) => (\r
        <U.Badge tone={v.tone === "none" ? undefined : v.tone} size={v.size}>\r
          Готово\r
        </U.Badge>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,vr=`export default {\r
  name: "Badge",\r
  description: "Короткая метка или роль",\r
  category: "feedback",\r
} as const;\r
`,br=`import { mark, useControllable } from "../../../core/base";\r
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
        <span>{p.title ?? "Технический JSON"}</span>\r
        <Icon name="chevron" size={18} />\r
      </summary>\r
      <div className="ad-collapse-content">\r
        {p.children ?? "Содержимое раскрывающегося раздела."}\r
      </div>\r
    </details>\r
  );\r
};\r
`,hr=`import { CollapsibleSection, KeyValueList } from "@ad-voice/ui";\r
\r
export default function CollapsibleSectionExample() {\r
  return (\r
    <CollapsibleSection title="Технические детали" icon="braces">\r
      <KeyValueList\r
        items={[\r
          ["Частота", "48 kHz"],\r
          ["Буфер", "128 сэмплов"],\r
          ["Задержка", "6.7 мс"],\r
        ]}\r
      />\r
    </CollapsibleSection>\r
  );\r
}\r
`,xr=`export default {\r
  name: "CollapsibleSection",\r
  description: "Раскрывающийся раздел",\r
  category: "feedback",\r
} as const;\r
`,yr=`import { mark } from "../../../core/base";\r
import { type DataTableProps } from "../shared";\r
\r
export const DataTable = (p: DataTableProps) => (\r
  <table {...mark("DataTable", p)}>\r
    {p.caption && <caption>{p.caption}</caption>}\r
    <thead>\r
      <tr>\r
        {(p.columns ?? ["Дата", "Событие", "Статус"]).map((name, i) => (\r
          <th key={i} scope="col">\r
            {name}\r
          </th>\r
        ))}\r
      </tr>\r
    </thead>\r
    <tbody>\r
      {(\r
        p.rows ?? [\r
          ["30.09.2026, 13:24", "AnalysisCompleted", "Готово"],\r
          ["30.09.2026, 13:23", "RecordingRegistered", "Готово"],\r
        ]\r
      ).map((row, i) => (\r
        <tr key={i}>\r
          {row.map((v, j) => (\r
            <td key={j}>{v}</td>\r
          ))}\r
        </tr>\r
      ))}\r
    </tbody>\r
  </table>\r
);\r
`,kr=`import { DataTable } from "@ad-voice/ui";\r
\r
export default function DataTableExample() {\r
  return (\r
    <DataTable\r
      caption="История обработки"\r
      columns={["Время", "Событие", "Статус"]}\r
      rows={[\r
        ["13:24", "Анализ завершён", "Готово"],\r
        ["13:23", "Запись загружена", "Готово"],\r
        ["13:21", "Выступление начато", "Готово"],\r
      ]}\r
    />\r
  );\r
}\r
`,_r=`export default {\r
  name: "DataTable",\r
  description: "Таблица истории и состояния данных",\r
  category: "feedback",\r
  wide: true,\r
} as const;\r
`,Pr=`import { useId, useLayoutEffect, useRef, useState } from "react";\r
import { mark, useControllable } from "../../../core/base";\r
import { Button } from "../../controls/Button/Button";\r
import { IconButton } from "../../controls/IconButton/IconButton";\r
import { Header } from "../../layout/Header/Header";\r
import { DialogBody } from "../../layout/DialogBody/DialogBody";\r
import { DialogActions } from "../../layout/DialogActions/DialogActions";\r
import { MessageBar } from "../MessageBar/MessageBar";\r
import type { DialogProps } from "../shared";\r
export const Dialog = (p: DialogProps) => {\r
  const [open, setOpen] = useControllable(\r
      p.open,\r
      p.defaultOpen ?? false,\r
      p.onOpenChange,\r
    ),\r
    [pending, setPending] = useState(false),\r
    [error, setError] = useState<string>();\r
  const ref = useRef<HTMLDialogElement>(null),\r
    titleId = useId(),\r
    descId = useId();\r
  useLayoutEffect(() => {\r
    const d = ref.current;\r
    if (!d) return;\r
    if (open && !d.open) d.showModal();\r
    else if (!open && d.open) d.close();\r
    return () => {\r
      if (d.open) d.close();\r
    };\r
  }, [open]);\r
  return (\r
    <dialog\r
      {...mark("Dialog", p, "dialog")}\r
      ref={ref}\r
      aria-labelledby={titleId}\r
      aria-describedby={p.description ? descId : undefined}\r
      onCancel={(e) => {\r
        e.preventDefault();\r
        if (!pending) setOpen(false);\r
      }}\r
    >\r
      <Header\r
        title={<span id={titleId}>{p.title ?? "Подтверждение"}</span>}\r
        level={2}\r
        actions={\r
          <IconButton\r
            variant="ghost"\r
            icon="close"\r
            label="Закрыть"\r
            disabled={pending}\r
            onClick={() => setOpen(false)}\r
          />\r
        }\r
      />\r
      <DialogBody>\r
        {p.description && <p id={descId}>{p.description}</p>}\r
        {p.children}\r
        {error && <MessageBar tone="error">{error}</MessageBar>}\r
      </DialogBody>\r
      <DialogActions>\r
        {p.cancelLabel !== false && (\r
          <Button disabled={pending} onClick={() => setOpen(false)}>\r
            {p.cancelLabel ?? "Отмена"}\r
          </Button>\r
        )}\r
        <Button\r
          variant={p.danger ? "danger" : "primary"}\r
          loading={pending}\r
          onClick={async () => {\r
            setPending(true);\r
            setError(undefined);\r
            try {\r
              const result = await p.onConfirm?.();\r
              if (result !== false) setOpen(false);\r
            } catch (e) {\r
              setError(\r
                e instanceof Error\r
                  ? e.message\r
                  : "Не удалось выполнить действие",\r
              );\r
            } finally {\r
              setPending(false);\r
            }\r
          }}\r
        >\r
          {p.confirmLabel ?? "Готово"}\r
        </Button>\r
      </DialogActions>\r
    </dialog>\r
  );\r
};\r
`,wr=`import { useState } from "react";\r
import { Button, Dialog } from "@ad-voice/ui";\r
\r
export default function DialogExample() {\r
  const [open, setOpen] = useState(false);\r
  return (\r
    <>\r
      <Button variant="danger" icon="trash" onClick={() => setOpen(true)}>\r
        Удалить запись\r
      </Button>\r
      <Dialog\r
        open={open}\r
        onOpenChange={setOpen}\r
        danger\r
        title="Удалить запись?"\r
        description="Файл и результаты анализа будут удалены без возможности восстановления."\r
        confirmLabel="Удалить"\r
        onConfirm={() => new Promise((done) => setTimeout(done, 800))}\r
      />\r
    </>\r
  );\r
}\r
`,Sr=`export default {\r
  name: "Dialog",\r
  description: "Модальное окно и управление фокусом",\r
  category: "layout",\r
} as const;\r
`,Tr=`import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type EmptyStateProps } from "../shared";\r
\r
export const EmptyState = (p: EmptyStateProps) => (\r
  <div {...mark("EmptyState", p)}>\r
    <Icon name={p.icon ?? "music"} size={44} />\r
    <h3>{p.title ?? "Пока нет записей"}</h3>\r
    <p>{p.description ?? "Добавьте запись, чтобы начать."}</p>\r
    {p.action}\r
  </div>\r
);\r
`,Cr=`import { Button, EmptyState } from "@ad-voice/ui";\r
\r
export default function EmptyStateExample() {\r
  return (\r
    <EmptyState\r
      icon="music"\r
      title="Пока нет записей"\r
      description="Спойте первую песню — запись появится здесь."\r
      action={\r
        <Button variant="primary" icon="plus">\r
          Новое выступление\r
        </Button>\r
      }\r
    />\r
  );\r
}\r
`,Rr=`export default {\r
  name: "EmptyState",\r
  description: "Пустой список и действие для начала",\r
  category: "feedback",\r
} as const;\r
`,Mr=`import { mark } from "../../../core/base";\r
import { type KeyValueListProps } from "../shared";\r
\r
export const KeyValueList = (p: KeyValueListProps) => (\r
  <dl {...mark("KeyValueList", p)}>\r
    {(\r
      p.items ?? [\r
        ["Python Backend", "Ready"],\r
        ["AudioService", "Running"],\r
        ["База данных", "Исправно"],\r
      ]\r
    ).map(([key, value], i) => (\r
      <div key={i}>\r
        <dt>{key}</dt>\r
        <dd>{value}</dd>\r
      </div>\r
    ))}\r
  </dl>\r
);\r
`,Er=`import { KeyValueList, StatusIndicator } from "@ad-voice/ui";\r
\r
export default function KeyValueListExample() {\r
  return (\r
    <KeyValueList\r
      items={[\r
        [\r
          "Python backend",\r
          <StatusIndicator status="success" label="Работает" />,\r
        ],\r
        ["Аудиосервис", <StatusIndicator status="processing" label="Запуск" />],\r
        ["База данных", <StatusIndicator status="success" label="Исправна" />],\r
      ]}\r
    />\r
  );\r
}\r
`,Ar=`export default {\r
  name: "KeyValueList",\r
  description: "Пары названий и значений",\r
  category: "feedback",\r
} as const;\r
`,Br=`import { Divider } from "../../layout/Divider/Divider";\r
import { Popover } from "../Popover/Popover";\r
import { MenuItem } from "../MenuItem/MenuItem";\r
import type { MenuProps } from "../shared";\r
export const Menu = (p: MenuProps) => (\r
  <Popover\r
    {...p}\r
    role="menu"\r
    className={\`ad-menu \${p.className ?? ""}\`}\r
    onKeyDown={(e) => {\r
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(e.key))\r
        return;\r
      if (e.key === "Tab") {\r
        p.onOpenChange?.(false);\r
        return;\r
      }\r
      e.preventDefault();\r
      const buttons = Array.from(\r
        e.currentTarget.querySelectorAll("button:not(:disabled)"),\r
      ) as HTMLButtonElement[];\r
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);\r
      const next =\r
        e.key === "Home"\r
          ? 0\r
          : e.key === "End"\r
            ? buttons.length - 1\r
            : (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %\r
              buttons.length;\r
      buttons[next]?.focus();\r
    }}\r
  >\r
    {(p.items ?? []).map((item, i) =>\r
      item.separator ? (\r
        <Divider key={item.id ?? String(i)} />\r
      ) : (\r
        <MenuItem\r
          key={item.id ?? String(i)}\r
          {...item}\r
          onSelect={() => {\r
            p.onOpenChange?.(false);\r
            p.anchorRef?.current?.focus();\r
            item.onSelect?.();\r
          }}\r
        />\r
      ),\r
    )}\r
  </Popover>\r
);\r
`,Ir=`import { useRef, useState } from "react";\r
import { Button, Menu } from "@ad-voice/ui";\r
\r
export default function MenuExample() {\r
  const [open, setOpen] = useState(false);\r
  const anchor = useRef<HTMLButtonElement>(null);\r
  return (\r
    <>\r
      <Button\r
        ref={anchor}\r
        icon="more"\r
        aria-haspopup="menu"\r
        aria-expanded={open}\r
        onClick={() => setOpen((v) => !v)}\r
      >\r
        Действия\r
      </Button>\r
      <Menu\r
        open={open}\r
        onOpenChange={setOpen}\r
        anchorRef={anchor}\r
        items={[\r
          { label: "Переименовать", icon: "pencil" },\r
          { label: "Скачать", icon: "download" },\r
          { separator: true },\r
          { label: "Удалить", icon: "trash", danger: true },\r
        ]}\r
      />\r
    </>\r
  );\r
}\r
`,Nr=`export default {\r
  name: "Menu",\r
  description: "Меню действий с клавиатурной навигацией",\r
  category: "navigation",\r
} as const;\r
`,zr=`import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import type { MenuItemProps } from "../shared";\r
\r
export const MenuItem = (p: MenuItemProps) => {\r
  const label = p.label ?? p.children ?? "Действие";\r
  return (\r
    <button\r
      {...mark("MenuItem", { ...p, tone: p.danger ? "error" : p.tone })}\r
      type="button"\r
      role="menuitem"\r
      disabled={p.disabled}\r
      onClick={p.onSelect}\r
    >\r
      <span className="ad-menu-item-icon" aria-hidden="true">\r
        <Icon name={p.icon ?? "more"} />\r
      </span>\r
      <span className="ad-menu-item-label">{label}</span>\r
      {p.endIcon && (\r
        <span className="ad-menu-item-end" aria-hidden="true">\r
          <Icon name={p.endIcon} />\r
        </span>\r
      )}\r
    </button>\r
  );\r
};\r
`,Fr=`import { Card, Divider, MenuItem, Stack } from "@ad-voice/ui";\r
\r
/** MenuItem is what Menu renders for each entry; use it to build a custom menu surface. */\r
export default function MenuItemExample() {\r
  return (\r
    <Card material="dialog" padding="sm">\r
      <Stack role="menu" aria-label="Действия с записью" gap={1}>\r
        <MenuItem label="Переименовать" icon="pencil" />\r
        <MenuItem label="Скачать" icon="download" />\r
        <Divider />\r
        <MenuItem label="Удалить" icon="trash" danger />\r
      </Stack>\r
    </Card>\r
  );\r
}\r
`,Lr=`export default {\r
  name: "MenuItem",\r
  description: "Действие меню, иконка и опасное состояние",\r
  category: "navigation",\r
} as const;\r
`,Dr=`import { mark, type CommonProps } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
\r
const icons = { success: "check", error: "warning", warning: "warning" };\r
\r
export const MessageBar = (p: CommonProps) => (\r
  <div\r
    {...mark("MessageBar", { ...p, tone: p.tone ?? "warning" })}\r
    role={p.tone === "error" ? "alert" : "status"}\r
  >\r
    <span className="ad-message-bar-icon" aria-hidden>\r
      <Icon name={icons[p.tone as keyof typeof icons] ?? "info"} />\r
    </span>\r
    <span className="ad-message-bar-text">\r
      {p.children ?? "Для операции нужно больше свободного места."}\r
    </span>\r
  </div>\r
);\r
`,Vr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
const tones = ["warning", "error", "success", "info"] as const;\r
const text = {\r
  warning: "Осталось меньше 1 ГБ свободного места",\r
  error: "Не удалось сохранить запись",\r
  success: "Все параметры сохранены",\r
  info: "Новая версия модели доступна",\r
};\r
\r
export default function MessageBarExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{ tone: { options: tones, value: "warning" } }}\r
      code={(v) => jsx("MessageBar", { tone: v.tone }, text[v.tone])}\r
    >\r
      {(v) => <U.MessageBar tone={v.tone}>{text[v.tone]}</U.MessageBar>}\r
    </Playground>\r
  );\r
}\r
`,Hr=`export default {\r
  name: "MessageBar",\r
  description: "Сообщение внутри карточки",\r
  category: "feedback",\r
} as const;\r
`,Or=`import { useLayoutEffect, useRef } from "react";\r
import { cssRem, mark } from "../../../core/base";\r
import { type PopoverProps } from "../shared";\r
\r
export const Popover = (p: PopoverProps) => {\r
  const ref = useRef<HTMLDivElement>(null);\r
  const change = useRef(p.onOpenChange);\r
  change.current = p.onOpenChange;\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node || !p.open) return;\r
    const position = () => {\r
      const target = p.anchorRef?.current?.getBoundingClientRect();\r
      const gap = 8;\r
      if (target && p.matchAnchorWidth)\r
        node.style.minWidth = cssRem(target.width);\r
      const r = node.getBoundingClientRect();\r
      const desired = target\r
        ? p.align === "start"\r
          ? target.left\r
          : target.right - r.width\r
        : innerWidth / 2 - r.width / 2;\r
      const left = Math.max(8, Math.min(innerWidth - r.width - 8, desired));\r
      const roomBelow = target ? innerHeight - target.bottom : innerHeight / 2;\r
      const roomAbove = target ? target.top : innerHeight / 2;\r
      const placeAbove =\r
        !!target && roomBelow < r.height + gap + 8 && roomAbove > roomBelow;\r
      const rawTop = target\r
        ? placeAbove\r
          ? target.top - r.height - gap\r
          : target.bottom + gap\r
        : innerHeight / 2 - r.height / 2;\r
      const top = Math.max(8, Math.min(innerHeight - r.height - 8, rawTop));\r
      node.style.left = cssRem(left);\r
      node.style.top = cssRem(top);\r
      node.dataset.adSide = placeAbove ? "above" : "below";\r
      if (target) {\r
        const anchorX = Math.max(\r
          24,\r
          Math.min(r.width - 24, target.left + target.width / 2 - left),\r
        );\r
        node.style.setProperty("--ad-popover-anchor-x", cssRem(anchorX));\r
      } else {\r
        node.style.removeProperty("--ad-popover-anchor-x");\r
      }\r
    };\r
    const supports = typeof node.showPopover === "function";\r
    if (supports) node.showPopover();\r
    position();\r
    if (p.autoFocus !== false)\r
      (\r
        node.querySelector<HTMLElement>(\r
          '[aria-selected="true"]:not(:disabled)',\r
        ) ??\r
        node.querySelector<HTMLElement>(\r
          'button:not(:disabled),input,[tabindex="0"]',\r
        )\r
      )?.focus();\r
    const dismiss = (e: PointerEvent) => {\r
      const path = e.composedPath();\r
      if (\r
        !path.includes(node) &&\r
        !path.includes(p.anchorRef?.current as EventTarget)\r
      )\r
        change.current?.(false);\r
    };\r
    const key = (e: KeyboardEvent) => {\r
      if (e.key === "Escape") {\r
        e.preventDefault();\r
        change.current?.(false);\r
        p.anchorRef?.current?.focus();\r
      }\r
    };\r
    document.addEventListener("pointerdown", dismiss);\r
    document.addEventListener("keydown", key);\r
    window.addEventListener("resize", position);\r
    window.addEventListener("scroll", position, true);\r
    return () => {\r
      document.removeEventListener("pointerdown", dismiss);\r
      document.removeEventListener("keydown", key);\r
      window.removeEventListener("resize", position);\r
      window.removeEventListener("scroll", position, true);\r
      if (supports && node.matches(":popover-open")) node.hidePopover();\r
    };\r
  }, [p.open, p.anchorRef]);\r
  if (!p.open) return null;\r
  return (\r
    <div\r
      {...mark("Popover", p, "dialog")}\r
      ref={ref}\r
      role={p.role ?? "dialog"}\r
      aria-label={p.label}\r
      popover="manual"\r
      onKeyDown={p.onKeyDown}\r
      style={{ margin: 0, position: "fixed", ...p.style }}\r
    >\r
      {p.children}\r
    </div>\r
  );\r
};\r
`,$r=`import { useRef, useState } from "react";\r
import { Button, Popover, Slider, Stack, Typography } from "@ad-voice/ui";\r
\r
export default function PopoverExample() {\r
  const [open, setOpen] = useState(false);\r
  const [volume, setVolume] = useState(65);\r
  const anchor = useRef<HTMLButtonElement>(null);\r
  return (\r
    <>\r
      <Button ref={anchor} icon="volume" onClick={() => setOpen((v) => !v)}>\r
        Громкость {volume}%\r
      </Button>\r
      <Popover\r
        open={open}\r
        onOpenChange={setOpen}\r
        anchorRef={anchor}\r
        label="Громкость"\r
      >\r
        <Stack gap={2}>\r
          <Typography variant="label">Громкость</Typography>\r
          <Slider value={volume} onValueChange={setVolume} label="Громкость" />\r
        </Stack>\r
      </Popover>\r
    </>\r
  );\r
}\r
`,Gr=`export default {\r
  name: "Popover",\r
  description: "Привязанная всплывающая поверхность",\r
  category: "navigation",\r
} as const;\r
`,Ur=`import { clamp, mark } from "../../../core/base";\r
import { type ProgressBarProps } from "../shared";\r
\r
export const ProgressBar = (p: ProgressBarProps) => {\r
  const max = Math.max(0.0001, p.max ?? 100);\r
  const value = clamp(p.value ?? 56, 0, max);\r
  return (\r
    <div\r
      {...mark("ProgressBar", p)}\r
      role="progressbar"\r
      aria-label={p.label ?? "Прогресс"}\r
      aria-valuemin={0}\r
      aria-valuemax={max}\r
      aria-valuenow={p.indeterminate ? undefined : value}\r
      data-indeterminate={p.indeterminate || undefined}\r
    >\r
      <span\r
        style={{ width: p.indeterminate ? "35%" : \`\${(value / max) * 100}%\` }}\r
      />\r
    </div>\r
  );\r
};\r
`,Wr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
export default function ProgressBarExample() {\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{\r
        value: { options: ["0", "35", "70", "100"], value: "35" },\r
        indeterminate: { value: false },\r
      }}\r
      code={(v) =>\r
        jsx("ProgressBar", {\r
          label: "Обработка записи",\r
          value: v.indeterminate ? undefined : Number(v.value),\r
          indeterminate: v.indeterminate,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.Stack gap={2}>\r
          <U.Stack direction="row" justify="between">\r
            <U.Typography variant="label">Обработка записи</U.Typography>\r
            <U.Typography variant="mono" tone="muted">\r
              {v.indeterminate ? "…" : \`\${v.value}%\`}\r
            </U.Typography>\r
          </U.Stack>\r
          <U.ProgressBar\r
            label="Обработка записи"\r
            value={Number(v.value)}\r
            indeterminate={v.indeterminate}\r
          />\r
        </U.Stack>\r
      )}\r
    </Playground>\r
  );\r
}\r
`,jr=`export default {\r
  name: "ProgressBar",\r
  description: "Отображение выполнения операции",\r
  category: "feedback",\r
} as const;\r
`,Kr=`import { mark, type Tone } from "../../../core/base";\r
import type { StatusIndicatorProps } from "../shared";\r
export const StatusIndicator = ({\r
  status = "success",\r
  ...p\r
}: StatusIndicatorProps) => {\r
  const labels: Record<Tone, string> = {\r
    success: "Готово",\r
    error: "Ошибка",\r
    warning: "Внимание",\r
    processing: "Обработка",\r
    pending: "В очереди",\r
    offline: "Не подключено",\r
    info: "Информация",\r
  };\r
  return (\r
    <span {...mark("StatusIndicator", { ...p, tone: status })}>\r
      <span className="ad-status-dot" aria-hidden>\r
        <i />\r
      </span>\r
      <span>{p.label ?? labels[status]}</span>\r
    </span>\r
  );\r
};\r
`,qr=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
\r
const statuses = [\r
  "success",\r
  "processing",\r
  "pending",\r
  "warning",\r
  "error",\r
  "offline",\r
  "info",\r
] as const;\r
\r
export default function StatusIndicatorExample() {\r
  return (\r
    <Playground\r
      knobs={{ status: { options: statuses, value: "processing" } }}\r
      code={(v) => jsx("StatusIndicator", { status: v.status })}\r
    >\r
      {(v) => <U.StatusIndicator status={v.status} />}\r
    </Playground>\r
  );\r
}\r
`,Yr=`export default {\r
  name: "StatusIndicator",\r
  description: "Готовность, обработка, очередь и ошибка",\r
  category: "feedback",\r
} as const;\r
`,Xr=`import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type StepsProps } from "../shared";\r
\r
export const Steps = (p: StepsProps) => {\r
  const steps = p.steps ?? [\r
    "Подготовка",\r
    "Анализ",\r
    "Модель",\r
    "Обработка",\r
    "Проверка",\r
  ];\r
  const current = p.current ?? 3;\r
  return (\r
    <ol {...mark("Steps", p)}>\r
      {steps.map((label, i) => {\r
        const state = i < current ? "done" : i === current ? "current" : "todo";\r
        return (\r
          <li\r
            key={\`\${i}-\${label}\`}\r
            data-state={state}\r
            aria-current={state === "current" ? "step" : undefined}\r
          >\r
            <span className="ad-step-node" aria-hidden>\r
              {state === "done" ? <Icon name="check" /> : i + 1}\r
            </span>\r
            <span className="ad-step-label">{label}</span>\r
          </li>\r
        );\r
      })}\r
    </ol>\r
  );\r
};\r
`,Zr=`import { Steps } from "@ad-voice/ui";\r
\r
export default function StepsExample() {\r
  return (\r
    <Steps\r
      steps={["Загрузка", "Анализ", "Модель", "Обработка", "Готово"]}\r
      current={2}\r
    />\r
  );\r
}\r
`,Jr=`export default {\r
  name: "Steps",\r
  description: "Этапы с завершённым, активным и ожидающим состояниями",\r
  category: "feedback",\r
  wide: true,\r
} as const;\r
`,Qr=`import { useEffect, useRef } from "react";\r
import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type ToastProps } from "../shared";\r
\r
export const Toast = ({\r
  open = true,\r
  duration = 3600,\r
  onClose,\r
  ...p\r
}: ToastProps) => {\r
  const close = useRef(onClose);\r
  close.current = onClose;\r
  useEffect(() => {\r
    if (!open || !onClose || duration <= 0) return;\r
    const id = window.setTimeout(() => close.current?.(), duration);\r
    return () => clearTimeout(id);\r
  }, [open, duration, !!onClose]);\r
  if (!open) return null;\r
  return (\r
    <div\r
      {...mark(\r
        "Toast",\r
        { ...p, tone: p.tone ?? "success" },\r
        "dialog",\r
        p.floating ? "ad-toast-floating" : undefined,\r
      )}\r
      role={p.tone === "error" ? "alert" : "status"}\r
      aria-live={p.tone === "error" ? "assertive" : "polite"}\r
    >\r
      <span className="ad-toast-icon" aria-hidden>\r
        <Icon\r
          name={\r
            p.tone === "error" || p.tone === "warning"\r
              ? "warning"\r
              : p.tone === "info"\r
                ? "info"\r
                : "check"\r
          }\r
        />\r
      </span>\r
      <span>{p.message ?? p.children ?? "Настройки сохранены"}</span>\r
      {onClose && duration > 0 && (\r
        <span\r
          className="ad-toast-timer"\r
          style={{ animationDuration: \`\${duration}ms\` }}\r
          aria-hidden\r
        />\r
      )}\r
    </div>\r
  );\r
};\r
`,ne=`import { useState } from "react";\r
import { Button, Toast } from "@ad-voice/ui";\r
\r
export default function ToastExample() {\r
  const [open, setOpen] = useState(false);\r
  return (\r
    <>\r
      <Button icon="save" onClick={() => setOpen(true)}>\r
        Сохранить\r
      </Button>\r
      <Toast\r
        floating\r
        open={open}\r
        message="Настройки сохранены"\r
        onClose={() => setOpen(false)}\r
      />\r
    </>\r
  );\r
}\r
`,re=`export default {\r
  name: "Toast",\r
  description: "Короткое уведомление без изменения разметки",\r
  category: "feedback",\r
} as const;\r
`,ee=`import type { ReactNode, RefObject, KeyboardEventHandler } from "react";\r
import type { CommonProps, Tone } from "../../core/base";\r
export interface DialogProps extends CommonProps {\r
  open?: boolean;\r
  defaultOpen?: boolean;\r
  onOpenChange?: (open: boolean) => void;\r
  title?: ReactNode;\r
  description?: ReactNode;\r
  confirmLabel?: string;\r
  cancelLabel?: string | false;\r
  danger?: boolean;\r
  onConfirm?: () => boolean | void | Promise<boolean | void>;\r
}\r
export interface PopoverProps extends CommonProps {\r
  open?: boolean;\r
  onOpenChange?: (open: boolean) => void;\r
  anchorRef?: RefObject<HTMLElement | null>;\r
  label?: string;\r
  role?: "dialog" | "menu" | "listbox";\r
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;\r
  align?: "start" | "end";\r
  matchAnchorWidth?: boolean;\r
  /** Move focus into the popover when it opens (default). Off for comboboxes that keep typing focus. */\r
  autoFocus?: boolean;\r
}\r
export interface MenuItemData {\r
  id?: string;\r
  label?: string;\r
  icon?: string;\r
  endIcon?: string;\r
  disabled?: boolean;\r
  danger?: boolean;\r
  separator?: boolean;\r
  onSelect?: () => void;\r
}\r
export interface MenuItemProps extends CommonProps, MenuItemData {}\r
export interface MenuProps extends PopoverProps {\r
  items?: MenuItemData[];\r
}\r
export interface ToastProps extends CommonProps {\r
  message?: ReactNode;\r
  open?: boolean;\r
  duration?: number;\r
  onClose?: () => void;\r
  floating?: boolean;\r
}\r
export interface BadgeProps extends CommonProps {\r
  label?: string;\r
}\r
export interface StatusIndicatorProps extends CommonProps {\r
  status?: Tone;\r
  label?: ReactNode;\r
}\r
export interface ProgressBarProps extends CommonProps {\r
  value?: number;\r
  max?: number;\r
  label?: string;\r
  indeterminate?: boolean;\r
}\r
export interface StepsProps extends CommonProps {\r
  steps?: string[];\r
  current?: number;\r
}\r
export interface EmptyStateProps extends CommonProps {\r
  title?: string;\r
  description?: string;\r
  icon?: string;\r
  action?: ReactNode;\r
}\r
export interface KeyValueListProps extends CommonProps {\r
  items?: Array<[ReactNode, ReactNode]>;\r
}\r
export interface DataTableProps extends CommonProps {\r
  columns?: string[];\r
  rows?: ReactNode[][];\r
  caption?: string;\r
}\r
export interface CollapsibleSectionProps extends CommonProps {\r
  title?: string;\r
  icon?: string;\r
  open?: boolean;\r
  defaultOpen?: boolean;\r
  onOpenChange?: (open: boolean) => void;\r
}\r
`,te=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useMemo,\r
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
    initialKey = JSON.stringify(options.initialValues);\r
  useEffect(() => {\r
    if (options.reinitialize !== false) {\r
      setValues(options.initialValues);\r
      setErrors({});\r
      setTouchedState({});\r
    }\r
  }, [initialKey, options.reinitialize]);\r
  const validate = async (next = values) => {\r
    const result = (await options.validate?.(next)) ?? {};\r
    setErrors(result);\r
    return result;\r
  };\r
  const api = useMemo(\r
    () =>\r
      ({\r
        values,\r
        errors,\r
        touched,\r
        submitting,\r
        setValue: (path: string, value: unknown) => {\r
          const next = setPath(values, path, value);\r
          setValues(next);\r
          if (options.validateOnChange) void validate(next);\r
        },\r
        setTouched: (path: string, state = true) => {\r
          setTouchedState((current) => ({ ...current, [path]: state }));\r
          if (state && options.validateOnBlur !== false) void validate();\r
        },\r
        reset: (next = options.initialValues) => {\r
          setValues(next);\r
          setErrors({});\r
          setTouchedState({});\r
        },\r
        submit: async () => {\r
          const result = await validate();\r
          if (Object.values(result).some(Boolean)) return false;\r
          setSubmitting(true);\r
          try {\r
            await options.onSubmit?.(values, api as FormApi<T>);\r
            return true;\r
          } finally {\r
            setSubmitting(false);\r
          }\r
        },\r
        field: (path: string) => ({\r
          value: getPath(values, path),\r
          error: getPath(errors, path),\r
          touched: !!touched[path],\r
          onValueChange: (value: unknown) => api.setValue(path, value),\r
          onBlur: () => api.setTouched(path),\r
        }),\r
      }) as FormApi<T>,\r
    [values, errors, touched, submitting, options],\r
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
`,oe=`import { Button, Stack, TextField } from "@ad-voice/ui";\r
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
`,ae=`export default {\r
  name: "Form",\r
  description:\r
    "Typed form state, validation, submit and field bindings without coupling controls to Formik.",\r
  category: "fields",\r
};\r
`,se=`import { type ComponentType, type ReactNode } from "react";\r
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
`,ie=`import { Button, Stack } from "@ad-voice/ui";\r
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
`,le=`export default {\r
  name: "FormFields",\r
  description:\r
    "Declarative field schema renderer with registry, conditional visibility and responsive Grid spans.",\r
  category: "fields",\r
  wide: true,\r
};\r
`,ce=`import { type CommonProps, type TokenStyle } from "../../../core/base";\r
export interface ThemeProviderProps extends CommonProps {\r
  theme?: "ruby" | "green" | "violet" | "light";\r
  accent?: string;\r
  tokens?: Record<string, string>;\r
}\r
export const ThemeProvider = ({\r
  theme = "ruby",\r
  accent,\r
  tokens = {},\r
  style,\r
  children,\r
  id,\r
  className,\r
}: ThemeProviderProps) => {\r
  const vars: TokenStyle = { ...style };\r
  for (const [key, value] of Object.entries(tokens))\r
    vars[(key.startsWith("--") ? key : \`--ad-\${key}\`) as \`--\${string}\`] = value;\r
  if (accent) {\r
    vars["--ad-red"] = accent;\r
    vars["--ad-pink"] = accent;\r
  }\r
  return (\r
    <div\r
      id={id}\r
      className={\`ad-theme \${className ?? ""}\`}\r
      style={vars}\r
      data-ad-component="ThemeProvider"\r
      data-ad-theme={theme}\r
    >\r
      {children}\r
    </div>\r
  );\r
};\r
`,pe=`import { useState } from "react";\r
import {\r
  Button,\r
  Card,\r
  Stack,\r
  TextField,\r
  ThemePicker,\r
  ThemeProvider,\r
} from "@ad-voice/ui";\r
\r
type Theme = "ruby" | "light" | "green" | "violet";\r
\r
export default function ThemeProviderExample() {\r
  const [theme, setTheme] = useState<Theme>("ruby");\r
  return (\r
    <ThemeProvider theme={theme}>\r
      <Stack gap={4}>\r
        <ThemePicker value={theme} onValueChange={setTheme} />\r
        <Card material="glass" title="Предпросмотр темы">\r
          <Stack direction={{ base: "column", sm: "row" }} gap={2}>\r
            <TextField placeholder="Поле ввода" />\r
            <Button variant="primary">Применить</Button>\r
          </Stack>\r
        </Card>\r
      </Stack>\r
    </ThemeProvider>\r
  );\r
}\r
`,de=`export default {
  name: "ThemeProvider",
  description:
    "Тема и цветовые токены; находится рядом с типографикой как часть foundation.",
  category: "typography",
  wide: true,
};
`,ue=`import { createElement } from "react";\r
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
  children,\r
  style,\r
  ...props\r
}: TypographyProps) {\r
  return createElement(\r
    as ?? defaultElement[variant],\r
    {\r
      ...mark("Typography", props),\r
      "data-ad-variant": variant,\r
      "data-ad-tone": tone,\r
      "data-ad-weight": weight,\r
      "data-ad-truncate": truncate || undefined,\r
      style: { ...style, textAlign: align },\r
    },\r
    children ?? text,\r
  );\r
}\r
`,me=`import { Grid, Stack, Typography } from "@ad-voice/ui";\r
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
`,fe=`export default {\r
  name: "Typography",\r
  description:\r
    "Единая шкала шрифтов, заголовков, подписей, цветов и весов текста",\r
  category: "typography",\r
  wide: true,\r
} as const;\r
`,ge=`import { mark } from "../../../core/base";\r
import { type AvatarProps } from "../shared";\r
import { HostSeal } from "./HostSeal";\r
\r
export const Avatar = ({ variant = "initials", ...p }: AvatarProps) => (\r
  <div\r
    {...mark("Avatar", p, "tile")}\r
    data-variant={variant}\r
    role="img"\r
    aria-label={p.name ?? "Пользователь"}\r
  >\r
    {variant === "host" ? (\r
      <HostSeal />\r
    ) : (\r
      (p.name ?? "Дмитрий").trim().slice(0, 1).toUpperCase()\r
    )}\r
  </div>\r
);\r
`,ve=`import { useRef } from "react";\r
import { SvgAsset } from "../../../core/artwork";\r
import { useDecoration } from "../../../core/motion/hooks";\r
import { illustrations } from "../shared";\r
\r
/** The host's neon seal: a crown inside two counter-rotating rings of light. */\r
export function HostSeal() {\r
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
  return (\r
    <span ref={ref} className="ad-host-seal" aria-hidden="true">\r
      <SvgAsset node={illustrations.host} />\r
    </span>\r
  );\r
}\r
`,be=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
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
`,he=`export default {\r
  name: "Avatar",\r
  description: "Инициалы в неоновом кольце или анимированная печать ведущего с короной",\r
  category: "typography",\r
} as const;\r
`,xe=`import { mark, type CommonProps } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { illustrations } from "../shared";\r
\r
export const BrandMark = (p: CommonProps) => (\r
  <div {...mark("BrandMark", p)}>\r
    <SvgAsset node={illustrations.brand} />\r
    <small>KARAOKE STUDIO</small>\r
  </div>\r
);\r
`,ye=`import { BrandMark } from "@ad-voice/ui";\r
\r
export default function BrandMarkExample() {\r
  return <BrandMark />;\r
}\r
`,ke=`export default {\r
  name: "BrandMark",\r
  description: "Фирменная надпись и подпись студии",\r
  category: "typography",\r
} as const;\r
`,_e=`import { part } from "../../../core/base";\r
\r
export const ButtonGroup = part("ButtonGroup", "div");\r
`,Pe=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";\r
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
`,we=`export default {\r
  name: "ButtonGroup",\r
  description: "Согласованная группа кнопок",\r
  category: "buttons",\r
} as const;\r
`,Se=`import React, { createElement, useRef } from "react";\r
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
`,Te=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
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
`,Ce=`export default {
  name: "Card",
  description:
    "Единая поверхность: card/glass/ruby/tile/shell через material и анимированная рамка через border.",
  category: "layout",
  wide: true,
};
`,Re=`import { part } from "../../../core/base";\r
\r
export const DialogActions = part("DialogActions", "footer");\r
`,Me=`import { Button, DialogActions } from "@ad-voice/ui";\r
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
`,Ee=`export default {\r
  name: "DialogActions",\r
  description: "Группа действий внизу диалога",\r
  category: "layout",\r
} as const;\r
`,Ae=`import { part } from "../../../core/base";\r
\r
export const DialogBody = part("DialogBody", "div");\r
`,Be=`import { DialogBody, TextField } from "@ad-voice/ui";\r
\r
/** Content area of a dialog with the standard spacing. */\r
export default function DialogBodyExample() {\r
  return (\r
    <DialogBody>\r
      <TextField label="Название записи" defaultValue="Ночь горит огнями" />\r
    </DialogBody>\r
  );\r
}\r
`,Ie=`export default {\r
  name: "DialogBody",\r
  description: "Область содержимого диалога",\r
  category: "layout",\r
} as const;\r
`,Ne=`import { mark } from "../../../core/base";\r
import { type DividerProps } from "../shared";\r
\r
export const Divider = (p: DividerProps) => (\r
  <div\r
    {...mark("Divider", p)}\r
    role="separator"\r
    aria-orientation={p.vertical ? "vertical" : "horizontal"}\r
  />\r
);\r
`,ze=`import { Divider, Stack, Typography } from "@ad-voice/ui";\r
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
`,Fe=`export default {\r
  name: "Divider",\r
  description: "Разделитель по горизонтали или вертикали",\r
  category: "layout",\r
} as const;\r
`,Le=`import type { ElementType, HTMLAttributes } from "react";
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
`,De=`import { Card, Grid } from "@ad-voice/ui";

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
`,Ve=`export default {
  name: "Grid",
  description: "Responsive CSS Grid для колонок, span и auto-fit раскладок",
  category: "layout",
  wide: true,
} as const;
`,He=`import { mark } from "../../../core/base";\r
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
`,Oe=`import { Playground, U, jsx } from "../../../dev/exampleHelpers";\r
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
`,$e=`export default {\r
  name: "Header",\r
  description: "Единый заголовок для страницы, секции, карточки и диалога.",\r
  category: "layout",\r
};\r
`,Ge=`import React from "react";\r
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
`,Ue=`import { Compare, Playground, U, jsx } from "../../../dev/exampleHelpers";\r
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
`,We=`export default {\r
  name: "Icon",\r
  description:\r
    'Иконка; surface="tile" добавляет контейнер вместо отдельного IconTile.',\r
  category: "typography",\r
};\r
`,je=`import { mark } from "../../../core/base";\r
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
`,Ke=`import { Grid, Illustration } from "@ad-voice/ui";\r
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
`,qe=`export default {
  name: "Illustration",
  description: "SVG-иллюстрация; framed заменяет отдельный ArtworkFrame.",
  category: "layout",
  wide: true,
};
`,Ye=`import { useRef } from "react";\r
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
`,Xe=`import { Badge, ScrollArea, Stack, Typography } from "@ad-voice/ui";\r
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
`,Ze=`export default {\r
  name: "ScrollArea",\r
  description: "Прокрутка с согласованным оформлением",\r
  category: "layout",\r
} as const;\r
`,Je=`import { Children, Fragment } from "react";
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
`,Qe=`import { Button, Stack } from "@ad-voice/ui";

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
`,nt=`export default {
  name: "Stack",
  description:
    "Flex-layout для вертикальных и горизонтальных групп с responsive-настройками",
  category: "layout",
  wide: true,
} as const;
`,rt=`import { mark } from "../../../core/base";\r
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
`,et=`import { TabPanel, Typography } from "@ad-voice/ui";\r
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
`,tt=`export default {\r
  name: "TabPanel",\r
  description: "Содержимое выбранной вкладки",\r
  category: "navigation",\r
} as const;\r
`,ot=`import { createElement } from "react";\r
import { mark } from "../../../core/base";\r
import { type TextProps } from "../shared";\r
\r
export const Text = ({ as = "span", ...p }: TextProps) =>\r
  createElement(\r
    as,\r
    { ...mark("Text", p), "data-ad-variant": p.variant },\r
    p.children ?? p.text,\r
  );\r
`,at=`import { Stack, Text } from "@ad-voice/ui";\r
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
`,st=`export default {\r
  name: "Text",\r
  description: "Иерархия заголовков, подписей и описаний",\r
  category: "typography",\r
} as const;\r
`,it=`import { part } from "../../../core/base";\r
\r
export const Toolbar = part("Toolbar", "div");\r
`,lt=`import {\r
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
`,ct=`export default {
  name: "Toolbar",
  description: "Группы инструментов в общей панели",
  category: "layout",
  wide: true,
} as const;
`,pt=`import type { ElementType, ReactNode } from "react";\r
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
`,dt=`import { useEffect, useRef, useState } from "react";\r
import { clamp, mark, timeText, useControllable } from "../../../core/base";\r
import { IconButton } from "../../controls/IconButton/IconButton";\r
import { Slider } from "../../controls/Slider/Slider";\r
import { Waveform } from "../Waveform/Waveform";\r
import type { AudioPlayerProps } from "../shared";\r
export const AudioPlayer = (p: AudioPlayerProps) => {\r
  const audio = useRef<HTMLAudioElement | null>(null);\r
  const [playing, setPlaying] = useState(false),\r
    [position, setPosition] = useState(0),\r
    [muted, setMuted] = useState(false);\r
  const [volume, setVolume] = useControllable(p.volume, p.defaultVolume ?? 0.7);\r
  const [fileDuration, setFileDuration] = useState<number>();\r
  const duration = p.duration ?? fileDuration ?? 51;\r
  useEffect(() => {\r
    if (!p.src) return;\r
    const media = new Audio(p.src);\r
    audio.current = media;\r
    const meta = () =>\r
      Number.isFinite(media.duration) && setFileDuration(media.duration);\r
    const ended = () => {\r
      setPlaying(false);\r
      p.onPlayingChange?.(false);\r
    };\r
    media.addEventListener("loadedmetadata", meta);\r
    media.addEventListener("ended", ended);\r
    return () => {\r
      media.pause();\r
      media.removeEventListener("loadedmetadata", meta);\r
      media.removeEventListener("ended", ended);\r
      audio.current = null;\r
      setFileDuration(undefined);\r
    };\r
  }, [p.src]);\r
  // While playing, the position is read every display refresh (timeupdate fires only ~4\r
  // times a second), so the cursor glides. Without a source the timeline runs on its own,\r
  // so the player can be shown alive in demos.\r
  useEffect(() => {\r
    if (!playing) return;\r
    let last = performance.now();\r
    let frame = requestAnimationFrame(function tick(now) {\r
      const media = audio.current;\r
      if (media) {\r
        setPosition(media.currentTime);\r
        p.onTimeChange?.(media.currentTime);\r
      } else\r
        setPosition((v) => {\r
          const next = v + (now - last) / 1000;\r
          if (next < duration) return next;\r
          setPlaying(false);\r
          return 0;\r
        });\r
      last = now;\r
      frame = requestAnimationFrame(tick);\r
    });\r
    return () => cancelAnimationFrame(frame);\r
  }, [playing, duration]);\r
  useEffect(() => {\r
    if (audio.current) {\r
      audio.current.muted = muted;\r
      audio.current.volume = clamp(volume, 0, 1);\r
    }\r
  }, [muted, volume]);\r
  const toggle = () => {\r
    const next = !playing;\r
    setPlaying(next);\r
    p.onPlayingChange?.(next);\r
    if (audio.current) {\r
      if (next) void audio.current.play();\r
      else audio.current.pause();\r
    }\r
  };\r
  const seek = (v: number) => {\r
    setPosition(v);\r
    if (audio.current) audio.current.currentTime = v;\r
    p.onTimeChange?.(v);\r
  };\r
  return (\r
    <div {...mark("AudioPlayer", p)} data-playing={playing || undefined}>\r
      <span className="ad-player-play">\r
        <IconButton\r
          variant="primary"\r
          round\r
          icon={playing ? "pause" : "play"}\r
          label={playing ? "Пауза" : "Воспроизвести"}\r
          onClick={toggle}\r
        />\r
      </span>\r
      <div className="ad-player-track">\r
        <Waveform\r
          duration={duration}\r
          position={position}\r
          onSeek={seek}\r
          points={p.points}\r
          src={p.points ? undefined : p.src}\r
        />\r
        <div className="ad-player-times">\r
          <span className="ad-time">{timeText(position)}</span>\r
          <span className="ad-time">−{timeText(duration - position)}</span>\r
        </div>\r
      </div>\r
      <div className="ad-player-volume">\r
        <IconButton\r
          variant="ghost"\r
          icon="volume"\r
          label={muted ? "Включить звук" : "Выключить звук"}\r
          aria-pressed={muted}\r
          data-muted={muted || undefined}\r
          onClick={() => setMuted((v) => !v)}\r
        />\r
        {p.showVolume !== false && (\r
          <Slider\r
            size="sm"\r
            min={0}\r
            max={1}\r
            step={0.01}\r
            value={muted ? 0 : volume}\r
            onValueChange={(v) => {\r
              setMuted(false);\r
              setVolume(v);\r
            }}\r
            label="Громкость"\r
          />\r
        )}\r
      </div>\r
    </div>\r
  );\r
};\r
`,ut=`import { AudioPlayer } from "@ad-voice/ui";\r
\r
/** Pass \`src\` to play a file; without it the player shows its timeline only. */\r
export default function AudioPlayerExample() {\r
  return <AudioPlayer duration={51} defaultVolume={0.7} />;\r
}\r
`,mt=`export default {\r
  name: "AudioPlayer",\r
  description: "Воспроизведение, позиция, время и звук",\r
  category: "audio",\r
  wide: true,\r
} as const;\r
`,ft=`import { useEffect, useId, useRef } from "react";\r
import { clamp, mark } from "../../../core/base";\r
import { type LevelMeterProps } from "../shared";\r
\r
const SAMPLES = 64;\r
const WIDTH = 256;\r
const HEIGHT = 24;\r
const MID = HEIGHT / 2;\r
const STEP = WIDTH / (SAMPLES - 1);\r
/** A new sample enters every 28 ms; between samples the wave slides sub-pixel. */\r
const SAMPLE_MS = 28;\r
\r
/** Mirrored outline of the samples around the midline; quiet parts keep a thin line. */\r
const wavePath = (samples: readonly number[]) => {\r
  const point = (i: number, level: number, side: 1 | -1) =>\r
    \`\${(i * STEP).toFixed(2)} \${(MID + side * (1 + level ** 0.68 * (MID - 3))).toFixed(2)}\`;\r
  const upper = samples.map((level, i) => point(i, level, -1));\r
  const lower = samples.map((level, i) => point(i, level, 1)).reverse();\r
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;\r
};\r
\r
/** Root-mean-square loudness of an analyser's current window, scaled to 0..1. */\r
const loudness = (\r
  analyser: AnalyserNode,\r
  buffer: Float32Array<ArrayBuffer>,\r
) => {\r
  analyser.getFloatTimeDomainData(buffer);\r
  let sum = 0;\r
  for (const sample of buffer) sum += sample * sample;\r
  return Math.min(1, Math.sqrt(sum / buffer.length) * 4);\r
};\r
\r
/**\r
 * Live input level as a scrolling mirrored wave. Feed it a changing \`value\` (0–100) or hand\r
 * it a \`stream\` (e.g. from getUserMedia) and it listens by itself. The wave is redrawn\r
 * outside React on every display refresh, so it never re-renders at the animation rate.\r
 */\r
export function LevelMeter({\r
  value = 0,\r
  stream,\r
  active = true,\r
  compact = false,\r
  label,\r
  ...p\r
}: LevelMeterProps) {\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const path = useRef<SVGPathElement>(null);\r
  const target = useRef(0);\r
  const level = clamp(value) / 100;\r
\r
  useEffect(() => {\r
    target.current = active ? level : 0;\r
  }, [active, level]);\r
\r
  useEffect(() => {\r
    const shape = path.current;\r
    if (!shape) return;\r
    const samples = Array.from({ length: SAMPLES + 1 }, () => 0);\r
    shape.setAttribute("d", wavePath(samples));\r
    if (!active) return;\r
\r
    let context: AudioContext | undefined;\r
    let analyser: AnalyserNode | undefined;\r
    let source: MediaStreamAudioSourceNode | undefined;\r
    if (stream) {\r
      context = new AudioContext();\r
      analyser = context.createAnalyser();\r
      analyser.fftSize = 1024;\r
      source = context.createMediaStreamSource(stream);\r
      source.connect(analyser);\r
    }\r
    const buffer = new Float32Array(analyser?.fftSize ?? 0);\r
\r
    let envelope = 0;\r
    let carry = 0;\r
    let last = performance.now();\r
    let frame = requestAnimationFrame(function draw(now) {\r
      carry += Math.min(250, now - last);\r
      last = now;\r
      const input = analyser ? loudness(analyser, buffer) : target.current;\r
      while (carry >= SAMPLE_MS) {\r
        carry -= SAMPLE_MS;\r
        // Fast attack, slow release, like a real meter's ballistics.\r
        envelope += (input - envelope) * (input > envelope ? 0.3 : 0.11);\r
        if (envelope < 0.001) envelope = 0;\r
        samples.shift();\r
        samples.push(envelope);\r
        shape.setAttribute("d", wavePath(samples));\r
      }\r
      shape.setAttribute(\r
        "transform",\r
        \`translate(\${(-(carry / SAMPLE_MS) * STEP).toFixed(3)} 0)\`,\r
      );\r
      frame = requestAnimationFrame(draw);\r
    });\r
    return () => {\r
      cancelAnimationFrame(frame);\r
      source?.disconnect();\r
      void context?.close();\r
    };\r
  }, [active, stream]);\r
\r
  return (\r
    <div\r
      {...mark("LevelMeter", p)}\r
      role="meter"\r
      aria-label={label ?? "Уровень сигнала"}\r
      aria-valuemin={0}\r
      aria-valuemax={100}\r
      aria-valuenow={stream ? undefined : Math.round(active ? level * 100 : 0)}\r
      data-active={active}\r
      data-compact={compact || undefined}\r
    >\r
      <svg\r
        viewBox={\`0 0 \${WIDTH} \${HEIGHT}\`}\r
        preserveAspectRatio="none"\r
        aria-hidden="true"\r
      >\r
        <defs>\r
          <linearGradient id={\`\${id}-wave\`}>\r
            <stop stopColor="#8c0d34" />\r
            <stop offset="0.52" stopColor="var(--ad-red)" />\r
            <stop offset="1" stopColor="#ffd3df" />\r
          </linearGradient>\r
        </defs>\r
        <line className="ad-level-meter-axis" x2={WIDTH} y1={MID} y2={MID} />\r
        <path\r
          ref={path}\r
          className="ad-level-meter-wave"\r
          fill={\`url(#\${id}-wave)\`}\r
        />\r
      </svg>\r
    </div>\r
  );\r
}\r
`,gt=`import { useEffect, useState } from "react";\r
import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
\r
/** A voice-like level: syllables rise and fall, with short pauses between phrases. */\r
function useDemoVoice(enabled: boolean) {\r
  const [level, setLevel] = useState(0);\r
  useEffect(() => {\r
    if (!enabled) return;\r
    const start = performance.now();\r
    const timer = setInterval(() => {\r
      const t = (performance.now() - start) / 1000;\r
      const phrase = Math.sin(t * 0.9) > -0.35 ? 1 : 0.05;\r
      const syllable =\r
        Math.abs(Math.sin(t * 7.3)) * (0.55 + 0.45 * Math.sin(t * 2.1));\r
      setLevel(Math.round(phrase * syllable * 90 + Math.random() * 8));\r
    }, 60);\r
    return () => clearInterval(timer);\r
  }, [enabled]);\r
  return level;\r
}\r
\r
export default function LevelMeterExample() {\r
  const [stream, setStream] = useState<MediaStream | null>(null);\r
  const [error, setError] = useState<string>();\r
  const level = useDemoVoice(!stream);\r
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);\r
\r
  const toggleMicrophone = async () => {\r
    if (stream) return setStream(null);\r
    try {\r
      setError(undefined);\r
      setStream(await navigator.mediaDevices.getUserMedia({ audio: true }));\r
    } catch {\r
      setError("Нет доступа к микрофону");\r
    }\r
  };\r
\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{ active: { value: true }, compact: { value: false } }}\r
      code={(v) =>\r
        jsx("LevelMeter", {\r
          label: "Микрофон",\r
          ...(stream ? { stream: expr("stream") } : { value: expr("level") }),\r
          active: v.active ? undefined : expr("false"),\r
          compact: v.compact,\r
        })\r
      }\r
      extra={\r
        <U.Stack direction="row" gap={3} align="center" wrap>\r
          <U.Button\r
            size="sm"\r
            icon="mic"\r
            variant={stream ? "primary" : "secondary"}\r
            onClick={toggleMicrophone}\r
          >\r
            {stream ? "Отключить микрофон" : "Подключить микрофон"}\r
          </U.Button>\r
          <U.Typography variant="caption" tone={error ? "danger" : "muted"}>\r
            {error ??\r
              (stream ? "Слушаю ваш микрофон" : "Сейчас — симуляция голоса")}\r
          </U.Typography>\r
        </U.Stack>\r
      }\r
    >\r
      {(v) => (\r
        <U.LevelMeter\r
          label="Микрофон"\r
          value={level}\r
          stream={stream}\r
          active={v.active}\r
          compact={v.compact}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,vt=`export default {\r
  name: "LevelMeter",\r
  description: "Сегментированный индикатор уровня",\r
  category: "audio",\r
} as const;\r
`,bt=`import React, {\r
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
  const stepRef = useRef(Math.max(0.001, p.step ?? 1));\r
  const fineStepRef = useRef(Math.max(0.001, p.fineStep ?? 0.1));\r
  onChangeRef.current = p.onValueChange;\r
  onCommitRef.current = p.onValueCommit;\r
  disabledRef.current = !!p.disabled;\r
  readOnlyRef.current = !!p.readOnly;\r
  stepRef.current = Math.max(0.001, p.step ?? 1);\r
  fineStepRef.current = Math.max(0.001, p.fineStep ?? 0.1);\r
\r
  const initial = clamp(p.defaultValue ?? p.value ?? 67);\r
  const initialRef = useRef(initial);\r
  const diameter =\r
    p.diameter ??\r
    { xs: 84, sm: 124, md: 220, lg: 320 }[normalizeSize(p.size) ?? "md"];\r
  const numberFormat = useMemo(\r
    () => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }),\r
    [],\r
  );\r
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
    const rotorCtx = rotor.getContext("2d")!;\r
    const feedbackCtx = feedback.getContext("2d")!;\r
    const ctx = canvas.getContext("2d", { alpha: true })!;\r
    if (!rotorCtx || !feedbackCtx || !ctx) return;\r
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
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");\r
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
      if (disposed) return;\r
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
      if (!feedbackCtx || !feedback.width || disposed) return;\r
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
      root.dataset.value = String(value);\r
      control.setAttribute("aria-valuenow", String(value));\r
      control.setAttribute(\r
        "aria-valuetext",\r
        \`\${numberFormat.format(value)} процентов\`,\r
      );\r
      control.title = \`\${p.label ?? "Громкость"}: \${numberFormat.format(value)}% · ведите по кругу или тяните за центр\`;\r
      readout.textContent = \`\${numberFormat.format(value)}%\`;\r
      schedulePaint();\r
      if (changed && notify) onChangeRef.current?.(value);\r
      return changed;\r
    }\r
\r
    function commit() {\r
      if (!disposed) onCommitRef.current?.(value);\r
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
      if (setValue(p.resetValue ?? defaultValue)) commit();\r
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
    const observer = new ResizeObserver(scheduleRender);\r
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
        if (setValue(p.resetValue ?? defaultValue)) commit();\r
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
      controllerRef.current?.setValue(clamp(p.value), false);\r
  }, [p.value]);\r
\r
  // Typing a value, as in studio plug-ins: click the readout, Enter applies, Escape cancels.\r
  const [draft, setDraft] = useState<string | null>(null);\r
  const cancelled = useRef(false);\r
  const editable = !p.disabled && !p.readOnly;\r
  const applyDraft = () => {\r
    if (cancelled.current) return;\r
    const next = Number(draft?.replace(",", ".").replace("%", ""));\r
    setDraft(null);\r
    const controller = controllerRef.current;\r
    if (!controller || !Number.isFinite(next)) return;\r
    const before = controller.value;\r
    controller.setValue(clamp(next), true);\r
    if (controller.value !== before) p.onValueCommit?.(controller.value);\r
  };\r
\r
  const rootProps = mark("RotaryKnob", p, undefined, "knob");\r
  return (\r
    <div\r
      {...rootProps}\r
      ref={rootRef}\r
      data-value={initial}\r
      data-disabled={p.disabled || undefined}\r
      data-readonly={p.readOnly || undefined}\r
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
        aria-valuemin={0}\r
        aria-valuemax={100}\r
        aria-valuenow={initial}\r
        aria-valuetext={\`\${numberFormat.format(initial)} процентов\`}\r
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
              numberFormat.format(controllerRef.current?.value ?? initial),\r
            );\r
          }}\r
        >\r
          {numberFormat.format(initial)}%\r
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
      <span className="ad-sr-only">\r
        Зажмите ручку ближе к краю и ведите мышью по кругу. За центр можно\r
        тянуть вверх или вниз. Нажатие на внешнюю шкалу устанавливает значение.\r
        Колесо мыши и стрелки меняют громкость. Shift — точная регулировка.\r
        Двойной щелчок — исходное значение.\r
      </span>\r
    </div>\r
  );\r
};\r
`,ht=`import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";\r
\r
export default function RotaryKnobExample() {\r
  return (\r
    <Playground\r
      knobs={{\r
        size: { options: sizes, value: "md" },\r
        readOnly: { value: false },\r
        disabled: { value: false },\r
      }}\r
      code={(v, c) =>\r
        jsx("RotaryKnob", {\r
          label: "Громкость",\r
          value: expr("volume"),\r
          onValueChange: expr("setVolume"),\r
          size: c.size,\r
          readOnly: v.readOnly,\r
          disabled: v.disabled,\r
        })\r
      }\r
    >\r
      {(v) => (\r
        <U.RotaryKnob\r
          label="Громкость"\r
          defaultValue={65}\r
          size={v.size}\r
          readOnly={v.readOnly}\r
          disabled={v.disabled}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,xt=`export default {\r
  name: "RotaryKnob",\r
  description:\r
    "Точный интерактивный React-порт premium-knob-interactive-neon(2).html.",\r
  category: "audio",\r
} as const;\r
`,yt=`import { useId, type CSSProperties } from "react";\r
import { mark } from "../../../core/base";\r
import { type SparklineProps } from "../shared";\r
\r
/** Line that draws itself in, an area glow below it and a beacon on the latest value. */\r
export const Sparkline = (p: SparklineProps) => {\r
  const values = p.values ?? [\r
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,\r
  ];\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const max = Math.max(...values, 1);\r
  const min = Math.min(...values, 0);\r
  const points = values.map((v, i) => [\r
    (i / Math.max(1, values.length - 1)) * 240,\r
    66 - ((v - min) / (max - min || 1)) * 58,\r
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
        { ...p.style, "--ad-spark": p.color ?? "#ff416a" } as CSSProperties\r
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
`,kt=`import { Sparkline, Stack, Typography } from "@ad-voice/ui";\r
\r
export default function SparklineExample() {\r
  return (\r
    <Stack gap={1}>\r
      <Typography variant="label">Задержка сети, мс</Typography>\r
      <Sparkline\r
        label="Задержка сети"\r
        values={[18, 22, 19, 31, 44, 26, 24, 21, 38, 27, 23, 20]}\r
      />\r
    </Stack>\r
  );\r
}\r
`,_t=`export default {\r
  name: "Sparkline",\r
  description: "Небольшой график без осей",\r
  category: "audio",\r
} as const;\r
`,Pt=`import { useId, useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
\r
export const WaveDecoration = (p: CommonProps) => {\r
  const ref = useRef<SVGSVGElement>(null);\r
  const uid = useId().replace(/:/g, "");\r
  const paint = (t: number) =>\r
    ref.current?.querySelectorAll("path").forEach((path, j) => {\r
      let d = "";\r
      for (let i = 0; i <= 65; i++) {\r
        const x = (i / 65) * 600,\r
          y =\r
            65 +\r
            (j - 11) * 2.5 +\r
            Math.sin(i * 0.115 + t * 0.6 + j * 0.08) * 24 +\r
            Math.sin(i * 0.19 - t * 0.31) * 9;\r
        d += \`\${i ? "L" : "M"}\${x.toFixed(2)} \${y.toFixed(2)}\`;\r
      }\r
      path.setAttribute("d", d);\r
    });\r
  useDecoration(ref, paint);\r
  return (\r
    <svg\r
      {...mark("WaveDecoration", p)}\r
      ref={ref}\r
      viewBox="0 0 600 130"\r
      aria-hidden="true"\r
    >\r
      <defs>\r
        <linearGradient id={\`wave-\${uid}\`}>\r
          {[\r
            [0, 0],\r
            [0.2, 0.3],\r
            [0.7, 1],\r
            [1, 0.35],\r
          ].map(([offset, opacity]) => (\r
            <stop\r
              key={offset}\r
              offset={offset}\r
              stopColor="#ff426d"\r
              stopOpacity={opacity}\r
            />\r
          ))}\r
        </linearGradient>\r
      </defs>\r
      {Array.from({ length: 22 }, (_, j) => (\r
        <path\r
          key={j}\r
          d="M0 65H600"\r
          fill="none"\r
          stroke={\`url(#wave-\${uid})\`}\r
          strokeWidth={j % 7 === 0 ? 1.2 : 0.65}\r
          opacity={0.5 + (j % 4) * 0.13}\r
        />\r
      ))}\r
    </svg>\r
  );\r
};\r
`,wt=`import { WaveDecoration } from "@ad-voice/ui";\r
\r
/** Decorative animated waves for hero areas; hidden from assistive tech. */\r
export default function WaveDecorationExample() {\r
  return <WaveDecoration />;\r
}\r
`,St=`export default {\r
  name: "WaveDecoration",\r
  description: "Декоративные линии с меняющейся формой",\r
  category: "motion",\r
} as const;\r
`,Tt=`import {\r
  useEffect,\r
  useId,\r
  useMemo,\r
  useRef,\r
  useState,\r
  type PointerEvent,\r
} from "react";\r
import { clamp, mark, timeText, useControllable } from "../../../core/base";\r
import { seeded } from "../../../core/noise";\r
import { type WaveformProps } from "../shared";\r
import { useWaveformPeaks } from "./useWaveformPeaks";\r
\r
/** Drawing space: a symmetric track around the midline, like a studio editor shows it. */\r
const W = 1000;\r
const H = 100;\r
const MID = H / 2;\r
const COLUMNS = 400;\r
const KEY_STEP = 5;\r
\r
/**\r
 * A believable song for when no audio is given: intro, verses and louder choruses, a\r
 * kick on every beat, and sample-level detail in between.\r
 */\r
const demoSong = (() => {\r
  const random = seeded(2741);\r
  return Array.from({ length: 600 }, (_, i) => {\r
    const t = i / 600;\r
    const section = 0.4 + 0.6 * Math.sin(t * Math.PI * 3.2) ** 2;\r
    const fade = Math.min(1, i / 24, (600 - i) / 30);\r
    const kick = Math.exp(-(i % 12) / 2.2);\r
    const detail = random() ** 0.7;\r
    return section * fade * (0.3 + 0.7 * (0.5 * kick + 0.5 * detail));\r
  });\r
})();\r
\r
/**\r
 * Resamples to fixed columns: an outer outline and a core of average loudness. Mastered\r
 * tracks hit full scale almost everywhere, so drawing raw peaks gives a flat brick; like\r
 * streaming players, the outline follows loudness (never above the real peak) and the\r
 * range between quiet and loud passages is stretched, while true silence stays a line.\r
 */\r
function columns(peaks: readonly number[], rms?: readonly number[]) {\r
  const outer: number[] = [];\r
  const ratio: number[] = [];\r
  for (let c = 0; c < COLUMNS; c += 1) {\r
    const from = Math.floor((c / COLUMNS) * peaks.length);\r
    const to = Math.max(\r
      from + 1,\r
      Math.floor(((c + 1) / COLUMNS) * peaks.length),\r
    );\r
    let peak = 0;\r
    let mean = 0;\r
    for (let i = from; i < to; i += 1) {\r
      peak = Math.max(peak, Math.abs(peaks[i]));\r
      mean += rms ? rms[i] : Math.abs(peaks[i]) * 0.58;\r
    }\r
    mean /= to - from;\r
    const level = Math.min(peak, mean * 1.9);\r
    outer.push(level);\r
    ratio.push(level > 0 ? Math.min(1, mean / level) : 0);\r
  }\r
  const sorted = [...outer].sort((a, b) => a - b);\r
  const high = sorted[sorted.length - 1] || 0.0001;\r
  const low = Math.min(\r
    sorted[Math.floor(sorted.length * 0.05)] * 0.7,\r
    high * 0.6,\r
  );\r
  const top = outer.map((v) => clamp((v - low) / (high - low), 0, 1));\r
  return { top, core: top.map((v, i) => v * ratio[i]) };\r
}\r
\r
/** A filled outline of the levels, mirrored above and below the midline. */\r
function mirrored(levels: readonly number[]) {\r
  const x = (i: number) => ((i / (levels.length - 1)) * W).toFixed(1);\r
  const y = (v: number, side: 1 | -1) =>\r
    (MID + side * (0.6 + v * (MID - 3))).toFixed(1);\r
  const upper = levels.map((v, i) => \`\${x(i)} \${y(v, -1)}\`);\r
  const lower = levels.map((v, i) => \`\${x(i)} \${y(v, 1)}\`).reverse();\r
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;\r
}\r
\r
/**\r
 * Seekable waveform drawn the way studio editors show audio: a dense, symmetric track with\r
 * translucent peaks around a solid core of average loudness. The played part burns ruby\r
 * and brightens towards the light-beam cursor; hovering previews the seek point and its\r
 * time. Click or drag to seek, arrows step 5 s, Home/End jump to the edges. Peaks come\r
 * from \`points\` or are decoded from \`src\`.\r
 */\r
export function Waveform({\r
  duration: total,\r
  position: controlled,\r
  defaultPosition = 0,\r
  onSeek,\r
  points,\r
  src,\r
  bins = 600,\r
  color,\r
  label,\r
  disabled = false,\r
  ...p\r
}: WaveformProps) {\r
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");\r
  const surface = useRef<HTMLDivElement>(null);\r
  const [hover, setHover] = useState<number | null>(null);\r
  const decoded = useWaveformPeaks(points ? null : src, bins);\r
  const loading = !points && !!src && decoded === null;\r
  const { peaksPath, corePath } = useMemo(() => {\r
    const { top, core } = points?.length\r
      ? columns(points)\r
      : decoded?.peaks.length\r
        ? columns(decoded.peaks, decoded.rms)\r
        : columns(demoSong);\r
    return { peaksPath: mirrored(top), corePath: mirrored(core) };\r
  }, [points, decoded]);\r
  const duration = Math.max(0.001, total ?? 231);\r
  const [position, seek] = useControllable(controlled, defaultPosition, onSeek);\r
  const progress = clamp(position / duration, 0, 1);\r
  const played = progress * W;\r
  const ahead = Math.max(0, (hover ?? 0) * W - played);\r
  // Playing = the position keeps creeping forward; sparks fly only then.\r
  const [playing, setPlaying] = useState(false);\r
  const previous = useRef(position);\r
  useEffect(() => {\r
    const step = position - previous.current;\r
    previous.current = position;\r
    if (step <= 0 || step > 1.5) return;\r
    setPlaying(true);\r
    const timer = setTimeout(() => setPlaying(false), 300);\r
    return () => clearTimeout(timer);\r
  }, [position]);\r
  const shape = points?.length\r
    ? "points"\r
    : decoded?.peaks.length\r
      ? "file"\r
      : "demo";\r
\r
  const ratio = (event: PointerEvent<HTMLDivElement>) => {\r
    const box = surface.current?.getBoundingClientRect();\r
    return box?.width ? clamp((event.clientX - box.left) / box.width, 0, 1) : 0;\r
  };\r
\r
  return (\r
    <div\r
      {...mark("Waveform", p)}\r
      ref={surface}\r
      role="slider"\r
      tabIndex={disabled ? -1 : 0}\r
      aria-label={label ?? "Позиция воспроизведения"}\r
      aria-valuemin={0}\r
      aria-valuemax={Math.round(duration)}\r
      aria-valuenow={Math.round(position)}\r
      aria-valuetext={timeText(position)}\r
      aria-disabled={disabled || undefined}\r
      data-loading={loading || undefined}\r
      data-playing={playing || undefined}\r
      style={\r
        {\r
          ...p.style,\r
          "--ad-wave-played": \`\${progress * 100}%\`,\r
          "--ad-wave-hover": hover === null ? undefined : \`\${hover * 100}%\`,\r
          ...(color ? { "--ad-wave-color": color } : {}),\r
        } as React.CSSProperties\r
      }\r
      onPointerDown={(event) => {\r
        if (disabled) return;\r
        event.currentTarget.setPointerCapture(event.pointerId);\r
        seek(ratio(event) * duration);\r
      }}\r
      onPointerMove={(event) => {\r
        if (disabled) return;\r
        setHover(ratio(event));\r
        if (event.currentTarget.hasPointerCapture(event.pointerId))\r
          seek(ratio(event) * duration);\r
      }}\r
      onPointerLeave={() => setHover(null)}\r
      onKeyDown={(event) => {\r
        if (disabled) return;\r
        const next = {\r
          ArrowRight: position + KEY_STEP,\r
          ArrowLeft: position - KEY_STEP,\r
          Home: 0,\r
          End: duration,\r
        }[event.key];\r
        if (next === undefined) return;\r
        event.preventDefault();\r
        seek(clamp(next, 0, duration));\r
      }}\r
    >\r
      <span className="ad-waveform-floor" aria-hidden />\r
      <svg\r
        key={shape}\r
        viewBox={\`0 0 \${W} \${H}\`}\r
        preserveAspectRatio="none"\r
        aria-hidden="true"\r
      >\r
        <defs>\r
          <clipPath id={\`\${id}-track\`}>\r
            <path d={peaksPath} />\r
          </clipPath>\r
          <clipPath id={\`\${id}-played\`}>\r
            <rect width={played} height={H} />\r
          </clipPath>\r
          <clipPath id={\`\${id}-ahead\`}>\r
            <rect x={played} width={ahead} height={H} />\r
          </clipPath>\r
          {/* Brushed silver: brightest along the midline, fading to the edges. */}\r
          <linearGradient id={\`\${id}-silver\`} x1="0" x2="0" y1="0" y2="1">\r
            <stop offset="0" stopColor="#d9cfdc" stopOpacity="0.35" />\r
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />\r
            <stop offset="1" stopColor="#d9cfdc" stopOpacity="0.35" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-solid\`} x1="0" x2="0" y1="0" y2="1">\r
            <stop offset="0" stopColor="#efe6f0" stopOpacity="0.8" />\r
            <stop offset="0.5" stopColor="#fff" />\r
            <stop offset="1" stopColor="#efe6f0" stopOpacity="0.8" />\r
          </linearGradient>\r
          {/* Light builds up along the played part and peaks at the cursor. */}\r
          <linearGradient\r
            id={\`\${id}-lit\`}\r
            gradientUnits="userSpaceOnUse"\r
            x1="0"\r
            x2={Math.max(1, played)}\r
          >\r
            <stop offset="0" stopColor="#6b0b2c" />\r
            <stop\r
              offset="0.6"\r
              stopColor="var(--ad-wave-color, var(--ad-red))"\r
            />\r
            <stop offset="1" stopColor="#ffd9e3" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-depth\`} x1="0" x2="0" y1="0" y2="1">\r
            {/* Lit from above: the upper half catches light, the lower sinks into shadow. */}\r
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />\r
            <stop offset="0.42" stopColor="#fff" stopOpacity="0" />\r
            <stop offset="0.56" stopColor="#000" stopOpacity="0" />\r
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />\r
          </linearGradient>\r
          <radialGradient id={\`\${id}-spot\`}>\r
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />\r
            <stop offset="1" stopColor="#ff2f6a" stopOpacity="0" />\r
          </radialGradient>\r
          <filter\r
            id={\`\${id}-bloom\`}\r
            x="-5%"\r
            y="-50%"\r
            width="110%"\r
            height="200%"\r
          >\r
            <feGaussianBlur stdDeviation="4" />\r
          </filter>\r
        </defs>\r
\r
        <line className="ad-waveform-axis" x2={W} y1={MID} y2={MID} />\r
        <path\r
          className="ad-waveform-peaks"\r
          d={peaksPath}\r
          fill={\`url(#\${id}-silver)\`}\r
        />\r
        <path\r
          className="ad-waveform-core"\r
          d={corePath}\r
          fill={\`url(#\${id}-solid)\`}\r
        />\r
        <path className="ad-waveform-edge" d={peaksPath} />\r
\r
        <g clipPath={\`url(#\${id}-ahead)\`} className="ad-waveform-ahead">\r
          <path d={peaksPath} />\r
          <path d={corePath} />\r
        </g>\r
\r
        <g clipPath={\`url(#\${id}-played)\`}>\r
          <path\r
            className="ad-waveform-bloom"\r
            d={corePath}\r
            fill={\`url(#\${id}-lit)\`}\r
            filter={\`url(#\${id}-bloom)\`}\r
          />\r
          <path\r
            className="ad-waveform-lit-peaks"\r
            d={peaksPath}\r
            fill={\`url(#\${id}-lit)\`}\r
          />\r
          <path\r
            className="ad-waveform-lit-core"\r
            d={corePath}\r
            fill={\`url(#\${id}-lit)\`}\r
          />\r
          <g clipPath={\`url(#\${id}-track)\`}>\r
            <rect className="ad-waveform-sheen" width="160" height={H} />\r
          </g>\r
        </g>\r
\r
        <rect\r
          className="ad-waveform-depth"\r
          width={W}\r
          height={H}\r
          fill={\`url(#\${id}-depth)\`}\r
          clipPath={\`url(#\${id}-track)\`}\r
        />\r
        <ellipse\r
          className="ad-waveform-spot"\r
          cx={played}\r
          cy={MID}\r
          rx="60"\r
          ry={H}\r
          fill={\`url(#\${id}-spot)\`}\r
          clipPath={\`url(#\${id}-track)\`}\r
        />\r
      </svg>\r
      <span className="ad-waveform-cursor" aria-hidden>\r
        <span className="ad-waveform-sparks">\r
          {Array.from({ length: 8 }, (_, i) => (\r
            <i key={i} />\r
          ))}\r
        </span>\r
      </span>\r
      {hover !== null && !disabled && (\r
        <span className="ad-waveform-hover" aria-hidden>\r
          <span className="ad-waveform-tip">{timeText(hover * duration)}</span>\r
        </span>\r
      )}\r
    </div>\r
  );\r
}\r
`,Ct=`import { useEffect, useState } from "react";\r
import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";\r
\r
const DURATION = 231;\r
\r
/** Plays along on its own, a frame at a time, so the cursor glides; seeking moves it. */\r
function PlayingWaveform({\r
  playing,\r
  disabled,\r
  file,\r
}: {\r
  playing: boolean;\r
  disabled: boolean;\r
  file: File | null;\r
}) {\r
  const [position, setPosition] = useState(64);\r
  useEffect(() => {\r
    if (!playing) return;\r
    let last = performance.now();\r
    let frame = requestAnimationFrame(function tick(now) {\r
      setPosition((v) => (v + (now - last) / 1000) % DURATION);\r
      last = now;\r
      frame = requestAnimationFrame(tick);\r
    });\r
    return () => cancelAnimationFrame(frame);\r
  }, [playing]);\r
  return (\r
    <U.Waveform\r
      style={{ width: "min(100%, 52rem)" }}\r
      label="Позиция в записи"\r
      src={file}\r
      duration={DURATION}\r
      position={position}\r
      onSeek={setPosition}\r
      disabled={disabled}\r
    />\r
  );\r
}\r
\r
export default function WaveformExample() {\r
  const [file, setFile] = useState<File | null>(null);\r
  return (\r
    <Playground\r
      stretch\r
      knobs={{ playing: { value: true }, disabled: { value: false } }}\r
      code={(v) =>\r
        jsx("Waveform", {\r
          label: "Позиция в записи",\r
          src: file ? expr("file") : undefined,\r
          duration: DURATION,\r
          position: expr("position"),\r
          onSeek: expr("setPosition"),\r
          disabled: v.disabled,\r
        })\r
      }\r
      extra={\r
        <U.FilePicker\r
          size="sm"\r
          label="Свой трек"\r
          description={file ? file.name : "Волна построится прямо в браузере"}\r
          icon="music"\r
          accept="audio/*"\r
          onFiles={([next]) => next && setFile(next)}\r
        />\r
      }\r
    >\r
      {(v) => (\r
        <PlayingWaveform\r
          playing={v.playing}\r
          disabled={v.disabled}\r
          file={file}\r
        />\r
      )}\r
    </Playground>\r
  );\r
}\r
`,Rt=`export default {\r
  name: "Waveform",\r
  description: "Геометрия сигнала и позиция воспроизведения",\r
  category: "audio",\r
} as const;\r
`,Mt=`import { useEffect, useState } from "react";\r
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
`,Et=`import type { CommonProps } from "../../core/base";\r
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
  label?: string;\r
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
  color?: string;\r
  label?: string;\r
}\r
`,At=`import {\r
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
`,Bt=`import { Typography } from "@ad-voice/ui";\r
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
`,It=`export default {
  name: "Router",
  description:
    "Typed universal routing with params, redirects and an optional access predicate — without project-specific role keys.",
  category: "navigation",
};
`,Nt=`export { ThemeProvider } from "./components/foundation/ThemeProvider/ThemeProvider";\r
export type { ThemeProviderProps } from "./components/foundation/ThemeProvider/ThemeProvider";\r
export { useReducedMotion, useMotion } from "./core/providers/context";\r
export {\r
  useBorder,\r
  useDecoration,\r
  useSmoothWheel,\r
  useTabShape,\r
} from "./core/motion/hooks";\r
export { getMotionStats } from "./core/motion-engine.js";\r
`,zt=`import React, { createElement, useId, useMemo } from "react";\r
import type { VectorNode } from "./base";\r
\r
/** Prefixes ids and their #references so several copies of one SVG can coexist on a page. */\r
function scopeIds(value: unknown, prefix: string, key: string): unknown {\r
  if (typeof value !== "string") return value;\r
  if (key === "id") return prefix + value;\r
  if (key === "href" && value.startsWith("#"))\r
    return "#" + prefix + value.slice(1);\r
  return value.replace(/url\\(#([^)]*)\\)/g, \`url(#\${prefix}$1)\`);\r
}\r
\r
/** Artwork JSON already stores React-ready SVG props; only ids are rewritten. */\r
export function vectorElement(\r
  node: VectorNode | string,\r
  prefix: string,\r
  key?: string | number,\r
): React.ReactNode {\r
  if (typeof node === "string") return node;\r
  const props: Record<string, unknown> = { key };\r
  for (const [name, value] of Object.entries(node.props ?? {}))\r
    props[name] = scopeIds(value, prefix, name);\r
  return createElement(\r
    node.tag,\r
    props,\r
    node.children?.map((child, i) => vectorElement(child, prefix, i)),\r
  );\r
}\r
export function SvgAsset({\r
  node,\r
  className,\r
  style,\r
  label,\r
  component,\r
}: {\r
  node: VectorNode;\r
  className?: string;\r
  style?: React.CSSProperties;\r
  label?: string;\r
  component?: string;\r
}) {\r
  const prefix = \`svg-\${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-\`;\r
  const element = useMemo(\r
    () =>\r
      vectorElement(node, prefix) as React.ReactElement<\r
        Record<string, unknown>\r
      >,\r
    [node, prefix],\r
  );\r
  return React.cloneElement(element, {\r
    ...(className ? { className } : {}),\r
    ...(style ? { style } : {}),\r
    ...(label\r
      ? { role: "img", "aria-label": label, "aria-hidden": undefined }\r
      : {}),\r
    ...(component ? { "data-ad-component": component } : {}),\r
  });\r
}\r
`,Ft=`import { createElement, useCallback, useRef, useState } from "react";\r
import type { CSSProperties, ReactNode, Ref } from "react";\r
\r
export type Material =\r
  | "shell"\r
  | "card"\r
  | "glass"\r
  | "ruby"\r
  | "tile"\r
  | "input"\r
  | "dialog"\r
  | "ghost"\r
  | "danger";\r
export type Variant = "primary" | "secondary" | "ghost" | "danger";\r
export type ControlSize = "xs" | "sm" | "md" | "lg";\r
export type LegacySize = "small" | "medium" | "large";\r
export type Size = ControlSize | LegacySize;\r
export type Tone =\r
  | "success"\r
  | "warning"\r
  | "error"\r
  | "processing"\r
  | "pending"\r
  | "offline"\r
  | "info";\r
export type TokenStyle = CSSProperties & {\r
  [key: \`--\${string}\`]: string | number | undefined;\r
};\r
export interface CommonProps {\r
  children?: ReactNode;\r
  className?: string;\r
  style?: TokenStyle;\r
  id?: string;\r
  material?: Material;\r
  size?: Size;\r
  tone?: Tone;\r
}\r
export interface VectorNode {\r
  tag: string;\r
  props?: Record<string, unknown>;\r
  children?: Array<VectorNode | string>;\r
}\r
\r
export function classes(...values: (string | undefined | false)[]): string {\r
  return values.filter(Boolean).join(" ");\r
}\r
export function normalizeSize(size?: Size): ControlSize | undefined {\r
  if (!size) return undefined;\r
  return (\r
    ({ small: "sm", medium: "md", large: "lg" } as const)[size as LegacySize] ??\r
    (size as ControlSize)\r
  );\r
}\r
\r
/** Root attributes shared by every component: \`ad ad-<kebab-name>\` class and data-ad-* hooks for CSS. */\r
export function mark(\r
  name: string,\r
  p: CommonProps,\r
  material?: Material,\r
  extra?: string,\r
) {\r
  return {\r
    id: p.id,\r
    className: classes(\r
      "ad",\r
      "ad-" +\r
        name.replace(/[A-Z]/g, (v, i) => (i ? "-" : "") + v.toLowerCase()),\r
      extra,\r
      p.className,\r
    ),\r
    style: p.style,\r
    "data-ad-component": name,\r
    "data-ad-material": p.material ?? material,\r
    "data-ad-size": normalizeSize(p.size),\r
    "data-ad-tone": p.tone,\r
  };\r
}\r
\r
/** Plain structural element with the standard component marks. */\r
export function part(name: string, tag: "header" | "div" | "footer") {\r
  const Part = (p: CommonProps) =>\r
    createElement(tag, mark(name, p), p.children);\r
  Part.displayName = name;\r
  return Part;\r
}\r
\r
export function useControllable<T>(\r
  value: T | undefined,\r
  initial: T,\r
  onChange?: (value: T) => void,\r
) {\r
  const [internal, setInternal] = useState(initial);\r
  const current = value === undefined ? internal : value;\r
  const latest = useRef({ current, value, onChange });\r
  latest.current = { current, value, onChange };\r
  const update = useCallback((next: T | ((value: T) => T)) => {\r
    const old = latest.current;\r
    const resolved =\r
      typeof next === "function"\r
        ? (next as (value: T) => T)(old.current)\r
        : next;\r
    if (old.value === undefined) setInternal(resolved);\r
    if (!Object.is(resolved, old.current)) old.onChange?.(resolved);\r
    latest.current.current = resolved;\r
  }, []);\r
  return [current, update] as const;\r
}\r
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {\r
  if (typeof ref === "function") ref(value);\r
  else if (ref) (ref as { current: T | null }).current = value;\r
}\r
export const clamp = (v: number, min = 0, max = 100) =>\r
  Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));\r
export const cssRem = (value: number) =>\r
  \`\${value / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)}rem\`;\r
export const timeText = (value: number) =>\r
  \`\${Math.floor(Math.max(0, value) / 60)}:\${String(Math.floor(Math.max(0, value)) % 60).padStart(2, "0")}\`;\r
export async function copyText(text: string): Promise<boolean> {\r
  try {\r
    await navigator.clipboard.writeText(text);\r
    return true;\r
  } catch {\r
    const field = document.createElement("textarea");\r
    field.value = text;\r
    field.style.cssText = "position:fixed;left:-100vw;top:0";\r
    const focus = document.activeElement as HTMLElement | null;\r
    document.body.append(field);\r
    field.select();\r
    try {\r
      return document.execCommand("copy");\r
    } catch {\r
      return false;\r
    } finally {\r
      field.remove();\r
      focus?.focus();\r
    }\r
  }\r
}\r
export function downloadFile(\r
  name: string,\r
  content: string,\r
  type = "application/json",\r
) {\r
  const url = URL.createObjectURL(new Blob([content], { type }));\r
  const link = document.createElement("a");\r
  link.download = name;\r
  link.href = url;\r
  link.click();\r
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);\r
}\r
\r
/** Spreads a ring of light from the pointer inside \`host\` (which should clip its overflow). */\r
export function ripple(host: HTMLElement, clientX: number, clientY: number) {\r
  const rect = host.getBoundingClientRect();\r
  const ring = document.createElement("span");\r
  ring.className = "ad-ripple";\r
  ring.style.left = \`\${clientX - rect.left}px\`;\r
  ring.style.top = \`\${clientY - rect.top}px\`;\r
  ring.addEventListener("animationend", () => ring.remove());\r
  host.append(ring);\r
}\r
`,Lt=`export interface MotionScope {\r
  root: Document | ShadowRoot | Element;\r
  enabled: boolean;\r
  time: number;\r
  previous: number | null;\r
  disposed?: boolean;\r
  callbacks: Map<Element, (time: number) => void>;\r
  add(node: Element, callback: (time: number) => void): () => void;\r
  set(enabled: boolean, explicit?: boolean): boolean;\r
  dispose(): void;\r
}\r
export interface BorderEffect {\r
  element: HTMLElement;\r
  overlay: SVGSVGElement;\r
  path: SVGPathElement;\r
  length: number;\r
  observer: ResizeObserver;\r
  sync(): void;\r
  paint(seconds: number): void;\r
  destroy(): void;\r
}\r
export function createMotion(\r
  root?: Document | ShadowRoot | Element,\r
): MotionScope;\r
export function attachBorder(\r
  element: HTMLElement,\r
  options: {\r
    shell?: boolean;\r
    round?: boolean;\r
    scope: MotionScope;\r
  },\r
): BorderEffect;\r
export function attachTabShape(element: HTMLButtonElement): {\r
  shape: SVGSVGElement;\r
  observer: ResizeObserver;\r
  sync(): void;\r
  destroy(): void;\r
};\r
export function getMotionStats(): {\r
  scopes: number;\r
  running: number;\r
  scheduled: boolean;\r
  callbacks: number;\r
};\r
`,Dt=`import React, { useEffect, useLayoutEffect, useRef } from "react";\r
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
      matchMedia("(prefers-reduced-motion: reduce)").matches\r
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
`,Vt=`/** Deterministic randomness and value noise for procedural artwork (same picture on every render). */\r
\r
export const clamp01 = (value: number, minimum = 0, maximum = 1) =>\r
  Math.min(maximum, Math.max(minimum, value));\r
\r
/** Seeded generator (mulberry32): returns a function giving numbers in [0, 1). */\r
export function seeded(initialSeed: number) {\r
  let seed = initialSeed;\r
  return () => {\r
    seed |= 0;\r
    seed = (seed + 0x6d2b79f5) | 0;\r
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);\r
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;\r
  };\r
}\r
\r
let table: Float32Array | null = null;\r
\r
/** Smooth 2D value noise in [0, 1]. */\r
export function noise(x: number, y: number) {\r
  table ??= Float32Array.from({ length: 65536 }, seeded(7149));\r
  const ix = Math.floor(x),\r
    iy = Math.floor(y);\r
  let fx = x - ix,\r
    fy = y - iy;\r
  fx = fx * fx * (3 - 2 * fx);\r
  fy = fy * fy * (3 - 2 * fy);\r
  const at = (a: number, b: number) => table![(a & 255) + ((b & 255) << 8)];\r
  const a = at(ix, iy),\r
    b = at(ix + 1, iy),\r
    c = at(ix, iy + 1),\r
    d = at(ix + 1, iy + 1);\r
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;\r
}\r
\r
/** Fractal noise: several octaves of value noise. */\r
export function fbm(initialX: number, initialY: number, octaves = 5) {\r
  let x = initialX,\r
    y = initialY,\r
    value = 0,\r
    amplitude = 0.5;\r
  for (let i = 0; i < octaves; i += 1) {\r
    value += noise(x, y) * amplitude;\r
    x = x * 2.03 + 13.2;\r
    y = y * 2.07 - 7.4;\r
    amplitude *= 0.5;\r
  }\r
  return value;\r
}\r
\r
/** A procedural picture: rows of pixels computed one by one, then optional vector strokes. */\r
export interface Painting {\r
  /** Fill rows \`from\`..\`to\` of the image; scale from \`image.width\` to stay resolution-free. */\r
  pixels(image: ImageData, from: number, to: number): void;\r
  /** Draw on top of the pixels (stars, glows, outlines). */\r
  finish?(\r
    context: CanvasRenderingContext2D,\r
    width: number,\r
    height: number,\r
  ): void;\r
}\r
\r
const paintings = new Map<string, Promise<HTMLCanvasElement>>();\r
const pause = () => new Promise<void>((resume) => setTimeout(resume));\r
\r
/**\r
 * Paints a picture into an offscreen canvas in ~8 ms slices, so even a large one never\r
 * freezes the page, and keeps it: every instance of the same size reuses the result.\r
 */\r
export function paintCanvas(\r
  key: string,\r
  width: number,\r
  height: number,\r
  painting: Painting,\r
) {\r
  const id = \`\${key}:\${width}x\${height}\`;\r
  let done = paintings.get(id);\r
  if (!done) {\r
    done = (async () => {\r
      const canvas = document.createElement("canvas");\r
      canvas.width = width;\r
      canvas.height = height;\r
      const context = canvas.getContext("2d");\r
      if (!context) return canvas;\r
      const image = context.createImageData(width, height);\r
      for (let row = 0; row < height;) {\r
        const started = performance.now();\r
        while (row < height && performance.now() - started < 8) {\r
          painting.pixels(image, row, row + 1);\r
          row += 1;\r
        }\r
        if (row < height) await pause();\r
      }\r
      context.putImageData(image, 0, 0);\r
      painting.finish?.(context, width, height);\r
      return canvas;\r
    })();\r
    paintings.set(id, done);\r
  }\r
  return done;\r
}\r
`,Ht=`import { useEffect, useState } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
export function useMotion() {
  const reduced = useReducedMotion();
  const [explicit, setExplicit] = useState<boolean | undefined>(() =>
    typeof document === "undefined"
      ? undefined
      : document.documentElement.dataset.adMotion === "off"
        ? false
        : document.documentElement.dataset.adMotion === "on"
          ? true
          : undefined,
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement,
      update = () =>
        setExplicit(
          root.dataset.adMotion === "off"
            ? false
            : root.dataset.adMotion === "on"
              ? true
              : undefined,
        );
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-ad-motion"],
    });
    update();
    return () => observer.disconnect();
  }, []);
  return explicit ?? !reduced;
}
`,Ot=`import type { CSSProperties } from "react";

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
`,$t=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useRef,\r
  useState,\r
  type ReactNode,\r
} from "react";\r
import * as UI from "../index";\r
import * as Editor from "../editor";\r
\r
export const U = { ...UI, ...Editor };\r
\r
/** True inside overview tiles: a playground shows only its specimens, without controls. */\r
export const ExamplePreviewContext = createContext(false);\r
\r
/** Knobs that pick a look rather than tune it: all of their options are shown side by side. */\r
const spreadKeys = ["variant", "tone", "status", "material", "effect"];\r
\r
/** The docs page listens here to show the code of the current playground state. */\r
export const ExampleCodeContext = createContext<\r
  ((code: string) => void) | null\r
>(null);\r
\r
/** A prop the reader can change: a list of options (segmented) or a flag (switch). */\r
export type Knob =\r
  { options: readonly string[]; value: string } | { value: boolean };\r
type KnobValue<K> = K extends { options: readonly (infer O)[] }\r
  ? O\r
  : K extends { value: infer V }\r
    ? V\r
    : never;\r
export type KnobValues<K extends Record<string, Knob>> = {\r
  [P in keyof K]: KnobValue<K[P]>;\r
};\r
\r
/** Marks a prop value that is printed as an expression: \`{...}\` instead of \`"..."\`. */\r
export const expr = (code: string) => ({ expr: code });\r
\r
/** Prints a JSX element; undefined/false props are left out, short elements stay on one line. */\r
export function jsx(\r
  name: string,\r
  props: Record<string, unknown>,\r
  children?: string,\r
): string {\r
  const attrs = Object.entries(props).flatMap(([key, value]) => {\r
    if (value === undefined || value === false) return [];\r
    if (value === true) return [key];\r
    if (typeof value === "string") return [\`\${key}="\${value}"\`];\r
    if (value && typeof value === "object" && "expr" in value)\r
      return [\`\${key}={\${(value as { expr: string }).expr}}\`];\r
    return [\`\${key}={\${JSON.stringify(value)}}\`];\r
  });\r
  const close = children ? \`>\${children}</\${name}>\` : " />";\r
  const inline = \`<\${name}\${attrs.map((a) => " " + a).join("")}\${close}\`;\r
  if (inline.length <= 56) return inline;\r
  const body = attrs.map((a) => \`\\n  \${a}\`).join("");\r
  if (!children) return \`<\${name}\${body}\\n/>\`;\r
  const open = attrs.length ? \`<\${name}\${body}\\n>\` : \`<\${name}>\`;\r
  return \`\${open}\\n  \${children}\\n</\${name}>\`;\r
}\r
\r
/** Values that differ from the knob defaults, so generated code shows only what was changed. */\r
function changed<K extends Record<string, Knob>>(\r
  knobs: K,\r
  values: KnobValues<K>,\r
): Partial<KnobValues<K>> {\r
  const out: Partial<KnobValues<K>> = {};\r
  for (const key in knobs)\r
    if (values[key] !== knobs[key].value) out[key] = values[key];\r
  return out;\r
}\r
\r
const knobLabels: Record<string, string> = {\r
  size: "Размер",\r
  variant: "Вид",\r
  disabled: "Disabled",\r
  readOnly: "Read only",\r
  error: "Ошибка",\r
  required: "Обязательное",\r
  clearable: "Очистка",\r
  loading: "Загрузка",\r
  icon: "Иконка",\r
  description: "Подсказка",\r
  round: "Круглая",\r
  multiple: "Несколько файлов",\r
  selected: "Выбрана",\r
  tone: "Тон",\r
  status: "Статус",\r
  value: "Значение",\r
  indeterminate: "Без значения",\r
  material: "Материал",\r
  border: "Анимированная рамка",\r
  level: "Уровень",\r
  compact: "Компактный",\r
  surface: "Подложка",\r
  segmented: "Сегменты",\r
  role: "Роль",\r
  active: "Активен",\r
  bars: "Столбики",\r
  playing: "Играет",\r
  flicker: "Мерцание",\r
  lines: "Строки",\r
  circle: "Аватар",\r
  effect: "Эффект",\r
  max: "Наклон, °",\r
  glare: "Блик",\r
  floating: "Подпись внутри",\r
  strands: "Нити",\r
  stars: "Звёзды",\r
  upload: "Облако загрузки",\r
};\r
\r
/**\r
 * One live specimen with its props as controls. Replaces grids of near-identical copies:\r
 * the reader changes a prop and sees the component and its code update together.\r
 */\r
export function Playground<K extends Record<string, Knob>>({\r
  knobs,\r
  code,\r
  children,\r
  stretch = false,\r
  extra,\r
}: {\r
  knobs: K;\r
  code: (values: KnobValues<K>, changes: Partial<KnobValues<K>>) => string;\r
  children: (values: KnobValues<K>) => ReactNode;\r
  /** Let the specimen take the stage width (fields) instead of its own size (buttons). */\r
  stretch?: boolean;\r
  /** Short comparison shown under the controls, e.g. all variants side by side. */\r
  extra?: ReactNode;\r
}) {\r
  const [values, setValues] = useState(\r
    () =>\r
      Object.fromEntries(\r
        Object.entries(knobs).map(([k, v]) => [k, v.value]),\r
      ) as KnobValues<K>,\r
  );\r
  const report = useContext(ExampleCodeContext);\r
  const preview = useContext(ExamplePreviewContext);\r
  const spread = Object.keys(knobs).find(\r
    (key) => spreadKeys.includes(key) && "options" in knobs[key],\r
  ) as keyof K | undefined;\r
  const looks = spread\r
    ? (knobs[spread] as { options: readonly string[] }).options.map(\r
        (option) => ({ option, values: { ...values, [spread]: option } }),\r
      )\r
    : [{ option: "", values }];\r
  const source = looks\r
    .map((look) => code(look.values, changed(knobs, look.values)))\r
    .join("\\n\\n");\r
  const reported = useRef("");\r
  useEffect(() => {\r
    if (report && reported.current !== source) {\r
      reported.current = source;\r
      report(source);\r
    }\r
  }, [report, source]);\r
  const set = (key: keyof K, value: string | boolean) =>\r
    setValues((old) => ({ ...old, [key]: value }));\r
\r
  return (\r
    <div className="example-playground">\r
      <div\r
        className="example-stage"\r
        data-stretch={stretch || undefined}\r
        data-spread={spread ? true : undefined}\r
      >\r
        {spread\r
          ? looks.map((look) => (\r
              <figure key={look.option}>\r
                {children(look.values)}\r
                <figcaption>{look.option}</figcaption>\r
              </figure>\r
            ))\r
          : children(values)}\r
      </div>\r
      {!preview && (\r
        <div className="example-knobs">\r
          {Object.entries(knobs)\r
            .filter(([key]) => key !== spread)\r
            .map(([key, knob]) =>\r
              "options" in knob ? (\r
                <div className="example-knob" key={key}>\r
                  <span>{knobLabels[key] ?? key}</span>\r
                  <U.SegmentedControl\r
                    size="xs"\r
                    label={knobLabels[key] ?? key}\r
                    value={values[key] as string}\r
                    onValueChange={(v) => set(key, v)}\r
                    items={knob.options.map((o) => ({ value: o, label: o }))}\r
                  />\r
                </div>\r
              ) : (\r
                <U.Switch\r
                  key={key}\r
                  size="xs"\r
                  label={knobLabels[key] ?? key}\r
                  checked={values[key] as boolean}\r
                  onValueChange={(v) => set(key, v)}\r
                />\r
              ),\r
            )}\r
        </div>\r
      )}\r
      {extra && !preview && <div className="example-extra">{extra}</div>}\r
    </div>\r
  );\r
}\r
\r
/** Captioned specimens in one row, for comparisons that are clearer side by side. */\r
export function Compare({\r
  items,\r
  captions = true,\r
}: {\r
  items: Array<{ label: string; node: ReactNode }>;\r
  /** Hide captions when the specimens already show their name. */\r
  captions?: boolean;\r
}) {\r
  return (\r
    <div className="example-compare">\r
      {items.map((item) => (\r
        <figure key={item.label}>\r
          {item.node}\r
          {captions && <figcaption>{item.label}</figcaption>}\r
        </figure>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
export const sizes = ["xs", "sm", "md", "lg"] as const;\r
export const buttonVariants = [\r
  "primary",\r
  "secondary",\r
  "ghost",\r
  "danger",\r
] as const;\r
export const inputVariants = ["outlined", "filled", "underlined"] as const;\r
`,Gt=`export { PianoRollGrid } from "./components/editor/PianoRollGrid/PianoRollGrid";
export type {
  PianoRollGridProps,
  NoteGeometry,
} from "./components/editor/shared";
`,Ut=`export { Form, useForm, useFormContext } from "./components/forms/Form/Form";
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
`,Wt=`export { copyText } from "./core/base";\r
export * from "./core/base";\r
export * from "./core/artwork";\r
export { useReducedMotion, useMotion } from "./core/providers/context";\r
export {\r
  useBorder,\r
  useDecoration,\r
  useSmoothWheel,\r
  useTabShape,\r
} from "./core/motion/hooks";\r
export { ThemeProvider } from "./components/foundation/ThemeProvider/ThemeProvider";\r
export type { ThemeProviderProps } from "./components/foundation/ThemeProvider/ThemeProvider";\r
export { Typography } from "./components/foundation/Typography/Typography";\r
export type {\r
  TypographyProps,\r
  TypographyTone,\r
  TypographyVariant,\r
  TypographyWeight,\r
} from "./components/foundation/Typography/Typography";\r
export { typography } from "./theme/typography";\r
export { Header } from "./components/layout/Header/Header";\r
export { Illustration } from "./components/layout/Illustration/Illustration";\r
export { Avatar } from "./components/layout/Avatar/Avatar";\r
export { BrandMark } from "./components/layout/BrandMark/BrandMark";\r
export { ButtonGroup } from "./components/layout/ButtonGroup/ButtonGroup";\r
export { Card } from "./components/layout/Card/Card";\r
export { DialogActions } from "./components/layout/DialogActions/DialogActions";\r
export { DialogBody } from "./components/layout/DialogBody/DialogBody";\r
export { Divider } from "./components/layout/Divider/Divider";\r
export { Grid } from "./components/layout/Grid/Grid";\r
export { Icon } from "./components/layout/Icon/Icon";\r
export { ScrollArea } from "./components/layout/ScrollArea/ScrollArea";\r
export { Stack } from "./components/layout/Stack/Stack";\r
export { TabPanel } from "./components/layout/TabPanel/TabPanel";\r
export { Text } from "./components/layout/Text/Text";\r
export { Toolbar } from "./components/layout/Toolbar/Toolbar";\r
export * from "./components/layout/shared";\r
export { Autocomplete } from "./components/controls/Autocomplete/Autocomplete";\r
export { Button } from "./components/controls/Button/Button";\r
export { Checkbox } from "./components/controls/Checkbox/Checkbox";\r
export { FilePicker } from "./components/controls/FilePicker/FilePicker";\r
export { IconButton } from "./components/controls/IconButton/IconButton";\r
export { InputBase } from "./components/controls/InputBase/InputBase";\r
export { Link } from "./components/controls/Link/Link";\r
export type { LinkProps } from "./components/controls/Link/Link";\r
export type { InputBaseProps } from "./components/controls/InputBase/InputBase";\r
export { NumberField } from "./components/controls/NumberField/NumberField";\r
export { SegmentedControl } from "./components/controls/SegmentedControl/SegmentedControl";\r
export { Select } from "./components/controls/Select/Select";\r
export { Slider } from "./components/controls/Slider/Slider";\r
export { SplitButton } from "./components/controls/SplitButton/SplitButton";\r
export { Switch } from "./components/controls/Switch/Switch";\r
export { Tab } from "./components/controls/Tab/Tab";\r
export { Tabs } from "./components/controls/Tabs/Tabs";\r
export { TextArea } from "./components/controls/TextArea/TextArea";\r
export { TextField } from "./components/controls/TextField/TextField";\r
export { ThemePicker } from "./components/controls/ThemePicker/ThemePicker";\r
export { ToggleButton } from "./components/controls/ToggleButton/ToggleButton";\r
export * from "./components/controls/shared";\r
export { Badge } from "./components/feedback/Badge/Badge";\r
export { CollapsibleSection } from "./components/feedback/CollapsibleSection/CollapsibleSection";\r
export { DataTable } from "./components/feedback/DataTable/DataTable";\r
export { Dialog } from "./components/feedback/Dialog/Dialog";\r
export { EmptyState } from "./components/feedback/EmptyState/EmptyState";\r
export { KeyValueList } from "./components/feedback/KeyValueList/KeyValueList";\r
export { Menu } from "./components/feedback/Menu/Menu";\r
export { MenuItem } from "./components/feedback/MenuItem/MenuItem";\r
export { MessageBar } from "./components/feedback/MessageBar/MessageBar";\r
export { Popover } from "./components/feedback/Popover/Popover";\r
export { ProgressBar } from "./components/feedback/ProgressBar/ProgressBar";\r
export { StatusIndicator } from "./components/feedback/StatusIndicator/StatusIndicator";\r
export { Steps } from "./components/feedback/Steps/Steps";\r
export { Toast } from "./components/feedback/Toast/Toast";\r
export * from "./components/feedback/shared";\r
export { AnimatedBorder } from "./components/effects/AnimatedBorder/AnimatedBorder";\r
export type { AnimatedBorderProps } from "./components/effects/AnimatedBorder/AnimatedBorder";\r
export { Spotlight } from "./components/effects/Spotlight/Spotlight";\r
export type { SpotlightProps } from "./components/effects/Spotlight/Spotlight";\r
export { Tilt } from "./components/effects/Tilt/Tilt";\r
export type { TiltProps } from "./components/effects/Tilt/Tilt";\r
export { Reveal } from "./components/effects/Reveal/Reveal";\r
export type { RevealProps } from "./components/effects/Reveal/Reveal";\r
export { GlowText } from "./components/effects/GlowText/GlowText";\r
export type { GlowTextProps } from "./components/effects/GlowText/GlowText";\r
export { Equalizer } from "./components/effects/Equalizer/Equalizer";\r
export type { EqualizerProps } from "./components/effects/Equalizer/Equalizer";\r
export { Shimmer } from "./components/effects/Shimmer/Shimmer";\r
export type { ShimmerProps } from "./components/effects/Shimmer/Shimmer";\r
export { Sparkles } from "./components/effects/Sparkles/Sparkles";\r
export type { SparklesProps } from "./components/effects/Sparkles/Sparkles";\r
export { Beacon } from "./components/effects/Beacon/Beacon";\r
export type { BeaconProps } from "./components/effects/Beacon/Beacon";\r
export { Marquee } from "./components/effects/Marquee/Marquee";\r
export type { MarqueeProps } from "./components/effects/Marquee/Marquee";\r
export { Landscape } from "./components/artwork/Landscape/Landscape";\r
export type { LandscapeProps } from "./components/artwork/Landscape/Landscape";\r
export { Planet } from "./components/artwork/Planet/Planet";\r
export type { PlanetProps } from "./components/artwork/Planet/Planet";\r
export { NeonWaves } from "./components/artwork/NeonWaves/NeonWaves";\r
export type { NeonWavesProps } from "./components/artwork/NeonWaves/NeonWaves";\r
export { Spectrum } from "./components/artwork/Spectrum/Spectrum";\r
export type { SpectrumProps } from "./components/artwork/Spectrum/Spectrum";\r
export { DatabaseArt } from "./components/artwork/DatabaseArt/DatabaseArt";\r
export type { DatabaseArtProps } from "./components/artwork/DatabaseArt/DatabaseArt";\r
export { ServerArt } from "./components/artwork/ServerArt/ServerArt";\r
export type { ServerArtProps } from "./components/artwork/ServerArt/ServerArt";\r
export { AudioPlayer } from "./components/media/AudioPlayer/AudioPlayer";\r
export { LevelMeter } from "./components/media/LevelMeter/LevelMeter";\r
export { RotaryKnob } from "./components/media/RotaryKnob/RotaryKnob";\r
export { Sparkline } from "./components/media/Sparkline/Sparkline";\r
export { WaveDecoration } from "./components/media/WaveDecoration/WaveDecoration";\r
export { Waveform } from "./components/media/Waveform/Waveform";\r
export { useWaveformPeaks } from "./components/media/Waveform/useWaveformPeaks";\r
export * from "./components/media/shared";\r
export { getMotionStats } from "./core/motion-engine.js";\r
export {\r
  Router,\r
  useRouter,\r
  matchRoute,\r
} from "./components/navigation/Router/Router";\r
export type {\r
  RouterProps,\r
  RouterValue,\r
  RouteDefinition,\r
  RouteMatch,\r
  RouteAccessContext,\r
} from "./components/navigation/Router/Router";\r
export { Form, useForm, useFormContext } from "./components/forms/Form/Form";\r
export type {\r
  FormApi,\r
  FormErrors,\r
  UseFormOptions,\r
} from "./components/forms/Form/Form";\r
export {\r
  FormFields,\r
  defaultFieldRegistry,\r
} from "./components/forms/FormFields/FormFields";\r
export type {\r
  FormFieldDefinition,\r
  FieldKind,\r
  FieldRegistry,\r
} from "./components/forms/FormFields/FormFields";\r
`,jt=`export {
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
`,Kt=`export const typography = {
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
`,l=Object.entries(Object.assign({"../../../../packages/ui/src/components/artwork/DatabaseArt/DatabaseArt.tsx":c,"../../../../packages/ui/src/components/artwork/DatabaseArt/example.tsx":p,"../../../../packages/ui/src/components/artwork/DatabaseArt/meta.ts":d,"../../../../packages/ui/src/components/artwork/Landscape/Landscape.tsx":u,"../../../../packages/ui/src/components/artwork/Landscape/example.tsx":m,"../../../../packages/ui/src/components/artwork/Landscape/meta.ts":f,"../../../../packages/ui/src/components/artwork/NeonWaves/NeonWaves.tsx":g,"../../../../packages/ui/src/components/artwork/NeonWaves/example.tsx":v,"../../../../packages/ui/src/components/artwork/NeonWaves/meta.ts":b,"../../../../packages/ui/src/components/artwork/Planet/Planet.tsx":h,"../../../../packages/ui/src/components/artwork/Planet/example.tsx":x,"../../../../packages/ui/src/components/artwork/Planet/meta.ts":y,"../../../../packages/ui/src/components/artwork/ServerArt/ServerArt.tsx":k,"../../../../packages/ui/src/components/artwork/ServerArt/example.tsx":_,"../../../../packages/ui/src/components/artwork/ServerArt/meta.ts":P,"../../../../packages/ui/src/components/artwork/Spectrum/Spectrum.tsx":w,"../../../../packages/ui/src/components/artwork/Spectrum/example.tsx":S,"../../../../packages/ui/src/components/artwork/Spectrum/meta.ts":T,"../../../../packages/ui/src/components/artwork/useArtwork.ts":C,"../../../../packages/ui/src/components/controls/Autocomplete/Autocomplete.tsx":R,"../../../../packages/ui/src/components/controls/Autocomplete/example.tsx":M,"../../../../packages/ui/src/components/controls/Autocomplete/meta.ts":E,"../../../../packages/ui/src/components/controls/Button/Button.tsx":A,"../../../../packages/ui/src/components/controls/Button/example.tsx":B,"../../../../packages/ui/src/components/controls/Button/meta.ts":I,"../../../../packages/ui/src/components/controls/Checkbox/Checkbox.tsx":N,"../../../../packages/ui/src/components/controls/Checkbox/example.tsx":z,"../../../../packages/ui/src/components/controls/Checkbox/meta.ts":F,"../../../../packages/ui/src/components/controls/FilePicker/FilePicker.tsx":L,"../../../../packages/ui/src/components/controls/FilePicker/example.tsx":D,"../../../../packages/ui/src/components/controls/FilePicker/meta.ts":V,"../../../../packages/ui/src/components/controls/IconButton/IconButton.tsx":H,"../../../../packages/ui/src/components/controls/IconButton/example.tsx":O,"../../../../packages/ui/src/components/controls/IconButton/meta.ts":$,"../../../../packages/ui/src/components/controls/InputBase/InputBase.tsx":G,"../../../../packages/ui/src/components/controls/InputBase/example.tsx":U,"../../../../packages/ui/src/components/controls/InputBase/meta.ts":W,"../../../../packages/ui/src/components/controls/Link/Link.tsx":j,"../../../../packages/ui/src/components/controls/Link/example.tsx":K,"../../../../packages/ui/src/components/controls/Link/meta.ts":q,"../../../../packages/ui/src/components/controls/NumberField/NumberField.tsx":Y,"../../../../packages/ui/src/components/controls/NumberField/example.tsx":X,"../../../../packages/ui/src/components/controls/NumberField/meta.ts":Z,"../../../../packages/ui/src/components/controls/SegmentedControl/SegmentedControl.tsx":J,"../../../../packages/ui/src/components/controls/SegmentedControl/example.tsx":Q,"../../../../packages/ui/src/components/controls/SegmentedControl/meta.ts":nn,"../../../../packages/ui/src/components/controls/Select/Select.tsx":rn,"../../../../packages/ui/src/components/controls/Select/example.tsx":en,"../../../../packages/ui/src/components/controls/Select/meta.ts":tn,"../../../../packages/ui/src/components/controls/Slider/Slider.tsx":on,"../../../../packages/ui/src/components/controls/Slider/example.tsx":an,"../../../../packages/ui/src/components/controls/Slider/meta.ts":sn,"../../../../packages/ui/src/components/controls/SplitButton/SplitButton.tsx":ln,"../../../../packages/ui/src/components/controls/SplitButton/example.tsx":cn,"../../../../packages/ui/src/components/controls/SplitButton/meta.ts":pn,"../../../../packages/ui/src/components/controls/Switch/Switch.tsx":dn,"../../../../packages/ui/src/components/controls/Switch/example.tsx":un,"../../../../packages/ui/src/components/controls/Switch/meta.ts":mn,"../../../../packages/ui/src/components/controls/Tab/Tab.tsx":fn,"../../../../packages/ui/src/components/controls/Tab/example.tsx":gn,"../../../../packages/ui/src/components/controls/Tab/meta.ts":vn,"../../../../packages/ui/src/components/controls/Tabs/Tabs.tsx":bn,"../../../../packages/ui/src/components/controls/Tabs/example.tsx":hn,"../../../../packages/ui/src/components/controls/Tabs/meta.ts":xn,"../../../../packages/ui/src/components/controls/TextArea/TextArea.tsx":yn,"../../../../packages/ui/src/components/controls/TextArea/example.tsx":kn,"../../../../packages/ui/src/components/controls/TextArea/meta.ts":_n,"../../../../packages/ui/src/components/controls/TextField/TextField.tsx":Pn,"../../../../packages/ui/src/components/controls/TextField/example.tsx":wn,"../../../../packages/ui/src/components/controls/TextField/meta.ts":Sn,"../../../../packages/ui/src/components/controls/ThemePicker/ThemePicker.tsx":Tn,"../../../../packages/ui/src/components/controls/ThemePicker/example.tsx":Cn,"../../../../packages/ui/src/components/controls/ThemePicker/meta.ts":Rn,"../../../../packages/ui/src/components/controls/ToggleButton/ToggleButton.tsx":Mn,"../../../../packages/ui/src/components/controls/ToggleButton/example.tsx":En,"../../../../packages/ui/src/components/controls/ToggleButton/meta.ts":An,"../../../../packages/ui/src/components/controls/internal.tsx":Bn,"../../../../packages/ui/src/components/controls/shared.tsx":In,"../../../../packages/ui/src/components/editor/PianoRollGrid/PianoRollGrid.tsx":Nn,"../../../../packages/ui/src/components/editor/PianoRollGrid/example.tsx":zn,"../../../../packages/ui/src/components/editor/PianoRollGrid/meta.ts":Fn,"../../../../packages/ui/src/components/editor/shared.tsx":Ln,"../../../../packages/ui/src/components/effects/AnimatedBorder/AnimatedBorder.tsx":Dn,"../../../../packages/ui/src/components/effects/AnimatedBorder/example.tsx":Vn,"../../../../packages/ui/src/components/effects/AnimatedBorder/meta.ts":Hn,"../../../../packages/ui/src/components/effects/Beacon/Beacon.tsx":On,"../../../../packages/ui/src/components/effects/Beacon/example.tsx":$n,"../../../../packages/ui/src/components/effects/Beacon/meta.ts":Gn,"../../../../packages/ui/src/components/effects/Equalizer/Equalizer.tsx":Un,"../../../../packages/ui/src/components/effects/Equalizer/example.tsx":Wn,"../../../../packages/ui/src/components/effects/Equalizer/meta.ts":jn,"../../../../packages/ui/src/components/effects/GlowText/GlowText.tsx":Kn,"../../../../packages/ui/src/components/effects/GlowText/example.tsx":qn,"../../../../packages/ui/src/components/effects/GlowText/meta.ts":Yn,"../../../../packages/ui/src/components/effects/Marquee/Marquee.tsx":Xn,"../../../../packages/ui/src/components/effects/Marquee/example.tsx":Zn,"../../../../packages/ui/src/components/effects/Marquee/meta.ts":Jn,"../../../../packages/ui/src/components/effects/Reveal/Reveal.tsx":Qn,"../../../../packages/ui/src/components/effects/Reveal/example.tsx":nr,"../../../../packages/ui/src/components/effects/Reveal/meta.ts":rr,"../../../../packages/ui/src/components/effects/Shimmer/Shimmer.tsx":er,"../../../../packages/ui/src/components/effects/Shimmer/example.tsx":tr,"../../../../packages/ui/src/components/effects/Shimmer/meta.ts":or,"../../../../packages/ui/src/components/effects/Sparkles/Sparkles.tsx":ar,"../../../../packages/ui/src/components/effects/Sparkles/example.tsx":sr,"../../../../packages/ui/src/components/effects/Sparkles/meta.ts":ir,"../../../../packages/ui/src/components/effects/Spotlight/Spotlight.tsx":lr,"../../../../packages/ui/src/components/effects/Spotlight/example.tsx":cr,"../../../../packages/ui/src/components/effects/Spotlight/meta.ts":pr,"../../../../packages/ui/src/components/effects/Tilt/Tilt.tsx":dr,"../../../../packages/ui/src/components/effects/Tilt/example.tsx":ur,"../../../../packages/ui/src/components/effects/Tilt/meta.ts":mr,"../../../../packages/ui/src/components/feedback/Badge/Badge.tsx":fr,"../../../../packages/ui/src/components/feedback/Badge/example.tsx":gr,"../../../../packages/ui/src/components/feedback/Badge/meta.ts":vr,"../../../../packages/ui/src/components/feedback/CollapsibleSection/CollapsibleSection.tsx":br,"../../../../packages/ui/src/components/feedback/CollapsibleSection/example.tsx":hr,"../../../../packages/ui/src/components/feedback/CollapsibleSection/meta.ts":xr,"../../../../packages/ui/src/components/feedback/DataTable/DataTable.tsx":yr,"../../../../packages/ui/src/components/feedback/DataTable/example.tsx":kr,"../../../../packages/ui/src/components/feedback/DataTable/meta.ts":_r,"../../../../packages/ui/src/components/feedback/Dialog/Dialog.tsx":Pr,"../../../../packages/ui/src/components/feedback/Dialog/example.tsx":wr,"../../../../packages/ui/src/components/feedback/Dialog/meta.ts":Sr,"../../../../packages/ui/src/components/feedback/EmptyState/EmptyState.tsx":Tr,"../../../../packages/ui/src/components/feedback/EmptyState/example.tsx":Cr,"../../../../packages/ui/src/components/feedback/EmptyState/meta.ts":Rr,"../../../../packages/ui/src/components/feedback/KeyValueList/KeyValueList.tsx":Mr,"../../../../packages/ui/src/components/feedback/KeyValueList/example.tsx":Er,"../../../../packages/ui/src/components/feedback/KeyValueList/meta.ts":Ar,"../../../../packages/ui/src/components/feedback/Menu/Menu.tsx":Br,"../../../../packages/ui/src/components/feedback/Menu/example.tsx":Ir,"../../../../packages/ui/src/components/feedback/Menu/meta.ts":Nr,"../../../../packages/ui/src/components/feedback/MenuItem/MenuItem.tsx":zr,"../../../../packages/ui/src/components/feedback/MenuItem/example.tsx":Fr,"../../../../packages/ui/src/components/feedback/MenuItem/meta.ts":Lr,"../../../../packages/ui/src/components/feedback/MessageBar/MessageBar.tsx":Dr,"../../../../packages/ui/src/components/feedback/MessageBar/example.tsx":Vr,"../../../../packages/ui/src/components/feedback/MessageBar/meta.ts":Hr,"../../../../packages/ui/src/components/feedback/Popover/Popover.tsx":Or,"../../../../packages/ui/src/components/feedback/Popover/example.tsx":$r,"../../../../packages/ui/src/components/feedback/Popover/meta.ts":Gr,"../../../../packages/ui/src/components/feedback/ProgressBar/ProgressBar.tsx":Ur,"../../../../packages/ui/src/components/feedback/ProgressBar/example.tsx":Wr,"../../../../packages/ui/src/components/feedback/ProgressBar/meta.ts":jr,"../../../../packages/ui/src/components/feedback/StatusIndicator/StatusIndicator.tsx":Kr,"../../../../packages/ui/src/components/feedback/StatusIndicator/example.tsx":qr,"../../../../packages/ui/src/components/feedback/StatusIndicator/meta.ts":Yr,"../../../../packages/ui/src/components/feedback/Steps/Steps.tsx":Xr,"../../../../packages/ui/src/components/feedback/Steps/example.tsx":Zr,"../../../../packages/ui/src/components/feedback/Steps/meta.ts":Jr,"../../../../packages/ui/src/components/feedback/Toast/Toast.tsx":Qr,"../../../../packages/ui/src/components/feedback/Toast/example.tsx":ne,"../../../../packages/ui/src/components/feedback/Toast/meta.ts":re,"../../../../packages/ui/src/components/feedback/shared.tsx":ee,"../../../../packages/ui/src/components/forms/Form/Form.tsx":te,"../../../../packages/ui/src/components/forms/Form/example.tsx":oe,"../../../../packages/ui/src/components/forms/Form/meta.ts":ae,"../../../../packages/ui/src/components/forms/FormFields/FormFields.tsx":se,"../../../../packages/ui/src/components/forms/FormFields/example.tsx":ie,"../../../../packages/ui/src/components/forms/FormFields/meta.ts":le,"../../../../packages/ui/src/components/foundation/ThemeProvider/ThemeProvider.tsx":ce,"../../../../packages/ui/src/components/foundation/ThemeProvider/example.tsx":pe,"../../../../packages/ui/src/components/foundation/ThemeProvider/meta.ts":de,"../../../../packages/ui/src/components/foundation/Typography/Typography.tsx":ue,"../../../../packages/ui/src/components/foundation/Typography/example.tsx":me,"../../../../packages/ui/src/components/foundation/Typography/meta.ts":fe,"../../../../packages/ui/src/components/layout/Avatar/Avatar.tsx":ge,"../../../../packages/ui/src/components/layout/Avatar/HostSeal.tsx":ve,"../../../../packages/ui/src/components/layout/Avatar/example.tsx":be,"../../../../packages/ui/src/components/layout/Avatar/meta.ts":he,"../../../../packages/ui/src/components/layout/BrandMark/BrandMark.tsx":xe,"../../../../packages/ui/src/components/layout/BrandMark/example.tsx":ye,"../../../../packages/ui/src/components/layout/BrandMark/meta.ts":ke,"../../../../packages/ui/src/components/layout/ButtonGroup/ButtonGroup.tsx":_e,"../../../../packages/ui/src/components/layout/ButtonGroup/example.tsx":Pe,"../../../../packages/ui/src/components/layout/ButtonGroup/meta.ts":we,"../../../../packages/ui/src/components/layout/Card/Card.tsx":Se,"../../../../packages/ui/src/components/layout/Card/example.tsx":Te,"../../../../packages/ui/src/components/layout/Card/meta.ts":Ce,"../../../../packages/ui/src/components/layout/DialogActions/DialogActions.tsx":Re,"../../../../packages/ui/src/components/layout/DialogActions/example.tsx":Me,"../../../../packages/ui/src/components/layout/DialogActions/meta.ts":Ee,"../../../../packages/ui/src/components/layout/DialogBody/DialogBody.tsx":Ae,"../../../../packages/ui/src/components/layout/DialogBody/example.tsx":Be,"../../../../packages/ui/src/components/layout/DialogBody/meta.ts":Ie,"../../../../packages/ui/src/components/layout/Divider/Divider.tsx":Ne,"../../../../packages/ui/src/components/layout/Divider/example.tsx":ze,"../../../../packages/ui/src/components/layout/Divider/meta.ts":Fe,"../../../../packages/ui/src/components/layout/Grid/Grid.tsx":Le,"../../../../packages/ui/src/components/layout/Grid/example.tsx":De,"../../../../packages/ui/src/components/layout/Grid/meta.ts":Ve,"../../../../packages/ui/src/components/layout/Header/Header.tsx":He,"../../../../packages/ui/src/components/layout/Header/example.tsx":Oe,"../../../../packages/ui/src/components/layout/Header/meta.ts":$e,"../../../../packages/ui/src/components/layout/Icon/Icon.tsx":Ge,"../../../../packages/ui/src/components/layout/Icon/example.tsx":Ue,"../../../../packages/ui/src/components/layout/Icon/meta.ts":We,"../../../../packages/ui/src/components/layout/Illustration/Illustration.tsx":je,"../../../../packages/ui/src/components/layout/Illustration/example.tsx":Ke,"../../../../packages/ui/src/components/layout/Illustration/meta.ts":qe,"../../../../packages/ui/src/components/layout/ScrollArea/ScrollArea.tsx":Ye,"../../../../packages/ui/src/components/layout/ScrollArea/example.tsx":Xe,"../../../../packages/ui/src/components/layout/ScrollArea/meta.ts":Ze,"../../../../packages/ui/src/components/layout/Stack/Stack.tsx":Je,"../../../../packages/ui/src/components/layout/Stack/example.tsx":Qe,"../../../../packages/ui/src/components/layout/Stack/meta.ts":nt,"../../../../packages/ui/src/components/layout/TabPanel/TabPanel.tsx":rt,"../../../../packages/ui/src/components/layout/TabPanel/example.tsx":et,"../../../../packages/ui/src/components/layout/TabPanel/meta.ts":tt,"../../../../packages/ui/src/components/layout/Text/Text.tsx":ot,"../../../../packages/ui/src/components/layout/Text/example.tsx":at,"../../../../packages/ui/src/components/layout/Text/meta.ts":st,"../../../../packages/ui/src/components/layout/Toolbar/Toolbar.tsx":it,"../../../../packages/ui/src/components/layout/Toolbar/example.tsx":lt,"../../../../packages/ui/src/components/layout/Toolbar/meta.ts":ct,"../../../../packages/ui/src/components/layout/shared.tsx":pt,"../../../../packages/ui/src/components/media/AudioPlayer/AudioPlayer.tsx":dt,"../../../../packages/ui/src/components/media/AudioPlayer/example.tsx":ut,"../../../../packages/ui/src/components/media/AudioPlayer/meta.ts":mt,"../../../../packages/ui/src/components/media/LevelMeter/LevelMeter.tsx":ft,"../../../../packages/ui/src/components/media/LevelMeter/example.tsx":gt,"../../../../packages/ui/src/components/media/LevelMeter/meta.ts":vt,"../../../../packages/ui/src/components/media/RotaryKnob/RotaryKnob.tsx":bt,"../../../../packages/ui/src/components/media/RotaryKnob/example.tsx":ht,"../../../../packages/ui/src/components/media/RotaryKnob/meta.ts":xt,"../../../../packages/ui/src/components/media/Sparkline/Sparkline.tsx":yt,"../../../../packages/ui/src/components/media/Sparkline/example.tsx":kt,"../../../../packages/ui/src/components/media/Sparkline/meta.ts":_t,"../../../../packages/ui/src/components/media/WaveDecoration/WaveDecoration.tsx":Pt,"../../../../packages/ui/src/components/media/WaveDecoration/example.tsx":wt,"../../../../packages/ui/src/components/media/WaveDecoration/meta.ts":St,"../../../../packages/ui/src/components/media/Waveform/Waveform.tsx":Tt,"../../../../packages/ui/src/components/media/Waveform/example.tsx":Ct,"../../../../packages/ui/src/components/media/Waveform/meta.ts":Rt,"../../../../packages/ui/src/components/media/Waveform/useWaveformPeaks.ts":Mt,"../../../../packages/ui/src/components/media/shared.tsx":Et,"../../../../packages/ui/src/components/navigation/Router/Router.tsx":At,"../../../../packages/ui/src/components/navigation/Router/example.tsx":Bt,"../../../../packages/ui/src/components/navigation/Router/meta.ts":It,"../../../../packages/ui/src/core.ts":Nt,"../../../../packages/ui/src/core/artwork.tsx":zt,"../../../../packages/ui/src/core/base.tsx":Ft,"../../../../packages/ui/src/core/motion-engine.d.ts":Lt,"../../../../packages/ui/src/core/motion/hooks.ts":Dt,"../../../../packages/ui/src/core/noise.ts":Vt,"../../../../packages/ui/src/core/providers/context.ts":Ht,"../../../../packages/ui/src/core/responsive.ts":Ot,"../../../../packages/ui/src/dev/exampleHelpers.tsx":$t,"../../../../packages/ui/src/editor.ts":Gt,"../../../../packages/ui/src/forms.ts":Ut,"../../../../packages/ui/src/index.ts":Wt,"../../../../packages/ui/src/router.ts":jt,"../../../../packages/ui/src/theme/typography.ts":Kt})),o=(n,t=`${n}.tsx`)=>l.find(([r])=>r.endsWith(`/${n}/${t}`)),qt=n=>o(n,"example.tsx")?.[1]??`// Нет example.tsx для ${n}`,Yt=n=>o(n)?.[1]??"",Xt=n=>o(n)?.[0].replace(/^.*packages\/ui\/src\//,"src/")??"";function i(n,t){const r=n.indexOf(t);if(r<0)return"";const a=n.indexOf("{",r);if(a<0){const e=n.indexOf(";",r);return n.slice(r,e<0?n.length:e+1).trim()}let s=0;for(let e=a;e<n.length;e+=1)if(n[e]==="{"&&(s+=1),n[e]==="}"&&--s===0)return n.slice(r,e+1).trim();return n.slice(r).trim()}const Zt=n=>{for(const[,t]of l){const r=i(t,`export interface ${n}Props`)||i(t,`export type ${n}Props`);if(r)return r}return`// ${n} не объявляет отдельный Props-интерфейс.
// Компонент использует общие props или композицию дочерних компонентов.`};export{Zt as getComponentApiSource,Yt as getComponentSource,Xt as getComponentSourcePath,qt as getExampleSource};
//# sourceMappingURL=sources-CqsKQ2aB.js.map
