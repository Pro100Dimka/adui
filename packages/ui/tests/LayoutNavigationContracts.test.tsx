import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Tabs } from "../src/components/controls/Tabs/Tabs";
import { FloatingPanel } from "../src/components/layout/FloatingPanel/FloatingPanel";
import { useFloatingPanel, type FloatingPanelOptions } from "../src/components/layout/FloatingPanel/useFloatingPanel";
import { Stack } from "../src/components/layout/Stack/Stack";
import { Router, matchRoute } from "../src/components/navigation/Router/Router";

let tree: ReactTestRenderer | undefined;
it("preserves prototype-like route parameter names as own values", () => {
  const match = matchRoute([{ path: "/:constructor/:toString/:__proto__" }], "/one/two/three");
  expect(match?.params).toEqual({ constructor: "one", toString: "two", ["__proto__"]: "three" });
  expect(Object.hasOwn(match!.params, "__proto__")).toBe(true);
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { innerWidth: 1000, innerHeight: 700, addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal("document", { addEventListener() {}, removeEventListener() {} });
});
afterEach(() => {
  act(() => tree?.unmount()); tree = undefined;
  vi.unstubAllGlobals();
});

describe("dynamic tab accessibility", () => {
  it("starts from the first enabled tab instead of an unfocusable disabled item", () => {
    act(() => { tree = create(<Tabs items={[{ value: "a", label: "A", disabled: true }, { value: "b", label: "B" }]} />); });
    expect(tree!.root.findAllByType("button").map(button => button.props["aria-selected"])).toEqual([false, true]);
  });

  it("recovers uncontrolled selection and informs its panel after removal", () => {
    const onValueChange = vi.fn();
    const items = [{ value: "a", label: "A" }, { value: "b", label: "B" }];
    act(() => { tree = create(<Tabs items={items} onValueChange={onValueChange} />); });
    act(() => tree!.update(<Tabs items={[items[1]]} onValueChange={onValueChange} />));
    expect(tree!.root.findByType("button").props["aria-selected"]).toBe(true);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("keeps a tab stop when a controlled value is absent without inventing selection", () => {
    const onValueChange = vi.fn();
    act(() => { tree = create(<Tabs value="removed" items={[{ value: "a", label: "A" }]} onValueChange={onValueChange} />); });
    expect(tree!.root.findByType("button").props["aria-selected"]).toBe(false);
    expect(tree!.root.findByType("button").props.tabIndex).toBe(0);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

const initial = { left: 100, top: 100, width: 300, height: 200 };
const pointer = (x: number, y = 100, button = 0) => ({ button, pointerId: 1, clientX: x, clientY: y,
  currentTarget: { setPointerCapture() {} }, target: { closest: () => null }, stopPropagation() {} });
function panel(options: FloatingPanelOptions = {}) {
  let value!: ReturnType<typeof useFloatingPanel>;
  const frameRef = { current: null };
  function Probe(p: FloatingPanelOptions) { value = useFloatingPanel(frameRef, p); return null; }
  act(() => { tree = create(<Probe {...options} />); });
  return { get value() { return value; }, update: (p: FloatingPanelOptions) => act(() => tree!.update(<Probe {...p} />)) };
}

describe("floating panel gesture lifecycle", () => {
  it("accepts a saved layout update after a completed move", () => {
    const onLayoutChange = vi.fn();
    const probe = panel({ layout: initial, onLayoutChange });
    act(() => probe.value.beginMove(pointer(100) as never));
    act(() => probe.value.handleMove(pointer(180) as never));
    act(() => probe.value.handleUp());
    expect(onLayoutChange).toHaveBeenCalledOnce();
    const next = { ...initial, left: 20 };
    probe.update({ layout: next, onLayoutChange });
    expect(probe.value.layout).toEqual(next);
  });

  it("preserves the opposite edge when a west resize reaches its minimum", () => {
    const probe = panel({ layout: initial, limits: { minWidth: 250 } });
    act(() => probe.value.beginResize("w")(pointer(100) as never));
    act(() => probe.value.handleMove(pointer(280) as never));
    expect(probe.value.layout).toEqual({ ...initial, left: 150, width: 250 });
  });

  it("ignores a secondary-button resize gesture", () => {
    const probe = panel({ layout: initial });
    act(() => probe.value.beginResize("e")(pointer(100, 100, 2) as never));
    act(() => probe.value.handleMove(pointer(200) as never));
    expect(probe.value.layout).toEqual(initial);
  });

  it("canceling a pointer restores placement and does not commit", () => {
    const onLayoutChange = vi.fn();
    act(() => { tree = create(<FloatingPanel layout={initial} onLayoutChange={onLayoutChange} />); });
    const root = () => tree!.root.findByType("div");
    act(() => root().props.onPointerDown(pointer(100)));
    act(() => root().props.onPointerMove(pointer(180)));
    act(() => root().props.onPointerCancel());
    expect(onLayoutChange).not.toHaveBeenCalled();
    expect(root().props.style.left).toBe(initial.left);
  });

  it("lets keyboard users move and resize a focused panel", () => {
    const onLayoutChange = vi.fn();
    act(() => { tree = create(<FloatingPanel layout={initial} onLayoutChange={onLayoutChange} resizable />); });
    const root = () => tree!.root.findByType("div");
    expect(root().props.tabIndex).toBe(0);
    const element = {};
    const key = (shiftKey: boolean) => ({ key: "ArrowRight", shiftKey, target: element, currentTarget: element, preventDefault: vi.fn() });
    act(() => root().props.onKeyDown(key(false)));
    expect(onLayoutChange).toHaveBeenLastCalledWith({ ...initial, left: 110 });
    act(() => root().props.onKeyDown(key(true)));
    expect(onLayoutChange).toHaveBeenLastCalledWith({ ...initial, left: 110, width: 310 });
  });

  it("passes defaultSize to its drag fallback before a layout can be measured", () => {
    const onLayoutChange = vi.fn();
    act(() => { tree = create(<FloatingPanel defaultSize={{ width: 300, height: 200 }} onLayoutChange={onLayoutChange} />); });
    const root = () => tree!.root.findByType("div");
    act(() => root().props.onPointerDown(pointer(100)));
    act(() => root().props.onPointerMove(pointer(180)));
    act(() => root().props.onPointerUp());
    expect(onLayoutChange).toHaveBeenLastCalledWith({ left: 80, top: 0, width: 300, height: 200 });
  });
});

describe("layout and navigation identity", () => {
  it("keeps child state by key when a divided Stack is reordered", () => {
    function Stateful({ name }: { name: string }) { const [edited, setEdited] = useState(false); return <span onClick={() => setEdited(true)}>{name}{edited ? " edited" : ""}</span>; }
    const render = (names: string[]) => <Stack divider="/">{names.map(name => <Stateful key={name} name={name} />)}</Stack>;
    act(() => { tree = create(render(["A", "B"])); });
    act(() => tree!.root.findAllByType(Stateful)[0].findByType("span").props.onClick());
    act(() => tree!.update(render(["B", "A"])));
    expect(tree!.root.findAllByType(Stateful).map(item => item.findByType("span").children.join(""))).toEqual(["B", "A edited"]);
  });

  it("resynchronizes location when router mode changes", () => {
    vi.stubGlobal("location", { hash: "#/hash", pathname: "/history" });
    const routes = [{ path: "/hash", element: "Hash view" }, { path: "/history", element: "History view" }];
    act(() => { tree = create(<Router mode="hash" routes={routes} />); });
    act(() => tree!.update(<Router mode="history" routes={routes} />));
    expect(tree!.toJSON()).toBe("History view");
  });
});
