import { act, create } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PianoKeyboard } from "../src/components/media/PianoKeyboard/PianoKeyboard";
import { MelodyRoll } from "../src/components/media/MelodyRoll/MelodyRoll";
import { Waveform } from "../src/components/media/Waveform/Waveform";
import { Marquee } from "../src/components/effects/Marquee/Marquee";
import { Sparkline } from "../src/components/media/Sparkline/Sparkline";
import { Tilt } from "../src/components/effects/Tilt/Tilt";
import { Shimmer } from "../src/components/effects/Shimmer/Shimmer";
import * as melodyGlow from "../src/components/media/MelodyRoll/melody-glow.js";
import { readFileSync } from "node:fs";

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("hands bounded note windows and mutable hits to the worker and restores native notes on failure", () => {
  const update = vi.fn(), dispose = vi.fn();
  let ready!: (value: boolean) => void;
  vi.spyOn(melodyGlow, "createMelodyGlow").mockImplementation((_root, _state, onReady) => {
    ready = onReady; ready(true);
    return { update, dispose };
  });
  const notes = Array.from({ length: 128 }, (_, i) => ({ id: String(i), start: i * 0.25, end: i * 0.25 + 0.2, pitch: 60, lyric: String(i) }));
  const hitIds = new Set<string>();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<MelodyRoll notes={notes} position={10} hitIds={hitIds} showLyrics />, { createNodeMock: () => ({}) }); });
  try {
    expect(tree.root.findAllByProps({ className: "ad-melody-note" })).toHaveLength(0);
    const original = update.mock.lastCall![0].notes;
    act(() => tree.update(<MelodyRoll notes={notes} position={10.01} hitIds={hitIds} showLyrics />));
    expect(update.mock.lastCall![0].notes).toBe(original);
    hitIds.add("40");
    act(() => tree.update(<MelodyRoll notes={notes} position={10.01} hitIds={hitIds} showLyrics />));
    const sent = update.mock.lastCall![0];
    expect(sent.hits[sent.notes.findIndex((note: { id: string }) => note.id === "40")]).toBe("h");
    for (const [position, span] of [[10.1, 8], [18.01, 8], [2, 4], [-1, 8]]) {
      act(() => tree.update(<MelodyRoll notes={notes} position={position} window={span} showLyrics />));
      const sent = update.mock.lastCall![0];
      const inside = (note: { start: number; end: number }) => note.end >= position - span * 0.25 && note.start <= position + span * 0.75;
      expect(sent.notes.filter(inside)).toEqual(notes.filter(inside));
      expect(sent.notes.length).toBeLessThanOrEqual(span * 8 + 2);
      expect(tree.root.findAllByProps({ className: "ad-melody-note" })).toHaveLength(0);
    }
    act(() => ready(false));
    expect(tree.root.findAllByProps({ className: "ad-melody-note" })).toHaveLength(notes.filter(note => note.end >= -3 && note.start <= 5).length);
    expect(tree.root.findAllByType("svg")).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
  expect(dispose).toHaveBeenCalledOnce();
});

