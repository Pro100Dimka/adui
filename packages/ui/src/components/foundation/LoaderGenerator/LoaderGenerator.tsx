import { useEffect, useRef, useState } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { tr, useTr } from "../../../core/i18n";
import { ColorPicker } from "../../controls/ColorPicker/ColorPicker";
import { Button } from "../../controls/Button/Button";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { SegmentedControl } from "../../controls/SegmentedControl/SegmentedControl";
import { Slider } from "../../controls/Slider/Slider";
import { Switch } from "../../controls/Switch/Switch";
import { Grid } from "../../layout/Grid/Grid";
import { Stack } from "../../layout/Stack/Stack";
import { Typography } from "../Typography/Typography";
import { Loader, loaderAnimationLabel, loaderAnimations, loaderCss, loaderDefaultImage, type LoaderAnimation } from "../Loader/Loader";
import { useThemePalette } from "../ThemeProvider/ThemeProvider";

export interface LoaderSettings {
  src: string;
  animation: LoaderAnimation;
  /** rem */
  size: number;
  speed: number;
  color: string;
  /** Colours extracted from the image for multicolour effects. */
  palette?: string[];
}

export interface LoaderGeneratorProps extends CommonProps {
  value?: LoaderSettings;
  defaultValue?: Partial<LoaderSettings>;
  onValueChange?: (settings: LoaderSettings) => void;
}

export const loaderGeneratorAnimations = loaderAnimations.filter(
  (animation) => animation !== "orbit" && animation !== "radar",
);
export const loaderSizes = { xs: 4.5, sm: 6.5, md: 9, lg: 12 } as const;
type LoaderSize = keyof typeof loaderSizes;

export const loaderRenderKey = ({ animation }: Pick<LoaderSettings, "animation">) => animation;

const loaderSizeItems = Object.keys(loaderSizes).map((value) => ({
  value: value as LoaderSize,
  label: value.toUpperCase(),
}));

const nearestLoaderSize = (size: number) =>
  loaderSizeItems.reduce((nearest, item) =>
    Math.abs(loaderSizes[item.value] - size) < Math.abs(loaderSizes[nearest.value] - size) ? item : nearest,
  ).value;

