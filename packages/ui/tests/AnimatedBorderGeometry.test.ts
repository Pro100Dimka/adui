import { afterEach, beforeEach, expect, it, vi } from "vitest";

let engine: typeof import("../src/core/motion-engine.js");
let resize: ResizeObserverCallback;
let width: number;
let height: number;
let style: Record<string, string>;
const length = vi.fn(() => 500);

beforeEach(async () => {
  width = 160;
  height = 240;
  style = { position: "relative", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", borderBottomLeftRadius: "12px" };
  const element = () => ({
    style: {}, attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
    getAttribute(name: string) { return this.attributes.get(name); },
    append() {}, remove() {}, getTotalLength: length,
  });
  vi.stubGlobal("document", { createElement: element, createElementNS: element });
  vi.stubGlobal("getComputedStyle", () => style);
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() {}
    disconnect() {}
  });
  vi.resetModules();
  engine = await import("../src/core/motion-engine.js");
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

function border() {
  const host = { style: {}, get offsetWidth() { return width; }, get offsetHeight() { return height; }, append() {} };
  return engine.attachBorder(host as unknown as HTMLElement);
}

it("follows all four corner radii instead of copying the top-left corner", () => {
  Object.assign(style, { borderTopRightRadius: "24px", borderBottomRightRadius: "36px", borderBottomLeftRadius: "48px" });
  const frame = border();
  const path = frame.path.getAttribute("d");
  for (const radius of [11.35, 23.35, 35.35, 47.35]) expect(path).toContain(`A${radius} ${radius}`);
  frame.destroy();
});

it("resolves percentage radii against each axis so the lights follow an ellipse", () => {
  for (const corner of ["TopLeft", "TopRight", "BottomRight", "BottomLeft"]) style[`border${corner}Radius`] = "50%";
  const frame = border();
  expect(frame.path.getAttribute("d")).toContain("A79.35 119.35");
  frame.destroy();
});

it("keeps cached contour and masks for unchanged resize notifications, then updates on resize", () => {
  const frame = border();
  for (let count = 0; count < 30; count++) resize([], {} as ResizeObserver);
  expect(length).toHaveBeenCalledOnce();
  width = 240;
  resize([], {} as ResizeObserver);
  expect(length).toHaveBeenCalledTimes(2);
  frame.destroy();
});

it("uses fractional border-box dimensions and compensates the host border on every side", () => {
  Object.assign(style, { width: "237.375px", height: "113.625px", boxSizing: "border-box", borderTopWidth: "1px", borderRightWidth: "2px", borderBottomWidth: "3px", borderLeftWidth: "4px" });
  width = 237; height = 114;
  const frame = border();
  expect(frame.path.getAttribute("d")).toContain("L225.375 0.65");
  expect(frame.overlay.style.inset).toBe("-1px -2px -3px -4px");
  expect(frame.overlay.style.width).toBe("calc(100% + 6px)");
  expect(frame.overlay.style.height).toBe("calc(100% + 4px)");
  frame.destroy();
});

it("converts content-box dimensions to the same border box used by CSS corner radii", () => {
  Object.assign(style, { width: "200.5px", height: "80.25px", boxSizing: "content-box", paddingLeft: "10px", paddingRight: "20px", paddingTop: "5px", paddingBottom: "6px", borderTopWidth: "1px", borderRightWidth: "2px", borderBottomWidth: "3px", borderLeftWidth: "4px" });
  const frame = border();
  expect(frame.path.getAttribute("d")).toContain("L224.5 0.65");
  expect(frame.path.getAttribute("d")).toContain("94.6");
  frame.destroy();
});

it("updates visible idle border lights on every shared clock frame for a smooth orbit", () => {
  let paint!: (time: number) => void;
  const host = { style: {}, offsetWidth: 160, offsetHeight: 240, append() {}, matches: () => false };
  const frame = engine.attachBorder(host as unknown as HTMLElement, {
    scope: { add: (_node: unknown, callback: typeof paint) => { paint = callback; return () => undefined; } } as never,
  });
  const transforms = new Set();
  for (let index = 1; index <= 30; index++) {
    paint(index / 30);
    transforms.add(frame.lights[0].spots[0].style.transform);
  }
  expect(transforms.size).toBe(30);
  frame.destroy();
});
