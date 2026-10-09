import { expect, it } from "vitest";
import { loaderCss } from "../src/components/foundation/Loader/Loader";

it("does not reserve compositor layers for loader pictures that never move", () => {
  const baseImage = loaderCss.match(/\.ad-loader-img\{([^}]*)\}/)?.[1];
  expect(baseImage).toBeDefined();
  expect(baseImage).not.toContain("will-change");
  const promotedImages = loaderCss.match(/([^{}]+)\{will-change:transform,opacity\}/)?.[1];
  expect(promotedImages).toContain("[data-animation=orbit]");
  expect(promotedImages).toContain(".ad-loader-fill>.ad-loader-img");
  expect(promotedImages).not.toContain("[data-animation=shine]");
});
