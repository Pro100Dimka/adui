import { act, create } from "react-test-renderer";
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { RotaryKnob } from "../src/components/media/RotaryKnob/RotaryKnob";
import { paintCanvas } from "../src/core/noise";

vi.mock("../src/core/noise", () => ({ paintCanvas: vi.fn(() => new Promise(() => undefined)) }));
vi.mock("../src/core/environment", () => ({
  canPaint: () => true,
  createResizeObserver: () => ({ observe() {}, disconnect() {} }),
  reducedMotionQuery: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("defers the knob's expensive static raster to the shared sliced artwork painter", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("window", { addEventListener() {}, setTimeout, clearTimeout });
  vi.stubGlobal("document", { addEventListener() {} });
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
  const context = new Proxy({}, { get: () => () => context }) as CanvasRenderingContext2D;
  const node = () => ({
    width: 0, height: 0, style: { setProperty() {} }, dataset: {},
    getBoundingClientRect: () => ({ width: 124, height: 124, left: 0, top: 0 }),
    getContext: () => context,
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, focus() {},
  });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(RotaryKnob, { label: "Gain" }), { createNodeMock: node }); });
  expect(paintCanvas).toHaveBeenCalledWith("rotary-knob-base", expect.any(Number), expect.any(Number), expect.objectContaining({ pixels: expect.any(Function), finish: expect.any(Function) }));
  let fills = 0;
  const finishContext = new Proxy({}, { get: (_, key) => key === "fill" ? () => { fills++; } : () => finishContext }) as CanvasRenderingContext2D;
  const painting = vi.mocked(paintCanvas).mock.calls[0][3];
  painting.finish?.(finishContext, 248, 248);
  expect(fills).toBeLessThan(3500);
  act(() => tree.unmount());
});