it("preserves CSS easing, independent voice transitions, trail gaps and worker pause/cleanup", async () => {
  let now = 0;
  const frames: Array<(time: number) => void> = [];
  const context = () => ({
    ...Object.fromEntries(["setTransform", "save", "restore", "beginPath", "rect", "roundRect", "clip", "fill", "fillRect", "fillText", "drawImage", "translate", "scale"].map(name => [name, vi.fn()])),
    clearRect: vi.fn(), arc: vi.fn(), stroke: vi.fn(), shadowBlur: 0, filter: "none",
    getTransform: () => ({ a: 1 }), measureText: () => ({ fontBoundingBoxAscent: 9, fontBoundingBoxDescent: 2 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  });
  class Canvas { ctx = context(); constructor(public width: number, public height: number) {} getContext() { return this.ctx; } }
  const root = context(), voice = context(), trail = context();
  class Path {
    points: Array<[string, number, number]> = [];
    moveTo(x: number, y: number) { this.points.push(["M", x, y]); }
    lineTo(x: number, y: number) { this.points.push(["L", x, y]); }
  }
  const source = readFileSync(new URL("../src/components/media/MelodyRoll/melody-glow.js", import.meta.url), "utf8");
  const posted = vi.fn();
  const receive = new Function("performance", "requestAnimationFrame", "postMessage", "Path2D", "OffscreenCanvas", `let onmessage; ${source.slice(0, source.indexOf("let thread ="))}; renderGlow(); return data => onmessage({data});`)(
    { timeOrigin: 0, now: () => now }, (frame: (time: number) => void) => { frames.push(frame); return 1; }, posted, Path, Canvas,
  );
  let state = { beat: 0, pitch: 60 as number | undefined, high: 72, rows: 16, lead: 0.25, level: 0, accuracy: 0, hit: false, position: 0, span: 8 };
  const config = { type: "configure", id: 1, state, visible: true, time: 0, width: 1000, height: 400, laneWidth: 1000, laneHeight: 400, pad: 40, radius: [16, 16, 16, 16], blur: 20, color: "#ff244c40", dpr: 1, duration: 120,
    canvas: { getContext: () => root }, voiceCanvas: { getContext: () => voice }, trailCanvas: { getContext: () => trail },
    lightColors: ["#ff244c20", "transparent"], lightBorder: "#ff244c55", lightWidth: 1, headWidth: 2, headShadows: [],
    voiceStyle: { size: [16, 32], color: ["#fff", "#2ee886"], hitColor: "#4dffa0", borderColor: "#fff", border: 2, shadows: [[], []], duration: 80, hitDuration: 420 },
    trailStyle: [10.4, 6.4, 2.4].map(width => ({ width, color: ["#fff", "#3dff91"], opacity: 0.75 })),
  };
  receive(config);
  const step = (time: number) => { now = time; frames.shift()?.(time); };
  const update = (change: Partial<typeof state>) => { state = { ...state, ...change }; receive({ type: "state", id: 1, state, time: now }); };
  update({ beat: 1, pitch: 64, level: 1, position: 1 });
  step(40);
  expect(voice.arc.mock.calls.at(-2)?.[1]).toBeCloseTo(262.5, 4); // Linear top at half of 80 ms.
  expect(voice.arc.mock.calls.at(-2)?.[2]).toBeCloseTo(14.4192, 3); // CSS ease(0.5) = 0.802403.
  step(60);
  expect(root.shadowBlur).toBeCloseTo(16.0481, 3); // Half of the 120 ms blur transition.
  update({ beat: 0 });
  step(80);
  expect(voice.arc.mock.calls.at(-2)?.[1]).toBeCloseTo(212.5, 4);
  expect(voice.arc.mock.calls.at(-2)?.[2]).toBe(16); // Unrelated beat updates must not restart size/top.
  update({ pitch: undefined, position: 2 });
  voice.arc.mockClear();
  step(100);
  expect(voice.arc).not.toHaveBeenCalled();
  update({ pitch: 65, position: 2.5 });
  trail.stroke.mockClear();
  step(120);
  expect(trail.stroke).toHaveBeenCalledTimes(6); // Three layers for each of two disconnected segments.
  expect(trail.stroke.mock.calls[0][0].points.map((point: [string, number, number]) => point[0])).toEqual(["M", "L"]);
  expect(trail.stroke.mock.calls[3][0].points.map((point: [string, number, number]) => point[0])).toEqual(["M"]);
  update({ position: -1 });
  trail.stroke.mockClear();
  step(140);
  expect(trail.stroke).toHaveBeenCalledTimes(3);
  expect(trail.stroke.mock.calls[0][0].points).toHaveLength(1);
  update({ hit: true });
  step(329); // 45% of the 420 ms hit animation, after the update at 140 ms.
  expect(voice.arc.mock.calls.at(-2)?.[2]).toBeCloseTo(21.6, 4);
  step(560);
  expect(voice.arc.mock.calls.at(-2)?.[2]).toBe(16);
  receive({ type: "visible", id: 1, visible: false });
  root.clearRect.mockClear();
  step(580);
  expect(root.clearRect).not.toHaveBeenCalled();
  expect(frames).toHaveLength(0);
  receive({ type: "remove", id: 1 });
  update({ beat: 1 });
  expect(frames).toHaveLength(0);

  const notes = context(), keys = context();
  const shadow = { kind: "drop-shadow", color: "#0f0", x: 0, y: 0, blur: 3, spread: 0, inset: false };
  const surface = { color: "#fff", backgroundColor: "#f00", gradient: [], shadows: [], radius: [8, 8, 8, 8], borders: Array.from({ length: 4 }, () => ({ width: 0, color: "#000" })), filter: [] };
  const text = { font: "10px sans-serif", color: "#fff", letterSpacing: "0px", baseline: 10, offset: 2, padding: 2, textShadows: [] };
  now = 600;
  receive({ ...config, id: 2, time: now, state: { ...state, position: 100.75, pitch: 64, hit: false, hits: "--", showLyrics: true, notes: [
    { id: "later", start: 100.5, end: 103, pitch: 64, lyric: "B" },
    { id: "earlier", start: 100, end: 102, pitch: 64, lyric: "A" },
  ] }, noteCanvas: { getContext: () => notes }, keyCanvas: { getContext: () => keys }, foreground: {
    fonts: [], grid: { color: "#fff1", width: 1 }, keyWidth: 72, keyHeight: 400,
    note: { base: surface, current: { ...surface, filter: [{ kind: "brightness", value: 1.3 }, shadow] }, hit: { ...surface, filter: [shadow, shadow] }, peakFilter: [{ kind: "brightness", value: 1.9 }, shadow], filterPad: 18,
      text, height: 19, filterDuration: 200, opacityDuration: 300, pastOpacity: 0.45, hitDuration: 620 },
    keys: [{ midi: 64, top: 0, width: 72, height: 25, label: "E4", text, base: surface, active: surface, hit: { ...surface, color: "#0f0" }, pressed: surface, duration: 180, pressDuration: 120, pressShift: -2, hitDuration: 900, hitIterations: Infinity, pad: 4 }],
  } });
  expect(notes.drawImage).toHaveBeenCalledTimes(2);
  expect(notes.drawImage.mock.calls[0][1]).toBeGreaterThan(notes.drawImage.mock.calls[1][1]); // Input order, including overlapping notes.
  receive({ type: "state", id: 2, time: now, state: { hits: "hh", hit: true } });
  notes.drawImage.mockClear();
  step(600 + 620 * 0.28);
  const peak = notes.drawImage.mock.calls[0];
  expect(peak[4]).toBeCloseTo(peak[0].height * 1.6, 5); // Scale applies to the filtered image, including its glow.
  expect(peak[0].ctx.filter).toContain("brightness(1.9)");
  step(1050);
  expect(Number(keys.filter.slice(11, -1))).toBeCloseTo(1.25, 8);
  receive({ type: "keys", id: 2, time: now, pressed: [64] });
  step(1170);
  expect(keys.drawImage.mock.calls.at(-1)?.[5]).toBe(-6); // Native press translation and shadow padding.
  receive({ type: "visible", id: 2, visible: false });
  notes.clearRect.mockClear(); step(1190);
  expect(notes.clearRect).not.toHaveBeenCalled();
  expect(frames).toHaveLength(0);
  await receive({ ...config, id: 3, canvas: { getContext() { throw new Error("Canvas unavailable"); } } });
  expect(posted).toHaveBeenLastCalledWith({ id: 3, failed: true });
});

it("does not rescan the whole melody during playback and refreshes replaced notes", () => {
  const start = vi.fn((i: number) => i * 0.25);
  const notes = Array.from({ length: 10000 }, (_, i) => ({ id: String(i), get start() { return start(i); }, end: i * 0.25 + 0.2, pitch: 60 + i % 12 }));
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<MelodyRoll notes={notes} position={100} />); });
  try {
    start.mockClear();
    act(() => tree.update(<MelodyRoll notes={notes} position={100.1} />));
    expect(start.mock.calls.length).toBeLessThan(512);
    for (const position of [100.1, 32, 32.01, -1]) {
      act(() => tree.update(<MelodyRoll notes={notes} position={position} window={8} />));
      const shift = Number(tree.root.findByProps({ className: "ad-melody-roll-strip" }).props.style.transform.match(/[-\d.]+/)[0]);
      const visible = notes.filter(note => note.end >= position - 2 && note.start <= position + 6);
      const rendered = tree.root.findAllByProps({ className: "ad-melody-note" });
      expect(rendered).toHaveLength(visible.length);
      rendered.forEach((note, i) => expect(parseFloat(note.props.style.left) + shift).toBeCloseTo((visible[i].start - position + 2) / 8 * 100, 2));
    }
    const replacement = [
      { id: "late", start: 8, end: 9, pitch: 64, lyric: "late" },
      { id: "long", start: -20, end: 20, pitch: 60, lyric: "long" },
      { id: "edge", start: 0, end: 2, pitch: 62, lyric: "edge" },
    ];
    act(() => tree.update(<MelodyRoll notes={replacement} position={4} window={8} showLyrics />));
    expect(tree.root.findAllByProps({ className: "ad-melody-note" }).map(note => note.findAllByType("span").at(-1)!.children.join(""))).toEqual(["late", "long", "edge"]);
  } finally { act(() => tree.unmount()); }
});

