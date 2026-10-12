import { act, create } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RotaryKnob } from "../src/components/media/RotaryKnob/RotaryKnob";

vi.mock("../src/core/environment", () => ({
  canPaint: () => false,
  createResizeObserver: () => ({ observe() {}, disconnect() {} }),
  reducedMotionQuery: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
}));

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { addEventListener() {}, setTimeout, clearTimeout });
  vi.stubGlobal("document", { addEventListener() {}, documentElement: { dataset: {} } });
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
});
afterEach(() => vi.unstubAllGlobals());

function nodes() {
  const handlers = new Map<string, EventListener>();
  const attributes = new Map<string, string>();
  return {
    handlers, attributes,
    createNodeMock: ({ props }: { props: { className?: string } }) => ({
      width: 0, height: 0, style: { setProperty() {} }, dataset: {},
      classList: { add() {}, remove() {} },
      getBoundingClientRect: () => ({ width: 100, height: 100, left: 0, top: 0 }),
      getContext: () => null,
      addEventListener(name: string, listener: EventListener) { if (props.className === "knob__control") handlers.set(name, listener); },
      setAttribute(name: string, value: string) { if (props.className === "knob__control") attributes.set(name, value); },
      focus() {}, setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {},
    }),
  };
}
const input = { preventDefault() {}, key: "ArrowRight", button: 0, isPrimary: true, pointerId: 1, clientX: 50, clientY: 50 };

it("keeps the knob operable by keyboard when its optional readout is hidden", () => {
  const fixture = nodes(), onValueChange = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob defaultValue={20} showValue={false} onValueChange={onValueChange} />, fixture); });
  act(() => fixture.handlers.get("keydown")?.(input as unknown as KeyboardEvent));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(21);
  expect(fixture.attributes.get("aria-valuenow")).toBe("21");
  act(() => tree.unmount());
});

it("keeps controlled display at the supplied value while reporting keyboard proposals", () => {
  const fixture = nodes(), onValueChange = vi.fn(), onValueCommit = vi.fn();
  const props = { value: 20, onValueChange, onValueCommit };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob {...props} />, fixture); });
  act(() => fixture.handlers.get("keydown")?.(input as unknown as KeyboardEvent));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(21);
  expect(onValueCommit).toHaveBeenCalledExactlyOnceWith(21);
  expect(fixture.attributes.get("aria-valuenow")).toBe("20");
  act(() => tree.update(<RotaryKnob {...props} value={21} />));
  expect(fixture.attributes.get("aria-valuenow")).toBe("21");
  act(() => tree.unmount());
});

it("reports typed controlled proposals without replacing the externally supplied value", () => {
  const fixture = nodes(), onValueChange = vi.fn(), onValueCommit = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob value={20} onValueChange={onValueChange} onValueCommit={onValueCommit} />, fixture); });
  act(() => tree.root.findByProps({ className: "knob__value" }).props.onClick());
  act(() => tree.root.findByType("input").props.onChange({ currentTarget: { value: "30" } }));
  act(() => tree.root.findByType("input").props.onBlur());
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(30);
  expect(onValueCommit).toHaveBeenCalledExactlyOnceWith(30);
  expect(fixture.attributes.get("aria-valuenow")).toBe("20");
  act(() => tree.unmount());
});

it("uses controlled value before defaultValue in the initial accessible markup", () => {
  const fixture = nodes();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob value={20} defaultValue={70} />, fixture); });
  expect(tree.root.findByProps({ role: "slider" }).props["aria-valuenow"]).toBe(20);
  act(() => tree.unmount());
});

it("does not emit a user commit when a drag is disposed by unmount", () => {
  const fixture = nodes(), onValueCommit = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob defaultValue={20} onValueCommit={onValueCommit} />, fixture); });
  act(() => {
    fixture.handlers.get("pointerdown")?.(input as unknown as PointerEvent);
    fixture.handlers.get("pointermove")?.({ ...input, clientY: 40 } as unknown as PointerEvent);
  });
  act(() => tree.unmount());
  expect(onValueCommit).not.toHaveBeenCalled();
});

it.each(["disabled", "readOnly"] as const)("stops a drag when %s changes during the interaction", (state) => {
  const fixture = nodes(), onValueChange = vi.fn(), onValueCommit = vi.fn();
  const props = { defaultValue: 20, onValueChange, onValueCommit };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RotaryKnob {...props} />, fixture); });
  act(() => fixture.handlers.get("pointerdown")?.(input as unknown as PointerEvent));
  act(() => tree.update(<RotaryKnob {...props} {...{ [state]: true }} />));
  act(() => {
    fixture.handlers.get("pointermove")?.({ ...input, clientY: 10 } as unknown as PointerEvent);
    fixture.handlers.get("pointerup")?.(input as unknown as PointerEvent);
  });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(onValueCommit).not.toHaveBeenCalled();
  act(() => tree.unmount());
});
