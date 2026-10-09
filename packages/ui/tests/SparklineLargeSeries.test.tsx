import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { Sparkline } from "../src/components/media/Sparkline/Sparkline";

it("keeps a large series bounded to screen resolution without losing its spike or last point", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const values = new Array<number>(200_000).fill(0);
  values[100_000] = 100;
  values[199_999] = 25;
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Sparkline values={values} />); });
  const line = tree.root.findByProps({ className: "ad-sparkline-line" }).props.d as string;
  const dot = tree.root.findByProps({ className: "ad-sparkline-dot" }).props;
  expect(line.match(/L/g)?.length).toBeLessThanOrEqual(480);
  expect(line).toContain(",8");
  expect(dot.cx).toBe(240);
  expect(dot.cy).toBeCloseTo(51.5);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});
