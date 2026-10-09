import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { readFileSync } from "node:fs";
import { DataTable } from "../src/components/feedback/DataTable/DataTable";
import { Popover } from "../src/components/feedback/Popover/Popover";
import { Select } from "../src/components/controls/Select/Select";
import { Autocomplete } from "../src/components/controls/Autocomplete/Autocomplete";
import { OptionList } from "../src/components/controls/internal";
import { PeoplePicker, type PickerPerson } from "../src/components/controls/PeoplePicker/PeoplePicker";

let tree: ReactTestRenderer | undefined;

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("popover positioning", () => {
  it("coalesces nested scroll events into one layout measurement per frame", () => {
    const box = { left: 20, right: 120, top: 20, bottom: 40, width: 100, height: 20 };
    const anchor = { getBoundingClientRect: vi.fn(() => box) } as unknown as HTMLElement;
    const node = {
      getBoundingClientRect: vi.fn(() => box),
      style: { setProperty: vi.fn(), removeProperty: vi.fn(), left: "", top: "" },
      dataset: {},
      querySelector: vi.fn(() => null),
    };
    let onScroll: (() => void) | undefined;
    const frames = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("innerWidth", 1280);
    vi.stubGlobal("innerHeight", 720);
    vi.stubGlobal("getComputedStyle", () => ({ fontSize: "16px" }));
    vi.stubGlobal("document", { documentElement: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal("window", {
      addEventListener: vi.fn((type: string, listener: () => void) => { if (type === "scroll") onScroll = listener; }),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frames.set(1, callback); return 1; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));
    act(() => { tree = create(<Popover open anchorRef={{ current: anchor }} autoFocus={false}>Menu</Popover>, {
      createNodeMock: (element) => element.props.popover ? node : null,
    }); });
    expect(node.getBoundingClientRect).toHaveBeenCalledTimes(1);
    act(() => { onScroll?.(); onScroll?.(); onScroll?.(); });
    expect(node.getBoundingClientRect).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);
    act(() => { frames.get(1)?.(16); frames.clear(); });
    expect(node.getBoundingClientRect).toHaveBeenCalledTimes(2);
    act(() => onScroll?.());
    act(() => tree!.unmount()); tree = undefined;
    expect(frames.size).toBe(0);
  });
});

describe("data controls keep unrelated interactions cheap", () => {
  it("does not re-key, re-sort or rescan filters on selection, resize and pagination", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), score: 1000 - index }));
    const value = vi.fn((row: typeof rows[number]) => row.score);
    const rowKey = vi.fn((row: typeof rows[number]) => row.id);
    const columns = [{ key: "score", title: "Score", value }];
    act(() => { tree = create(<DataTable columns={columns} rows={rows} rowKey={rowKey}
      selectable filterable pageSize={10} defaultSort={{ key: "score", direction: "asc" }} />); });
    expect(value).toHaveBeenCalled();
    expect(rowKey).toHaveBeenCalledTimes(rows.length);
    value.mockClear();
    rowKey.mockClear();

    const dataRow = tree!.root.findAllByType("tr").find((row) => row.findAllByType("td").length > 0)!;
    act(() => dataRow.findByType("input").props.onChange({ currentTarget: { checked: true } }));
    const separator = tree!.root.findByProps({ role: "separator" });
    act(() => separator.props.onKeyDown({ key: "ArrowRight", preventDefault() {}, currentTarget: {
      closest: () => ({ getBoundingClientRect: () => ({ width: 160 }) }),
    } }));
    const next = tree!.root.findAllByType("button").find((node) => node.props["aria-label"] === "Следующая страница")!;
    act(() => next.props.onClick());

    expect({ keys: rowKey.mock.calls.length, values: value.mock.calls.length }).toEqual({ keys: 0, values: 0 });
    expect(tree!.root.findAllByType("td").some((cell) => cell.children.includes("11"))).toBe(true);
  });

  it("invalidates cached sort and filter options when data or columns change", () => {
    const value = vi.fn((row: { id: string; name: string }) => row.name);
    const columns = [{ key: "name", title: "Name", value, filter: "values" as const }];
    act(() => { tree = create(<DataTable columns={columns} rows={[{ id: "1", name: "A" }]}
      defaultSort={{ key: "name", direction: "asc" }} />); });
    value.mockClear();
    act(() => tree!.update(<DataTable columns={columns} rows={[{ id: "2", name: "B" }, { id: "3", name: "C" }]}
      defaultSort={{ key: "name", direction: "asc" }} />));
    expect(value).toHaveBeenCalled();
    const filter = tree!.root.findAllByType("button").find((node) => node.props["aria-label"] === "Фильтр: Name")!;
    act(() => filter.props.onClick());
    expect(tree!.root.findByType(Autocomplete).props.options).toEqual(["B", "C"]);
    const nextValue = vi.fn((row: { id: string; name: string }) => row.name.toLowerCase());
    act(() => tree!.update(<DataTable columns={[{ ...columns[0], value: nextValue }]}
      rows={[{ id: "2", name: "B" }]} defaultSort={{ key: "name", direction: "asc" }} />));
    expect(nextValue).toHaveBeenCalled();
    expect(tree!.root.findByType(Autocomplete).props.options).toEqual(["b"]);
  });

  it("keeps sort cycling, search and group collapse coherent after caching the data pipeline", () => {
    const columns = [{ key: "name", title: "Name" }, { key: "group", title: "Group" }];
    const rows = [{ id: "b", name: "Bob", group: "Team" }, { id: "a", name: "Anna", group: "Team" }];
    act(() => { tree = create(<DataTable columns={columns} rows={rows} searchable groupBy="group" />); });
    const names = () => tree!.root.findAllByType("td").filter((cell) => cell.props["data-primary"])
      .map((cell) => cell.children.join(""));
    const sort = () => tree!.root.findAllByType("button").find((button) => button.props.className === "ad-data-table-sort" && button.children.includes("Name"))!;
    const header = () => tree!.root.findAllByType("th")[0];
    act(() => sort().props.onClick());
    expect(names()).toEqual(["Anna", "Bob"]);
    expect(header().props["aria-sort"]).toBe("ascending");
    act(() => sort().props.onClick());
    expect(names()).toEqual(["Bob", "Anna"]);
    expect(header().props["aria-sort"]).toBe("descending");
    act(() => sort().props.onClick());
    expect(header().props["aria-sort"]).toBeUndefined();
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "anna" } }));
    expect(names()).toEqual(["Anna"]);
    const group = tree!.root.findByProps({ className: "ad-data-table-group-toggle" });
    act(() => group.props.onClick());
    expect(names()).toEqual([]);
    act(() => tree!.root.findByProps({ className: "ad-data-table-group-toggle" }).props.onClick());
    expect(names()).toEqual(["Anna"]);
  });

  it("does not recompute all group aggregates when selecting a row", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), group: `Group ${index % 10}`, score: index }));
    const value = vi.fn((row: typeof rows[number]) => row.group);
    const aggregate = vi.fn((items: typeof rows) => items.reduce((sum, row) => sum + row.score, 0));
    const columns = [{ key: "group", title: "Group", value }, { key: "score", title: "Score", aggregate }];
    act(() => { tree = create(<DataTable columns={columns} rows={rows} selectable groupBy="group" pageSize={10} />); });
    value.mockClear();
    aggregate.mockClear();
    const dataRow = tree!.root.findAllByType("tr").find((row) => row.findAllByType("input").length && row.findAllByType("td").length)!;
    act(() => dataRow.findByType("input").props.onChange({ currentTarget: { checked: true } }));
    expect({ groups: value.mock.calls.length, aggregates: aggregate.mock.calls.length }).toEqual({ groups: 0, aggregates: 0 });
  });

  it("clears a large matching selection in linear work and preserves selections outside the result", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
    const onSelectionChange = vi.fn();
    act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name" }]} rows={rows} selectable pageSize={10}
      defaultSelected={[...rows.map((row) => row.id), "outside"]} onSelectionChange={onSelectionChange} />); });
    const checkbox = tree!.root.findAllByType("tr")[0].findByType("input");
    let comparisons = 0;
    act(() => {
      const some = Array.prototype.some;
      const scan = vi.spyOn(Array.prototype, "some").mockImplementation(function (predicate, thisArg) {
        return some.call(this, (value, index, array) => {
          comparisons++;
          return predicate.call(thisArg, value, index, array);
        });
      });
      try { checkbox.props.onChange({ currentTarget: { checked: false } }); }
      finally { scan.mockRestore(); }
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(["outside"]);
    expect(comparisons).toBeLessThanOrEqual(rows.length * 2);
  });

  it("does not rescan every selected row when an unrelated table prop changes", () => {
    const rows = Array.from({ length: 2000 }, (_, index) => ({ id: `row-${index}`, name: `Row ${index}` }));
    const columns = [{ key: "name", title: "Name" }];
    act(() => { tree = create(<DataTable columns={columns} rows={rows} selectable pageSize={10} caption="Before" />); });
    const has = vi.spyOn(Set.prototype, "has");
    try {
      act(() => tree!.update(<DataTable columns={columns} rows={rows} selectable pageSize={10} caption="After" />));
      const selectionChecks = has.mock.calls.filter(([key]) => typeof key === "string" && key.startsWith("row-")).length;
      expect(selectionChecks).toBeLessThan(50);
    } finally {
      has.mockRestore();
    }
  });

  it("does not scan the dataset for an empty selection", () => {
    const rows = Array.from({ length: 2000 }, (_, index) => ({ id: `row-${index}`, name: `Row ${index}` }));
    const has = vi.spyOn(Set.prototype, "has");
    try {
      act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name" }]} rows={rows} selectable pageSize={10} />); });
      const selectionChecks = has.mock.calls.filter(([key]) => typeof key === "string" && key.startsWith("row-")).length;
      expect(selectionChecks).toBeLessThan(50);
    } finally {
      has.mockRestore();
    }
  });

  it("stops selection checks once partial selection is known", () => {
    const rows = Array.from({ length: 2000 }, (_, index) => ({ id: `row-${index}`, name: `Row ${index}` }));
    const has = vi.spyOn(Set.prototype, "has");
    try {
      act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name" }]} rows={rows}
        selectable pageSize={10} defaultSelected={["row-0"]} />); });
      const selectionChecks = has.mock.calls.filter(([key]) => typeof key === "string" && key.startsWith("row-")).length;
      expect(selectionChecks).toBeLessThan(50);
    } finally {
      has.mockRestore();
    }
  });

  it("collects automatic text filter values once instead of sorting the same column twice", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), name: `Name ${index % 10}` }));
    const value = vi.fn((row: typeof rows[number]) => row.name);
    act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name", value }]} rows={rows} filterable pageSize={10} />); });
    expect(value.mock.calls.length).toBeLessThanOrEqual(rows.length + 1);
  });

  it("collects high-cardinality filter suggestions only when the editor opens", () => {
    const rows = Array.from({ length: 2000 }, (_, index) => ({ id: String(index), name: `Name ${index}` }));
    const value = vi.fn((row: typeof rows[number]) => row.name);
    act(() => { tree = create(<DataTable columns={[{ key: "name", title: "Name", value }]} rows={rows} filterable pageSize={10} />); });
    expect(value.mock.calls.length).toBeLessThan(50);
    const filter = tree!.root.findAllByType("button").find((node) => node.props["aria-label"] === "Фильтр: Name")!;
    act(() => filter.props.onClick());
    expect(tree!.root.findByType(Autocomplete).props.options).toHaveLength(100);
  });

  it("does not construct custom Select option content while its list is closed", () => {
    const options = Array.from({ length: 1000 }, (_, index) => ({ value: String(index), label: `Item ${index}` }));
    const renderOption = vi.fn((option: typeof options[number]) => option.label);
    act(() => { tree = create(<Select options={options} renderOption={renderOption} searchable />); });
    expect(renderOption.mock.calls.length).toBe(0);
    const button = tree!.root.findAllByType("button").find((node) => node.props["aria-haspopup"] === "listbox")!;
    act(() => button.props.onClick());
    expect(renderOption).toHaveBeenCalledTimes(options.length);
    renderOption.mockClear();
    const search = tree!.root.findAllByType("input").find((node) => node.props.placeholder === "Поиск")!;
    act(() => search.props.onChange({ currentTarget: { value: "Item 999" } }));
    expect(renderOption).toHaveBeenCalledTimes(1);
  });

  it("reuses keys of unchanged Select options while searching a large list", () => {
    const options = Array.from({ length: 1000 }, (_, index) => ({ value: { id: index }, label: `Item ${index}` }));
    const getKey = vi.fn((value: { id: number }) => String(value.id));
    act(() => { tree = create(<Select options={options} getKey={getKey} searchable />); });
    const button = tree!.root.findAllByType("button").find((node) => node.props["aria-haspopup"] === "listbox")!;
    act(() => button.props.onClick());
    getKey.mockClear();
    const search = tree!.root.findAllByType("input").find((node) => node.props.placeholder === "Поиск")!;
    act(() => search.props.onChange({ currentTarget: { value: "Item" } }));
    expect(getKey.mock.calls.length).toBeLessThanOrEqual(2);
    expect(tree!.root.findAllByProps({ role: "option" })).toHaveLength(options.length);
  });

  it("does not scan every Autocomplete label again when only the active option changes", () => {
    const label = vi.fn((index: number) => `Item ${index}`);
    const options = Array.from({ length: 1000 }, (_, index) => ({
      value: String(index), get label() { return label(index); },
    }));
    act(() => { tree = create(<Autocomplete options={options} defaultValue="Item" />); });
    label.mockClear();
    const input = tree!.root.findByType("input");
    act(() => input.props.onKeyDown({ key: "ArrowDown", preventDefault() {} }));
    // Opening draws each option once; filtering must not scan the same 1,000 labels again.
    expect(label.mock.calls.length).toBeLessThanOrEqual(options.length);
  });

  it("reuses normalized Autocomplete options while the query changes", () => {
    const options = Array.from({ length: 1000 }, (_, index) => `Item ${index}`);
    act(() => { tree = create(<Autocomplete options={options} defaultValue="Item" />); });
    act(() => tree!.root.findByType("input").props.onFocus());
    const first = tree!.root.findByType(OptionList).props.options[999];
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Item " } }));
    const second = tree!.root.findByType(OptionList).props.options[999];
    expect(second).toBe(first);
    expect(tree!.root.findAllByProps({ role: "option" })).toHaveLength(options.length);
  });
});

