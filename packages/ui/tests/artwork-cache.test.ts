import { afterEach, expect, it, vi } from "vitest";
import { paintCanvas } from "../src/core/noise";

afterEach(() => vi.unstubAllGlobals());

it("evicts old procedural pictures instead of retaining every visited size", async () => {
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => null }) });
  const painting = { pixels() {} };
  const first = paintCanvas("cache-test-0", 10, 10, painting);
  for (let index = 1; index <= 30; index++) await paintCanvas(`cache-test-${index}`, 10, 10, painting);
  expect(paintCanvas("cache-test-0", 10, 10, painting)).not.toBe(first);
});
