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

/** A procedural picture: rows of pixels computed one by one, then optional vector strokes. */
export interface Painting {
  /** Fill rows `from`..`to` of the image; scale from `image.width` to stay resolution-free. */
  pixels(image: ImageData, from: number, to: number): void;
  /** Draw on top of the pixels (stars, glows, outlines). */
  finish?(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void;
}

const paintings = new Map<string, Promise<HTMLCanvasElement>>();
const nextSlice = () => new Promise<IdleDeadline | undefined>((resume) => {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(resume, { timeout: 32 });
  } else {
    setTimeout(() => resume(undefined), 16);
  }
});

/**
 * Paints a picture into an offscreen canvas in short idle-time slices, so even a large
 * one stays responsive, and keeps it: every instance of the same size reuses the result.
 */
export function paintCanvas(
  key: string,
  width: number,
  height: number,
  painting: Painting,
) {
  const id = `${key}:${width}x${height}`;
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
        const deadline = await nextSlice();
        const started = performance.now();
        const budget = Math.max(1, Math.min(4, deadline?.timeRemaining() ?? 4));
        do {
          painting.pixels(image, row, row + 1);
          row += 1;
        } while (row < height && performance.now() - started < budget);
      }
      await nextSlice();
      context.putImageData(image, 0, 0);
      painting.finish?.(context, width, height);
      return canvas;
    })();
    paintings.set(id, done);
    while (paintings.size > 24) paintings.delete(paintings.keys().next().value!);
  }
  return done;
}
