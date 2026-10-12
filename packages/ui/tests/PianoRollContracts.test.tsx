import { act, create } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PianoRoll } from "../src/components/editor/PianoRoll/PianoRoll";

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => vi.unstubAllGlobals());
const notes = [{ id: "a", pitch: 60, start: 0, end: 1 }];
const node = { style: {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 250 }), setPointerCapture() {} };
const pointer = { button: 0, pointerId: 1, clientX: 50, clientY: 100, currentTarget: node, stopPropagation() {}, preventDefault() {} };

it("selects a piano-roll note through native keyboard activation without starting a drag", () => {
  const onSelect = vi.fn(), onNoteDrag = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoRoll notes={notes} onSelect={onSelect} onNoteDrag={onNoteDrag} />); });
  act(() => tree.root.findByProps({ className: "ad-piano-roll-note-body" }).props.onClick?.({ detail: 0, shiftKey: true }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith("a", true);
  expect(onNoteDrag).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("does not seek or select an area when the browser cancels a pointer gesture", () => {
  const onSeek = vi.fn(), onSelectArea = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoRoll notes={notes} onSeek={onSeek} onSelectArea={onSelectArea} />, { createNodeMock: () => node }); });
  const world = tree.root.findByProps({ className: "ad-piano-roll-world" });
  act(() => world.props.onPointerDown(pointer));
  act(() => world.props.onPointerCancel({ ...pointer, type: "pointercancel" }));
  expect(onSeek).not.toHaveBeenCalled();
  expect(onSelectArea).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("ignores secondary pointers while a note drag is in progress", () => {
  const onNoteDrag = vi.fn(), onNoteDragEnd = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoRoll notes={notes} onNoteDrag={onNoteDrag} onNoteDragEnd={onNoteDragEnd} />, { createNodeMock: () => node }); });
  const world = tree.root.findByProps({ className: "ad-piano-roll-world" });
  act(() => tree.root.findByProps({ className: "ad-piano-roll-note-body" }).props.onPointerDown(pointer));
  act(() => {
    world.props.onPointerMove({ ...pointer, pointerId: 2, clientX: 100 });
    world.props.onPointerUp({ ...pointer, pointerId: 2, type: "pointerup" });
  });
  expect(onNoteDrag).not.toHaveBeenCalled();
  expect(onNoteDragEnd).not.toHaveBeenCalled();
  act(() => world.props.onPointerUp({ ...pointer, type: "pointerup" }));
  expect(onNoteDragEnd).toHaveBeenCalledOnce();
  act(() => tree.unmount());
});

it("restores the original note gesture before completing a cancelled drag", () => {
  const onNoteDrag = vi.fn(), onNoteDragEnd = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<PianoRoll notes={notes} onNoteDrag={onNoteDrag} onNoteDragEnd={onNoteDragEnd} />, { createNodeMock: () => node }); });
  const world = tree.root.findByProps({ className: "ad-piano-roll-world" });
  act(() => tree.root.findByProps({ className: "ad-piano-roll-note-body" }).props.onPointerDown(pointer));
  act(() => world.props.onPointerMove({ ...pointer, clientX: 100 }));
  act(() => world.props.onPointerCancel({ ...pointer, type: "pointercancel" }));
  expect(onNoteDrag).toHaveBeenLastCalledWith({ kind: "move", ids: ["a"], pitch: 0, seconds: 0 });
  expect(onNoteDragEnd).toHaveBeenCalledOnce();
  act(() => tree.unmount());
});
