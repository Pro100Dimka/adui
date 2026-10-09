import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { WaveDecoration } from "../src/components/media/WaveDecoration/WaveDecoration";

const motion = vi.hoisted(() => ({ paint: null as null | ((time: number) => void) }));
vi.mock("../src/core/motion/hooks", () => ({
  usePauseOffscreen: () => undefined,
  useDecoration: (_ref: unknown, paint: (time: number) => void) => { motion.paint = paint; },
}));

it("reuses the strand nodes instead of querying the SVG on each animation frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const paths = Array.from({ length: 22 }, () => ({ setAttribute: vi.fn() }));
  const svg = { querySelectorAll: vi.fn(() => paths) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<WaveDecoration />, { createNodeMock: ({ type }) => type === "svg" ? svg : null }); });
  for (let frame = 0; frame < 30; frame++) motion.paint?.(frame / 30);
  expect(svg.querySelectorAll).toHaveBeenCalledTimes(1);
  expect(paths[0].setAttribute).toHaveBeenCalledTimes(30);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});
