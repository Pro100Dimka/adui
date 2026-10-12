import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { CollapsibleSection } from "../src/components/feedback/CollapsibleSection/CollapsibleSection";
import { SignalBars } from "../src/components/feedback/SignalBars/SignalBars";
import { DataTable, FilterEditor } from "../src/components/feedback/DataTable/DataTable";
import { Select } from "../src/components/controls/Select/Select";
import { Toast } from "../src/components/feedback/Toast/Toast";
import { Steps } from "../src/components/feedback/Steps/Steps";
import DataTableExample from "../src/components/feedback/DataTable/example";

let tree: ReactTestRenderer;
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => { act(() => tree?.unmount()); vi.unstubAllGlobals(); vi.useRealTimers(); });
const mount = (element: React.ReactElement) => act(() => { tree = create(element); });

describe("secondary feedback contract audit", () => {
  it("keeps visible DataTable example action text in explicit accessible names", () => {
    mount(<DataTableExample />);
    const actions = tree.root.findAll((node) => node.type === "button" && node.props["aria-label"] && node.findAllByProps({ className: "ad-button-label" }).length);
    for (const action of actions) {
      const label = action.findByProps({ className: "ad-button-label" }).children.join("");
      expect(action.props["aria-label"]).toContain(label);
    }
  });

  it("restores a controlled details element when the parent refuses a toggle", () => {
    const onOpenChange = vi.fn();
    mount(<CollapsibleSection open={false} onOpenChange={onOpenChange}>Content</CollapsibleSection>);
    const currentTarget = { open: true };
    act(() => tree.root.findByType("details").props.onToggle({ currentTarget }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(currentTarget.open).toBe(false);
  });

  it.each([Infinity, NaN, -1])("keeps SignalBars finite for bars=%s", (bars) => {
    expect(() => mount(<SignalBars bars={bars} />)).not.toThrow();
    expect(tree.root.findAllByType("i").length).toBeGreaterThan(0);
  });

  it("announces the same clamped signal strength that it paints", () => {
    mount(<SignalBars bars={4} level={99} />);
    expect(tree.root.findByType("span").props["aria-label"]).toContain("4 из 4");
  });

  it("emits one pagination change when selecting a controlled page size", () => {
    const onPaginationChange = vi.fn();
    mount(<DataTable columns={["Name"]} rows={[["One"], ["Two"]]} pagination={{ pageIndex: 1, pageSize: 1 }} onPaginationChange={onPaginationChange} />);
    act(() => tree.root.findByType(Select).props.onValueChange(10));
    expect(onPaginationChange).toHaveBeenCalledExactlyOnceWith({ pageIndex: 0, pageSize: 10 });
  });

  it("includes visible detail rows in the table's announced row count", () => {
    mount(<DataTable columns={[{ key: "name", title: "Name" }]} rows={[{ id: "one", name: "One" }]} defaultExpandedRows={["one"]} renderRowDetails={() => "Details"} />);
    expect(tree.root.findByType("table").props["aria-rowcount"]).toBe(3);
  });

  it("announces a column resize separator's explicit initial width", () => {
    mount(<DataTable columns={[{ key: "name", title: "Name", width: "240px" }]} rows={[]} />);
    expect(tree.root.findByProps({ role: "separator" }).props["aria-valuenow"]).toBe(240);
  });

  it("fills a changing pinned container and disconnects its width observer", () => {
    let measure = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { measure = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const scroll = { clientWidth: 900 };
    act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name" }, { key: "team", title: "Team" }]}
      rows={[{ name: "One", team: "Two" }]} columnPinning={{ left: ["name", "team"] }} />, {
      createNodeMock: (node) => node.props.className === "ad-data-table-scroll" ? scroll : null,
    }); });
    const headers = () => tree.root.findAllByType("th");
    expect(tree.root.findByType("table").props.style.width).toBe(900);
    expect(headers()[1].props.style.left).toBe("var(--ad-table-pin-left, 450px)");
    act(() => { scroll.clientWidth = 600; measure(); });
    expect(tree.root.findByType("table").props.style.width).toBe(600);
    expect(headers()[1].props.style.left).toBe("var(--ad-table-pin-left, 300px)");
    act(() => tree.unmount());
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it.each(["constructor", "toString", "__proto__"])("keeps the public column key %s finite and renders only own row data", (key) => {
    mount(<DataTable columns={[{ key, title: "Reserved name" }]}
      rows={[{ [key]: "Own value" }, {}]} columnPinning={{ left: [key] }} />);
    expect(tree.root.findByType("table").props.style.width).toBe(160);
    expect(tree.root.findByProps({ role: "separator" }).props["aria-valuenow"]).toBe(160);
    expect(tree.root.findAllByType("td").map((cell) => cell.children)).toEqual([["Own value"], []]);
  });

  it("offers reset when only row density or details changed and restores both", () => {
    mount(<DataTable columns={["Name"]} rows={[["One"]]} densityToggle renderRowDetails={() => "Details"} />);
    const button = (label: string) => tree.root.findAllByType("button").find((node) => node.props["aria-label"] === label);
    act(() => button("Компактные строки")!.props.onClick());
    expect(button("Сбросить вид")).toBeDefined();
    act(() => button("Подробности строки 1")!.props.onClick());
    act(() => button("Сбросить вид")!.props.onClick());
    expect(tree.root.findByProps({ "data-ad-component": "DataTable" }).props["data-dense"]).toBeUndefined();
    expect(tree.root.findAllByProps({ className: "ad-data-table-details" })).toHaveLength(0);
  });

  it("stores a __proto__ column filter as an own field without changing the object prototype", () => {
    const onFiltersChange = vi.fn();
    mount(<DataTable columns={[{ key: "__proto__", title: "Key", filter: "text" }]} rows={[{ ["__proto__"]: "Own" }]} onFiltersChange={onFiltersChange} />);
    act(() => tree.root.findAllByType("button").find((node) => node.props["aria-label"] === "Фильтр: Key")!.props.onClick());
    act(() => tree.root.findByType(FilterEditor).props.onChange({ kind: "text", text: "Own" }));
    const filters = onFiltersChange.mock.calls[0][0];
    expect(Object.hasOwn(filters, "__proto__")).toBe(true);
    expect(Object.getPrototypeOf(filters)).toBe(Object.prototype);
  });

  it("Toast uses the newest close callback and cleans up its timer on unmount", () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
    const oldClose = vi.fn(), close = vi.fn();
    mount(<Toast duration={100} onClose={oldClose} />);
    act(() => tree.update(<Toast duration={100} onClose={close} />));
    act(() => vi.advanceTimersByTime(100));
    expect(oldClose).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledOnce();
    act(() => tree.update(<Toast duration={200} onClose={close} />));
    act(() => tree.unmount());
    act(() => vi.advanceTimersByTime(200));
    expect(close).toHaveBeenCalledOnce();
  });

  it("Steps marks one current step, permits completion, and handles an empty list", () => {
    mount(<Steps steps={["First", "Second"]} current={1} />);
    expect(tree.root.findAllByProps({ "aria-current": "step" })).toHaveLength(1);
    act(() => tree.update(<Steps steps={["First", "Second"]} current={2} />));
    expect(tree.root.findAllByProps({ "data-state": "done" })).toHaveLength(2);
    act(() => tree.update(<Steps steps={[]} />));
    expect(tree.root.findAllByType("li")).toHaveLength(0);
  });
});