const fileToDataUrl = (blob: Blob, signal?: AbortSignal) =>
  new Promise<string>((resolve, reject) => {
    signal?.throwIfAborted();
    const reader = new FileReader();
    const abort = () => reader.abort();
    const finish = (error?: unknown) => {
      signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(String(reader.result));
    };
    reader.onload = () => finish();
    reader.onerror = () => finish(reader.error ?? new Error("Unable to read the file"));
    reader.onabort = () => finish(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    reader.readAsDataURL(blob);
  });

const pixelDistance = (pixels: Uint8ClampedArray, first: number, second: number) =>
  Math.hypot(
    pixels[first * 4] - pixels[second * 4],
    pixels[first * 4 + 1] - pixels[second * 4 + 1],
    pixels[first * 4 + 2] - pixels[second * 4 + 2],
  );

// CPU-only image passes share a short work budget; a microtask alone would not let input run.
const imageWorkSlice = (signal?: AbortSignal) => {
  let sliceStart = performance.now();
  return async () => {
    signal?.throwIfAborted();
    if (performance.now() - sliceStart < 8) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    signal?.throwIfAborted();
    sliceStart = performance.now();
  };
};

/** Removes large, smoothly connected background regions while preserving enclosed logo details. */
export async function removeBackgroundPixels(pixels: Uint8ClampedArray, width: number, height: number, signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (!width || !height || pixels.length < width * height * 4) return pixels;
  const checkpoint = imageWorkSlice(signal);
  const total = width * height;
  const background = new Uint8Array(total);
  const candidate = new Uint8Array(total);
  const originalAlpha = new Uint8Array(total);
  let transparentBorder = 0;
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (pixel % 1024 === 0) await checkpoint();
    originalAlpha[pixel] = pixels[pixel * 4 + 3];
    if (originalAlpha[pixel] < 32) background[pixel] = 1;
  }
  const border: number[] = [];
  for (let x = 0; x < width; x += 1) border.push(x);
  for (let y = 1; y < height; y += 1) {
    border.push(y * width);
    if (width > 1) border.push((y + 1) * width - 1);
  }
  if (height > 1) for (let x = 1; x < width - 1; x += 1) border.push((height - 1) * width + x);
  for (const pixel of border) transparentBorder += background[pixel];
  if (transparentBorder > border.length / 4) return pixels;

  const neighbours = (pixel: number) => {
    const x = pixel % width;
    const values = [];
    if (x > 0) values.push(pixel - 1);
    if (x + 1 < width) values.push(pixel + 1);
    if (pixel >= width) values.push(pixel - width);
    if (pixel + width < total) values.push(pixel + width);
    return values;
  };
  const terms = (pixel: number) => {
    const x = width > 1 ? ((pixel % width) / (width - 1)) * 2 - 1 : 0;
    const y = height > 1 ? (Math.floor(pixel / width) / (height - 1)) * 2 - 1 : 0;
    return [1, x, y, x * x, x * y, y * y];
  };
  const matrix = Array.from({ length: 6 }, () => Array(6).fill(0) as number[]);
  const right = Array.from({ length: 3 }, () => Array(6).fill(0) as number[]);
  for (let edge = 0; edge < border.length; edge += 1) {
    if (edge % 1024 === 0) await checkpoint();
    const pixel = border[edge];
    const basis = terms(pixel);
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 6; column += 1) matrix[row][column] += basis[row] * basis[column];
      for (let channel = 0; channel < 3; channel += 1) right[channel][row] += basis[row] * pixels[pixel * 4 + channel];
    }
  }
  const solve = (values: number[]) => {
    const system = matrix.map((row, index) => [...row, values[index]]);
    for (let pivot = 0; pivot < 6; pivot += 1) {
      let best = pivot;
      for (let row = pivot + 1; row < 6; row += 1) if (Math.abs(system[row][pivot]) > Math.abs(system[best][pivot])) best = row;
      [system[pivot], system[best]] = [system[best], system[pivot]];
      const divisor = system[pivot][pivot];
      if (Math.abs(divisor) < 1e-8) return undefined;
      for (let column = pivot; column <= 6; column += 1) system[pivot][column] /= divisor;
      for (let row = 0; row < 6; row += 1) {
        if (row === pivot) continue;
        const factor = system[row][pivot];
        for (let column = pivot; column <= 6; column += 1) system[row][column] -= factor * system[pivot][column];
      }
    }
    return system.map((row) => row[6]);
  };
  const solutions = right.map(solve);
  const curvedBackground = solutions.every((coefficients) => coefficients !== undefined) ? solutions : undefined;
  const curveError = curvedBackground
    ? Math.sqrt(border.reduce((sum, pixel) => {
        const basis = terms(pixel);
        return sum + curvedBackground.reduce((channels, coefficients, channel) => {
          const predicted = coefficients.reduce((value, coefficient, index) => value + coefficient * basis[index], 0);
          return channels + (pixels[pixel * 4 + channel] - predicted) ** 2;
        }, 0);
      }, 0) / (border.length * 3))
    : Infinity;
  // Predict a smooth background from opposite image edges. Unlike a local flood fill, this
  // cannot walk from a blue sky into a similarly blue logo across a soft antialiased edge.
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (pixel % 1024 === 0) await checkpoint();
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const horizontal = width > 1 ? x / (width - 1) : 0;
    const vertical = height > 1 ? y / (height - 1) : 0;
    const edges = [y * width, y * width + width - 1, x, (height - 1) * width + x];
    let distance = 0;
    let curvedDistance = curveError <= 24 ? 0 : Infinity;
    const basis = terms(pixel);
    for (let channel = 0; channel < 3; channel += 1) {
      const leftRight = pixels[edges[0] * 4 + channel] * (1 - horizontal) + pixels[edges[1] * 4 + channel] * horizontal;
      const topBottom = pixels[edges[2] * 4 + channel] * (1 - vertical) + pixels[edges[3] * 4 + channel] * vertical;
      const delta = pixels[pixel * 4 + channel] - (leftRight + topBottom) / 2;
      distance += delta * delta;
      if (curveError <= 24 && curvedBackground) {
        const predicted = curvedBackground[channel].reduce((value, coefficient, index) => value + coefficient * basis[index], 0);
        curvedDistance += (pixels[pixel * 4 + channel] - predicted) ** 2;
      }
    }
    // Real logo exports often use a radial highlight whose centre is much brighter than its
    // edges. A generous absolute tolerance follows that highlight, while the global edge
    // prediction still prevents the mask from wandering into similarly coloured artwork.
    if (Math.min(Math.sqrt(distance), Math.sqrt(curvedDistance)) <= 50) candidate[pixel] = 1;
  }

  const queue = border.filter((pixel) => candidate[pixel]);
  const queued = new Uint8Array(total);
  const mainBackground = new Uint8Array(total);
  for (const pixel of queue) queued[pixel] = 1;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    if (cursor % 1024 === 0) await checkpoint();
    const pixel = queue[cursor];
    background[pixel] = 1;
    for (const near of neighbours(pixel)) {
      if (!queued[near] && candidate[near]) {
        queued[near] = 1;
        queue.push(near);
      }
    }
  }
  const firstLayerSize = queue.length;
  let foundMainBackground = firstLayerSize >= total * 0.15 && firstLayerSize >= border.length * 1.5;
  const predictedMainBackground = foundMainBackground;
  if (foundMainBackground) for (let index = 0; index < queue.length; index += 1) {
    if (index % 1024 === 0) await checkpoint();
    mainBackground[queue[index]] = 1;
  }

  // A thin frame can surround a second, solid background colour. Remove that large connected
  // region with a fixed-colour comparison. A few exports have multiple thin matte/keyline
  // layers, so repeat this a bounded number of times and stop before small logo regions.
  if (firstLayerSize && !foundMainBackground) {
    for (let layer = 0; layer < 8; layer += 1) {
      const visited = new Uint8Array(total);
      const seeds: number[] = [];
      for (let pixel = 0; pixel < total; pixel += 1) {
        if (pixel % 1024 === 0) await checkpoint();
        if (!background[pixel] && neighbours(pixel).some((near) => background[near])) seeds.push(pixel);
      }
      let removedLayer = false;
      let removedMainBackground = false;
      for (const seed of seeds) {
        if (visited[seed] || background[seed]) continue;
        const region = [seed];
        visited[seed] = 1;
        for (let cursor = 0; cursor < region.length; cursor += 1) {
          if (cursor % 1024 === 0) await checkpoint();
          for (const near of neighbours(region[cursor])) {
            if (visited[near] || background[near] || pixelDistance(pixels, seed, near) > 42) continue;
            visited[near] = 1;
            region.push(near);
          }
        }
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;
        for (let index = 0; index < region.length; index += 1) {
          if (index % 1024 === 0) await checkpoint();
          const pixel = region[index];
          const x = pixel % width;
          const y = Math.floor(pixel / width);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
        const boundsArea = (maxX - minX + 1) * (maxY - minY + 1);
        const frameLike = maxX - minX > 1 && maxY - minY > 1 && region.length < boundsArea * 0.65;
        const large = region.length >= Math.max(4, total * 0.08);
        if (!large && !frameLike) continue;
        for (let index = 0; index < region.length; index += 1) {
          if (index % 1024 === 0) await checkpoint();
          const pixel = region[index];
          background[pixel] = 1;
          if (large && !frameLike) mainBackground[pixel] = 1;
        }
        removedLayer = true;
        removedMainBackground ||= large && !frameLike;
      }
      if (!removedLayer && seeds.length) {
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;
        for (let index = 0; index < seeds.length; index += 1) {
          if (index % 1024 === 0) await checkpoint();
          const pixel = seeds[index];
          const x = pixel % width;
          const y = Math.floor(pixel / width);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
        const boundsArea = (maxX - minX + 1) * (maxY - minY + 1);
        const fragmentedFrame = maxX - minX > 1 && maxY - minY > 1 && seeds.length < boundsArea * 0.65;
        if (fragmentedFrame) {
          for (let index = 0; index < seeds.length; index += 1) {
            if (index % 1024 === 0) await checkpoint();
            background[seeds[index]] = 1;
          }
          removedLayer = true;
        }
      }
      foundMainBackground ||= removedMainBackground;
      if (!removedLayer || removedMainBackground) break;
    }
  }

  // Remove matching background visible through enclosed counters/holes, but compare it only
  // with the main background layer. This keeps white/gold logo details that merely match an
  // outer matte or keyline colour.
  const mainColours = new Set<string>();
  const colourBucket = (pixel: number, redOffset = 0, greenOffset = 0, blueOffset = 0) =>
    `${Math.floor(pixels[pixel * 4] / 32) + redOffset}:${Math.floor(pixels[pixel * 4 + 1] / 32) + greenOffset}:${Math.floor(pixels[pixel * 4 + 2] / 32) + blueOffset}`;
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (pixel % 1024 === 0) await checkpoint();
    if (mainBackground[pixel]) mainColours.add(colourBucket(pixel));
  }
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (pixel % 1024 === 0) await checkpoint();
    if (background[pixel]) continue;
    if (candidate[pixel] && predictedMainBackground) {
      background[pixel] = 1;
      continue;
    }
    if (mainColours.size > 12) continue;
    let matchesMain = false;
    for (let red = -1; red <= 1 && !matchesMain; red += 1) {
      for (let green = -1; green <= 1 && !matchesMain; green += 1) {
        for (let blue = -1; blue <= 1; blue += 1) {
          if (mainColours.has(colourBucket(pixel, red, green, blue))) {
            matchesMain = true;
            break;
          }
        }
      }
    }
    if (matchesMain) background[pixel] = 1;
  }

  // Lossy encoders sometimes leave a one-pixel matte line along an image edge. Remove only
  // elongated edge components; compact artwork that happens to touch the crop stays intact.
  const foregroundVisited = new Uint8Array(total);
  for (let seed = 0; seed < total; seed += 1) {
    if (seed % 1024 === 0) await checkpoint();
    if (background[seed] || foregroundVisited[seed]) continue;
    const region = [seed];
    foregroundVisited[seed] = 1;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    for (let cursor = 0; cursor < region.length; cursor += 1) {
      if (cursor % 1024 === 0) await checkpoint();
      const pixel = region[cursor];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const near of neighbours(pixel)) {
        if (background[near] || foregroundVisited[near]) continue;
        foregroundVisited[near] = 1;
        region.push(near);
      }
    }
    const touchesEdge = minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1;
    const regionWidth = maxX - minX + 1;
    const regionHeight = maxY - minY + 1;
    const edgeMargin = Math.max(2, Math.ceil(Math.min(width, height) * 0.025));
    const nearEdge = minX <= edgeMargin || minY <= edgeMargin
      || maxX >= width - 1 - edgeMargin || maxY >= height - 1 - edgeMargin;
    const insetFrame = minX <= edgeMargin && minY <= edgeMargin
      && maxX >= width - 1 - edgeMargin && maxY >= height - 1 - edgeMargin
      && region.length < regionWidth * regionHeight * 0.25;
    const edgeSpeckle = nearEdge && region.length <= Math.max(3, Math.ceil(total * 0.0001));
    const thinVertical = regionWidth <= Math.max(2, width * 0.025) && regionHeight >= height * 0.25;
    const thinHorizontal = regionHeight <= Math.max(2, height * 0.025) && regionWidth >= width * 0.25;
    if (width >= 16 && height >= 16 && (edgeSpeckle || insetFrame || (touchesEdge || nearEdge) && (thinVertical || thinHorizontal))) {
      for (let index = 0; index < region.length; index += 1) {
        if (index % 1024 === 0) await checkpoint();
        background[region[index]] = 1;
      }
    }
  }

  for (let pixel = 0; pixel < total; pixel += 1) {
    if (pixel % 1024 === 0) await checkpoint();
    const alphaOffset = pixel * 4 + 3;
    if (background[pixel]) {
      pixels[alphaOffset] = 0;
      continue;
    }
    const edgeDistances = neighbours(pixel)
      .filter((near) => background[near])
      .map((near) => pixelDistance(pixels, pixel, near));
    if (edgeDistances.length) {
      const coverage = Math.max(0, Math.min(1, (Math.min(...edgeDistances) - 8) / 52));
      pixels[alphaOffset] = Math.round(originalAlpha[pixel] * coverage);
    }
  }
  return pixels;
}

