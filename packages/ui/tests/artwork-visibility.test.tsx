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
