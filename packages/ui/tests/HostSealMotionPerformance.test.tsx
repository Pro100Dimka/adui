import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { HostSeal } from "../src/components/layout/Avatar/HostSeal";

const motion = vi.hoisted(() => ({ decoration: vi.fn(), pauseOffscreen: vi.fn() }));
vi.mock("../src/core/motion/hooks", () => ({
  useDecoration: motion.decoration,
  usePauseOffscreen: motion.pauseOffscreen,
}));

it("composites the host rings at their original periods without a per-frame JavaScript painter", () => {
  const html = renderToStaticMarkup(createElement(HostSeal, { name: "Дмитрий" }));
  const animated = [...html.matchAll(/<svg[^>]*data-host-spin="([^"]+)"[^>]*>/g)];
  expect(animated.length).toBeGreaterThan(0);
  for (const [tag, spin] of animated) {
    expect(tag).toContain(`animation-duration:${1 / Math.abs(Number(spin))}s`);
    expect(tag).toContain(`animation-direction:${Number(spin) < 0 ? "reverse" : "normal"}`);
  }
  expect(motion.decoration).not.toHaveBeenCalled();
  expect(motion.pauseOffscreen).toHaveBeenCalledOnce();
  const css = readFileSync("src/components/layout/Avatar/styles.css", "utf8");
  expect(css).toContain("animation: ad-host-spin");
  expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  expect(css).toContain(':root:not([data-ad-motion="on"]) .ad-host-seal > svg[data-host-spin]');
});

it("keeps a person's photo out of the theme's hue shift while the rings follow it", () => {
  const photo = "data:image/webp;base64,cGhvdG8=";
  const html = renderToStaticMarkup(createElement(HostSeal, { photo, name: "Дмитрий" }));
  const layers = [...html.matchAll(/<svg[^>]*>.*?<\/svg>/gs)].map(([layer]) => layer);
  const withPhoto = layers.filter((layer) => layer.includes(photo));
  expect(withPhoto).toHaveLength(1);
  expect(withPhoto[0]).toMatch(/^<svg[^>]*data-host-photo=""/);
  // The face is still clipped to its circle, defined in the bottom drawing.
  expect(withPhoto[0]).toContain("hostv2-face-clip");
  expect(layers.filter((layer) => /^<svg[^>]*data-host-photo/.test(layer))).toHaveLength(1);
  const css = readFileSync("src/components/layout/shared.css", "utf8");
  expect(css).toContain(":is(.ad-illustration, .ad-brand-mark, .ad-host-seal) svg:not([data-host-photo])");
});