/** Finds a representative visible colour for rings, highlights and image glow. */
export function pickLoaderAccent(pixels: Uint8ClampedArray) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] < 64) continue;
    red += pixels[offset];
    green += pixels[offset + 1];
    blue += pixels[offset + 2];
    count += 1;
  }
  if (!count) return "#ff244c";
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel / count).toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function pickLoaderPalette(pixels: Uint8ClampedArray, signal?: AbortSignal) {
  const checkpoint = imageWorkSlice(signal);
  const buckets = new Map<number, { red: number; green: number; blue: number; count: number }>();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (offset % 4096 === 0) await checkpoint();
    if (pixels[offset + 3] < 64) continue;
    const key = Math.floor(pixels[offset] / 32) * 64 + Math.floor(pixels[offset + 1] / 32) * 8 + Math.floor(pixels[offset + 2] / 32);
    const bucket = buckets.get(key) ?? { red: 0, green: 0, blue: 0, count: 0 };
    bucket.red += pixels[offset];
    bucket.green += pixels[offset + 1];
    bucket.blue += pixels[offset + 2];
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  const candidates = [...buckets.values()]
    .map((bucket) => ({
      count: bucket.count,
      colour: [bucket.red, bucket.green, bucket.blue].map((channel) => Math.round(channel / bucket.count)),
    }))
    .sort((a, b) => {
      const chroma = ({ colour }: typeof a) => Math.max(...colour) - Math.min(...colour);
      return Number(chroma(b) >= 24) - Number(chroma(a) >= 24) || b.count - a.count;
    });
  const picked: number[][] = [];
  for (const { colour } of candidates) {
    if (picked.every((other) => Math.hypot(...colour.map((channel, i) => channel - other[i])) > 48)) picked.push(colour);
    if (picked.length === 3) break;
  }
  const colours = picked.map((colour) => `#${colour.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`);
  for (const fallback of ["#ff7c97", "#7c3aed", "#24d6ff"]) {
    if (colours.length >= 3) break;
    colours.push(fallback);
  }
  return colours;
}

