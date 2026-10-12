import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Popover } from "../src/components/feedback/Popover/Popover";
import { Tooltip } from "../src/components/feedback/Tooltip/Tooltip";
import { Dialog } from "../src/components/feedback/Dialog/Dialog";
import { Button } from "../src/components/controls/Button/Button";
import { Menu } from "../src/components/feedback/Menu/Menu";
import { MessageBar } from "../src/components/feedback/MessageBar/MessageBar";
import { Icon } from "../src/components/layout/Icon/Icon";

let tree: ReactTestRenderer | undefined;
let doc: EventTarget;
let win: EventTarget;
let resizeCallbacks: ResizeObserverCallback[];
let frames: Map<number, FrameRequestCallback>;

it("keeps the default MessageBar warning tone and its icon consistent", () => {
  act(() => { tree = create(<MessageBar>Warning message</MessageBar>); });
  expect(tree!.root.findByType("div").props["data-ad-tone"]).toBe("warning");
  expect(tree!.root.findByType(Icon).props.name).toBe("warning");
});
const rect = (left = 100, top = 100, width = 160, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height });
const node = (box = rect()) => ({
  getBoundingClientRect: vi.fn(() => box),
  style: { left: "", top: "", minWidth: "", setProperty: vi.fn(), removeProperty: vi.fn() },
  dataset: {}, querySelector: vi.fn(() => null), contains: vi.fn(() => false),
  focus: vi.fn(), isConnected: true,
});

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  doc = Object.assign(new EventTarget(), { documentElement: {}, activeElement: null });
  win = new EventTarget();
  frames = new Map();
  resizeCallbacks = [];
  vi.stubGlobal("document", doc);
  vi.stubGlobal("window", win);
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  vi.stubGlobal("getComputedStyle", () => ({ fontSize: "16px" }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { const id = frames.size + 1; frames.set(id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class { constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); } observe() {} disconnect() {} });
});
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  vi.unstubAllGlobals();
});

