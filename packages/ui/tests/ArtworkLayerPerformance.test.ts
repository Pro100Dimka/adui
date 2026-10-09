import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const css = (name: string) => readFileSync(new URL(`../src/components/${name}/styles.css`, import.meta.url), "utf8");

it("does not promote full-size neon wave wrappers when only their children move", () => {
  const styles = css("artwork/NeonWaves");
  const wrappers = styles.match(/\.ad-neon-waves-strands,\s*\.ad-neon-waves-comets\s*\{([^}]*)\}/)?.[1];
  const comet = styles.match(/\.ad-neon-waves-comet\s*\{([^}]*)\}/)?.[1];

  expect(wrappers).toBeDefined();
  expect(wrappers).not.toContain("will-change");
  expect(comet).toContain("will-change: transform, opacity");
});

it("does not promote the full-size WaveDecoration SVG for path updates", () => {
  const wrapper = css("media/WaveDecoration").match(/\.ad-wave-decoration\s*\{([^}]*)\}/)?.[1];
  expect(wrapper ?? "").not.toContain("will-change");
});

it("does not promote the full-size Sparkline SVG for a tiny ring animation", () => {
  const styles = css("media/Sparkline");
  const wrapper = styles.match(/\.ad-sparkline\s*>\s*svg:nth-child\(2\)\s*\{([^}]*)\}/)?.[1];
  expect(wrapper ?? "").not.toContain("will-change");
  expect(styles).toContain("animation: ad-spark-ping");
});