async function removeImageBackground(src: string, translate = tr, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    const clean = () => {
      signal?.removeEventListener("abort", abort);
      element.onload = element.onerror = null;
    };
    const abort = () => { clean(); element.src = ""; reject(signal?.reason); };
    element.onload = () => { clean(); resolve(element); };
    element.onerror = () => { clean(); reject(new Error(translate("Не удалось прочитать изображение."))); };
    signal?.addEventListener("abort", abort, { once: true });
    element.src = src;
  });
  signal?.throwIfAborted();
  const canvas = document.createElement("canvas");
  // A loader is at most 12rem: a 2048px working image retains ample detail without
  // allocating full-resolution photo-sized masks. The original upload remains available.
  const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error(translate("Обработка изображений недоступна в этом браузере."));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  await removeBackgroundPixels(imageData.data, canvas.width, canvas.height, signal);
  context.putImageData(imageData, 0, 0);
  const palette = await pickLoaderPalette(imageData.data, signal);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    (encoded) => encoded ? resolve(encoded) : reject(new Error(translate("Не удалось обработать изображение."))),
    "image/png",
  ));
  return { src: await fileToDataUrl(blob, signal), color: palette[0], palette };
}

const escapeHtmlAttribute = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const loaderCode = (settings: LoaderSettings) =>
  `<Loader src={${JSON.stringify(settings.src)}} animation="${settings.animation}" size="${settings.size}rem"${settings.speed !== 1 ? ` speed={${settings.speed}}` : ""} color="${settings.color}"${settings.palette?.length ? ` palette={${JSON.stringify(settings.palette)}}` : ""} />`;

