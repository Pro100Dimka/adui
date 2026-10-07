import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { readFileSync } from "node:fs";
import { loaderCss } from "../src/components/foundation/Loader/Loader";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import {
  LoaderGenerator,
  loaderGeneratorAnimations,
  loaderRenderKey,
  loaderSizes,
  loaderCode,
  loaderHtml,
  pickLoaderAccent,
  pickLoaderPalette,
  removeBackgroundPixels,
} from "../src/components/foundation/LoaderGenerator/LoaderGenerator";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function mockUploadImage(width: number, height: number) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("FileReader", class {
    result = "";
    onload = () => {};
    onabort = () => {};
    abort() { this.onabort(); }
    readAsDataURL(blob: Blob) {
      this.result = blob instanceof Blob ? "data:image/png;base64,encoded" : "data:image/png;base64,original";
      queueMicrotask(() => this.onload());
    }
  });
  vi.stubGlobal("Image", class {
    naturalWidth = width;
    naturalHeight = height;
    onload = () => {};
    set src(_: string) { queueMicrotask(() => this.onload()); }
  });
  const canvas = {
    width: 0, height: 0,
    getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(16) }), putImageData() {} }),
    toBlob: vi.fn((callback: (blob: Blob) => void) => queueMicrotask(() => callback(new Blob(["png"], { type: "image/png" })))),
    toDataURL: vi.fn(() => "data:image/png;base64,encoded"),
  };
  vi.stubGlobal("document", {
    createElement: (tag: string) => tag === "canvas" ? canvas : { dataset: {}, textContent: "" },
    head: { append() {} },
  });
  return canvas;
}

