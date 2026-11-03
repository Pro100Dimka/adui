import { afterEach, expect, it, vi } from "vitest";
import { act, create } from "react-test-renderer";
import { createElement } from "react";
import { Spectrum } from "../src/components/artwork/Spectrum/Spectrum";
import { NeonWaves } from "../src/components/artwork/NeonWaves/NeonWaves";
import { ServerArt } from "../src/components/artwork/ServerArt/ServerArt";
import { readFileSync } from "node:fs";

const painters = vi.hoisted(() => [] as Array<(time: number) => void>);
const boundaries = vi.hoisted(() => [] as Array<{ current: unknown }>);

it("draws worker stars at their original size and CSS ease-in-out opacity", () => {
  const source = readFileSync(new URL("../src/components/artwork/NeonWaves/neon-renderer.js", import.meta.url), "utf8");
  const workerSource = source.slice(0, source.indexOf("let thread =" )).replaceAll("export ", "");
  const receive = new Function(`let onmessage; const requestAnimationFrame = () => 1; const postMessage = () => {}; ${workerSource}; renderNeon(createNeonGeometry); return (data) => onmessage({data});`)();
  const arc = vi.fn(), fill = vi.fn();
  const context = { globalAlpha: 1, setTransform() {}, clearRect() {}, createLinearGradient: () => ({ addColorStop() {} }), beginPath() {}, arc, fill() { fill(this.globalAlpha); } };
  for (const [id, time] of [0, 1, 2, 4].entries()) receive({type:"update", id, time, canvas:{getContext:()=>context}, width:600, height:120, dpr:1, padX:0, padY:0, stops:[], starColor:"#ff244c", options:{strands:0, comets:0, dots:[{x:300,y:60,r:0.6,o:0.45}]}});
  expect(arc).toHaveBeenCalledWith(300, 60, 0.6 * 3 / 2, 0, Math.PI * 2);
  [0.45, 0.25, 0.05, 0.45].forEach((opacity, index) => expect(fill.mock.calls[index][0]).toBeCloseTo(opacity, 5));
});
vi.mock("../src/core/motion/hooks", () => ({
  usePauseOffscreen: (ref: { current: unknown }) => { boundaries.push(ref); },
  useDecoration: (_ref: unknown, paint: (time: number) => void) => { painters.push(paint); },
}));
vi.mock("../src/core/providers/context", () => ({ useMotion: () => true }));

afterEach(() => {
  painters.length = 0;
  boundaries.length = 0;
  vi.unstubAllGlobals();
});

it("keeps spectrum columns moving without querying them on every animation tick", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const columns = Array.from({ length: 27 }, () => ({
    style: { transform: "" },
    firstElementChild: { style: { setProperty: vi.fn() } },
  }));
  const querySelectorAll = vi.fn(() => columns);
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(createElement(Spectrum, { variant: "segmented" }), {
      createNodeMock: (element) => element.props["data-variant"] === "segmented" ? { querySelectorAll } : null,
    });
  });
  for (const time of [0, 0.1, 0.2]) painters[0]!(time);
  expect(columns[0]!.style.transform).toContain("translateY(");
  expect(querySelectorAll).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it("keeps spectrum bars moving without repeatedly searching every SVG bar and layer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const bars = Array.from({ length: 23 }, () => ({
    querySelectorAll: vi.fn(() => [0, 1, 2].map((grow) => ({
      dataset: { grow: String(grow) },
      setAttribute: vi.fn(),
    }))),
  }));
  const querySelectorAll = vi.fn(() => bars);
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(createElement(Spectrum, { variant: "bars" }), {
      createNodeMock: (element) => element.props["data-variant"] === "bars" ? { querySelectorAll } : null,
    });
  });
  for (const time of [0, 0.1, 0.2]) painters[0]!(time);
  expect(querySelectorAll).toHaveBeenCalledTimes(1);
  for (const bar of bars) expect(bar.querySelectorAll).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it("keeps neon strands and comets moving without repeating DOM searches each frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([{ contentRect: { width: 600, height: 120 } } as ResizeObserverEntry], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const paths = Array.from({ length: 3 }, () => ({ setAttribute: vi.fn() }));
  const comets = Array.from({ length: 2 }, () => ({ dataset: {}, style: { width: "", transform: "", opacity: "" } }));
  const pathQuery = vi.fn(() => paths);
  const cometQuery = vi.fn(() => comets);
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(createElement(NeonWaves, { strands: 3, comets: 2, stars: false }), {
      createNodeMock: (element) => {
        if (element.props["data-ad-component"] === "NeonWaves") return {};
        if (element.props.className === "ad-neon-waves-strands") return { querySelectorAll: pathQuery };
        if (element.props.className === "ad-neon-waves-comets") return { querySelectorAll: cometQuery };
        return null;
      },
    });
  });
  for (const time of [0, 0.1, 0.2]) painters[0]!(time);
  expect(paths[0]!.setAttribute).toHaveBeenCalledTimes(3);
  expect(comets[0]!.style.transform).toContain("translate(");
  expect(pathQuery).toHaveBeenCalledTimes(1);
  expect(cometQuery).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it("shares nine twinkle phases and pauses the whole wave including its stars", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = {};
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<NeonWaves />, {createNodeMock: ({props}) => props["data-ad-component"] === "NeonWaves" ? host : null}); });
  const groups = tree.root.findAllByProps({className: "ad-neon-waves-stars"});
  expect(groups).toHaveLength(9);
  expect(groups.flatMap(group => group.findAllByType("i"))).toHaveLength(60);
  expect(boundaries[0].current).toBe(host);
  const floor = tree.root.findByProps({className: "ad-neon-waves-stars-floor"}).findAllByType("i");
  expect(floor).toHaveLength(60);
  for (const star of floor) expect(star.props.style.opacity).toBe(0.05);
  act(() => tree.unmount());
});

it("draws the server rack's unchanged ventilation detail without a DOM node per hatch", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(ServerArt)); });
  const paths = tree.root.findAllByType("path");
  expect(paths.length).toBeLessThan(60);
  expect(paths.some(({ props }) => props.stroke === "var(--ad-neutral-950)" && props.d.includes("M34 49.8"))).toBe(true);
  act(() => tree.unmount());
});