/** A standalone page with just the loader: its markup and the animation it uses. */
export function loaderHtml({ src, animation, size, speed, color, palette }: LoaderSettings) {
  const safeSrc = escapeHtmlAttribute(src);
  const picture = src === loaderDefaultImage
    ? '<span class="ad-loader-img ad-loader-default-image" aria-hidden="true"></span>'
    : `<img class="ad-loader-img" src="${safeSrc}" alt="">`;
  const rings = ["wave", "palette"].includes(animation) ? 2 : ["bounce", "orbit", "glow", "radar"].includes(animation) ? 1 : 0;
  const extra =
    animation === "fill"
      ? `<span class="ad-loader-fill">${picture}</span>`
      : animation === "shine"
        ? `<span class="ad-loader-sweep"><i></i></span>`
        : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Loader</title><style>
html,body{height:100%;margin:0;display:grid;place-items:center;background:#0b0508}
${loaderCss.trim()}
</style></head><body>
<span class="ad-loader" role="status" aria-label="Loading" data-animation="${animation}" style="--ad-loader-size:${size}rem;--ad-loader-speed:${speed};--ad-loader-color:${color};--ad-loader-color-2:${palette?.[1] ?? color};--ad-loader-color-3:${palette?.[2] ?? color};${src === loaderDefaultImage || animation === "shine" ? `--ad-loader-src:url('${safeSrc}')` : ""}">${'<span class="ad-loader-ring"></span>'.repeat(rings)}${picture}${extra}</span>
</body></html>`;
}

/**
 * Make a loader from your own picture: upload it, pick an animation from live
 * previews, set size, speed and colour, then copy the code or download a ready page.
 */
export function LoaderGenerator({ value, defaultValue, onValueChange, ...p }: LoaderGeneratorProps) {
  const tr = useTr();
  const theme = useThemePalette();
  const [own, setOwn] = useState<Partial<LoaderSettings>>(() => defaultValue ?? {});
  const settings: LoaderSettings = value ?? {
    src: loaderDefaultImage,
    animation: "pulse",
    size: 9,
    speed: 1,
    color: theme.primary,
    palette: [theme.primary, theme.secondary, theme.primary],
    ...own,
  };
  const [uploaded, setUploaded] = useState<{ original: string; transparent: string }>();
  const [removeBackground, setRemoveBackground] = useState(true);
  const [uploadState, setUploadState] = useState<{ status: "idle" | "processing"; error?: never } | { status: "error"; error: string }>({ status: "idle" });
  const processing = uploadState.status === "processing";
  const uploadController = useRef<AbortController>(null);
  const latest = useRef({ settings, removeBackground, onValueChange });
  latest.current = { settings, removeBackground, onValueChange };
  useEffect(() => () => uploadController.current?.abort(), []);
  const update = (patch: Partial<LoaderSettings>) => {
    const next = { ...latest.current.settings, ...patch };
    latest.current.settings = next;
    setOwn((current) => ({ ...current, ...patch }));
    latest.current.onValueChange?.(next);
  };

  const upload = async (file: File) => {
    uploadController.current?.abort();
    const controller = new AbortController();
    uploadController.current = controller;
    setUploadState({ status: "processing" });
    try {
      const original = await fileToDataUrl(file, controller.signal);
      const processed = await removeImageBackground(original, tr, controller.signal);
      controller.signal.throwIfAborted();
      setUploaded({ original, transparent: processed.src });
      update({ src: latest.current.removeBackground ? processed.src : original, color: processed.color, palette: processed.palette });
      setUploadState({ status: "idle" });
    } catch (cause) {
      if (!controller.signal.aborted)
        setUploadState({ status: "error", error: cause instanceof Error ? cause.message : tr("Не удалось обработать изображение.") });
    }
  };

  return (
    <Stack {...mark("LoaderGenerator", p)} gap={4}>
      <Grid className="ad-loader-generator-top" columns={{ base: 1, sm: "minmax(12rem, 1fr) minmax(0, 1.4fr)" }} gap={4}>
        <Grid className="ad-loader-generator-stage" columns={1} align="center" justify="center">
          <Loader key={loaderRenderKey(settings)} src={settings.src} animation={settings.animation} size={`${settings.size}rem`} speed={settings.speed} color={settings.color} palette={settings.palette} />
        </Grid>
        <Stack className="ad-loader-generator-controls" gap={3}>
          <FilePicker variant="zone" icon="photo" accept="image/*" label={tr("Загрузите картинку")}
            description={processing ? tr("Убираем фон…") : tr("Поддерживаются PNG, JPEG, SVG и WebP")}
            disabled={processing} onFiles={([file]) => file && void upload(file)} />
          {uploadState.error && <Typography variant="caption" tone="danger">{uploadState.error}</Typography>}
          <Stack className="ad-loader-generator-toolbar" direction="row" align="end" gap={3}>
            <Stack className="ad-loader-generator-color">
              <ColorPicker label={tr("Цвет эффектов")} value={settings.color} onValueChange={(color) => update({ color })} />
            </Stack>
            <Stack className="ad-loader-generator-size" gap={1}>
              <Typography variant="label">{tr("Размер")}</Typography>
              <SegmentedControl<LoaderSize> label={tr("Размер")} size="sm" items={loaderSizeItems}
                value={nearestLoaderSize(settings.size)} onValueChange={(size) => update({ size: loaderSizes[size] })} />
            </Stack>
            <Stack as="label" className="ad-loader-generator-slider" gap={1}>
              <Stack direction="row" justify="between"><Typography variant="label">{tr("Скорость")}</Typography><Typography variant="mono" tone="muted">×{settings.speed}</Typography></Stack>
              <Slider label={tr("Скорость")} min={0.25} max={3} step={0.25} value={settings.speed} onValueChange={(speed) => update({ speed })} />
            </Stack>
            <Switch label={tr("Убрать фон")} checked={removeBackground} onValueChange={(enabled) => {
              setRemoveBackground(enabled);
              if (uploaded) update({ src: enabled ? uploaded.transparent : uploaded.original });
            }} />
          </Stack>
        </Stack>
      </Grid>

      <Typography variant="label">{tr("Анимация")}</Typography>
      <Stack className="ad-loader-generator-grid" direction="row" gap={2} role="radiogroup" aria-label={tr("Анимация")}>
        {loaderGeneratorAnimations.map((animation) => (
          <Button key={animation} variant="ghost" type="button" role="radio" aria-checked={animation === settings.animation}
            className="ad-loader-generator-option" onClick={() => update({ animation })}>
            <Loader src={settings.src} animation={animation} size="3.5rem" speed={settings.speed} color={settings.color} palette={settings.palette} />
            <Typography variant="caption">{loaderAnimationLabel(animation, tr)}</Typography>
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