describe("LoaderGenerator", () => {
  it("encodes processed images asynchronously and bounds the loader image working size", async () => {
    const canvas = mockUploadImage(6000, 3000);
    const onValueChange = vi.fn();
    let tree: ReturnType<typeof create>;
    act(() => { tree = create(createElement(LoaderGenerator, { onValueChange })); });
    await act(async () => {
      tree.root.findByType(FilePicker).props.onFiles([{}]);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(canvas.toDataURL).not.toHaveBeenCalled();
    expect(canvas.toBlob).toHaveBeenCalled();
    expect(canvas.width).toBe(2048);
    expect(canvas.height).toBe(1024);
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ src: "data:image/png;base64,encoded" }));
    act(() => tree.unmount());
  });

  it("ignores encoded images when the generator closed during encoding", async () => {
    const canvas = mockUploadImage(2, 2);
    let finishEncoding: ((blob: Blob) => void) | undefined;
    canvas.toBlob.mockImplementation((callback) => { finishEncoding = callback; });
    const onValueChange = vi.fn();
    let tree: ReturnType<typeof create>;
    act(() => { tree = create(createElement(LoaderGenerator, { onValueChange })); });
    await act(async () => {
      tree.root.findByType(FilePicker).props.onFiles([{}]);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(finishEncoding).toBeTypeOf("function");
    act(() => tree.unmount());
    await act(async () => { finishEncoding?.(new Blob(["png"], { type: "image/png" })); });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("compares palette colours only with colours that were actually selected", async () => {
    const pixels = new Uint8ClampedArray([
      100, 0, 0, 255, 100, 0, 0, 255, 100, 0, 0, 255,
      145, 0, 0, 255, 145, 0, 0, 255,
      190, 0, 0, 255,
    ]);
    expect((await pickLoaderPalette(pixels)).slice(0, 2)).toEqual(["#640000", "#be0000"]);
  });

  it("yields during colour extraction without discarding image pixels", async () => {
    let elapsed = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ++elapsed);
    const pixels = new Uint8ClampedArray(256 * 256 * 4).fill(255);
    const heartbeat = vi.fn();
    const timer = setTimeout(heartbeat, 0);
    try {
      expect(await pickLoaderPalette(pixels)).toContain("#ffffff");
      expect(heartbeat).toHaveBeenCalled();
    } finally {
      clearTimeout(timer);
    }
  });

  it("does not process a pending upload after the generator unmounts", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let finishReading = () => {};
    vi.stubGlobal("FileReader", class {
      result = "data:image/png;base64,original";
      onload = () => {};
      onabort = () => {};
      abort() { this.onabort(); }
      readAsDataURL() { finishReading = () => this.onload(); }
    });
    vi.stubGlobal("Image", class {
      naturalWidth = 2;
      naturalHeight = 2;
      onload = () => {};
      set src(_: string) { queueMicrotask(() => this.onload()); }
    });
    const createCanvas = vi.fn(() => ({
      width: 0, height: 0,
      getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(16) }), putImageData() {} }),
      toDataURL: () => "data:image/png;base64,transparent",
    }));
    vi.stubGlobal("document", {
      createElement: (tag: string) => tag === "canvas" ? createCanvas() : { dataset: {}, textContent: "" },
      head: { append() {} },
    });
    const onValueChange = vi.fn();
    let tree: ReturnType<typeof create>;
    act(() => { tree = create(createElement(LoaderGenerator, { onValueChange })); });
    act(() => tree.root.findByType(FilePicker).props.onFiles([{}]));
    act(() => tree.unmount());
    await act(async () => {
      finishReading();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(createCanvas).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("lets user input run while removing a large image background", async () => {
    let elapsed = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ++elapsed);
    const size = 128;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    const heartbeat = vi.fn();
    const timer = setTimeout(heartbeat, 0);
    try {
      await removeBackgroundPixels(pixels, size, size);
      expect(heartbeat).toHaveBeenCalled();
      expect(pixels[3]).toBe(0);
    } finally {
      clearTimeout(timer);
    }
  });

  it("cancels image processing at the next work slice", async () => {
    let elapsed = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ++elapsed);
    const size = 256;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 0);
    try {
      await expect(Promise.resolve().then(async () => {
        await removeBackgroundPixels(pixels, size, size, controller.signal);
        return "completed";
      }))
        .rejects.toMatchObject({ name: "AbortError" });
    } finally {
      clearTimeout(timer);
    }
  });

  it("removes a flat image background and feathers contrasting edge pixels", async () => {
    const pixels = new Uint8ClampedArray([
      255, 255, 255, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,
      250, 250, 255, 255,
      255, 0, 80, 255,
      255, 255, 255, 255,
      225, 225, 230, 255,
      0, 110, 255, 255,
    ]);

    await removeBackgroundPixels(pixels, 3, 3);

    expect(pixels[3]).toBe(0);
    expect(pixels[19]).toBeLessThan(80);
    expect(pixels[23]).toBe(255);
    expect(pixels[31]).toBeGreaterThan(0);
    expect(pixels[31]).toBeLessThan(255);
    expect(pixels[35]).toBe(0);

    const withCodecEdge = new Uint8ClampedArray(20 * 20 * 4);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        withCodecEdge.set(x === 1 ? [210, 225, 235, 255] : x === 10 && y === 10 ? [255, 255, 255, 255] : [235, 25, 35, 255], (y * 20 + x) * 4);
      }
    }

    await removeBackgroundPixels(withCodecEdge, 20, 20);

    expect(withCodecEdge[(10 * 20 + 1) * 4 + 3]).toBe(0);
    expect(withCodecEdge[(10 * 20 + 10) * 4 + 3]).toBe(255);

    const withInsetFrame = new Uint8ClampedArray(20 * 20 * 4);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        const frame = (x === 1 || x === 18) && y >= 1 && y <= 18 || (y === 1 || y === 18) && x >= 1 && x <= 18;
        withInsetFrame.set(frame ? [185, 120, 125, 255] : x === 10 && y === 10 ? [255, 255, 255, 255] : [235, 25, 35, 255], (y * 20 + x) * 4);
      }
    }

    await removeBackgroundPixels(withInsetFrame, 20, 20);

    expect(withInsetFrame[(10 * 20 + 1) * 4 + 3]).toBe(0);
    expect(withInsetFrame[(10 * 20 + 10) * 4 + 3]).toBe(255);

    const withEdgeSpeckles = new Uint8ClampedArray(20 * 20 * 4);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        const logo = x >= 9 && x <= 10 && y >= 9 && y <= 10;
        const speckle = x === 1 && y === 3;
        withEdgeSpeckles.set(logo ? [20, 110, 235, 255] : speckle ? [245, 245, 245, 255] : [235, 25, 35, 255], (y * 20 + x) * 4);
      }
    }

    await removeBackgroundPixels(withEdgeSpeckles, 20, 20);

    expect(withEdgeSpeckles[(3 * 20 + 1) * 4 + 3]).toBe(0);
    expect(withEdgeSpeckles[(9 * 20 + 9) * 4 + 3]).toBe(255);
  });

  it("removes a border plus a second background colour without erasing matching logo details", async () => {
    const white = [255, 255, 255, 255];
    const green = [0, 115, 86, 255];
    const pixels = new Uint8ClampedArray([
      ...white, ...white, ...white, ...white, ...white,
      ...white, ...green, ...green, ...green, ...white,
      ...white, ...green, ...white, ...green, ...white,
      ...white, ...green, ...green, ...green, ...white,
      ...white, ...white, ...white, ...white, ...white,
    ]);

    await removeBackgroundPixels(pixels, 5, 5);

    expect(pixels[3]).toBe(0);
    expect(pixels[(1 * 5 + 1) * 4 + 3]).toBe(0);
    expect(pixels[(2 * 5 + 2) * 4 + 3]).toBe(255);
  });

  it("peels thin nested frames before removing a large inner background", async () => {
    const frames = [
      [255, 255, 255, 255],
      [195, 205, 200, 255],
      [135, 160, 150, 255],
      [75, 120, 105, 255],
      [25, 80, 65, 255],
    ];
    const green = [0, 115, 86, 255];
    const gold = [230, 180, 35, 255];
    const pixels = new Uint8ClampedArray(15 * 15 * 4);
    for (let y = 0; y < 15; y += 1) {
      for (let x = 0; x < 15; x += 1) {
        const inset = Math.min(x, y, 14 - x, 14 - y);
        const frame = frames[inset];
        const antialiasedFrame = frame?.map((channel, index) => index === 3 || inset === 0 ? channel : channel + ((x + y) % 2 ? 28 : -28));
        pixels.set(x === 7 && y === 7 ? gold : antialiasedFrame ?? green, (y * 15 + x) * 4);
      }
    }

    await removeBackgroundPixels(pixels, 15, 15);

    expect(pixels[(4 * 15 + 4) * 4 + 3]).toBe(0);
    expect(pixels[(5 * 15 + 5) * 4 + 3]).toBe(0);
    expect(pixels[(7 * 15 + 7) * 4 + 3]).toBe(255);
  });

  it("follows a smooth edge-connected gradient but stops at a sharp logo edge", async () => {
    const pixels = new Uint8ClampedArray(5 * 5 * 4);
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const offset = (y * 5 + x) * 4;
        pixels.set(x === 2 && y === 2 ? [0, 20, 170, 255] : [180 + x * 8, 220 + y * 6, 245, 255], offset);
      }
    }

    await removeBackgroundPixels(pixels, 5, 5);

    expect(pixels[(1 * 5 + 1) * 4 + 3]).toBe(0);
    expect(pixels[(2 * 5 + 2) * 4 + 3]).toBe(255);
  });

  it("removes a bright radial gradient behind a contrasting logo", async () => {
    const pixels = new Uint8ClampedArray(7 * 7 * 4);
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const offset = (y * 7 + x) * 4;
        const glow = Math.max(0, 58 - Math.hypot(x - 3, y - 3) * 19);
        pixels.set(x === 3 && y === 3 ? [0, 35, 175, 255] : [175 + glow, 205 + glow * 0.75, 232 + glow * 0.35, 255], offset);
      }
    }

    await removeBackgroundPixels(pixels, 7, 7);

    expect(pixels[(2 * 7 + 3) * 4 + 3]).toBe(0);
    expect(pixels[(3 * 7 + 3) * 4 + 3]).toBe(255);
  });

  it("removes background enclosed inside a logo", async () => {
    const background = [200, 230, 250, 255];
    const logo = [10, 55, 175, 255];
    const pixels = new Uint8ClampedArray(7 * 7 * 4);
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const ring = x >= 2 && x <= 4 && y >= 2 && y <= 4 && (x === 2 || x === 4 || y === 2 || y === 4);
        pixels.set(ring ? logo : background, (y * 7 + x) * 4);
      }
    }

    await removeBackgroundPixels(pixels, 7, 7);

    expect(pixels[(3 * 7 + 3) * 4 + 3]).toBe(0);
    expect(pixels[(2 * 7 + 3) * 4 + 3]).toBe(255);

    const size = 41;
    const gradient = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const radius = Math.hypot(x - 20, y - 20);
        const glow = Math.max(0, 1 - radius / 28);
        const logoRing = radius >= 7 && radius <= 9;
        gradient.set(
          logoRing ? [250, 245, 245, 255] : [45 + glow * 145, glow * 55, 12 + glow * 68, 255],
          (y * size + x) * 4,
        );
      }
    }

    await removeBackgroundPixels(gradient, size, size);

    expect(gradient[(20 * size + 20) * 4 + 3]).toBe(0);
    expect(gradient[(20 * size + 28) * 4 + 3]).toBe(255);
  });

  it("keeps an image that already has a transparent background unchanged", async () => {
    const pixels = new Uint8ClampedArray([
      0, 0, 0, 0,
      255, 30, 60, 180,
      0, 0, 0, 0,
      255, 30, 60, 255,
    ]);
    const original = pixels.slice();

    await removeBackgroundPixels(pixels, 2, 2);

    expect(pixels).toEqual(original);
  });

  it("embeds uploaded data URLs in copied JSX instead of referencing an undefined variable", () => {
    expect(loaderCode({
      src: "data:image/png;base64,a+b/c==",
      animation: "spin",
      size: 6,
      speed: 1,
      color: "#ff244c",
    })).toContain('src={"data:image/png;base64,a+b/c=="}');
  });

  it("escapes image URLs in downloaded HTML attributes", () => {
    const html = loaderHtml({
      src: 'logo.png" onerror="alert(1)',
      animation: "spin",
      size: 6,
      speed: 1,
      color: "#ff244c",
    });

    expect(html).toContain('src="logo.png&quot; onerror=&quot;alert(1)"');
    expect(html).not.toContain('src="logo.png" onerror=');
  });

  it("offers only the compact animation set without orbit and radar", () => {
    expect(loaderGeneratorAnimations).not.toContain("orbit");
    expect(loaderGeneratorAnimations).not.toContain("radar");
    expect(loaderGeneratorAnimations).toContain("spin");
    expect(loaderGeneratorAnimations).toContain("palette");
  });

  it("uses the shared four-step size scale", () => {
    expect(loaderSizes).toEqual({ xs: 4.5, sm: 6.5, md: 9, lg: 12 });
  });

  it("renders a compact settings toolbar without the generated-code panel", () => {
    const markup = renderToStaticMarkup(createElement(LoaderGenerator));
    const source = readFileSync("src/components/foundation/LoaderGenerator/LoaderGenerator.tsx", "utf8");
    const styles = readFileSync("src/components/foundation/LoaderGenerator/styles.css", "utf8");

    expect(markup).toContain("ad-loader-generator-toolbar");
    expect(markup).not.toContain("ad-loader-generator-preview-mode");
    expect(markup).not.toContain("ad-loader-generator-code");
    expect(markup).not.toContain("Код лоадера");
    expect(source).toContain('<Stack {...mark("LoaderGenerator", p)}');
    expect(source).toContain('<Grid className="ad-loader-generator-top"');
    expect(source).toContain('<Button key={animation}');
    expect(source).toContain('<Button key={animation} variant="ghost"');
    expect(source).toContain('animation: "pulse"');
    expect(styles).toMatch(/\.ad-loader-generator-option\.ad-button\s*{[^}]*height:\s*auto/s);
    expect(styles).toMatch(/\.ad-loader-generator-option\s+\.ad-button-label\s*{[^}]*white-space:\s*normal/s);
    expect(styles).toMatch(/flex:\s*0\s+0\s+8\.5rem/);
    expect(styles).toMatch(/\.ad-loader-generator-option\s*>\s*:is\(\.ad-button-fx,\s*\.ad-button-orbit\)\s*{[^}]*display:\s*none/s);
  });

  it("picks a saturated accent from visible image pixels instead of the background", () => {
    const pixels = new Uint8ClampedArray([
      255, 255, 255, 0,
      35, 125, 240, 255,
      25, 105, 230, 255,
      255, 255, 255, 0,
    ]);

    expect(pickLoaderAccent(pixels)).toBe("#1e73eb");
    expect(loaderCss).toMatch(/\.ad-loader-img\{[^}]*filter:drop-shadow\([^}]*--ad-loader-color/);
  });

  it("extracts distinct loader colours for the palette animation", async () => {
    const pixels = new Uint8ClampedArray([
      245, 25, 45, 255,
      240, 30, 50, 255,
      20, 110, 235, 255,
      30, 120, 240, 255,
      255, 255, 255, 0,
    ]);

    expect(await pickLoaderPalette(pixels)).toEqual(["#f31c30", "#1973ee", "#ff7c97"]);
    expect(loaderCss).toContain("data-animation=palette");
  });

  it("prefers a saturated brand colour over a larger near-white highlight", async () => {
    const pixels = new Uint8ClampedArray([
      245, 250, 255, 255,
      245, 250, 255, 255,
      245, 250, 255, 255,
      25, 115, 235, 255,
      20, 105, 230, 255,
    ]);

    expect((await pickLoaderPalette(pixels))[0]).toBe("#176ee9");
  });

  it("forces a fresh loader instance when the selected animation changes", () => {
    const settings = { src: "logo.png", animation: "spin" as const };
    expect(loaderRenderKey(settings)).not.toBe(loaderRenderKey({ ...settings, animation: "pulse" }));
  });
});
