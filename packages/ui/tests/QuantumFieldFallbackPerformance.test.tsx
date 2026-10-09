import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { QuantumField, quantumFieldAudio } from "../src/components/artwork/QuantumField/QuantumField";

it("reuses the caller-owned audio frame while updating every frequency band", () => {
  const bins = new Uint8Array(128);
  const analyser = { frequencyBinCount: bins.length, getByteFrequencyData(target: Uint8Array) { target.set(bins); } };
  const scratch = new Uint8Array(bins.length);
  const frame = { bands: Array<number>(7).fill(0), energy: 0 };
  bins.fill(255, 0, 12);
  expect(quantumFieldAudio(analyser, scratch, frame)).toBe(frame);
  expect(frame.bands[0]).toBeGreaterThan(0);
  bins.fill(0);
  expect(quantumFieldAudio(analyser, scratch, frame)).toBe(frame);
  expect(frame.bands).toEqual([0, 0, 0, 0, 0, 0, 0]);
  expect(frame.energy).toBe(0);
});

it("reuses deterministic particle seeds instead of recalculating their trigonometric hashes on every 2D frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", undefined);
  const context = { clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {}, stroke() {} };
  const canvas = { width: 300, height: 150, getContext: (kind: string) => kind === "2d" ? context : null };
  const root = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 200 }) };
  const sin = vi.spyOn(Math, "sin");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { interactive: true, paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  const firstFrameCalls = sin.mock.calls.length;
  sin.mockClear();
  const field = tree.root.findByProps({ "data-ad-component": "QuantumField" });
  act(() => field.props.onPointerMove({ clientX: 200, clientY: 100, currentTarget: root }));
  expect(firstFrameCalls).toBeGreaterThan(1_000);
  expect(sin.mock.calls.length).toBeLessThan(firstFrameCalls * 0.6);
  act(() => tree.unmount());
  sin.mockRestore();
  vi.unstubAllGlobals();
});
