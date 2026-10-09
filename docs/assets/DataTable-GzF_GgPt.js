const e=`import { tr, useTr } from "../../../core/i18n";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { mark, useControllable } from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";
import { Checkbox } from "../../controls/Checkbox/Checkbox";
import { IconButton } from "../../controls/IconButton/IconButton";
import { NumberField } from "../../controls/NumberField/NumberField";
import { Select } from "../../controls/Select/Select";
import { TextField } from "../../controls/TextField/TextField";
import { Icon } from "../../layout/Icon/Icon";
import { Popover } from "../Popover/Popover";
import type {
  DataTableColumn,
  DataTableFilter,
  DataTableProps,
  DataTableRow,
  DataTableSort,
  DataTablePagination,
  DataTableColumnPinning,
} from "../shared";

type Filters = Record<string, DataTableFilter>;
const sortStates = {
  asc: { next: "desc", aria: "ascending" },
  desc: { next: null, aria: "descending" },
} as const;
const compareText = new Intl.Collator(undefined, { numeric: true }).compare;

/** Distinct values of a column, sorted, as text. */
const distinct = <T extends DataTableRow>(column: DataTableColumn<T>, rows: T[]) =>
  [...new Set(rows.map((row) => String(cellValue(column, row))))].sort(compareText);

/** Infer low-cardinality choices eagerly; defer large suggestion lists until the filter opens. */
const filterDefinition = <T extends DataTableRow>(column: DataTableColumn<T>, rows: T[], filterable: boolean) => {
  if (column.filter === false || (column.filter === undefined && !filterable)) return { kind: false as const, options: [] };
  if (column.filter) return { kind: column.filter, options: [] };
  if (rows.length && rows.every((row) => typeof cellValue(column, row) === "number"))
    return { kind: "range" as const, options: [] };
  const values = new Set<string>();
  for (const row of rows) {
    values.add(String(cellValue(column, row)));
    if (values.size > 12) return { kind: "text" as const, options: [] };
  }
  return { kind: "values" as const, options: [...values].sort(compareText) };
};

const passes = (filter: DataTableFilter, value: string | number) => {
  if (filter.kind === "text") return String(value).toLowerCase().includes(filter.text.toLowerCase());
  if (filter.kind === "values") return filter.values.includes(String(value));
  const number = typeof value === "number" ? value : Number(value);
  return (filter.min === undefined || number >= filter.min) && (filter.max === undefined || number <= filter.max);
};

const isActive = (filter?: DataTableFilter) => {
  if (!filter) return false;
  if (filter.kind === "text") return !!filter.text;
  if (filter.kind === "values") return true;
  return filter.min !== undefined || filter.max !== undefined;
};

/** Short description of an active filter for its chip. */
const describe = (filter: DataTableFilter, translate = tr) => {
  if (filter.kind === "text") return \`«\${filter.text}»\`;
  if (filter.kind === "values") return filter.values.length <= 2
    ? filter.values.join(", ")
    : translate("{count} знач.", { count: filter.values.length });
  return \`\${filter.min ?? "…"} – \${filter.max ?? "…"}\`;
};

/** The filter editor in a column header's popover. */
export function FilterEditor({
  kind,
  options,
  filter,
  onChange,
}: {
  kind: "text" | "values" | "range";
  options: string[];
  filter?: DataTableFilter;
  onChange: (filter: DataTableFilter | undefined) => void;
}) {
  const tr = useTr();
  const [search, setSearch] = useState("");
  const text = filter?.kind === "text" ? filter.text : "";
  const chosen = filter?.kind === "values" ? filter.values : [];
  const query = (kind === "text" ? text : search).trim().toLocaleLowerCase();
  const excluded = new Set(kind === "values" ? chosen : []);
  const suggestions = kind === "range" ? [] : options.filter((value) =>
    (!query || value.toLocaleLowerCase().includes(query)) && !excluded.has(value),
  ).slice(0, 100);
  if (kind === "text")
    return (
      <Autocomplete
        size="sm"
        autoFocus
        placeholder={tr("Содержит…")}
        startAdornment={<Icon name="search" />}
        clearable
        options={suggestions}
        value={text}
        onValueChange={(text) => onChange(text ? { kind: "text", text } : undefined)}
      />
    );
  if (kind === "range") {
    const range = filter?.kind === "range" ? filter : { kind: "range" as const };
    const set = (part: "min" | "max", value: number | "") => {
      const next = { ...range, [part]: value === "" ? undefined : value };
      onChange(next.min === undefined && next.max === undefined ? undefined : next);
    };
    return (
      <div className="ad-data-table-range">
        <NumberField size="sm" label={tr("От")} controls={false} value={range.min ?? ""} onValueChange={(v) => set("min", v)} />
        <NumberField size="sm" label={tr("До")} controls={false} value={range.max ?? ""} onValueChange={(v) => set("max", v)} />
      </div>
    );
  }
  return (
    <div className="ad-data-table-values">
      <Autocomplete
        size="sm"
        autoFocus
        placeholder={tr("Найти значение…")}
        startAdornment={<Icon name="search" />}
        options={suggestions}
        value={search}
        onValueChange={setSearch}
        onOptionSelect={(value) => {
          onChange({ kind: "values", values: [...chosen, value] });
          setSearch("");
        }}
      />
      {chosen.length > 0 && <div className="ad-data-table-values-list">
        {chosen.map((value) => (
          <span key={value} className="ad-data-table-chip">
            {value || "—"}
            <button type="button" aria-label={tr("Убрать {value}", { value: value || "—" })}
              onClick={() => {
                const next = chosen.filter((item) => item !== value);
                onChange(next.length ? { kind: "values", values: next } : undefined);
              }}>
              <Icon name="close" />
            </button>
          </span>
        ))}
      </div>}
    </div>
  );
}

/** The funnel button of a column header and the popover behind it. */
function ColumnFilter<T extends DataTableRow>({
  column,
  rows,
  kind,
  options,
  filter,
  onChange,
}: {
  column: DataTableColumn<T>;
  rows: T[];
  kind: "text" | "values" | "range";
  options: string[];
  filter?: DataTableFilter;
  onChange: (filter: DataTableFilter | undefined) => void;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const title = typeof column.title === "string" ? column.title : column.key;
  const suggestions = useMemo(() => open && kind !== "range" && !options.length ? distinct(column, rows) : options,
    [open, kind, column, rows, options]);
  return (
    <>
      <IconButton
        ref={anchor}
        size="xs"
        variant="ghost"
        icon="sliders"
        className="ad-data-table-filter"
        data-active={isActive(filter) || undefined}
        label={tr("Фильтр: {title}", { title })}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchor} label={tr("Фильтр: {title}", { title })} className="ad-data-table-filter-popover">
        <FilterEditor kind={kind} options={suggestions} filter={filter} onChange={onChange} />
      </Popover>
    </>
  );
}

const field = (row: DataTableRow, key: string) =>
  (row as Record<string, unknown>)[key];

/** Text of a cell for sorting and search: numbers stay numbers. */
function cellValue<T extends DataTableRow>(column: DataTableColumn<T>, row: T) {
  const raw = column.value ? column.value(row) : field(row, column.key);
  if (typeof raw === "number") return raw;
  return raw == null ? "" : String(raw);
}

/** Export the filtered, sorted rows with the same columns the reader can see. */
export const dataTableCsv = <T extends DataTableRow>(columns: DataTableColumn<T>[], rows: T[]) => {
  const quote = (value: string | number) => {
    const safe = typeof value === "string" && /^[=+\\-@\\t\\r]/.test(value) ? \`'\${value}\` : String(value);
    return \`"\${safe.replace(/"/g, '""')}"\`;
  };
  return [
    columns.map((column) => typeof column.title === "string" ? column.title : column.key),
    ...rows.map((row) => columns.map((column) => cellValue(column, row))),
  ].map((cells) => cells.map(quote).join(",")).join("\\r\\n");
};

/**
 * A data table: sortable columns, row selection with "select all", search, pages, a sticky
 * header when it scrolls, loading and empty states. Plain \`columns: string[]\` with array
 * rows still works.
 */
export function DataTable<T extends DataTableRow = DataTableRow>({
  columns: providedColumns,
  rows = [] as unknown as T[],
  caption,
  rowKey,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  sorting: controlledSorting,
  defaultSorting,
  onSortingChange,
  selectable = false,
  selected: controlledSelection,
  defaultSelected = [],
  onSelectionChange,
  searchable = false,
  query: controlledQuery,
  defaultQuery = "",
  onQueryChange,
  filterable = false,
  filters: controlledFilters,
  defaultFilters = {},
  onFiltersChange,
  groupable = false,
  groupBy: controlledGroupBy,
  defaultGroupBy = null,
  onGroupByChange,
  pageSize,
  pageSizeOptions,
  pagination: controlledPagination,
  defaultPagination,
  onPaginationChange,
  manualFiltering = false,
  manualSorting = false,
  manualPagination = false,
  rowCount,
  columnOrder: controlledColumnOrder,
  defaultColumnOrder = [],
  onColumnOrderChange,
  columnPinning: controlledColumnPinning,
  defaultColumnPinning = {},
  onColumnPinningChange,
  resizableColumns = true,
  maxHeight,
  virtualize = false,
  estimatedRowHeight,
  overscan = 5,
  renderRowDetails,
  expandedRows: controlledExpandedRows,
  defaultExpandedRows = [],
  onExpandedRowsChange,
  renderRowActions,
  rowActionsWidth = 96,
  rowNumbers = false,
  dense: controlledDense,
  densityToggle = false,
  onDenseChange,
  striped = false,
  loading = false,
  empty: providedEmpty,
  onRowClick,
  ...p
}: DataTableProps<T>) {
  const tr = useTr();
  const columns = providedColumns ?? [tr("Дата"), tr("Событие"), tr("Статус")];
  const empty = providedEmpty ?? tr("Нет данных");
  const cols = useMemo(
    () =>
      columns.map((column, index) => {
        if (typeof column === "string") return { key: String(index), title: column } as DataTableColumn<T>;
        if (!column.value) return column;
        const cache = new WeakMap<T, string | number>();
        return { ...column, value: (row: T) => {
          if (!cache.has(row)) cache.set(row, column.value!(row));
          return cache.get(row)!;
        } };
      }),
    [columns, rows],
  );
  const [sort, setSort] = useControllable<DataTableSort | null>(
    controlledSort,
    defaultSort,
    onSortChange,
  );
  const [multiSorting, setMultiSorting] = useControllable(controlledSorting, defaultSorting ?? (defaultSort ? [defaultSort] : []), onSortingChange);
  const multiSort = controlledSorting !== undefined || controlledSort === undefined;
  const sorting = useMemo(() => {
    const seen = new Set<string>();
    return (multiSort ? multiSorting : sort ? [sort] : []).filter((item) => {
      const column = cols.find((column) => column.key === item.key);
      if (!column || column.sortable === false || seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
  }, [multiSort, multiSorting, sort, cols]);
  const setSorting = (next: DataTableSort[]) => { setMultiSorting(next); setSort(next[0] ?? null); };
  const [selection, setSelection] = useControllable(
    controlledSelection,
    defaultSelected,
    onSelectionChange,
  );
  const generatedKeys = useRef(new WeakMap<object, string>());
  const nextGeneratedKey = useRef(0);
  const keyed = useMemo(() => {
    const identify = (row: T, index: number) => {
      if (rowKey) return rowKey(row, index);
      const id = !Array.isArray(row) && row && typeof row === "object" && "id" in row ? row.id : undefined;
      if (typeof id === "string" || typeof id === "number") return String(id);
      if (row && typeof row === "object") {
        let key = generatedKeys.current.get(row);
        if (!key) {
          key = \`\\u0000row:\${++nextGeneratedKey.current}\`;
          generatedKeys.current.set(row, key);
        }
        return key;
      }
      return \`\\u0000index:\${index}\`;
    };
    return rows.map((row, index) => ({ row, index, key: identify(row, index) }));
  }, [rows, rowKey]);
  const [query, setQuery] = useControllable(controlledQuery, defaultQuery, onQueryChange);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useControllable(controlledColumnOrder, defaultColumnOrder, onColumnOrderChange);
  const [columnPinning, setColumnPinning] = useControllable<DataTableColumnPinning>(controlledColumnPinning, defaultColumnPinning, onColumnPinningChange);
  const [expandedRows, setExpandedRows] = useControllable(controlledExpandedRows, defaultExpandedRows, onExpandedRowsChange);
  const [dense, setDense] = useControllable(controlledDense, false, onDenseChange);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizing = useRef<{ key: string; x: number; width: number } | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const columnsAnchor = useRef<HTMLButtonElement>(null);
  const orderedCols = useMemo(() => {
    const byKey = new Map(cols.map((column) => [column.key, column]));
    return [...new Set([...columnOrder, ...cols.map((column) => column.key)])].flatMap((key) => byKey.has(key) ? [byKey.get(key)!] : []);
  }, [cols, columnOrder]);
  const availableCols = orderedCols.filter((column) => !hiddenColumns.includes(column.key));
  const shownCols = availableCols.length ? availableCols : orderedCols.slice(0, 1);
  const pinning = useMemo(() => {
    const keys = new Set(shownCols.map((column) => column.key));
    const left = [...new Set(columnPinning.left ?? [])].filter((key) => keys.has(key));
    const right = [...new Set(columnPinning.right ?? [])].filter((key) => keys.has(key) && !left.includes(key));
    return { left, right };
  }, [columnPinning, shownCols.map((column) => column.key).join("\\0")]);
  const visibleCols = [...pinning.left.map((key) => shownCols.find((column) => column.key === key)!),
    ...shownCols.filter((column) => !pinning.left.includes(column.key) && !pinning.right.includes(column.key)),
    ...pinning.right.map((key) => shownCols.find((column) => column.key === key)!)];
  const validSize = (value?: number) => value !== undefined && Number.isInteger(value) && value > 0 ? value : undefined;
  const [pagination, setPagination] = useControllable<DataTablePagination>(controlledPagination,
    defaultPagination ?? { pageIndex: 0, pageSize: validSize(pageSize) ?? 0 }, onPaginationChange);
  const page = Number.isFinite(pagination.pageIndex) ? Math.max(0, Math.floor(pagination.pageIndex)) : 0;
  const perPage = validSize(pagination.pageSize);
  const setPage = (pageIndex: number) => setPagination((current) => ({ ...current, pageIndex }));
  const setPerPage = (size?: number) => setPagination({ pageIndex: 0, pageSize: validSize(size) ?? 0 });
  useEffect(() => { if (controlledPagination === undefined && defaultPagination === undefined && pagination.pageSize !== (validSize(pageSize) ?? 0)) setPerPage(pageSize); }, [pageSize]);
  const [filters, setFilters] = useControllable<Filters>(controlledFilters, defaultFilters, onFiltersChange);
  const [groupBy, setGroupBy] = useControllable<string | null>(controlledGroupBy, defaultGroupBy, onGroupByChange);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const setFilter = (key: string, filter: DataTableFilter | undefined) => {
    const next = { ...filters };
    if (filter) next[key] = filter;
    else delete next[key];
    setFilters(next);
    setPage(0);
  };
  const columnFilters = useMemo(
    () => new Map(cols.map((column) => [column.key, filterDefinition(column, rows, filterable)])),
    [cols, rows, filterable],
  );

  const activeFilters = useMemo(() => cols.filter((column) => isActive(filters[column.key])), [cols, filters]);
  const found = useMemo(() => {
    if (manualFiltering) return keyed;
    const needle = query.toLowerCase();
    return keyed.filter(
      ({ row }) =>
        (!needle || cols.some((column) => String(cellValue(column, row)).toLowerCase().includes(needle))) &&
        activeFilters.every((column) => passes(filters[column.key]!, cellValue(column, row))),
    );
  }, [keyed, cols, query, activeFilters, filters, manualFiltering]);
  const sorted = useMemo(() => sorting.length && !manualSorting
      ? [...found].sort((a, b) => {
          for (const sort of sorting) {
            const column = cols.find((column) => column.key === sort.key)!;
            const x = cellValue(column, a.row), y = cellValue(column, b.row);
            const order = typeof x === "number" && typeof y === "number"
              ? (Number.isNaN(x) ? Number.isNaN(y) ? 0 : 1 : Number.isNaN(y) ? -1 : x - y)
              : compareText(String(x), String(y));
            if (order) return sort.direction === "asc" ? order : -order;
          }
          return a.index - b.index;
        })
      : found,
    [found, sorting, cols, manualSorting],
  );
  // Grouping keeps the sort inside each group; groups follow in the order of their values.
  const groupColumn = groupBy ? cols.find((column) => column.key === groupBy) : undefined;
  const { groups, groupNames } = useMemo(() => {
    const grouped = new Map<string, typeof sorted>();
    const groupNames = new Map<string, string>();
    if (groupColumn) for (const item of sorted) {
      const name = String(cellValue(groupColumn, item.row));
      groupNames.set(item.key, name);
      const items = grouped.get(name) ?? [];
      items.push(item);
      grouped.set(name, items);
    }
    const aggregateColumns = cols.filter((column) => column.aggregate);
    const groups = [...grouped].sort(([a], [b]) => compareText(a, b))
      .map(([name, items]) => {
        const rows = items.map(({ row }) => row);
        const summaries = new Map(aggregateColumns.map((column) => [column.key, column.aggregate?.(rows)]));
        return { name, items, summaries };
      });
    return { groups, groupNames };
  }, [sorted, groupColumn, cols]);
  const ordered = useMemo(() => groupColumn
    ? groups.flatMap((group) => (collapsed.has(group.name) ? [] : group.items))
    : sorted, [groupColumn, groups, collapsed, sorted]);
  const total = manualPagination && rowCount !== undefined && Number.isFinite(rowCount) ? Math.max(0, Math.floor(rowCount)) : ordered.length;
  const knownTotal = !manualPagination || (rowCount !== undefined && Number.isFinite(rowCount));
  const pages = perPage ? knownTotal ? Math.max(1, Math.ceil(total / perPage)) : page + 1 + Number(rows.length >= perPage) : 1;
  const current = Math.min(page, pages - 1);
  useEffect(() => { if (!loading && (page !== current || pagination.pageIndex !== page)) setPage(current); }, [page, current, pagination.pageIndex, loading]);
  const visible = useMemo(() => perPage && !manualPagination
    ? ordered.slice(current * perPage, (current + 1) * perPage)
    : ordered, [ordered, current, perPage, manualPagination]);
  const sizes = [...new Set([pageSize, perPage, ...(pageSizeOptions ?? [10, 25, 50])]
    .filter((size): size is number => typeof size === "number" && Number.isInteger(size) && size > 0))].sort((a, b) => a - b);
  const viewChanged = !!(query || sorting.length || groupBy || activeFilters.length || hiddenColumns.length || Object.keys(columnWidths).length || collapsed.size || perPage !== validSize(pageSize) || columnOrder.length || pinning.left.length || pinning.right.length);
  const resetView = () => {
    setQuery("");
    setSorting([]);
    setFilters({});
    setGroupBy(null);
    setHiddenColumns([]);
    setColumnWidths({});
    setColumnOrder([]);
    setColumnPinning({ left: [], right: [] });
    setExpandedRows([]);
    setCollapsed(new Set());
    setPerPage(validSize(pageSize) ?? validSize(defaultPagination?.pageSize) ?? perPage);
    setPage(0);
    setColumnsOpen(false);
  };
  const toggleGroup = (name: string) =>
    setCollapsed((all) => {
      const next = new Set(all);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const leading = Number(selectable) + Number(rowNumbers) + Number(!!renderRowDetails);
  const actionWidth = Number.isFinite(rowActionsWidth) && rowActionsWidth >= 40 ? Math.round(rowActionsWidth) : 96;
  const span = visibleCols.length + leading + Number(!!renderRowActions);
  const widthOf = (key: string) => columnWidths[key] ?? (cols.find((column) => column.key === key)?.width?.endsWith("px")
    ? Number.parseFloat(cols.find((column) => column.key === key)!.width!) : 160);
  const pinned = !!(pinning.left.length || pinning.right.length);
  const columnStyle = (column: DataTableColumn<T>): CSSProperties => {
    const side = pinning.left.includes(column.key) ? "left" : pinning.right.includes(column.key) ? "right" : undefined;
    const keys = side ? pinning[side] : [];
    const index = keys.indexOf(column.key);
    const preceding = side === "left" ? keys.slice(0, index) : keys.slice(index + 1);
    return { width: pinned ? widthOf(column.key) : columnWidths[column.key] ?? column.width,
      ...(side && { [side]: preceding.reduce((sum, key) => sum + widthOf(key), side === "left" ? leading * 40 : renderRowActions ? actionWidth : 0) }) };
  };
  const pinnedSide = (key: string) => pinning.left.includes(key) ? "left" : pinning.right.includes(key) ? "right" : undefined;
  /** The group header row: chevron, the group's value, its count and the columns' summaries. */
  const groupRow = (group: (typeof groups)[number], viewIndex: number) => (
    <tr key={\`g:\${group.name}\`} data-virtual-key={\`g:\${group.name}\`} aria-rowindex={virtualize ? viewIndex + 2 : undefined} className="ad-data-table-group" data-collapsed={collapsed.has(group.name) || undefined}>
      <td colSpan={span}>
        <div className="ad-data-table-group-content">
          <button type="button" className="ad-data-table-group-toggle" aria-expanded={!collapsed.has(group.name)} onClick={() => toggleGroup(group.name)}>
            <Icon name="chevron" />
            <span>{group.name || "—"}</span>
            <span className="ad-data-table-group-count">{group.items.length}</span>
          </button>
          <div className="ad-data-table-group-summaries">{visibleCols.filter((column) => column.aggregate && column.key !== visibleCols[0]?.key).map((column) => (
            <span key={column.key} className="ad-data-table-group-summary">
              <span>{column.title}</span>
              <strong>{group.summaries.get(column.key)}</strong>
            </span>
          ))}</div>
        </div>
      </td>
    </tr>
  );

  const chosen = useMemo(() => new Set(selection), [selection]);
  const { allChosen, someChosen } = useMemo(() => {
    if (!selectable || !found.length || !chosen.size) return { allChosen: false, someChosen: false };
    let all = true, some = false;
    for (const { key } of found) {
      if (chosen.has(key)) some = true;
      else all = false;
      if (some && !all) break;
    }
    return { allChosen: all, someChosen: some && !all };
  }, [selectable, found, chosen]);
  const toggleAll = () => {
    const foundKeys = new Set(found.map(({ key }) => key));
    setSelection(
      allChosen
        ? selection.filter((key) => !foundKeys.has(key))
        : [...new Set([...selection, ...foundKeys])],
    );
  };
  const toggle = (key: string) =>
    setSelection(
      chosen.has(key)
        ? selection.filter((k) => k !== key)
        : [...selection, key],
    );
  // Ascending, descending, then back to the original order.
  const cycleSort = (key: string, append = false) => {
    const prior = sorting.find((sort) => sort.key === key);
    const direction = prior ? sortStates[prior.direction].next : "asc";
    append = append && multiSort;
    const next = append ? sorting.filter((sort) => sort.key !== key) : [];
    if (direction) {
      const index = append && prior ? sorting.findIndex((sort) => sort.key === key) : next.length;
      next.splice(index, 0, { key, direction });
    }
    setSorting(next);
  };

  type ViewItem = { kind: "group"; key: string; group: (typeof groups)[number] }
    | { kind: "row" | "details"; key: string; item: (typeof visible)[number]; position: number };
  const expanded = useMemo(() => new Set(expandedRows), [expandedRows]);
  const viewItems = useMemo(() => {
    const positions = new Map(visible.map((item, index) => [item.key, index]));
    const appendRows = (items: typeof visible): ViewItem[] => items.flatMap((item) => {
      const position = (perPage ? current * perPage : 0) + positions.get(item.key)!;
      const entries: ViewItem[] = [{ kind: "row", key: \`r:\${item.key}\`, item, position }];
      if (renderRowDetails && expanded.has(item.key)) entries.push({ kind: "details", key: \`d:\${item.key}\`, item, position });
      return entries;
    });
    if (!groupColumn) return appendRows(visible);
    const pageGroups = new Map<string, typeof visible>();
    for (const item of visible) {
      const name = groupNames.get(item.key) ?? "";
      const items = pageGroups.get(name) ?? [];
      items.push(item);
      pageGroups.set(name, items);
    }
    return groups.flatMap((group): ViewItem[] => {
      const items = pageGroups.get(group.name) ?? [];
      if (!items.length && !(current === 0 && collapsed.has(group.name))) return [];
      return [{ kind: "group", key: \`g:\${group.name}\`, group }, ...appendRows(items)];
    });
  }, [visible, groupColumn, groupNames, groups, collapsed, current, perPage, expanded, !!renderRowDetails]);
  const viewIndexes = useMemo(() => new Map(viewItems.map((item, index) => [item.key, index])), [viewItems]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const heights = useRef(new Map<string, number>());
  const headerHeight = useRef(44);
  const frameRef = useRef(0);
  const measuredWidth = useRef(0);
  const geometryChanged = useRef(false);
  const [geometryVersion, setGeometryVersion] = useState(0);
  const [viewport, setViewport] = useState({ top: 0, height: typeof maxHeight === "number" ? maxHeight : 480, width: 0 });
  const scheduleViewport = () => {
    if (!virtualize || frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const element = scrollRef.current;
      if (!element) return;
      setViewport((old) => {
        const next = { top: element.scrollTop, height: element.clientHeight || old.height, width: element.clientWidth || old.width };
        return old.top === next.top && old.height === next.height && old.width === next.width ? old : next;
      });
      if (geometryChanged.current) { geometryChanged.current = false; setGeometryVersion((version) => version + 1); }
    });
  };
  const estimate = estimatedRowHeight && estimatedRowHeight > 0 && Number.isFinite(estimatedRowHeight) ? estimatedRowHeight : dense ? 36 : 48;
  const offsets = useMemo(() => {
    const result = [0];
    for (const entry of viewItems) result.push(result[result.length - 1]! + (heights.current.get(entry.key) ?? (entry.kind === "details" ? estimate * 3 : estimate)));
    return result;
  }, [viewItems, dense, estimatedRowHeight, geometryVersion]);
  const virtualHeight = offsets[offsets.length - 1] ?? 0;
  const indexAt = (offset: number, values = offsets) => {
    let low = 0, high = values.length - 1;
    while (low < high) { const middle = (low + high) >>> 1; if (values[middle + 1]! <= offset) low = middle + 1; else high = middle; }
    return Math.min(low, Math.max(0, values.length - 2));
  };
  const clearMeasurements = (anchor: number, oldOffsets = offsets) => {
    let position = 0;
    for (let index = 0; index < anchor; index++) position += viewItems[index]?.kind === "details" ? estimate * 3 : estimate;
    heights.current.clear();
    geometryChanged.current = true;
    return position - (oldOffsets[anchor] ?? 0);
  };
  const extra = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 5;
  const top = Math.max(0, Math.min(viewport.top - headerHeight.current, Math.max(0, virtualHeight - viewport.height)));
  const start = virtualize ? Math.max(0, indexAt(top) - extra) : 0;
  const end = virtualize ? Math.min(viewItems.length, indexAt(top + viewport.height) + extra + 1) : viewItems.length;
  const viewIdentity = JSON.stringify([query, sorting, filters, groupBy, current, perPage]);
  useEffect(() => {
    if (!virtualize) return;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setViewport((current) => current.top ? { ...current, top: 0 } : current);
  }, [virtualize, viewIdentity]);
  useEffect(() => {
    if (!virtualize) return;
    for (const key of heights.current.keys()) if (!viewIndexes.has(key)) heights.current.delete(key);
    const maximum = Math.max(0, virtualHeight + headerHeight.current - viewport.height);
    const element = scrollRef.current;
    if (element && element.scrollTop > maximum) {
      element.scrollTop = maximum;
      setViewport((old) => ({ ...old, top: maximum }));
    }
  }, [virtualize, viewItems, virtualHeight, viewport.height]);
  const measurementIdentity = JSON.stringify([dense, estimatedRowHeight, columnWidths, visibleCols.map((column) => column.key)]);
  const previousMeasurementIdentity = useRef(measurementIdentity);
  const previousOffsets = useRef(offsets);
  useEffect(() => {
    if (previousMeasurementIdentity.current === measurementIdentity) return;
    previousMeasurementIdentity.current = measurementIdentity;
    if (!virtualize) { heights.current.clear(); return; }
    const element = scrollRef.current;
    const anchor = indexAt(Math.max(0, (element?.scrollTop ?? 0) - headerHeight.current), previousOffsets.current);
    const adjustment = clearMeasurements(anchor, previousOffsets.current);
    if (element && adjustment) { element.scrollTop += adjustment; setViewport((old) => ({ ...old, top: element.scrollTop })); }
    geometryChanged.current = false;
    setGeometryVersion((version) => version + 1);
  }, [virtualize, measurementIdentity]);
  useEffect(() => { previousOffsets.current = offsets; }, [offsets]);
  useEffect(() => {
    if (!virtualize || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const element = scrollRef.current;
      const anchor = indexAt(Math.max(0, (element?.scrollTop ?? 0) - headerHeight.current));
      let adjustment = 0;
      const width = element?.clientWidth ?? 0;
      const resized = measuredWidth.current > 0 && measuredWidth.current !== width;
      measuredWidth.current = width;
      if (resized) adjustment += clearMeasurements(anchor);
      const measurements = resized
        ? [...entries, ...Array.from(bodyRef.current?.querySelectorAll<HTMLElement>("[data-virtual-key]") ?? []).map((target) => ({ target, borderBoxSize: [] }))]
        : entries;
      for (const entry of measurements) {
        const element = entry.target as HTMLElement;
        const height = entry.borderBoxSize?.[0]?.blockSize ?? element.getBoundingClientRect().height;
        if (element === headerRef.current && height > 0 && height !== headerHeight.current) {
          headerHeight.current = height; geometryChanged.current = true;
        }
        const key = element.dataset.virtualKey;
        if (key && height > 0 && heights.current.get(key) !== height) {
          const index = viewIndexes.get(key);
          if (index !== undefined && index < anchor) adjustment += height - (heights.current.get(key) ?? (resized ? viewItems[index]!.kind === "details" ? estimate * 3 : estimate : offsets[index + 1]! - offsets[index]!));
          heights.current.set(key, height); geometryChanged.current = true;
        }
      }
      if (element && adjustment) element.scrollTop += adjustment;
      scheduleViewport();
    });
    if (scrollRef.current) observer.observe(scrollRef.current);
    if (headerRef.current) observer.observe(headerRef.current);
    bodyRef.current?.querySelectorAll<HTMLElement>("[data-virtual-key]").forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [virtualize, start, end, viewItems, offsets, measurementIdentity]);
  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); frameRef.current = 0; }, [virtualize]);
  const toggleDetails = (key: string) => setExpandedRows(expanded.has(key) ? expandedRows.filter((item) => item !== key) : [...expandedRows, key]);
  const specialStyle = (index: number): CSSProperties => ({ width: 40, ...(pinning.left.length ? { position: "sticky", left: index * 40, zIndex: 2 } : {}) });

  const body: ReactNode = loading ? (
    Array.from({ length: Math.min(perPage ?? 4, 6) }, (_, i) => (
      <tr key={i} className="ad-data-table-loading">
        {Array.from({ length: span }, (__, j) => (
          <td key={j}>
            <i />
          </td>
        ))}
      </tr>
    ))
  ) : visible.length === 0 && !groups.some((group) => collapsed.has(group.name)) ? (
    <tr>
      <td className="ad-data-table-empty" colSpan={span}>
        {empty}
      </td>
    </tr>
  ) : (
    viewItems.slice(start, end).map((entry, indexInWindow) => {
      const viewIndex = start + indexInWindow;
      if (entry.kind === "group") return groupRow(entry.group, viewIndex);
      const { row, index, key } = entry.item;
      if (entry.kind === "details") return <tr key={entry.key} data-virtual-key={entry.key} aria-rowindex={virtualize ? viewIndex + 2 : undefined} data-details-key={key} className="ad-data-table-details">
        <td colSpan={span}>{renderRowDetails?.(row, index)}</td>
      </tr>;
      return (
      <tr
        key={entry.key}
        data-virtual-key={entry.key}
        data-row-key={key}
        aria-rowindex={virtualize ? viewIndex + 2 : undefined}
        data-selected={chosen.has(key) || undefined}
        data-clickable={onRowClick ? true : undefined}
        onClick={onRowClick && ((event) => {
          const interactive = (event?.target as HTMLElement | undefined)?.closest?.("button,a,input,select,textarea,[role='button'],[role='checkbox'],[role='switch'],[contenteditable='true']");
          if (!interactive) onRowClick(row, index);
        })}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={onRowClick ? (event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRowClick(row, index); } } : undefined}
      >
        {renderRowDetails && <td className="ad-data-table-expand" style={specialStyle(0)} onClick={(event) => event.stopPropagation()}>
          <IconButton size="xs" variant="ghost" icon="chevron" label={tr("Подробности строки {number}", { number: entry.position + 1 })}
            aria-expanded={expanded.has(key)} data-expanded={expanded.has(key) || undefined} onClick={() => toggleDetails(key)} />
        </td>}
        {rowNumbers && <td className="ad-data-table-row-number" style={specialStyle(Number(!!renderRowDetails))} data-label={tr("Номер строки")}>{entry.position + 1}</td>}
        {selectable && (
          <td
            className="ad-data-table-check"
            style={specialStyle(Number(!!renderRowDetails) + Number(rowNumbers))}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              size="sm"
              checked={chosen.has(key)}
              onValueChange={() => toggle(key)}
              label={<span className="ad-sr-only">{tr("Выбрать строку")}</span>}
            />
          </td>
        )}
        {visibleCols.map((column) => (
          <td key={column.key} data-align={column.align} data-column-key={column.key}
            data-pinned={pinnedSide(column.key)} style={columnStyle(column)}
            data-label={typeof column.title === "string" ? column.title : column.key}
            data-primary={column.key === visibleCols[0]?.key || undefined}>
            {column.render
              ? column.render(row, index)
              : column.value ? column.value(row) : (field(row, column.key) as ReactNode)}
          </td>
        ))}
        {renderRowActions && <td className="ad-data-table-actions" style={{ width: actionWidth, ...(pinning.right.length ? { position: "sticky", right: 0, zIndex: 2 } : {}) }} onClick={(event) => event.stopPropagation()}>{renderRowActions(row, index)}</td>}
      </tr>
      );
    })
  );

  return (
    <div
      {...mark("DataTable", p)}
      data-dense={dense || undefined}
      data-striped={striped || undefined}
      data-selectable={selectable || undefined}
      data-virtual={virtualize || undefined}
      data-pinned={pinned || undefined}
      aria-busy={loading || undefined}
    >
      {(caption || searchable || groupable || densityToggle || cols.length > 1 || viewChanged) && (
        <div className="ad-data-table-bar">
          {caption && <strong>{caption}</strong>}
          {groupable && (
            <Select<string>
              size="sm"
              className="ad-data-table-group-by"
              icon="list"
              aria-label={tr("Группировать по")}
              value={groupBy ?? ""}
              onValueChange={(key) => {
                setGroupBy(key || null);
                setCollapsed(new Set());
                setPage(0);
              }}
              options={[
                { value: "", label: tr("Без группировки") },
                ...cols
                  .filter((column) => column.groupable !== false)
                  .map((column) => ({ value: column.key, label: column.title, text: typeof column.title === "string" ? column.title : column.key })),
              ]}
            />
          )}
          {searchable && (
            <TextField
              size="sm"
              placeholder={tr("Поиск…")}
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              startAdornment={<Icon name="search" />}
              clearable
              aria-label={tr("Поиск по таблице")}
            />
          )}
          <span className="ad-data-table-tools">
            {viewChanged && <IconButton size="sm" variant="ghost" icon="reset"
              label={tr("Сбросить вид")} onClick={resetView} />}
            {densityToggle && <IconButton size="sm" variant="ghost" icon="list" label={tr("Компактные строки")} aria-pressed={dense} onClick={() => setDense(!dense)} />}
            {cols.length > 1 && <>
              <IconButton ref={columnsAnchor} size="sm" variant="ghost" icon="grid"
                label={tr("Столбцы")} aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)} />
              <Popover open={columnsOpen} onOpenChange={setColumnsOpen} anchorRef={columnsAnchor} label={tr("Столбцы")}>
                <div className="ad-data-table-columns">
                  {orderedCols.map((column, index) => <div key={column.key} className="ad-data-table-column-option"><Checkbox size="sm"
                    label={typeof column.title === "string" ? column.title : column.key}
                    checked={!hiddenColumns.includes(column.key)}
                    onValueChange={(shown) => setHiddenColumns((current) => shown
                      ? current.filter((key) => key !== column.key)
                      : visibleCols.length > 1 ? [...current, column.key] : current)} />
                    <span className="ad-data-table-column-actions">{([
                      { label: "Переместить влево: {title}", icon: "prev", disabled: index === 0, action: () => {
                        const next = orderedCols.map((column) => column.key); [next[index - 1], next[index]] = [next[index]!, next[index - 1]!]; setColumnOrder(next);
                      } },
                      { label: "Переместить вправо: {title}", icon: "next", disabled: index === orderedCols.length - 1, action: () => {
                        const next = orderedCols.map((column) => column.key); [next[index], next[index + 1]] = [next[index + 1]!, next[index]!]; setColumnOrder(next);
                      } },
                      { label: "Закрепить слева: {title}", icon: "prev", active: pinning.left.includes(column.key), action: () => setColumnPinning({
                        left: pinning.left.includes(column.key) ? pinning.left.filter((key) => key !== column.key) : [...pinning.left, column.key], right: pinning.right.filter((key) => key !== column.key),
                      }) },
                      { label: "Закрепить справа: {title}", icon: "next", active: pinning.right.includes(column.key), action: () => setColumnPinning({
                        right: pinning.right.includes(column.key) ? pinning.right.filter((key) => key !== column.key) : [...pinning.right, column.key], left: pinning.left.filter((key) => key !== column.key),
                      }) },
                    ]).map((action) => <IconButton key={action.label} size="xs" variant="ghost" icon={action.icon} disabled={action.disabled}
                      aria-pressed={action.active} label={tr(action.label, { title: typeof column.title === "string" ? column.title : column.key })} onClick={action.action} />)}</span>
                  </div>)}
                </div>
              </Popover>
            </>}
            <IconButton size="sm" variant="ghost" icon="download" label={tr("Экспорт CSV")}
              onClick={() => {
                const url = URL.createObjectURL(new Blob(["\\uFEFF", dataTableCsv(visibleCols, sorted.map(({ row }) => row))], { type: "text/csv;charset=utf-8" }));
                const link = document.createElement("a");
                link.href = url;
                link.download = "data-table.csv";
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 0);
              }} />
          </span>
        </div>
      )}
      {activeFilters.length > 0 && (
        <div className="ad-data-table-chips">
          {activeFilters.map((column) => (
            <span key={column.key} className="ad-data-table-chip">
              <strong>{column.title}</strong> {describe(filters[column.key]!, tr)}
              <button type="button" aria-label={tr("Убрать фильтр")} onClick={() => setFilter(column.key, undefined)}>
                <Icon name="close" />
              </button>
            </span>
          ))}
          <Button size="xs" variant="ghost" icon="reset" onClick={() => { setFilters({}); setPage(0); }}>
            {tr("Сбросить фильтры")}
          </Button>
        </div>
      )}
      <div ref={scrollRef} className="ad-data-table-scroll" onScroll={virtualize ? scheduleViewport : undefined}
        style={{ maxHeight: maxHeight ?? (virtualize ? 480 : undefined), height: virtualize ? maxHeight ?? 480 : undefined }}>
        <table aria-rowcount={knownTotal ? (virtualize ? viewItems.length : total) + 1 : -1} style={pinned ? { width: visibleCols.reduce((sum, column) => sum + widthOf(column.key), leading * 40 + (renderRowActions ? actionWidth : 0)) } : undefined}>
          <colgroup>
            {Array.from({ length: leading }, (_, index) => <col key={\`leading:\${index}\`} style={{ width: 40 }} />)}
            {visibleCols.map((column) => <col key={column.key} style={{ width: columnStyle(column).width }} />)}
            {renderRowActions && <col style={{ width: actionWidth }} />}
          </colgroup>
          <thead ref={headerRef}>
            <tr>
              {renderRowDetails && <th className="ad-data-table-expand" style={specialStyle(0)}><span className="ad-sr-only">{tr("Подробности")}</span></th>}
              {rowNumbers && <th className="ad-data-table-row-number" style={specialStyle(Number(!!renderRowDetails))} scope="col"><span className="ad-sr-only">{tr("Номер строки")}</span>#</th>}
              {selectable && (
                <th className="ad-data-table-check" style={specialStyle(Number(!!renderRowDetails) + Number(rowNumbers))}>
                  <Checkbox
                    size="sm"
                    checked={allChosen}
                    indeterminate={someChosen}
                    onValueChange={toggleAll}
                    label={<span className="ad-sr-only">{tr("Выбрать все")}</span>}
                  />
                </th>
              )}
              {visibleCols.map((column) => {
                const sortable = column.sortable ?? true;
                const sortIndex = sorting.findIndex((sort) => sort.key === column.key);
                const direction = sorting[sortIndex]?.direction;
                const filter = columnFilters.get(column.key);
                const width = columnWidths[column.key];
                const resize = (delta: number, base: number) =>
                  setColumnWidths((current) => ({ ...current, [column.key]: Math.max(96, Math.min(800, Math.round(base + delta))) }));
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-align={column.align}
                    data-column-key={column.key}
                    data-pinned={pinnedSide(column.key)}
                    style={columnStyle(column)}
                    aria-sort={direction ? sortStates[direction].aria : undefined}
                  >
                    <span className="ad-data-table-head">
                      {sortable ? (
                        <button
                          type="button"
                          className="ad-data-table-sort"
                          data-direction={direction}
                          onClick={(event) => cycleSort(column.key, !!event?.shiftKey)}
                        >
                          {column.title}
                          <Icon name="chevron" />
                          {sorting.length > 1 && sortIndex >= 0 && <small className="ad-data-table-sort-priority">{sortIndex + 1}</small>}
                        </button>
                      ) : (
                        column.title
                      )}
                      {filter?.kind && (
                        <ColumnFilter
                          column={column}
                          rows={rows}
                          kind={filter.kind}
                          options={filter.options}
                          filter={filters[column.key]}
                          onChange={(filter) => setFilter(column.key, filter)}
                        />
                      )}
                    </span>
                    {resizableColumns && column.resizable !== false && (
                      <span className="ad-data-table-resize" role="separator" tabIndex={0}
                        aria-orientation="vertical"
                        aria-label={tr("Изменить ширину: {title}", { title: typeof column.title === "string" ? column.title : column.key })}
                        aria-valuemin={96} aria-valuemax={800}
                        aria-valuenow={width}
                        aria-valuetext={width ? \`\${width}px\` : column.width ?? tr("Авто")}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          event.preventDefault();
                          const measured = event.currentTarget.closest("th")?.getBoundingClientRect().width ?? 160;
                          resizing.current = { key: column.key, x: event.clientX, width: measured };
                          event.currentTarget.setPointerCapture(event.pointerId);
                        }}
                        onPointerMove={(event) => {
                          const active = resizing.current;
                          if (active?.key === column.key) resize(event.clientX - active.x, active.width);
                        }}
                        onPointerUp={(event) => {
                          if (resizing.current?.key === column.key) resizing.current = null;
                          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                        }}
                        onLostPointerCapture={() => { if (resizing.current?.key === column.key) resizing.current = null; }}
                        onDoubleClick={() => setColumnWidths((current) => {
                          const next = { ...current };
                          delete next[column.key];
                          return next;
                        })}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                          event.preventDefault();
                          const measured = event.currentTarget.closest("th")?.getBoundingClientRect().width ?? 160;
                          resize(event.key === "ArrowRight" ? 16 : -16, width ?? measured);
                        }} />
                    )}
                  </th>
                );
              })}
              {renderRowActions && <th className="ad-data-table-actions" style={{ width: actionWidth, ...(pinning.right.length ? { right: 0, zIndex: 3 } : {}) }}><span className="ad-sr-only">{tr("Действия")}</span></th>}
            </tr>
          </thead>
          <tbody ref={bodyRef}>
            {virtualize && !loading && start > 0 && <tr className="ad-data-table-spacer" aria-hidden="true"><td colSpan={span} style={{ height: offsets[start] }} /></tr>}
            {body}
            {virtualize && !loading && end < viewItems.length && <tr className="ad-data-table-spacer" aria-hidden="true"><td colSpan={span} style={{ height: virtualHeight - offsets[end]! }} /></tr>}
          </tbody>
        </table>
      </div>
      {(perPage || activeFilters.length > 0 || (selectable && selection.length > 0)) && (
        <div className="ad-data-table-foot">
          <span>
            {selectable && selection.length > 0
              ? tr("Выбрано: {count}", { count: selection.length })
              : perPage
                ? tr(knownTotal ? "{from}–{to} из {count}" : "{from}–{to}", { from: visible.length ? current * perPage + 1 : 0, to: visible.length ? current * perPage + visible.length : 0, count: total })
                : tr(query || activeFilters.length ? "{count} найдено" : "{count} всего", { count: sorted.length })}
          </span>
          {selectable && selection.length > 0 && (
            <Button size="xs" variant="ghost" icon="close" onClick={() => setSelection([])}>
              {tr("Снять выделение")}
            </Button>
          )}
          {perPage && <span className="ad-data-table-page-controls">
            <Select<number> size="sm" label={tr("Строк на странице")}
              value={perPage}
              options={sizes.map((size) => ({ value: size, label: String(size) }))}
              onValueChange={(size) => { if (size) { setPerPage(size); setPage(0); } }} />
          {pages > 1 && (
            <span className="ad-data-table-pages">
              <IconButton
                size="xs"
                variant="ghost"
                icon="prev"
                label={tr("Предыдущая страница")}
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              />
              <span>
                {current + 1} / {knownTotal ? pages : "…"}
              </span>
              <IconButton
                size="xs"
                variant="ghost"
                icon="prev"
                label={tr("Следующая страница")}
                className="ad-data-table-next"
                disabled={current >= pages - 1}
                onClick={() => setPage(current + 1)}
              />
            </span>
          )}
          </span>}
        </div>
      )}
    </div>
  );
}
`;export{e as default};
