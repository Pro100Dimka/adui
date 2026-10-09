import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const draw = vi.hoisted(() => vi.fn());
const setPalette = vi.hoisted(() => vi.fn());
const createRenderer = vi.hoisted(() => vi.fn());
const tick = vi.hoisted(() => ({ current: (_now: number) => undefined as void }));
const tickActive = vi.hoisted(() => ({ current: false }));
vi.mock("../src/core/motion/hooks", () => ({ useTick: (callback: (now: number) => void, active: boolean) => { tick.current = callback; tickActive.current = active; } }));
vi.mock("../src/components/artwork/QuantumField/renderer", async (importOriginal) => ({
  ...await importOriginal<object>(),
  createQuantumFieldRenderer: (...args: unknown[]) => {
    createRenderer(...args);
    return { setPalette, resize() {}, draw, dispose() {} };
  },
}));
import { QuantumField } from "../src/components/artwork/QuantumField/QuantumField";

it("unsubscribes the native field from the shared animation clock while offscreen", () => {
  createRenderer.mockClear();
  let reveal!: IntersectionObserverCallback;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  expect(tickActive.current).toBe(false);
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(tickActive.current).toBe(true);
  act(() => reveal([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(tickActive.current).toBe(false);
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(tickActive.current).toBe(true);
  expect(createRenderer).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("disturbs only particles near the pointer without rotating the entire scene on hover", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("navigator", { hardwareConcurrency: 8 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", undefined);
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

it("keeps the GPU renderer and geometry when only live audio, speed, or palette changes", () => {
  createRenderer.mockClear();
  setPalette.mockClear();
  draw.mockClear();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("navigator", { hardwareConcurrency: 8 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", undefined);
  const root = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 200 }) };
  const firstAudio = { bands: [0, 0, 0, 0, 0, 0, 0] };
  const nextAudio = { bands: [1, 0, 0, 0, 0, 0, 0] };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { quality: "high", speed: 1, audio: firstAudio, palette: ["#ff244c", "#ff7c97"] }), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  expect(createRenderer).toHaveBeenCalledTimes(1);
  act(() => { tree.update(createElement(QuantumField, { quality: "high", speed: 2, audio: nextAudio, palette: ["#10c99a", "#7cf3d0"] })); });
  expect(createRenderer).toHaveBeenCalledTimes(1);
  expect(setPalette).toHaveBeenLastCalledWith("#10c99a", "#7cf3d0");
  act(() => { tick.current(1_000); tick.current(1_040); });
  expect(draw).toHaveBeenLastCalledWith(0.08, expect.any(Object), nextAudio, expect.any(Object));
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("keeps automatic quality conservative on an eight-thread machine while allowing explicit high quality", () => {
  createRenderer.mockClear();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("navigator", { hardwareConcurrency: 8, deviceMemory: 8 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", undefined);
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  expect(createRenderer.mock.lastCall![2]).toBeLessThanOrEqual(20_000);
  act(() => tree.update(createElement(QuantumField, { quality: "high" })));
  expect(createRenderer.mock.lastCall![2]).toBeGreaterThan(20_000);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("does not redraw or reset the viewport for unchanged ResizeObserver notifications", () => {
  createRenderer.mockClear();
  draw.mockClear();
  let notify!: ResizeObserverCallback;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { notify = callback; }
    observe() { notify([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  const paints = draw.mock.calls.length;
  expect(paints).toBeGreaterThan(0);
  act(() => notify([], {} as ResizeObserver));
  expect(draw).toHaveBeenCalledTimes(paints);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("observes ancestor theme tokens only when the instance has no explicit palette", () => {
  createRenderer.mockClear();
  setPalette.mockClear();
  const observe = vi.fn();
  const computed = vi.fn(() => ({ getPropertyValue: (name: string) => name === "--ad-primary" ? "#10c99a" : "#7cf3d0" }));
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", computed);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("MutationObserver", class { constructor(_callback: MutationCallback) {} observe = observe; disconnect() {} });
  const root = { parentElement: null, getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { palette: ["#ff244c", "#ff7c97"] }), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  expect(observe).not.toHaveBeenCalled();
  expect(computed).not.toHaveBeenCalled();
  act(() => tree.update(createElement(QuantumField)));
  expect(createRenderer).toHaveBeenCalledTimes(1);
  expect(observe).toHaveBeenCalledTimes(1);
  expect(setPalette).toHaveBeenLastCalledWith("#10c99a", "#7cf3d0");
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("repaints a paused field on visibility return when its palette changed offscreen", () => {
  createRenderer.mockClear();
  draw.mockClear();
  let reveal!: IntersectionObserverCallback;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true, palette: ["#ff244c", "#ff7c97"] }), {
    createNodeMock: ({ type }) => type === "canvas" ? { width: 300, height: 150, clientWidth: 400 } : root,
  }); });
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  const paints = draw.mock.calls.length;
  expect(paints).toBeGreaterThan(0);
  act(() => reveal([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  act(() => tree.update(createElement(QuantumField, { paused: true, palette: ["#10c99a", "#7cf3d0"] })));
  expect(draw).toHaveBeenCalledTimes(paints);
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(draw).toHaveBeenCalledTimes(paints + 1);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});
