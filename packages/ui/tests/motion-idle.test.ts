import { afterEach, beforeEach, expect, it, vi } from "vitest";

let engine: typeof import("../src/core/motion-engine.js");
let frames: Map<number, FrameRequestCallback>;
let observers: IntersectionObserverCallback[];
let events: Map<string, EventListener>;
let document: {
  hidden: boolean;
  documentElement: { dataset: Record<string, string> };
  getAnimations: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
};

beforeEach(async () => {
  vi.useFakeTimers();
  frames = new Map();
  observers = [];
  events = new Map();
  let frameId = 0;
  document = {
    hidden: false,
    documentElement: { dataset: {} },
    getAnimations: vi.fn(() => []),
    addEventListener: vi.fn((name: string, listener: EventListener) => events.set(name, listener)),
  };
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", document);
  vi.stubGlobal("HTMLElement", class {});
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { observers.push(callback); }
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.resetModules();
  engine = await import("../src/core/motion-engine.js");
});

function flushFrame(now = performance.now()) {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(now));
}

function observe(target: Element, isIntersecting: boolean, index = 0) {
  observers[index]([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
}

function cssLoop() {
  const node = { isConnected: true, closest: vi.fn(() => null), getAnimations: vi.fn() };
  const animation = {
    animationName: "ad-loader-pulse",
    playState: "running",
    currentTime: 0,
    effect: { target: node, getTiming: () => ({ iterations: Infinity, pseudoElement: "::before" }) },
    pause: vi.fn(() => { animation.playState = "paused"; }),
    play: vi.fn(),
  };
  node.getAnimations.mockReturnValue([animation]);
  return { node, animation };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function borderFixture() {
  const geometry = {
    size: vi.fn(),
    style: vi.fn(() => ({ position: "static", borderTopLeftRadius: "12px" })),
    length: vi.fn(() => 400),
  };
  vi.stubGlobal("getComputedStyle", geometry.style);
  const element = (tag: string) => ({
    tagName: tag,
    style: {},
    attributes: new Map(),
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
    append() {},
    remove() {},
    getTotalLength: geometry.length,
    getPointAtLength: () => ({ x: 0, y: 0 }),
  });
  vi.stubGlobal("document", {
    ...document,
    createElement: element,
    createElementNS: (_namespace: string, tag: string) => element(tag),
  });
  const host = () => ({
    isConnected: true,
    style: { position: "" },
    dataset: {},
    get offsetWidth() { geometry.size(); return 160; },
    get offsetHeight() { geometry.size(); return 240; },
    getClientRects: () => [{}],
    append() {},
  }) as unknown as HTMLElement;
  return { geometry, host };
}

it("does not force layout when 95 deferred borders mount outside the viewport", async () => {
  const { geometry, host } = borderFixture();
  const borders = Array.from({ length: 95 }, () => {
    const node = host();
    const scope = engine.createMotion(document as unknown as Document);
    return { node, scope, border: engine.attachBorder(node, { scope, defer: true }) };
  });
  expect(geometry.size).not.toHaveBeenCalled();
  expect(geometry.style).not.toHaveBeenCalled();
  expect(geometry.length).not.toHaveBeenCalled();
  borders.forEach(({ node }, index) => observe(node, false, index));
  flushFrame();
  await vi.advanceTimersByTimeAsync(1000);
  expect(engine.getMotionStats().scheduled).toBe(false);
  for (const { scope, border } of borders) { border.destroy(); scope.dispose(); }
});

it("spreads visible border geometry across the shared frame budget", () => {
  const { geometry, host } = borderFixture();
  let elapsed = 0;
  vi.spyOn(performance, "now").mockImplementation(() => elapsed);
  geometry.length.mockImplementation(() => { elapsed += 4; return 400; });
  const borders = Array.from({ length: 95 }, () => {
    const node = host();
    const scope = engine.createMotion(document as unknown as Document);
    return { node, scope, border: engine.attachBorder(node, { scope, defer: true }) };
  });
  geometry.length.mockClear();
  elapsed = 0;
  borders.forEach(({ node }, index) => observe(node, true, index));
  flushFrame();
  expect(geometry.length).toHaveBeenCalledTimes(2);
  for (const { scope, border } of borders) { border.destroy(); scope.dispose(); }
});

it("initializes a visible deferred border even when motion is disabled", () => {
  const { geometry, host } = borderFixture();
  const node = host();
  const scope = engine.createMotion(document as unknown as Document);
  scope.set(false);
  const border = engine.attachBorder(node, { scope, defer: true });
  expect(geometry.length).not.toHaveBeenCalled();
  observe(node, true);
  flushFrame();
  expect(geometry.length).toHaveBeenCalledOnce();
  expect(engine.getMotionStats().scheduled).toBe(false);
  border.destroy();
  scope.dispose();
});

it("drops a deferred border's pending geometry when it unmounts before becoming visible", () => {
  const { geometry, host } = borderFixture();
  const node = host();
  const scope = engine.createMotion(document as unknown as Document);
  const border = engine.attachBorder(node, { scope, defer: true });
  geometry.length.mockClear();
  border.destroy();
  scope.dispose();
  observe(node, true);
  flushFrame();
  expect(geometry.length).not.toHaveBeenCalled();
  expect(engine.getMotionStats().scheduled).toBe(false);
});

it("sleeps the shared motion clock while every component is offscreen and wakes on return", async () => {
  const node = {
    isConnected: true,
    getClientRects: () => [{}],
  } as unknown as Element;
  const scope = engine.createMotion(document as unknown as Document);
  scope.add(node, vi.fn());
  observe(node, false);

  flushFrame();
  await vi.advanceTimersByTimeAsync(100);
  expect(frames.size).toBe(0);

  observe(node, true);
  expect(frames.size).toBe(1);
  scope.dispose();
});

it("does not poll the consumer document or leave timers behind when no kit motion is active", async () => {
  const scansAtImport = document.getAnimations.mock.calls.length;
  await vi.advanceTimersByTimeAsync(10_000);
  expect(document.getAnimations).toHaveBeenCalledTimes(scansAtImport);
  expect(vi.getTimerCount()).toBe(0);
  expect(engine.getMotionStats().scheduled).toBe(false);
});

it("cancels both queued frames and delayed ticks when the last subscriber detaches", async () => {
  const unsubscribe = engine.subscribeTick(vi.fn());
  expect(frames.size).toBe(1);
  unsubscribe();
  expect(frames.size).toBe(0);
  expect(engine.getMotionStats().scheduled).toBe(false);

  const stop = engine.subscribeTick(vi.fn());
  flushFrame(100);
  expect(vi.getTimerCount()).toBe(1);
  stop();
  expect(vi.getTimerCount()).toBe(0);
  await vi.advanceTimersByTimeAsync(1000);
  expect(frames.size).toBe(0);
});

it("uses observer visibility without layout reads for offscreen or already measured nodes", () => {
  const scope = engine.createMotion(document as unknown as Document);
  const hidden = { isConnected: true, getClientRects: vi.fn(() => [{}]) };
  const visible = { isConnected: true, getClientRects: vi.fn(() => [{}]) };
  const paintHidden = vi.fn(), paintVisible = vi.fn();
  scope.add(hidden as unknown as Element, paintHidden);
  scope.add(visible as unknown as Element, paintVisible);
  observe(hidden as unknown as Element, false);
  observe(visible as unknown as Element, true);
  paintHidden.mockClear();
  paintVisible.mockClear();
  flushFrame(100);
  expect(paintHidden).not.toHaveBeenCalled();
  expect(paintVisible).toHaveBeenCalledOnce();
  expect(hidden.getClientRects).not.toHaveBeenCalled();
  expect(visible.getClientRects).not.toHaveBeenCalled();
  scope.dispose();
});

it("discovers CSS-only and pseudo-element loops from animation events without recurring document scans", async () => {
  const { node, animation } = cssLoop();
  document.getAnimations.mockClear();
  events.get("animationstart")?.({ animationName: animation.animationName, target: node } as unknown as Event);
  expect(frames.size).toBe(1);
  flushFrame(100);
  expect(animation.pause).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(600);
  flushFrame(600);
  expect(animation.currentTime).toBeGreaterThan(0);
  expect(document.getAnimations).not.toHaveBeenCalled();
  animation.playState = "idle";
  node.getAnimations.mockReturnValue([]);
  events.get("animationcancel")?.({ animationName: animation.animationName, target: node } as unknown as Event);
  await vi.advanceTimersByTimeAsync(40);
  flushFrame(1000);
  expect(engine.getMotionStats().scheduled).toBe(false);
});

it("adopts loops that were already mounted when the package loads", async () => {
  const { animation } = cssLoop();
  document.getAnimations.mockReturnValue([animation]);
  vi.resetModules();
  engine = await import("../src/core/motion-engine.js");
  expect(animation.pause).toHaveBeenCalledOnce();
  expect(engine.getMotionStats().scheduled).toBe(true);
});

it("resumes CSS light from its held position after a browser tab was hidden", async () => {
  const { node, animation } = cssLoop();
  events.get("animationstart")!({ animationName: animation.animationName, target: node } as unknown as Event);
  flushFrame();
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  const held = animation.currentTime;
  document.hidden = true;
  events.get("visibilitychange")!(new Event("visibilitychange"));
  expect(engine.getMotionStats().scheduled).toBe(false);
  await vi.advanceTimersByTimeAsync(10_000);
  document.hidden = false;
  events.get("visibilitychange")!(new Event("visibilitychange"));
  flushFrame();
  expect(animation.currentTime).toBe(held);
});

it("holds an offscreen scope's time even while another component keeps the clock running", async () => {
  const hidden = engine.createMotion(document as unknown as Document);
  const visible = engine.createMotion(document as unknown as Document);
  const nodes = [0, 1].map(() => ({ isConnected: true, getClientRects: () => [{}] }) as unknown as Element);
  const paint = vi.fn();
  hidden.add(nodes[0], paint);
  visible.add(nodes[1], vi.fn());
  observe(nodes[0], false, 0);
  observe(nodes[1], true, 1);
  flushFrame(100);
  await vi.advanceTimersByTimeAsync(600);
  flushFrame(600);
  expect(hidden.time).toBe(0);
  observe(nodes[0], true, 0);
  await vi.advanceTimersByTimeAsync(600);
  flushFrame(1200);
  expect(paint.mock.calls.at(-1)?.[0]).toBe(0);
  hidden.dispose();
  visible.dispose();
});

it("wakes CSS-only loops when the shared offscreen hook reveals their block", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const { createElement, useRef } = await import("react");
  const { act, create } = await import("react-test-renderer");
  const { usePauseOffscreen } = await import("../src/core/motion/hooks");
  const { animation, node } = cssLoop();
  let offscreen = false;
  const boundary = {
    toggleAttribute: (_name: string, force: boolean) => { offscreen = force; },
    removeAttribute: () => { offscreen = false; },
  };
  node.closest.mockImplementation(() => offscreen ? boundary as never : null);
  events.get("animationstart")!({ animationName: animation.animationName, target: node } as unknown as Event);
  function Block() {
    const ref = useRef<Element>(null);
    usePauseOffscreen(ref);
    return createElement("div", { ref });
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(Block), { createNodeMock: () => boundary }); });
  observe(boundary as unknown as Element, false);
  flushFrame();
  expect(engine.getMotionStats().scheduled).toBe(false);
  observe(boundary as unknown as Element, true);
  expect(engine.getMotionStats().scheduled).toBe(true);
  act(() => tree.unmount());
});

