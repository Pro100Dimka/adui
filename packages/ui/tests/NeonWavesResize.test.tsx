import { act, create } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { NeonWaves } from "../src/components/artwork/NeonWaves/NeonWaves";

const motion = vi.hoisted(() => ({ paint: null as null | ((time: number) => void), resize: null as null | ResizeObserverCallback }));
vi.mock("../src/core/motion/hooks", () => ({
  usePauseOffscreen() {},
  useDecoration: (_ref: unknown, paint: (time: number) => void) => { motion.paint = paint; },
}));
vi.mock("../src/core/providers/context", () => ({ useMotion: () => true }));
vi.mock("../src/core/environment", () => ({
  createResizeObserver: (callback: ResizeObserverCallback) => {
    motion.resize = callback;
    return { observe() {}, disconnect() {} };
  },
}));
afterEach(() => vi.unstubAllGlobals());

it("resizes comet coordinates immediately without waiting for another motion tick", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const paths = Array.from({ length: 22 }, () => ({ setAttribute() {} }));
  const comets = Array.from({ length: 3 }, () => ({ dataset: {}, style: { transform: "", width: "", opacity: "" } }));
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<NeonWaves comets={3} />, { createNodeMock: ({ props }) => ({
    querySelectorAll: () => props.className === "ad-neon-waves-comets" ? comets : paths,
  }) }); });
  const resize = (width: number) => motion.resize?.([{ contentRect: { width, height: 120 } }] as ResizeObserverEntry[], {} as ResizeObserver);
  resize(600);
  motion.paint?.(2);
  const x = () => comets.map(comet => Number(/translate\(([-\d.]+)px/.exec(comet.style.transform)?.[1]));
  const before = x();
  resize(200);
  x().forEach((position, i) => expect(position).toBeCloseTo(before[i]! / 3, 1));
  act(() => tree.unmount());
});
