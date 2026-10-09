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

it("defers procedural pixels and yields between idle-time chunks", async () => {
  const callbacks: IdleRequestCallback[] = [];
  vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => callbacks.push(callback));
  let elapsed = 0;
  vi.stubGlobal("performance", { now: () => elapsed });
  const context = {
    createImageData: (width: number, height: number) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: vi.fn(),
  };
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => context }) });
  const rows: number[] = [];
  const painting = paintCanvas("idle-test", 4, 5, {
    pixels(_image, from) { rows.push(from); elapsed += 2; },
  });

  expect(rows).toEqual([]);
  callbacks.shift()!({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline);
  await Promise.resolve();
  expect(rows).toEqual([0]);
  expect(context.putImageData).not.toHaveBeenCalled();

  const deadline = { didTimeout: false, timeRemaining: () => 4 } as IdleDeadline;
  callbacks.shift()!(deadline);
  await Promise.resolve();
  expect(rows).toEqual([0, 1, 2]);
  expect(context.putImageData).not.toHaveBeenCalled();

  while (callbacks.length) {
    callbacks.shift()!(deadline);
    await Promise.resolve();
  }
  await painting;
  expect(rows).toEqual([0, 1, 2, 3, 4]);
  expect(context.putImageData).toHaveBeenCalledTimes(1);
});

it("defers image upload and finishing strokes until after the final pixel slice", async () => {
  const callbacks: IdleRequestCallback[] = [];
  vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => callbacks.push(callback));
  const calls: string[] = [];
  const context = {
    createImageData: (width: number, height: number) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: () => calls.push("upload"),
  };
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => context }) });
  const painting = paintCanvas("finish-idle-test", 1, 1, {
    pixels: () => { calls.push("pixels"); },
    finish: () => { calls.push("finish"); },
  });
  const deadline = { didTimeout: false, timeRemaining: () => 4 } as IdleDeadline;

  expect(calls).toEqual([]);
  callbacks.shift()!(deadline);
  await Promise.resolve();
  expect(calls).toEqual(["pixels"]);

  callbacks.shift()!(deadline);
  await painting;
  expect(calls).toEqual(["pixels", "upload", "finish"]);
});