it("keeps the moving seconds grid local while preserving its phase through seeks and zoom", () => {
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<MelodyRoll position={2.5} window={8} />); });
  try {
    for (const [position, span, shift] of [[2.5, 8, -6.25], [5.75, 8, -9.375], [5.75, 4, -18.75]]) {
      act(() => tree.update(<MelodyRoll position={position} window={span} />));
      expect(tree.root.findByProps({ role: "img" }).props.style["--ad-roll-shift"]).toBeUndefined();
      expect(tree.root.findByProps({ className: "ad-melody-roll-seconds" }).props.style["--ad-roll-shift"]).toBe(`${shift}cqw`);
    }
  } finally { act(() => tree.unmount()); }
});

it("activates piano keys through the native click used by keyboard and assistive input, once", () => {
  const onKeyPress = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoKeyboard minMidi={60} maxMidi={60} onKeyPress={onKeyPress} />); });
  const key = tree.root.findByType("button");
  act(() => key.props.onClick?.({ detail: 0 }));
  expect(onKeyPress).toHaveBeenCalledExactlyOnceWith(60);
  act(() => tree.unmount());
});

it("cleans up the piano pressed feedback timer on unmount", () => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoKeyboard minMidi={60} maxMidi={60} onKeyPress={() => undefined} />); });
  const key = tree.root.findByType("button");
  act(() => key.props.onPointerDown?.({ button: 0, isPrimary: true }));
  act(() => tree.unmount());
  expect(vi.getTimerCount()).toBe(0);
});

