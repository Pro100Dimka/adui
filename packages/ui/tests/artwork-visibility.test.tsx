import { afterEach, expect, it, vi } from "vitest";
import { createElement, useRef } from "react";
import { act, create } from "react-test-renderer";
import { useArtwork } from "../src/components/artwork/useArtwork";
import { paintCanvas } from "../src/core/noise";

vi.mock("../src/core/noise", () => ({ paintCanvas: vi.fn(() => Promise.resolve({})) }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("does not paint a library artwork until its canvas approaches the viewport", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("CanvasRenderingContext2D", class {});
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  let reveal!: IntersectionObserverCallback;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });
  let resize!: ResizeObserverCallback;
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() { resize([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const canvas = {
    getBoundingClientRect: () => ({ width: 160, height: 40 }),
    getContext: () => ({ drawImage() {} }),
    dataset: {},
  };
  function Artwork() {
    const ref = useRef<HTMLCanvasElement>(null);
    useArtwork(ref, "test", 160, 40, { pixels() {} });
    return createElement("canvas", { ref });
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(Artwork), { createNodeMock: () => canvas }); });
  expect(paintCanvas).not.toHaveBeenCalled();

  act(() => reveal([{ target: canvas, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(paintCanvas).toHaveBeenCalledTimes(1);
  act(() => reveal([{ target: canvas, isIntersecting: false } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
  act(() => resize([], {} as ResizeObserver));
  expect(paintCanvas).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it("caps procedural artwork pixels on large high-density surfaces", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("CanvasRenderingContext2D", class {});
  vi.stubGlobal("window", { devicePixelRatio: 2 });
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const canvas = {
    getBoundingClientRect: () => ({ width: 1000, height: 600 }),
    getContext: () => ({ drawImage() {} }),
    dataset: {},
  };
  function Artwork() {
    const ref = useRef<HTMLCanvasElement>(null);
    useArtwork(ref, "large-test", 515, 114, { pixels() {} });
    return createElement("canvas", { ref });
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(Artwork), { createNodeMock: () => canvas }); });
  const [, width, height] = vi.mocked(paintCanvas).mock.lastCall!;
  expect(width * height).toBeLessThanOrEqual(512_000);
  act(() => tree.unmount());
});
