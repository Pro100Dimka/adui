import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { loaderCss } from "../src/components/foundation/Loader/Loader";
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

describe("LoaderGenerator", () => {
  it("removes a flat image background and feathers contrasting edge pixels", () => {
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

    removeBackgroundPixels(pixels, 3, 3);

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

    removeBackgroundPixels(withCodecEdge, 20, 20);

    expect(withCodecEdge[(10 * 20 + 1) * 4 + 3]).toBe(0);
    expect(withCodecEdge[(10 * 20 + 10) * 4 + 3]).toBe(255);

    const withInsetFrame = new Uint8ClampedArray(20 * 20 * 4);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        const frame = (x === 1 || x === 18) && y >= 1 && y <= 18 || (y === 1 || y === 18) && x >= 1 && x <= 18;
        withInsetFrame.set(frame ? [185, 120, 125, 255] : x === 10 && y === 10 ? [255, 255, 255, 255] : [235, 25, 35, 255], (y * 20 + x) * 4);
      }
    }

    removeBackgroundPixels(withInsetFrame, 20, 20);

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

    removeBackgroundPixels(withEdgeSpeckles, 20, 20);

    expect(withEdgeSpeckles[(3 * 20 + 1) * 4 + 3]).toBe(0);
    expect(withEdgeSpeckles[(9 * 20 + 9) * 4 + 3]).toBe(255);
  });

  it("removes a border plus a second background colour without erasing matching logo details", () => {
    const white = [255, 255, 255, 255];
    const green = [0, 115, 86, 255];
    const pixels = new Uint8ClampedArray([
      ...white, ...white, ...white, ...white, ...white,
      ...white, ...green, ...green, ...green, ...white,
      ...white, ...green, ...white, ...green, ...white,
      ...white, ...green, ...green, ...green, ...white,
      ...white, ...white, ...white, ...white, ...white,
    ]);

    removeBackgroundPixels(pixels, 5, 5);

    expect(pixels[3]).toBe(0);
    expect(pixels[(1 * 5 + 1) * 4 + 3]).toBe(0);
    expect(pixels[(2 * 5 + 2) * 4 + 3]).toBe(255);
  });

  it("peels thin nested frames before removing a large inner background", () => {
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

    removeBackgroundPixels(pixels, 15, 15);

    expect(pixels[(4 * 15 + 4) * 4 + 3]).toBe(0);
    expect(pixels[(5 * 15 + 5) * 4 + 3]).toBe(0);
    expect(pixels[(7 * 15 + 7) * 4 + 3]).toBe(255);
  });

  it("follows a smooth edge-connected gradient but stops at a sharp logo edge", () => {
    const pixels = new Uint8ClampedArray(5 * 5 * 4);
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const offset = (y * 5 + x) * 4;
        pixels.set(x === 2 && y === 2 ? [0, 20, 170, 255] : [180 + x * 8, 220 + y * 6, 245, 255], offset);
      }
    }

    removeBackgroundPixels(pixels, 5, 5);

    expect(pixels[(1 * 5 + 1) * 4 + 3]).toBe(0);
    expect(pixels[(2 * 5 + 2) * 4 + 3]).toBe(255);
  });

  it("removes a bright radial gradient behind a contrasting logo", () => {
    const pixels = new Uint8ClampedArray(7 * 7 * 4);
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const offset = (y * 7 + x) * 4;
        const glow = Math.max(0, 58 - Math.hypot(x - 3, y - 3) * 19);
        pixels.set(x === 3 && y === 3 ? [0, 35, 175, 255] : [175 + glow, 205 + glow * 0.75, 232 + glow * 0.35, 255], offset);
      }
    }

    removeBackgroundPixels(pixels, 7, 7);

    expect(pixels[(2 * 7 + 3) * 4 + 3]).toBe(0);
    expect(pixels[(3 * 7 + 3) * 4 + 3]).toBe(255);
  });

  it("removes background enclosed inside a logo", () => {
    const background = [200, 230, 250, 255];
    const logo = [10, 55, 175, 255];
    const pixels = new Uint8ClampedArray(7 * 7 * 4);
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const ring = x >= 2 && x <= 4 && y >= 2 && y <= 4 && (x === 2 || x === 4 || y === 2 || y === 4);
        pixels.set(ring ? logo : background, (y * 7 + x) * 4);
      }
    }

    removeBackgroundPixels(pixels, 7, 7);

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

    removeBackgroundPixels(gradient, size, size);

    expect(gradient[(20 * size + 20) * 4 + 3]).toBe(0);
    expect(gradient[(20 * size + 28) * 4 + 3]).toBe(255);
  });

  it("keeps an image that already has a transparent background unchanged", () => {
    const pixels = new Uint8ClampedArray([
      0, 0, 0, 0,
      255, 30, 60, 180,
      0, 0, 0, 0,
      255, 30, 60, 255,
    ]);
    const original = pixels.slice();

    removeBackgroundPixels(pixels, 2, 2);

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

  it("extracts distinct loader colours for the palette animation", () => {
    const pixels = new Uint8ClampedArray([
      245, 25, 45, 255,
      240, 30, 50, 255,
      20, 110, 235, 255,
      30, 120, 240, 255,
      255, 255, 255, 0,
    ]);

    expect(pickLoaderPalette(pixels)).toEqual(["#f31c30", "#1973ee", "#ff7c97"]);
    expect(loaderCss).toContain("data-animation=palette");
  });

  it("prefers a saturated brand colour over a larger near-white highlight", () => {
    const pixels = new Uint8ClampedArray([
      245, 250, 255, 255,
      245, 250, 255, 255,
      245, 250, 255, 255,
      25, 115, 235, 255,
      20, 105, 230, 255,
    ]);

    expect(pickLoaderPalette(pixels)[0]).toBe("#176ee9");
  });

  it("forces a fresh loader instance when the selected animation changes", () => {
    const settings = { src: "logo.png", animation: "spin" as const };
    expect(loaderRenderKey(settings)).not.toBe(loaderRenderKey({ ...settings, animation: "pulse" }));
  });
});