it("stops the waveform playback decoration when a seek interrupts a small playback step", () => {
  vi.useFakeTimers();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Waveform position={1} />); });
  act(() => tree.update(<Waveform position={1.1} />));
  expect(tree.root.findByProps({ role: "slider" }).props["data-playing"]).toBe(true);
  act(() => tree.update(<Waveform position={20} />));
  act(() => vi.advanceTimersByTime(1000));
  expect(tree.root.findByProps({ role: "slider" }).props["data-playing"]).toBeUndefined();
  act(() => tree.unmount());
});

it("clamps the waveform's spoken value to the same track position that is rendered", () => {
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Waveform duration={10} position={30} />); });
  const slider = tree.root.findByProps({ role: "slider" });
  expect(slider.props["aria-valuenow"]).toBe(10);
  expect(slider.props["aria-valuetext"]).toBe("0:10");
  act(() => tree.unmount());
});

it("keeps decorative marquee copies out of keyboard and pointer interaction", () => {
  const copy = { inert: false };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Marquee><button>Open track</button></Marquee>, { createNodeMock: ({ props }) => props["aria-hidden"] ? copy : null }); });
  const groups = tree.root.findAllByProps({ className: "ad-marquee-group" });
  expect(groups[0].props.inert).toBeUndefined();
  expect(copy.inert).toBe(true);
  act(() => tree.unmount());
});

