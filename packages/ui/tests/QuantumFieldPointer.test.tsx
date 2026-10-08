import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const draw = vi.hoisted(() => vi.fn());
const createRenderer = vi.hoisted(() => vi.fn());
const tick = vi.hoisted(() => ({ current: (_now: number) => undefined as void }));
vi.mock("../src/core/motion/hooks", () => ({ useTick: (callback: (now: number) => void) => { tick.current = callback; } }));
vi.mock("../src/components/artwork/QuantumField/renderer", async (importOriginal) => ({
  ...await importOriginal<object>(),
  createQuantumFieldRenderer: (...args: unknown[]) => {
    createRenderer(...args);
    return { setPalette() {}, resize() {}, draw, dispose() {} };
  },
}));
import { QuantumField } from "../src/components/artwork/QuantumField/QuantumField";

it("disturbs only particles near the pointer without rotating the entire scene on hover", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("navigator", { hardwareConcurrency: 8 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const root = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 200 }), dataset: {}, addEventListener() {}, removeEventListener() {} };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { interactive: true, paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  expect(createRenderer.mock.lastCall![2]).toBeLessThanOrEqual(40_000);
  const field = tree.root.findByProps({ "data-ad-component": "QuantumField" });
  act(() => field.props.onPointerMove({ clientX: 250, clientY: 100, currentTarget: root }));
  expect(draw).toHaveBeenCalled();
  const [, camera, , pointer] = draw.mock.lastCall!;
  expect(camera.yaw).toBe(0);
  expect(pointer).toEqual({ x: 0.25, y: 0, active: true });
  act(() => field.props.onPointerDown({ clientX: 250, clientY: 100, currentTarget: root, pointerId: 1 }));
  act(() => field.props.onPointerMove({ clientX: 350, clientY: 100, currentTarget: root }));
  expect(draw.mock.lastCall![1].yaw).toBeGreaterThan(0);
  expect(draw.mock.lastCall![1].yaw).toBeLessThan(0.2);
  act(() => { tick.current(1000); tick.current(1040); });
  const elapsed = draw.mock.lastCall![0];
  act(() => field.props.onPointerMove({ clientX: 300, clientY: 120, currentTarget: root }));
  expect(draw.mock.lastCall![0]).toBe(elapsed);
  act(() => tree.update(createElement(QuantumField, { interactive: true })));
  const active = tree.root.findByProps({ "data-ad-component": "QuantumField" });
  const paints = draw.mock.calls.length;
  act(() => active.props.onPointerMove({ clientX: 280, clientY: 120, currentTarget: root }));
  expect(draw).toHaveBeenCalledTimes(paints);
  act(() => tick.current(1080));
  expect(draw).toHaveBeenCalledTimes(paints + 1);
  expect(draw.mock.lastCall![3].x).toBeCloseTo(0.4);
  expect(draw.mock.lastCall![3].y).toBeCloseTo(0.2);
  expect(draw.mock.lastCall![3].active).toBe(true);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});
