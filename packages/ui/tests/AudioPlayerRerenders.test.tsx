import { afterEach, expect, it, vi } from "vitest";
import { act, create } from "react-test-renderer";
import { AudioPlayer } from "../src/components/media/AudioPlayer/AudioPlayer";
import { IconButton } from "../src/components/controls/IconButton/IconButton";
import { Slider } from "../src/components/controls/Slider/Slider";
import { Waveform } from "../src/components/media/Waveform/Waveform";

const clock = vi.hoisted(() => ({ tick: null as null | ((now: number) => void) }));
vi.mock("../src/core/motion/hooks", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/core/motion/hooks")>(),
  useTick: (callback: (now: number) => void, active: boolean) => {
    clock.tick = active ? callback : null;
  },
}));

afterEach(() => { clock.tick = null; vi.unstubAllGlobals(); });

it("moves the live cursor without rebuilding the play and volume controls every frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<AudioPlayer points={[0.2, 0.8, 0.4]} />); });
  act(() => tree.root.findAllByType(IconButton)[0].props.onClick!({} as never));
  const buttons = tree.root.findAllByType(IconButton).map((button) => button.props);
  const volume = tree.root.findByType(Slider).props;
  for (let frame = 0; frame < 30; frame++) act(() => clock.tick?.(1000 + frame * 34));

  expect(tree.root.findByType(Waveform).props.position).toBeGreaterThan(0.4);
  tree.root.findAllByType(IconButton).forEach((button, index) => expect(button.props).toBe(buttons[index]));
  expect(tree.root.findByType(Slider).props).toBe(volume);
  act(() => tree.unmount());
});

it("uses elapsed clock time for the demo timeline and announces completion once", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const onPlayingChange = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<AudioPlayer duration={0.2} onPlayingChange={onPlayingChange} />); });
  act(() => tree.root.findAllByType(IconButton)[0].props.onClick!({} as never));
  for (const now of [1000, 1050, 1100, 1150]) act(() => clock.tick?.(now));
  expect(tree.root.findByType(Waveform).props.position).toBeCloseTo(0.15);
  act(() => clock.tick?.(1200));
  expect(tree.root.findByType(Waveform).props.position).toBe(0);
  expect(onPlayingChange.mock.calls).toEqual([[true], [false]]);
  expect(clock.tick).toBeNull();
  act(() => tree.unmount());
});

it("resets a paused timeline when its audio source is replaced without emitting a seek", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Audio", class extends EventTarget {
    currentTime = 0;
    volume = 1;
    muted = false;
    play() { return Promise.resolve(); }
    pause() {}
  });
  const onTimeChange = vi.fn();
  const points = [0.2, 0.8, 0.4];
  let tree!: ReturnType<typeof create>;
  await act(async () => { tree = create(<AudioPlayer src="first.mp3" duration={30} points={points} onTimeChange={onTimeChange} />); });
  act(() => tree.root.findByType(Waveform).props.onSeek!(12));
  expect(tree.root.findByType(Waveform).props.position).toBe(12);
  await act(async () => { tree.update(<AudioPlayer src="second.mp3" duration={30} points={points} onTimeChange={onTimeChange} />); });
  expect(tree.root.findByType(Waveform).props.position).toBe(0);
  expect(onTimeChange.mock.calls).toEqual([[12]]);
  act(() => tree.unmount());
});