it("renders explicit empty waveform peaks as silence rather than fabricated demo audio", () => {
  let empty!: ReturnType<typeof create>, silent!: ReturnType<typeof create>;
  act(() => { empty = create(<Waveform points={[]} />); silent = create(<Waveform points={[0]} />); });
  expect(empty.root.findByProps({ className: "ad-waveform-peaks" }).props.d).toBe(silent.root.findByProps({ className: "ad-waveform-peaks" }).props.d);
  act(() => { empty.unmount(); silent.unmount(); });
});

it("does not invent a sparkline when a supplied series is empty", () => {
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Sparkline values={[]} label="No measurements" />); });
  expect(tree.root.findAllByType("path")).toHaveLength(0);
  expect(tree.root.findAllByType("circle")).toHaveLength(0);
  expect(tree.root.findByProps({ role: "img" }).props["aria-label"]).toBe("No measurements");
  act(() => tree.unmount());
});

it("keeps pointer-driven tilt still for a reduced-motion preference", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const node = { style: { setProperty: vi.fn() }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Tilt>Content</Tilt>); });
  act(() => tree.root.findByType("div").props.onPointerMove({ currentTarget: node, clientX: 95, clientY: 20 }));
  expect(node.style.setProperty).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it.each([{ name: "Shimmer", Component: Shimmer }, { name: "Sparkline", Component: Sparkline }])("tracks visibility and releases the observer for offscreen $name animations", ({ Component }) => {
  vi.stubGlobal("document", { hidden: true });
  const observe = vi.fn(), unobserve = vi.fn(), disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class { observe = observe; unobserve = unobserve; disconnect = disconnect; });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Component />, { createNodeMock: () => ({ removeAttribute() {} }) }); });
  expect(observe).toHaveBeenCalledOnce();
  act(() => tree.unmount());
  expect(unobserve).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
});

it("ignores a context-menu press on the waveform instead of seeking", () => {
  const onSeek = vi.fn();
  const node = { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, width: 100 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Waveform onSeek={onSeek} />, { createNodeMock: () => node }); });
  act(() => tree.root.findByProps({ role: "slider" }).props.onPointerDown({ currentTarget: node, button: 2, isPrimary: true, pointerId: 1, clientX: 50 }));
  expect(onSeek).not.toHaveBeenCalled();
  expect(node.setPointerCapture).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("restores a cancelled waveform seek and returns keyboard focus to the track", () => {
  const onSeek = vi.fn();
  const node = { setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture: vi.fn(), focus: vi.fn(), getBoundingClientRect: () => ({ left: 0, width: 100 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<Waveform defaultPosition={10} duration={100} onSeek={onSeek} />, { createNodeMock: () => node }); });
  const slider = tree.root.findByProps({ role: "slider" });
  act(() => slider.props.onPointerDown({ currentTarget: node, button: 0, isPrimary: true, pointerId: 1, clientX: 50, preventDefault() {} }));
  act(() => slider.props.onPointerCancel?.({ pointerId: 1 }));
  expect(onSeek.mock.calls).toEqual([[50], [10]]);
  expect(node.focus).toHaveBeenCalledOnce();
  expect(node.releasePointerCapture).toHaveBeenCalledWith(1);
  act(() => tree.unmount());
});
