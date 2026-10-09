import { act, create } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { LevelMeter } from "../src/components/media/LevelMeter/LevelMeter";

const clock = vi.hoisted(() => ({
  listeners: new Set<(now: number) => void>(),
  subscribe: vi.fn(),
}));
vi.mock("../src/core/motion-engine.js", () => ({
  subscribeTick: (listener: (now: number) => void) => {
    clock.subscribe();
    clock.listeners.add(listener);
    return () => { clock.listeners.delete(listener); };
  },
}));

afterEach(() => {
  clock.listeners.clear();
  clock.subscribe.mockClear();
  vi.unstubAllGlobals();
});

it("keeps a silent meter off the shared frame clock until it receives a level", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const path = { setAttribute: vi.fn() };
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<LevelMeter value={0} />, { createNodeMock: ({ type }) => type === "path" ? path : null });
  });
  expect(clock.subscribe).not.toHaveBeenCalled();
  act(() => { tree.update(<LevelMeter value={35} />); });
  expect(clock.listeners.size).toBe(1);
  act(() => tree.unmount());
  expect(clock.listeners.size).toBe(0);
});

it("lets a fading meter settle and releases the frame clock after silence", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const path = { setAttribute: vi.fn() };
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<LevelMeter value={80} />, { createNodeMock: ({ type }) => type === "path" ? path : null });
  });
  const start = performance.now();
  for (let i = 1; i <= 4; i++) for (const tick of clock.listeners) tick(start + i * 28);
  act(() => { tree.update(<LevelMeter value={0} />); });
  expect(clock.listeners.size).toBe(1);
  for (let i = 5; i <= 220; i++) for (const tick of clock.listeners) tick(start + i * 28);
  expect(clock.listeners.size).toBe(0);
  expect(path.setAttribute).toHaveBeenCalledWith("transform", "translate(0 0)");
  act(() => tree.unmount());
});
