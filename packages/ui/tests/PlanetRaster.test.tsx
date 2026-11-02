import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { Planet } from "../src/components/artwork/Planet/Planet";
import { useArtwork } from "../src/components/artwork/useArtwork";

vi.mock("../src/components/artwork/useArtwork", () => ({ useArtwork: vi.fn() }));

it.each([515, 1503])("blends pixels crossed by the planet rim at width %i", (width) => {
  renderToStaticMarkup(createElement(Planet));
  const call = vi.mocked(useArtwork).mock.lastCall;
  if (!call) throw new Error("Planet did not request its artwork");
  const scale = width / 515;
  const height = Math.round(114 * scale);
  const x = Math.round(490 * scale);
  const y = Math.ceil(290 * scale - Math.sqrt((302 * scale) ** 2 - (x - 344 * scale) ** 2));
  const image: ImageData = {
    width,
    height,
    colorSpace: "srgb",
    data: new Uint8ClampedArray(width * height * 4),
  };
  call[4].pixels(image, y, y + 1);
  const alpha = image.data[(y * width + x) * 4 + 3];
  expect(alpha).toBeGreaterThan(0);
  expect(alpha).toBeLessThan(255);
  call[4].pixels(image, y + 2, y + 3);
  expect(image.data[((y + 2) * width + x) * 4 + 3]).toBe(255);
});
