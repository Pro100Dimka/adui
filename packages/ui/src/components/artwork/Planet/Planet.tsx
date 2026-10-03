import { useEffect, useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { cachedCanvas, clamp01, fbm, noise } from "../../../core/noise";

export type PlanetProps = CommonProps;

const W = 1030;
const H = 228;

/** The rim of a dark planet rising from the bottom right, lit by a ruby atmosphere. */
function paintPlanet(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const scale = width / 515,
    centerX = 344 * scale,
    centerY = 290 * scale,
    radius = 302 * scale;
  const image = context.createImageData(width, height);
  for (let y = 0; y < height; y += 1)
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
            noise(dx * 80 + 8 * terrainNoise, dy * 80 + 8 * terrainNoise) * 2 -
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
  context.putImageData(image, 0, 0);
}

/** Planet horizon banner; children are laid over the dark side. */
export function Planet({ children, ...p }: PlanetProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const canvas = ref.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      context.drawImage(cachedCanvas("planet", W, H, paintPlanet), 0, 0);
      canvas.dataset.ready = "";
    }, 30);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div {...mark("Planet", p)}>
      <canvas ref={ref} width={W} height={H} aria-hidden />
      {children && <div className="ad-planet-content">{children}</div>}
    </div>
  );
}
