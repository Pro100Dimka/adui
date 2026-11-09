import { act, create } from "react-test-renderer";
import { useLayoutEffect } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { LevelMeter } from "../src/components/media/LevelMeter/LevelMeter";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("reuses worker geometry and isolates a failed canvas from other meters", () => {
  const source = readFileSync(new URL("../src/components/media/LevelMeter/LevelMeter.tsx", import.meta.url), "utf8");
  const worker = transformSync(source.slice(source.indexOf("function renderMeters()"), source.indexOf("let meterWorker:")), { loader: "ts" }).code;
  class Path { constructor(public d?: string) {} }
  const posted = vi.fn(), gradient = { addColorStop: vi.fn() };
  const ctx = { setTransform: vi.fn(), clearRect: vi.fn(), scale: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), translate: vi.fn(), fill: vi.fn(), createLinearGradient: vi.fn(() => gradient) };
  const canvas = { width: 0, height: 0, getContext: () => ctx, addEventListener: vi.fn() };
  const receive = new Function("Path2D", "postMessage", `let onmessage; ${worker}; renderMeters(); return onmessage;`)(Path, posted);
  const style = { width: 800, height: 120, stroke: "#f00", lineWidth: .7, lineAlpha: .24, fillAlpha: 1, fill: "", stops: [{ at: 0, color: "#f00" }, { at: 1, color: "#fff" }] };
  receive({ data: { frames: [{ id: 1, revision: 1, canvas, style, d: "M0 11L256 11L256 13L0 13Z", offset: -1 }] } });
  const path = ctx.fill.mock.calls[0]?.[0];
  expect(canvas.width).toBe(800);
  expect(ctx.scale).toHaveBeenLastCalledWith(800 / 256, 120 / 24);
  expect(ctx.translate).toHaveBeenLastCalledWith(-1, 0);
  receive({ data: { frames: [{ id: 1, revision: 1, offset: -2 }, { id: 2, revision: 1, canvas: { getContext: () => null }, style, offset: 0 }] } });
  expect(ctx.fill.mock.calls.at(-1)?.[0]).toBe(path);
  expect(ctx.createLinearGradient).toHaveBeenCalledOnce();
  expect(posted).toHaveBeenLastCalledWith({ ack: true, completed: [{ id: 1, revision: 1 }], failed: [2] });
  receive({ data: { remove: 1 } });
  ctx.fill.mockClear();
  receive({ data: { frames: [{ id: 1, revision: 1, offset: 0 }] } });
  expect(ctx.fill).not.toHaveBeenCalled();
});

it("makes a committed signal available before the next paint", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(performance, "now").mockReturnValue(0);
  const path = { setAttribute: vi.fn() };
  function Host({ value }: { value: number }) {
    useLayoutEffect(() => { for (const tick of clock.listeners) tick(28); }, [value]);
    return <LevelMeter value={value} />;
  }
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Host value={0} />, { createNodeMock: ({ type }) => type === "path" ? path : null }); });
  const silent = path.setAttribute.mock.calls.find(([name]) => name === "d")?.[1];
  act(() => tree.update(<Host value={35} />));
  expect(path.setAttribute.mock.calls.filter(([name]) => name === "d").at(-1)?.[1]).not.toBe(silent);
  expect(tree.root.findByProps({ role: "meter" }).props["aria-valuenow"]).toBe(35);
  act(() => tree.unmount());
});

it("writes only the final waveform after delayed frames without skipping samples", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(performance, "now").mockReturnValue(0);
  const paths = [{ setAttribute: vi.fn() }, { setAttribute: vi.fn() }];
  const trees = paths.map(path => {
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(<LevelMeter value={80} />, { createNodeMock: ({ type }) => type === "path" ? path : null }); });
    return tree;
  });
  const [regular, delayed] = [...clock.listeners];
  for (let now = 28; now <= 224; now += 28) regular!(now);
  paths[1]!.setAttribute.mockClear();
  delayed!(224);
  const writes = paths.map(path => path.setAttribute.mock.calls.filter(([name]) => name === "d"));
  expect(writes[1]).toHaveLength(1);
  expect(writes[1]![0]![1]).toBe(writes[0]!.at(-1)?.[1]);
  const samples = Array.from({ length: 65 }, () => 0);
  let envelope = 0;
  for (let i = 0; i < 8; i++) {
    envelope += (.8 - envelope) * .3;
    samples.shift(); samples.push(envelope);
  }
  const point = (level: number, i: number, side: number) => `${(i * 256 / 63).toFixed(2)} ${(12 + side * (1 + level ** .68 * 9)).toFixed(2)}`;
  const upper = samples.map((level, i) => point(level, i, -1));
  const lower = samples.map((level, i) => point(level, i, 1)).reverse();
  expect(writes[1]![0]![1]).toBe(`M${upper.join("L")}L${lower.join("L")}Z`);
  for (const tree of trees) act(() => tree.unmount());
});

it("does not rewrite an unchanged waveform while a steady level keeps scrolling", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(performance, "now").mockReturnValue(0);
  const path = { setAttribute: vi.fn() };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<LevelMeter value={35} />, { createNodeMock: ({ type }) => type === "path" ? path : null }); });
  const [tick] = [...clock.listeners];
  for (let now = 28; now <= 5600; now += 28) tick!(now);
  path.setAttribute.mockClear();
  tick!(5635);
  expect(path.setAttribute.mock.calls.filter(([name]) => name === "d")).toHaveLength(0);
  expect(path.setAttribute).toHaveBeenCalledWith("transform", "translate(-1.016 0)");
  act(() => tree.unmount());
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
  const start = performance.now();
  for (const tick of clock.listeners) tick(start + 1);
  expect(clock.listeners.size).toBe(1);
  const silentPath = path.setAttribute.mock.calls.find(([name]) => name === "d")?.[1];
  for (const tick of clock.listeners) tick(start + 40);
  expect(path.setAttribute.mock.calls.filter(([name]) => name === "d").at(-1)?.[1]).not.toBe(silentPath);
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
