/** Deterministic randomness and value noise for procedural artwork (same picture on every render). */

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

/**
 * Paints once into an offscreen canvas and keeps it, so every instance of an artwork
 * reuses the same picture instead of recomputing millions of noise samples.
 */
export function cachedCanvas(
  key: string,
  width: number,
  height: number,
  paint: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void,
) {
  const cache = ((
    cachedCanvas as { store?: Map<string, HTMLCanvasElement> }
  ).store ??= new Map());
  let canvas = cache.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context) paint(context, width, height);
    cache.set(key, canvas);
  }
  return canvas;
}