it("does not add hidden elapsed time when the whole clock sleeps offscreen", async () => {
  const scope = engine.createMotion(document as unknown as Document);
  const node = { isConnected: true, getClientRects: () => [{}] } as unknown as Element;
  const paint = vi.fn();
  scope.add(node, paint);
  observe(node, true);
  flushFrame();
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  const held = scope.time;
  observe(node, false);
  await vi.advanceTimersByTimeAsync(10_000);
  observe(node, true);
  flushFrame();
  expect(scope.time).toBe(held);
  scope.dispose();
});

it("batches a mount-time burst of CSS loops into one linear scan", () => {
  const loops = Array.from({ length: 100 }, () => {
    const loop = cssLoop();
    loop.animation.effect.getTiming = vi.fn(loop.animation.effect.getTiming);
    return loop;
  });
  for (const { node, animation } of loops)
    events.get("animationstart")!({ type: "animationstart", animationName: animation.animationName, target: node } as unknown as Event);
  flushFrame();
  const timingReads = loops.reduce((count, { animation }) => count + vi.mocked(animation.effect.getTiming).mock.calls.length, 0);
  expect(timingReads).toBeLessThanOrEqual(loops.length * 2);
  expect(loops.every(({ animation }) => animation.pause.mock.calls.length === 1)).toBe(true);
});

