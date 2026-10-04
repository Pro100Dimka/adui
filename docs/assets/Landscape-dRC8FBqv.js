const n=`import { useRef } from "react";
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
`;export{n as default};