describe("layer ownership", () => {
  it("Escape dismisses only the most recently opened popover", () => {
    const outerClose = vi.fn(), innerClose = vi.fn();
    act(() => { tree = create(<><Popover open onOpenChange={outerClose} /><Popover open onOpenChange={innerClose} /></>, { createNodeMock: () => node() }); });
    const event = Object.assign(new Event("keydown", { cancelable: true }), { key: "Escape" });
    act(() => doc.dispatchEvent(event));
    expect(innerClose).toHaveBeenCalledExactlyOnceWith(false);
    expect(outerClose).not.toHaveBeenCalled();
  });

  it("outside presses dismiss only the top layer", () => {
    const first = vi.fn(), second = vi.fn();
    act(() => { tree = create(<><Popover open onOpenChange={first} /><Popover open onOpenChange={second} /></>, { createNodeMock: () => node() }); });
    act(() => doc.dispatchEvent(new Event("pointerdown")));
    expect(second).toHaveBeenCalledExactlyOnceWith(false);
    expect(first).not.toHaveBeenCalled();
  });

  it("respects an Escape already handled by a child", () => {
    const close = vi.fn();
    act(() => { tree = create(<Popover open onOpenChange={close} />, { createNodeMock: () => node() }); });
    const event = Object.assign(new Event("keydown", { cancelable: true }), { key: "Escape" });
    event.preventDefault();
    act(() => doc.dispatchEvent(event));
    expect(close).not.toHaveBeenCalled();
  });

  it("updates positioning props without reopening or refocusing", () => {
    const anchorRef = { current: node(rect(100, 100, 240)) as unknown as HTMLElement };
    const panel = node(rect(0, 0, 100));
    act(() => { tree = create(<Popover open anchorRef={anchorRef} align="end" matchAnchorWidth />, { createNodeMock: () => panel }); });
    expect(panel.style.left).toBe("15rem");
    act(() => tree!.update(<Popover open anchorRef={anchorRef} align="start" />));
    expect(panel.style.left).toBe("6.25rem");
    expect(panel.style.minWidth).toBe("");
  });

  it("repositions when the anchor or content resizes and removes pending work on unmount", () => {
    const anchorRef = { current: node() as unknown as HTMLElement };
    const panel = node();
    act(() => { tree = create(<Popover open anchorRef={anchorRef} />, { createNodeMock: () => panel }); });
    expect(resizeCallbacks.length).toBeGreaterThan(0);
    const before = panel.getBoundingClientRect.mock.calls.length;
    act(() => resizeCallbacks.forEach(callback => callback([], {} as ResizeObserver)));
    act(() => { frames.forEach(callback => callback(16)); frames.clear(); });
    expect(panel.getBoundingClientRect.mock.calls.length).toBeGreaterThan(before);
    act(() => resizeCallbacks.forEach(callback => callback([], {} as ResizeObserver)));
    act(() => tree!.unmount()); tree = undefined;
    expect(frames.size).toBe(0);
  });

  it("keeps the popup above a software keyboard's visual viewport boundary", () => {
    Object.assign(win, { visualViewport: Object.assign(new EventTarget(), { width: 800, height: 200, offsetLeft: 0, offsetTop: 200 }) });
    const anchorRef = { current: node(rect(100, 340, 100, 40)) as unknown as HTMLElement };
    const panel = node(rect(0, 0, 200, 80));
    act(() => { tree = create(<Popover open anchorRef={anchorRef} />, { createNodeMock: () => panel }); });
    expect(Number.parseFloat(panel.style.top) * 16 + 80).toBeLessThanOrEqual(392);
  });

  it("positions by untransformed dimensions while the entry animation scales the panel", () => {
    const anchorRef = { current: node(rect(740, 100, 40, 40)) as unknown as HTMLElement };
    const panel = Object.assign(node(rect(0, 0, 192, 76.8)), { offsetWidth: 200, offsetHeight: 80 });
    act(() => { tree = create(<Popover open anchorRef={anchorRef} align="start" />, { createNodeMock: () => panel }); });
    expect(Number.parseFloat(panel.style.left) * 16 + 200).toBeLessThanOrEqual(792);
  });

  it("Menu preserves the consumer key handler and its prevented navigation", () => {
    const onKeyDown = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    act(() => { tree = create(<Menu open onKeyDown={onKeyDown} items={[]} />); });
    const event = { key: "ArrowDown", currentTarget: { querySelectorAll: () => [] }, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    act(() => tree!.root.findByType(Popover).props.onKeyDown(event));
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });
});

describe("Tooltip descriptions and motion", () => {
  it("keeps the trigger's existing accessible description", () => {
    act(() => { tree = create(<Tooltip content="More detail"><button aria-describedby="field-help">Action</button></Tooltip>); });
    act(() => tree!.root.findByProps({ className: "ad-tooltip-trigger" }).props.onFocus());
    const id = tree!.root.findByProps({ role: "tooltip" }).props.id;
    expect(tree!.root.findByType("button").props["aria-describedby"]).toBe(`field-help ${id}`);
  });

  it("follows scrolling while visible", () => {
    const anchor = node(), tip = node(rect(0, 0, 120, 30));
    act(() => { tree = create(<Tooltip content="Help"><button>Action</button></Tooltip>, {
      createNodeMock: element => element.props.role === "tooltip" ? tip : anchor,
    }); });
    act(() => tree!.root.findByProps({ className: "ad-tooltip-trigger" }).props.onFocus());
    const before = tip.getBoundingClientRect.mock.calls.length;
    act(() => win.dispatchEvent(new Event("scroll")));
    act(() => { frames.forEach(callback => callback(16)); frames.clear(); });
    expect(tip.getBoundingClientRect.mock.calls.length).toBeGreaterThan(before);
  });

  it("does not hide a keyboard-focused description merely when the pointer leaves", () => {
    const anchor = node();
    anchor.contains.mockReturnValue(true);
    Object.assign(doc, { activeElement: {} });
    act(() => { tree = create(<Tooltip content="Help"><button>Action</button></Tooltip>, { createNodeMock: () => anchor }); });
    const trigger = () => tree!.root.findByProps({ className: "ad-tooltip-trigger" });
    act(() => trigger().props.onFocus());
    act(() => trigger().props.onMouseLeave());
    expect(tree!.root.findAllByProps({ role: "tooltip" })).toHaveLength(1);
  });
});

describe("Dialog asynchronous confirmation", () => {
  it("ignores a pending confirmation after the dialog closes and reopens", async () => {
    let resolve!: (result: boolean) => void;
    const onConfirm = () => new Promise<boolean>(done => { resolve = done; });
    const onOpenChange = vi.fn();
    const render = (open: boolean) => <Dialog open={open} onConfirm={onConfirm} onOpenChange={onOpenChange} />;
    act(() => { tree = create(render(true)); });
    act(() => { void tree!.root.findAllByType(Button).at(-1)!.props.onClick(); });
    act(() => tree!.update(render(false)));
    act(() => tree!.update(render(true)));
    await act(async () => resolve(true));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(tree!.root.findAllByType(Button).at(-1)!.props.loading).toBe(false);
  });

  it("does not submit twice before the pending render commits", async () => {
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>(done => { resolve = done; }));
    act(() => { tree = create(<Dialog open onConfirm={onConfirm} />); });
    const confirm = tree!.root.findAllByType(Button).at(-1)!.props.onClick;
    act(() => { void confirm(); void confirm(); });
    expect(onConfirm).toHaveBeenCalledOnce();
    await act(async () => resolve());
  });
});