it("discovers an animation target once on the shared frame instead of flushing layout per event", async () => {
  const { node, animation } = cssLoop();
  for (let event = 0; event < 100; event++)
    for (const type of ["animationstart", "animationcancel"])
      events.get(type)!({ animationName: animation.animationName, target: node } as unknown as Event);
  expect(node.getAnimations.mock.calls.length).toBe(0);
  expect(frames.size).toBe(1);
  flushFrame();
  expect(node.getAnimations).toHaveBeenCalledOnce();
  expect(animation.pause).toHaveBeenCalledOnce();

  animation.playState = "idle";
  node.getAnimations.mockReturnValue([]);
  events.get("animationcancel")!({ animationName: animation.animationName, target: node } as unknown as Event);
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  expect(engine.getMotionStats().scheduled).toBe(false);
});

it("coalesces 95 offscreen boundary refreshes into one scan instead of blocking route teardown", async () => {
  const loops = Array.from({ length: 100 }, () => {
    const loop = cssLoop();
    loop.animation.effect.getTiming = vi.fn(loop.animation.effect.getTiming);
    return loop;
  });
  for (const { node, animation } of loops)
    events.get("animationstart")!({ animationName: animation.animationName, target: node } as unknown as Event);
  flushFrame();
  loops.forEach(({ animation }) => vi.mocked(animation.effect.getTiming).mockClear());
  const reads = () => loops.reduce((count, { animation }) => count + vi.mocked(animation.effect.getTiming).mock.calls.length, 0);

  for (let boundary = 0; boundary < 95; boundary++) engine.refreshMotion();
  expect(reads()).toBe(0);
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  expect(reads()).toBe(100);

  loops.forEach(({ node }) => { node.isConnected = false; });
  for (let boundary = 0; boundary < 95; boundary++) engine.refreshMotion();
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  expect(engine.getMotionStats().scheduled).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

it("defers hidden boundary refreshes without rescanning or advancing held CSS clocks", async () => {
  const loops = Array.from({ length: 100 }, () => {
    const loop = cssLoop();
    loop.animation.effect.getTiming = vi.fn(loop.animation.effect.getTiming);
    return loop;
  });
  for (const { node, animation } of loops)
    events.get("animationstart")!({ animationName: animation.animationName, target: node } as unknown as Event);
  flushFrame();
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  const held = loops.map(({ animation }) => animation.currentTime);
  const clearReads = () => loops.forEach(({ animation }) => vi.mocked(animation.effect.getTiming).mockClear());
  const reads = () => loops.reduce((count, { animation }) => count + vi.mocked(animation.effect.getTiming).mock.calls.length, 0);

  clearReads();
  document.hidden = true;
  events.get("visibilitychange")!(new Event("visibilitychange"));
  expect(reads()).toBe(100);
  clearReads();
  for (let boundary = 0; boundary < 95; boundary++) engine.refreshMotion();
  expect(reads()).toBe(0);
  expect(engine.getMotionStats().scheduled).toBe(false);
  expect(vi.getTimerCount()).toBe(0);

  await vi.advanceTimersByTimeAsync(10_000);
  document.hidden = false;
  events.get("visibilitychange")!(new Event("visibilitychange"));
  flushFrame();
  expect(reads()).toBe(100);
  expect(loops.map(({ animation }) => animation.currentTime)).toEqual(held);
  loops.forEach(({ node }) => { node.isConnected = false; });
  engine.refreshMotion();
  await vi.advanceTimersByTimeAsync(40);
  flushFrame();
  expect(engine.getMotionStats().scheduled).toBe(false);
});

it.each([
  { name: "a fitted container", scrollHeight: 500, overflowY: "auto" },
  { name: "visible overflow", scrollHeight: 1000, overflowY: "visible" },
  { name: "hidden overflow", scrollHeight: 1000, overflowY: "hidden" },
  { name: "clipped overflow", scrollHeight: 1000, overflowY: "clip" },
])("lets native page scrolling handle wheel notches over $name", async ({ scrollHeight, overflowY }) => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const { createElement, useRef } = await import("react");
  const { act, create } = await import("react-test-renderer");
  const { useSmoothWheel } = await import("../src/core/motion/hooks");
  let wheel = (_event: WheelEvent) => {};
  const element = {
    scrollTop: 0,
    scrollHeight,
    clientHeight: 500,
    addEventListener: (_name: string, listener: typeof wheel) => { wheel = listener; },
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("getComputedStyle", () => ({ overflowY }));
  function Block() {
    const ref = useRef<HTMLElement>(null);
    useSmoothWheel(ref);
    return createElement("div", { ref });
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(Block), { createNodeMock: () => element }); });
  try {
    const preventDefault = vi.fn();
    wheel({ target: element, deltaY: 100, deltaX: 0, deltaMode: 0, preventDefault } as unknown as WheelEvent);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    expect(element.scrollTop).toBe(0);
  } finally { act(() => tree.unmount()); }
  expect(element.removeEventListener).toHaveBeenCalledWith("wheel", wheel);
});

