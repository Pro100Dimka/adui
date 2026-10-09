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
