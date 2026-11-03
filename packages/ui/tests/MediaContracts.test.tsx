import { act, create } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PianoKeyboard } from "../src/components/media/PianoKeyboard/PianoKeyboard";
import { MelodyRoll } from "../src/components/media/MelodyRoll/MelodyRoll";
import { Waveform } from "../src/components/media/Waveform/Waveform";
import { Marquee } from "../src/components/effects/Marquee/Marquee";
import { Sparkline } from "../src/components/media/Sparkline/Sparkline";
import { Tilt } from "../src/components/effects/Tilt/Tilt";
import { Shimmer } from "../src/components/effects/Shimmer/Shimmer";

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

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