it("smooths a scrollable container without taking wheel input from inner areas, gestures or trackpads", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const { createElement, useRef } = await import("react");
  const { act, create } = await import("react-test-renderer");
  const { useSmoothWheel } = await import("../src/core/motion/hooks");
  let wheel = (_event: WheelEvent) => {};
  const element = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 500,
    addEventListener: (_name: string, listener: typeof wheel) => { wheel = listener; },
    removeEventListener: vi.fn(),
  };
  const inner = { scrollTop: 0, scrollHeight: 600, clientHeight: 200, parentElement: element };
  vi.stubGlobal("getComputedStyle", () => ({ overflowY: "auto" }));
  function Block() {
    const ref = useRef<HTMLElement>(null);
    useSmoothWheel(ref);
    return createElement("div", { ref });
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(Block), { createNodeMock: () => element }); });
  try {
    for (const input of [
      { target: inner },
      { ctrlKey: true },
      { deltaX: 200 },
      { deltaY: 20 },
    ]) {
      const preventDefault = vi.fn();
      wheel({ target: element, deltaY: 100, deltaX: 0, deltaMode: 0, ...input, preventDefault } as unknown as WheelEvent);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(frames.size).toBe(0);
    }
    const preventDefault = vi.fn();
    wheel({ target: element, deltaY: 100, deltaX: 0, deltaMode: 0, preventDefault } as unknown as WheelEvent);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(frames.size).toBe(1);
    flushFrame(100);
    expect(element.scrollTop).toBeGreaterThan(0);
    expect(element.scrollTop).toBeLessThan(100);
    act(() => tree.unmount());
    expect(frames.size).toBe(0);

    element.scrollTop = 500;
    act(() => { tree = create(createElement(Block), { createNodeMock: () => element }); });
    preventDefault.mockClear();
    wheel({ target: element, deltaY: 100, deltaX: 0, deltaMode: 0, preventDefault } as unknown as WheelEvent);
    expect(preventDefault).toHaveBeenCalledOnce();
    flushFrame(100);
    expect(element.scrollTop).toBe(500);
    expect(frames.size).toBe(0);
  } finally { act(() => tree.unmount()); }
});
