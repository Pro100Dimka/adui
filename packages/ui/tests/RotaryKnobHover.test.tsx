import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { RotaryKnob } from "../src/components/media/RotaryKnob/RotaryKnob";

vi.mock("../src/core/environment", () => ({
  canPaint: () => false,
  createResizeObserver: () => ({ observe() {}, disconnect() {} }),
  reducedMotionQuery: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
}));

it("coalesces rapid pointer hover updates into one visual frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("devicePixelRatio", 1);
  vi.stubGlobal("window", { addEventListener() {}, setTimeout, clearTimeout });
  vi.stubGlobal("document", { addEventListener() {}, documentElement: { dataset: {} } });
  const frames = new Map<number, FrameRequestCallback>();
  let serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++serial, callback);
    return serial;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const handlers = new Map<string, EventListener>();
  const rootStyle = { setProperty: vi.fn() };
  const node = ({ props }: { props: Record<string, unknown> }) => ({
    width: 0, height: 0, dataset: {}, classList: { add() {}, remove() {} },
    style: props["data-ad-component"] === "RotaryKnob" ? rootStyle : { setProperty() {} },
    getBoundingClientRect: () => ({ width: 124, height: 124, left: 0, top: 0 }),
    getContext: () => null,
    addEventListener(name: string, listener: EventListener) {
      if (props["data-ad-component"] === "RotaryKnob") handlers.set(name, listener);
    },
    removeEventListener() {}, setAttribute() {}, focus() {},
  });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob label="Gain" />, { createNodeMock: node }); });
  frames.clear();
  rootStyle.setProperty.mockClear();
  for (const clientX of [40, 45, 50, 55, 60])
    handlers.get("pointermove")?.({ clientX, clientY: 50 } as PointerEvent);
  expect(rootStyle.setProperty).not.toHaveBeenCalled();
  for (const callback of [...frames.values()]) callback(16);
  expect(rootStyle.setProperty).toHaveBeenCalledTimes(2);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});