describe("remote people search stays responsive", () => {
  it("stops loading when a pending query is cleared and ignores its late answer", async () => {
    vi.useFakeTimers();
    let resolve!: (people: PickerPerson[]) => void;
    const onSearch = vi.fn(() => new Promise<PickerPerson[]>((done) => { resolve = done; }));
    act(() => { tree = create(<PeoplePicker onSearch={onSearch} />); });
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Anna" } }));
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    expect(tree!.root.findAllByProps({ className: "ad-spinner" })).toHaveLength(1);
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "" } }));
    expect(tree!.root.findAllByProps({ className: "ad-spinner" })).toHaveLength(0);
    await act(async () => resolve([{ id: "old", name: "Old answer" }]));
    expect(tree!.root.findAllByProps({ role: "option" })).toHaveLength(0);
  });

  it("does not restart an unchanged query merely because the search callback was recreated", async () => {
    vi.useFakeTimers();
    let resolve!: (people: PickerPerson[]) => void;
    const first = vi.fn(() => new Promise<PickerPerson[]>((done) => { resolve = done; }));
    const latest = vi.fn(() => []);
    act(() => { tree = create(<PeoplePicker onSearch={first} />); });
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Anna" } }));
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    act(() => tree!.update(<PeoplePicker onSearch={latest} />));
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    expect(latest.mock.calls.length).toBe(0);
    await act(async () => resolve([{ id: "anna", name: "Anna" }]));
    expect(tree!.root.findAllByProps({ role: "option" })).toHaveLength(1);
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Bob" } }));
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    expect(latest.mock.calls.length).toBe(1);
  });

  it("cancels superseded searches and never shows their stale results", async () => {
    vi.useFakeTimers();
    const requests: Array<{ signal?: AbortSignal; resolve: (people: PickerPerson[]) => void }> = [];
    const onSearch = (_query: string, signal?: AbortSignal) => new Promise<PickerPerson[]>((resolve) => requests.push({ signal, resolve }));
    act(() => { tree = create(<PeoplePicker onSearch={onSearch} />); });
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Anna" } }));
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    expect(requests[0].signal).toBeDefined();
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "Bob" } }));
    expect(requests[0].signal?.aborted).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    await act(async () => requests[1].resolve([{ id: "bob", name: "Bob" }]));
    await act(async () => requests[0].resolve([{ id: "anna", name: "Anna" }]));
    const options = tree!.root.findAllByProps({ role: "option" });
    expect(options).toHaveLength(1);
    expect(options[0].findByProps({ className: "ad-option-label" }).children).toEqual(["Bob"]);
    act(() => tree!.unmount());
    tree = undefined;
    expect(requests[1].signal?.aborted).toBe(true);
  });
});

