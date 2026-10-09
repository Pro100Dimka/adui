import { afterEach, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { CatalogOverview } from "../../../apps/playground/src/catalog/CatalogOverview";
import { ComponentDocsPage } from "../../../apps/playground/src/catalog/ComponentDocsPage";
import { CatalogPage } from "../../../apps/playground/src/catalog/CatalogPage";
import { catalog } from "../../../apps/playground/src/catalog/componentRegistry";
import DataTableExample from "../src/components/feedback/DataTable/example";

it("includes QuantumField in the published documentation assets", () => {
  expect(readdirSync("../../docs/assets").some((name) => /^QuantumField-.*\.js$/.test(name))).toBe(true);
});

const border = vi.hoisted(() => vi.fn());
const tablePreview = vi.hoisted(() => vi.fn());
vi.mock("@ad-voice/ui", async (original) => {
  const kit = await original<typeof import("../src/index")>();
  const { createElement } = await import("react");
  return {
    ...kit,
    useBorder: border,
    usePauseOffscreen: () => {},
    DataTable: (props: Record<string, unknown>) => { tablePreview(props); return null; },
    Card: ({ as = "section", id, className, border, children }: import("../src/components/layout/shared").CardProps) =>
      createElement(as, { id, className, "data-test-border": border }, children),
  };
});

it("demonstrates table details, actions, pinning, multi-sort and opt-in large-data virtualization with complete rows", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  act(() => { tree = create(<DataTableExample />); });
  const initial = tablePreview.mock.calls.at(-1)![0];
  expect(initial.rows).toHaveLength(8);
  expect(initial.defaultSorting).toHaveLength(2);
  expect(initial.defaultColumnPinning).toEqual({ left: ["title"], right: ["status"] });
  expect(initial.renderRowDetails).toBeTypeOf("function");
  expect(initial.renderRowActions).toBeTypeOf("function");
  expect(initial.rowNumbers).toBe(true);
  expect(initial.densityToggle).toBe(true);
  const toggle = () => tree!.root.findAll((node) => node.type === "button" &&
    node.props["aria-label"] === "Переключить объём данных")[0];
  act(() => toggle().props.onClick());
  const large = tablePreview.mock.calls.at(-1)![0];
  expect(large.rows).toHaveLength(10_000);
  expect(large.virtualize).toBe(true);
  expect(large.pageSize).toBeUndefined();
  expect(new Set(large.rows.map((row: { id: string }) => row.id)).size).toBe(10_000);
  act(() => toggle().props.onClick());
  expect(tablePreview.mock.calls.at(-1)![0].rows).toBe(initial.rows);
});
vi.mock("../../../apps/playground/src/catalog/componentRegistry", async (original) => ({
  ...await original<typeof import("../../../apps/playground/src/catalog/componentRegistry")>(),
  getExample: () => undefined,
}));
vi.mock("../../../apps/playground/src/catalog/HeroBackdrop", () => ({ HeroBackdrop: () => null }));
vi.mock("../../../apps/playground/src/catalog/CatalogSidebar", () => ({ CatalogSidebar: () => null }));
vi.mock("@ad-voice/ui/core", () => ({ useSmoothWheel: () => {} }));

let tree: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it("uses the kit's animated border on every overview tile and panel", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const nodes: object[] = [];
  act(() => {
    tree = create(<CatalogOverview />, { createNodeMock: ({ props }) => {
      if (props.className !== "docs-showcase-tile") return null;
      const node = {};
      nodes.push(node);
      return node;
    } });
  });
  expect(nodes).toHaveLength(catalog.length);
  expect(new Set(border.mock.calls.map(([ref]) => ref.current))).toEqual(new Set(nodes));
  const panels = tree!.root.findAll((node) => typeof node.type === "string" &&
    /(?:^|\s)(?:docs-overview-hero|docs-install)(?:\s|$)/.test(node.props.className ?? ""));
  expect(panels).toHaveLength(2);
  expect(panels.every((node) => node.props["data-test-border"] === true)).toBe(true);
});

it("animates the Example and Related section borders on component pages", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  act(() => { tree = create(<ComponentDocsPage item={catalog[0]} />); });
  for (const id of ["example", "related"])
    expect(tree!.root.findAll((node) => typeof node.type === "string" && node.props.id === id)[0].props["data-test-border"]).toBe(true);
});

it.each([".docs-showcase-tile", ".docs-component-hero.ad-card"])("lets %s's border aura fade before clipping", (selector) => {
  const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");
  const declarations = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
    .filter(([, selectors]) => selectors.split(",").some((value) => value.trim().endsWith(selector)))
    .map(([, , body]) => body).join("\n");
  const margin = [...declarations.matchAll(/overflow-clip-margin:\s*([\d.]+)(px|rem);/g)].at(-1);
  const engine = readFileSync("src/core/motion-engine.js", "utf8");
  const widest = Math.max(...JSON.parse(engine.match(/const AURA = (\[.*?\]);/)![1]!).map(([width]: number[]) => width));
  expect(declarations).toMatch(/overflow:\s*clip;/);
  expect(margin).toBeDefined();
  // The contour is inset 0.65px; the widest halo stroke reaches half its width beyond it.
  expect(Number(margin![1]) * (margin![2] === "rem" ? 16 : 1)).toBeGreaterThanOrEqual(widest / 2 - 0.65);
  expect(declarations).not.toMatch(/content-visibility:|contain-intrinsic-size:/);
});

it("keeps the sticky documentation toolbar opaque instead of blurring animated content underneath", () => {
  const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");
  const toolbar = css.match(/\.site-top\.ad-toolbar\s*\{([^}]+)\}/)?.[1];
  expect(toolbar).toBeDefined();
  expect(toolbar).not.toMatch(/backdrop-filter\s*:/);
});

it("resets both the desktop content and mobile document scroll on navigation", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const contentScroll = vi.fn(), documentScroll = vi.fn();
  vi.stubGlobal("window", { scrollTo: documentScroll });
  vi.stubGlobal("document", { documentElement: { dataset: {} }, title: "" });
  act(() => {
    tree = create(<CatalogPage routeId="avatar" />, {
      createNodeMock: ({ type }) => type === "main" ? { scrollTo: contentScroll } : null,
    });
  });
  expect(contentScroll).toHaveBeenCalledWith({ top: 0 });
  expect(documentScroll).toHaveBeenCalledWith({ top: 0 });
  vi.clearAllMocks();
  act(() => tree!.update(<CatalogPage routeId="brand-mark" />));
  expect(contentScroll).toHaveBeenCalledOnce();
  expect(documentScroll).toHaveBeenCalledOnce();
});