describe("DataTable scalable and controlled views", () => {
  const columns = [{ key: "team", title: "Team" }, { key: "score", title: "Score" }];
  const rows = [{ id: "b", team: "A", score: 2 }, { id: "c", team: "B", score: 1 }, { id: "a", team: "A", score: 1 }];
  const primary = () => tree!.root.findAllByType("tr").filter((row) => row.props["data-row-key"])
    .map((row) => row.props["data-row-key"]);
  const sortButton = (title: string) => tree!.root.findAllByType("button").find((button) => button.props.className === "ad-data-table-sort" && button.children.includes(title))!;

  it("keeps 10,000 virtual rows bounded, coalesces scroll and cancels pending work on unmount", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frame = 0;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frames.set(++frame, callback); return frame; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));
    const scroll = { scrollTop: 0, clientHeight: 240, scrollHeight: 480000 };
    const many = Array.from({ length: 10000 }, (_, index) => ({ id: String(index), team: `Row ${index}`, score: index }));
    act(() => { tree = create(<DataTable {...{ columns, rows: many, virtualize: true, maxHeight: 240, estimatedRowHeight: 48, overscan: 2 }} />, {
      createNodeMock: (element) => element.props.className === "ad-data-table-scroll" ? scroll : null,
    }); });
    expect(primary().length).toBeGreaterThan(0);
    expect(primary().length).toBeLessThan(20);
    const viewport = tree!.root.findByProps({ className: "ad-data-table-scroll" });
    act(() => {
      scroll.scrollTop = 4800;
      viewport.props.onScroll({ currentTarget: scroll });
      scroll.scrollTop = 9600;
      viewport.props.onScroll({ currentTarget: scroll });
    });
    expect(frames.size).toBe(1);
    act(() => { const callback = frames.values().next().value!; frames.clear(); callback(16); });
    expect(Number(primary()[0])).toBeGreaterThan(190);
    expect(primary().length).toBeLessThan(20);
    act(() => viewport.props.onScroll({ currentTarget: scroll }));
    act(() => tree!.unmount()); tree = undefined;
    expect(frames.size).toBe(0);
  });

  it("uses server rows unchanged and emits controlled query, multi-sort and pagination without fetching", () => {
    const onQueryChange = vi.fn();
    const onPaginationChange = vi.fn();
    const onSortingChange = vi.fn();
    act(() => { tree = create(<DataTable {...{ columns, rows, searchable: true, query: "missing", onQueryChange,
      sorting: [{ key: "score", direction: "desc" }], onSortingChange,
      pagination: { pageIndex: 3, pageSize: 10 }, onPaginationChange,
      manualFiltering: true, manualSorting: true, manualPagination: true, rowCount: 100 }} />); });
    expect(primary()).toEqual(["b", "c", "a"]);
    expect(tree!.root.findAllByType("span").some((node) => node.children.includes("31–33 из 100"))).toBe(true);
    act(() => tree!.root.findByType("input").props.onChange({ currentTarget: { value: "A" } }));
    expect(onQueryChange).toHaveBeenLastCalledWith("A");
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 10 });
    expect(primary()).toEqual(["b", "c", "a"]);
    const next = tree!.root.findAllByType("button").find((node) => node.props["aria-label"] === "Следующая страница")!;
    act(() => next.props.onClick());
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 4, pageSize: 10 });
    act(() => sortButton("Team").props.onClick({ shiftKey: true }));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ key: "score", direction: "desc" }, { key: "team", direction: "asc" }]);
  });

  it("sorts by priority, Shift appends/cycles one key and normal clicks replace the sorting", () => {
    const onSortingChange = vi.fn();
    act(() => { tree = create(<DataTable {...{ columns, rows, defaultSorting: [{ key: "team", direction: "asc" }, { key: "score", direction: "asc" }], onSortingChange }} />); });
    expect(primary()).toEqual(["a", "b", "c"]);
    act(() => sortButton("Score").props.onClick({ shiftKey: true }));
    expect(primary()).toEqual(["b", "a", "c"]);
    expect(onSortingChange).toHaveBeenLastCalledWith([{ key: "team", direction: "asc" }, { key: "score", direction: "desc" }]);
    act(() => sortButton("Score").props.onClick({ shiftKey: true }));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ key: "team", direction: "asc" }]);
    act(() => sortButton("Score").props.onClick());
    expect(onSortingChange).toHaveBeenLastCalledWith([{ key: "score", direction: "asc" }]);
    expect(primary()).toEqual(["c", "a", "b"]);
  });

  it("normalizes duplicate/stale column order and pin ids and keeps sticky offsets aligned after resize", () => {
    act(() => { tree = create(<DataTable {...{ columns: [...columns, { key: "id", title: "ID" }], rows,
      columnOrder: ["score", "gone", "score", "team"], columnPinning: { left: ["team", "score", "team", "gone"], right: ["id", "score"] } }} />); });
    const headers = () => tree!.root.findAllByType("th");
    expect(headers().map((header) => header.props["data-column-key"])).toEqual(["team", "score", "id"]);
    expect(headers().map((header) => header.props["data-pinned"])).toEqual(["left", "left", "right"]);
    expect(headers()[1].props.style.left).toBe(160);
    const resize = headers()[0].findByProps({ role: "separator" });
    act(() => resize.props.onKeyDown({ key: "ArrowRight", preventDefault() {}, currentTarget: { closest: () => ({ getBoundingClientRect: () => ({ width: 160 }) }) } }));
    expect(headers()[1].props.style.left).toBe(176);
    expect(tree!.root.findAllByType("td").filter((cell) => cell.props["data-column-key"] === "score").every((cell) => cell.props.style.left === 176)).toBe(true);
  });

  it("offers accessible column reorder and pin actions and never hides the final current column after columns change", () => {
    const onColumnOrderChange = vi.fn();
    const onColumnPinningChange = vi.fn();
    act(() => { tree = create(<DataTable {...{ columns, rows, onColumnOrderChange, onColumnPinningChange }} />); });
    act(() => tree!.root.findAllByType("button").find((button) => button.props["aria-label"] === "Столбцы")!.props.onClick());
    act(() => tree!.root.findAllByType("button").find((button) => button.props["aria-label"] === "Переместить влево: Score")!.props.onClick());
    expect(onColumnOrderChange).toHaveBeenLastCalledWith(["score", "team"]);
    act(() => tree!.root.findAllByType("button").find((button) => button.props["aria-label"] === "Закрепить слева: Team")!.props.onClick());
    expect(onColumnPinningChange).toHaveBeenLastCalledWith({ left: ["team"], right: [] });
    const toggle = tree!.root.findAllByType("input").find((input) => input.props.type === "checkbox")!;
    act(() => toggle.props.onChange({ currentTarget: { checked: false } }));
    act(() => tree!.update(<DataTable columns={[columns[1]]} rows={rows} />));
    expect(tree!.root.findAllByType("th")).toHaveLength(1);
  });

  it("mounts details only when expanded, preserves identity across sorting and isolates actions from row clicks", () => {
    const details = vi.fn((row: typeof rows[number]) => <span>{`Details ${row.id}`}</span>);
    const actions = vi.fn((row: typeof rows[number]) => <button>{`Edit ${row.id}`}</button>);
    const onRowClick = vi.fn();
    act(() => { tree = create(<DataTable {...{ columns, rows, renderRowDetails: details, renderRowActions: actions, rowNumbers: true, onRowClick }} />); });
    expect(details).not.toHaveBeenCalled();
    expect(actions).toHaveBeenCalledTimes(rows.length);
    act(() => tree!.root.findAllByType("button").find((button) => button.props["aria-label"] === "Подробности строки 1")!.props.onClick({ stopPropagation() {} }));
    expect(details).toHaveBeenLastCalledWith(rows[0], 0);
    expect(tree!.root.findAllByType("tr").filter((row) => row.props.className === "ad-data-table-details")).toHaveLength(1);
    act(() => sortButton("Score").props.onClick());
    expect(tree!.root.findAllByProps({ className: "ad-data-table-details" })[0].props["data-details-key"]).toBe("b");
    const cell = tree!.root.findAllByType("td").find((cell) => cell.props.className === "ad-data-table-actions")!;
    const stopPropagation = vi.fn();
    act(() => cell.props.onClick({ stopPropagation }));
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY, 0.5])("ignores invalid legacy pageSize %s instead of losing all rows", (pageSize) => {
    act(() => { tree = create(<DataTable columns={columns} rows={rows} pageSize={pageSize} />); });
    expect(primary()).toEqual(["b", "c", "a"]);
  });

  it("renders a column value getter when no custom renderer is supplied", () => {
    act(() => { tree = create(<DataTable columns={[{ key: "computed", title: "Computed", value: (row) => `${row.team}:${row.score}` }]} rows={rows} />); });
    expect(tree!.root.findAllByType("td").map((cell) => cell.children.join(""))).toEqual(["A:2", "B:1", "A:1"]);
  });

  it("retains an unknown-total server page and selection while loading or replacing its rows", () => {
    const onPaginationChange = vi.fn();
    const props = { columns, manualPagination: true, pagination: { pageIndex: 5, pageSize: 10 }, onPaginationChange,
      selectable: true, selected: ["outside", "b"] };
    act(() => { tree = create(<DataTable {...{ ...props, rows, loading: true }} />); });
    expect(onPaginationChange).not.toHaveBeenCalled();
    act(() => tree!.update(<DataTable {...{ ...props, rows: [rows[1]] }} />));
    expect(primary()).toEqual(["c"]);
    expect(onPaginationChange).not.toHaveBeenCalled();
    expect(tree!.root.findAllByType("span").some((node) => node.children.includes("Выбрано: 2"))).toBe(true);
  });

  it("measures tall virtual rows without losing first measurements and anchors the visible row", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frame = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frame, callback); return frame; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const scroll = { scrollTop: 0, clientHeight: 240, clientWidth: 800, dataset: {} };
    const header = { dataset: {}, getBoundingClientRect: () => ({ height: 44 }) };
    let notify!: (entries: any[]) => void;
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: (entries: any[]) => void) { notify = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const many = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), team: `Row ${index}`, score: index }));
    act(() => { tree = create(<DataTable {...{ columns, rows: many, virtualize: true, maxHeight: 240, estimatedRowHeight: 48, overscan: 2 }} />, {
      createNodeMock: (element) => ({ "ad-data-table-scroll": scroll, "tbody": { querySelectorAll: () => [] }, "thead": header })[element.props.className ?? element.type as string] ?? null,
    }); });
    const flush = () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(16); };
    const box = (key: string, height: number) => ({ target: { dataset: { virtualKey: key } }, borderBoxSize: [{ blockSize: height }] });
    act(() => { notify([box("r:0", 96)]); flush(); });
    const spacer = () => tree!.root.findAllByProps({ className: "ad-data-table-spacer" }).map((row) => row.findByType("td").props.style.height);
    expect(spacer().at(-1)! + primary().length * 48 + 48).toBe(1000 * 48 + 48);
    const viewport = tree!.root.findByProps({ className: "ad-data-table-scroll" });
    act(() => { scroll.scrollTop = 4800; viewport.props.onScroll(); flush(); });
    const before = primary();
    const measuredKey = `r:${before[0]}`;
    act(() => { notify([box(measuredKey, 96)]); flush(); });
    expect(scroll.scrollTop).toBe(4848);
    expect(primary()[0]).toBe(before[0]);
    const anchor = primary()[0];
    act(() => { scroll.clientWidth = 600; notify([{ target: scroll, borderBoxSize: [{ blockSize: 240 }] }]); flush(); });
    expect(scroll.scrollTop).toBe(4752);
    expect(primary()[0]).toBe(anchor);
    act(() => tree!.unmount()); tree = undefined;
    expect(disconnect).toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("virtualizes group headers and expanded details, then clamps a distant scroll after collapse", () => {
    const scroll = { scrollTop: 0, clientHeight: 240, clientWidth: 600 };
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callbacks.push(callback); return callbacks.length; });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const many = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), team: "A", score: index }));
    const details = vi.fn((row: typeof rows[number]) => row.id);
    act(() => { tree = create(<DataTable {...{ columns, rows: many, virtualize: true, maxHeight: 240, groupBy: "team", renderRowDetails: details, defaultExpandedRows: ["0", "999"], estimatedRowHeight: 48 }} />, {
      createNodeMock: (element) => element.props.className === "ad-data-table-scroll" ? scroll : null,
    }); });
    expect(details.mock.calls.map(([row]) => row.id)).toEqual(["0"]);
    expect(primary().length).toBeLessThan(20);
    act(() => { scroll.scrollTop = 47000; tree!.root.findByProps({ className: "ad-data-table-scroll" }).props.onScroll(); callbacks.splice(0).forEach((callback) => callback(16)); });
    act(() => tree!.update(<DataTable {...{ columns, rows: [], virtualize: true, maxHeight: 240, groupBy: "team", renderRowDetails: details, estimatedRowHeight: 48 }} />));
    expect(primary()).toEqual([]);
    expect(scroll.scrollTop).toBe(0);
    expect(tree!.root.findAllByProps({ className: "ad-data-table-empty" })).toHaveLength(1);
  });

  it("supports Shift multi-sort by default but respects a legacy controlled single sort", () => {
    act(() => { tree = create(<DataTable columns={columns} rows={rows} />); });
    act(() => sortButton("Team").props.onClick());
    act(() => sortButton("Score").props.onClick({ shiftKey: true }));
    expect(primary()).toEqual(["a", "b", "c"]);
    expect(tree!.root.findAllByProps({ className: "ad-data-table-sort-priority" })).toHaveLength(2);
    const onSortChange = vi.fn();
    act(() => tree!.update(<DataTable columns={columns} rows={rows} sort={{ key: "score", direction: "desc" }} onSortChange={onSortChange} />));
    act(() => sortButton("Team").props.onClick({ shiftKey: true }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "team", direction: "asc" });
    expect(primary()).toEqual(["b", "c", "a"]);
  });

  it("does not activate a clickable row from interactive custom cell content", () => {
    const onRowClick = vi.fn();
    act(() => { tree = create(<DataTable columns={[{ key: "team", title: "Team", render: () => <button>Edit</button> }]} rows={rows} onRowClick={onRowClick} />); });
    const row = tree!.root.findAllByType("tr").find((node) => node.props["data-row-key"] === "b")!;
    const button = { closest: () => ({ tagName: "BUTTON" }) };
    act(() => row.props.onClick({ target: button, currentTarget: {} }));
    expect(onRowClick).not.toHaveBeenCalled();
    act(() => row.props.onClick({ target: { closest: () => null }, currentTarget: {} }));
    expect(onRowClick).toHaveBeenCalledOnce();
  });

  it("keeps the controlled page-size choice and resets query without sending a zero server limit", () => {
    const onPaginationChange = vi.fn();
    act(() => { tree = create(<DataTable {...{ columns, rows, searchable: true, query: "A", manualPagination: true, rowCount: 50,
      pagination: { pageIndex: 2, pageSize: 6 }, pageSizeOptions: [12, 24], onPaginationChange }} />); });
    const size = tree!.root.findAllByType(Select).find((node) => node.props.label === "Строк на странице")!;
    expect(size.props.options.map((option: { value: number }) => option.value)).toEqual([6, 12, 24]);
    act(() => tree!.root.findAllByType("button").find((node) => node.props["aria-label"] === "Сбросить вид")!.props.onClick());
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 6 });
  });

  it("reserves a usable action slot and includes it in right pin offsets", () => {
    act(() => { tree = create(<DataTable {...{ columns, rows, renderRowActions: () => <button>Copy</button>, columnPinning: { right: ["score"] } }} />); });
    const actions = tree!.root.findAllByType("td").find((cell) => cell.props.className === "ad-data-table-actions")!;
    expect(actions.props.style.width).toBe(96);
    expect(tree!.root.findAllByType("th").find((cell) => cell.props["data-column-key"] === "score")!.props.style.right).toBe(96);
  });

  it("collapses a real virtual group and unmounts its expanded detail panel", () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), team: index < 500 ? "A" : "B", score: index }));
    const details = vi.fn((row: typeof rows[number]) => row.id);
    act(() => { tree = create(<DataTable {...{ columns, rows: many, virtualize: true, maxHeight: 240, groupBy: "team", renderRowDetails: details, defaultExpandedRows: ["0", "500"] }} />); });
    expect(primary()).toContain("0");
    expect(tree!.root.findAllByProps({ className: "ad-data-table-details" })).toHaveLength(1);
    act(() => tree!.root.findAllByProps({ className: "ad-data-table-group-toggle" })[0].props.onClick());
    expect(primary()).not.toContain("0");
    expect(primary()).toContain("500");
    expect(tree!.root.findAllByProps({ className: "ad-data-table-details" })[0].props["data-details-key"]).toBe("500");
    expect(tree!.root.findAllByProps({ className: "ad-data-table-empty" })).toHaveLength(0);
  });

  it("does not fabricate a server page total or an empty-page range", () => {
    act(() => { tree = create(<DataTable {...{ columns, rows, manualPagination: true, pagination: { pageIndex: 2, pageSize: 3 } }} />); });
    expect(tree!.root.findByType("table").props["aria-rowcount"]).toBe(-1);
    expect(tree!.root.findByProps({ className: "ad-data-table-pages" }).children.some((node) => typeof node !== "string" && node.type === "span" && node.children.includes("…"))).toBe(true);
    act(() => tree!.update(<DataTable {...{ columns, rows: [], manualPagination: true, rowCount: 100, pagination: { pageIndex: 2, pageSize: 3 } }} />));
    expect(tree!.root.findAllByType("span").some((node) => node.children.includes("0–0 из 100"))).toBe(true);
  });

  it("reuses numeric collation instead of constructing locale comparison options per row pair", () => {
    const compare = vi.spyOn(String.prototype, "localeCompare");
    try {
      const natural = [{ id: "10", team: "Row 10", score: 10 }, { id: "2", team: "Row 2", score: 2 }];
      act(() => { tree = create(<DataTable columns={columns} rows={natural} filterable groupBy="team" defaultSort={{ key: "team", direction: "asc" }} />); });
      expect(primary()).toEqual(["2", "10"]);
      expect(compare).not.toHaveBeenCalled();
    } finally { compare.mockRestore(); }
  });

  it("keeps hovered pinned and utility cells opaque so scrolling content cannot bleed through", () => {
    const css = readFileSync(new URL("../src/components/feedback/DataTable/styles.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.ad-data-table tbody tr:is\(:hover, \[data-selected\]\) td:is\([^}]+background:\s*linear-gradient\([^}]+var\(--ad-neutral-900\)/s);
    expect(css).toMatch(/\.ad-data-table-row-number\s*\{[^}]*overflow:\s*visible/s);
  });

  it("keeps a pinned mobile table scrollable and gives virtual group/detail rows consecutive indices", () => {
    const css = readFileSync(new URL("../src/components/feedback/DataTable/styles.css", import.meta.url), "utf8");
    expect(css).toContain(".ad-data-table:not([data-virtual]):not([data-pinned]) table");
    act(() => { tree = create(<DataTable {...{ columns, rows, virtualize: true, groupBy: "team", renderRowDetails: () => "Detail", defaultExpandedRows: ["b"], columnPinning: { left: ["team"] } }} />); });
    const entries = tree!.root.findAllByType("tr").filter((row) => row.props["data-virtual-key"]);
    expect(entries.map((row) => row.props["aria-rowindex"])).toEqual(entries.map((_, index) => index + 2));
    expect(tree!.root.findByType("table").props["aria-rowcount"]).toBe(7);
  });

  it("keeps equal NaN values stable in both sort directions", () => {
    const values = [{ id: "a", score: Number.NaN }, { id: "b", score: Number.NaN }, { id: "c", score: 1 }];
    const cols = [{ key: "score", title: "Score" }];
    act(() => { tree = create(<DataTable columns={cols} rows={values} defaultSort={{ key: "score", direction: "desc" }} />); });
    expect(primary().filter((key) => key !== "c")).toEqual(["a", "b"]);
    act(() => sortButton("Score").props.onClick());
    expect(primary().filter((key) => key !== "c")).toEqual(["a", "b"]);
  });
});
