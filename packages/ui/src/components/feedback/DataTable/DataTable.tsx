import { tr } from "../../../core/i18n";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
} from "../shared";

type AnyColumn = DataTableColumn<DataTableRow>;
type Filters = Record<string, DataTableFilter>;

/** Distinct values of a column, sorted, as text. */
const distinct = (column: AnyColumn, rows: DataTableRow[]) =>
  [...new Set(rows.map((row) => String(cellValue(column, row))))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

/** The filter a column gets: its own choice, or one that suits its values. */
const filterKind = (column: AnyColumn, rows: DataTableRow[], filterable: boolean) => {
  if (column.filter !== undefined) return column.filter;
  if (!filterable) return false;
  if (rows.length && rows.every((row) => typeof cellValue(column, row) === "number")) return "range";
  return distinct(column, rows).length <= 12 ? "values" : "text";
};

const passes = (filter: DataTableFilter, value: string | number) => {
  if (filter.kind === "text") return String(value).toLowerCase().includes(filter.text.toLowerCase());
  if (filter.kind === "values") return filter.values.includes(String(value));
  const number = typeof value === "number" ? value : Number(value);
  return (filter.min === undefined || number >= filter.min) && (filter.max === undefined || number <= filter.max);
};

const isActive = (filter?: DataTableFilter) =>
  !!filter &&
  (filter.kind === "text" ? !!filter.text : filter.kind === "values" ? true : filter.min !== undefined || filter.max !== undefined);

/** Short description of an active filter for its chip. */
const describe = (filter: DataTableFilter) =>
  filter.kind === "text"
    ? `«${filter.text}»`
    : filter.kind === "values"
      ? filter.values.length <= 2
        ? filter.values.join(", ")
        : tr("{count} знач.", { count: filter.values.length })
      : `${filter.min ?? "…"} – ${filter.max ?? "…"}`;

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
  const [search, setSearch] = useState("");
  if (kind === "text")
    return (
      <Autocomplete
        size="sm"
        autoFocus
        placeholder={tr("Содержит…")}
        startAdornment={<Icon name="search" />}
        clearable
        options={options}
        value={filter?.kind === "text" ? filter.text : ""}
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
  const chosen = filter?.kind === "values" ? filter.values : [];
  return (
    <div className="ad-data-table-values">
      <Autocomplete
        size="sm"
        autoFocus
        placeholder={tr("Найти значение…")}
        startAdornment={<Icon name="search" />}
        options={options.filter((value) => !chosen.includes(value))}
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
function ColumnFilter({
  column,
  kind,
  options,
  filter,
  onChange,
}: {
  column: AnyColumn;
  kind: "text" | "values" | "range";
  options: string[];
  filter?: DataTableFilter;
  onChange: (filter: DataTableFilter | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const title = typeof column.title === "string" ? column.title : column.key;
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
        <FilterEditor kind={kind} options={options} filter={filter} onChange={onChange} />
      </Popover>
    </>
  );
}

const field = (row: DataTableRow, key: string) =>
  (row as Record<string, unknown>)[key];

/** Text of a cell for sorting and search: numbers stay numbers. */
function cellValue<T extends DataTableRow>(column: DataTableColumn<T>, row: T) {
  const raw = column.value ? column.value(row) : field(row, column.key);
  return typeof raw === "number" ? raw : raw == null ? "" : String(raw);
}

/** Export the filtered, sorted rows with the same columns the reader can see. */
export const dataTableCsv = <T extends DataTableRow>(columns: DataTableColumn<T>[], rows: T[]) => {
  const quote = (value: string | number) => {
    const safe = typeof value === "string" && /^[=+\-@\t\r]/.test(value) ? `'${value}` : String(value);
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [
    columns.map((column) => typeof column.title === "string" ? column.title : column.key),
    ...rows.map((row) => columns.map((column) => cellValue(column, row))),
  ].map((cells) => cells.map(quote).join(",")).join("\r\n");
};

/**
 * A data table: sortable columns, row selection with "select all", search, pages, a sticky
 * header when it scrolls, loading and empty states. Plain `columns: string[]` with array
 * rows still works.
 */
export function DataTable<T extends DataTableRow = DataTableRow>({
  columns = [tr("Дата"), tr("Событие"), tr("Статус")],
  rows = [] as unknown as T[],
  caption,
  rowKey = (_, index) => String(index),
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selected: controlledSelection,
  defaultSelected = [],
  onSelectionChange,
  searchable = false,
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
  resizableColumns = true,
  maxHeight,
  dense = false,
  striped = false,
  loading = false,
  empty = tr("Нет данных"),
  onRowClick,
  ...p
}: DataTableProps<T>) {
  const cols = useMemo(
    () =>
      columns.map((column, index) =>
        typeof column === "string"
          ? ({ key: String(index), title: column } as DataTableColumn<T>)
          : column,
      ),
    [columns],
  );
  const [sort, setSort] = useControllable<DataTableSort | null>(
    controlledSort,
    defaultSort,
    onSortChange,
  );
  const [selection, setSelection] = useControllable(
    controlledSelection,
    defaultSelected,
    onSelectionChange,
  );
  const [query, setQuery] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizing = useRef<{ key: string; x: number; width: number } | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const columnsAnchor = useRef<HTMLButtonElement>(null);
  const visibleCols = cols.filter((column) => !hiddenColumns.includes(column.key));
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(pageSize);
  useEffect(() => setPerPage(pageSize), [pageSize]);
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
  const kinds = useMemo(
    () => new Map(cols.map((column) => [column.key, filterKind(column as AnyColumn, rows, filterable)])),
    [cols, rows, filterable],
  );

  const keyed = rows.map((row, index) => ({
    row,
    index,
    key: rowKey(row, index),
  }));
  const activeFilters = cols.filter((column) => isActive(filters[column.key]));
  const found = keyed.filter(
    ({ row }) =>
      (!query ||
        cols.some((column) =>
          String(cellValue(column as DataTableColumn, row))
            .toLowerCase()
            .includes(query.toLowerCase()),
        )) &&
      activeFilters.every((column) => passes(filters[column.key]!, cellValue(column as AnyColumn, row))),
  );
  const sortColumn = sort && cols.find((column) => column.key === sort.key);
  const sorted = sortColumn
    ? [...found].sort((a, b) => {
        const x = cellValue(sortColumn as DataTableColumn, a.row);
        const y = cellValue(sortColumn as DataTableColumn, b.row);
        const order =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort!.direction === "asc" ? order : -order;
      })
    : found;
  // Grouping keeps the sort inside each group; groups follow in the order of their values.
  const groupColumn = groupBy ? cols.find((column) => column.key === groupBy) : undefined;
  const groupOf = (row: T) => (groupColumn ? String(cellValue(groupColumn as AnyColumn, row)) : "");
  const groups = groupColumn
    ? distinct(groupColumn as AnyColumn, sorted.map(({ row }) => row)).map((name) => ({
        name,
        items: sorted.filter(({ row }) => groupOf(row) === name),
      }))
    : [];
  const ordered = groupColumn ? groups.flatMap((group) => (collapsed.has(group.name) ? [] : group.items)) : sorted;
  const pages = perPage ? Math.max(1, Math.ceil(ordered.length / perPage)) : 1;
  const current = Math.min(page, pages - 1);
  const visible = perPage
    ? ordered.slice(current * perPage, (current + 1) * perPage)
    : ordered;
  const sizes = [...new Set([pageSize, ...(pageSizeOptions ?? [10, 25, 50])]
    .filter((size): size is number => typeof size === "number" && Number.isInteger(size) && size > 0))].sort((a, b) => a - b);
  const viewChanged = !!(query || sort || groupBy || activeFilters.length || hiddenColumns.length || Object.keys(columnWidths).length || collapsed.size || perPage !== pageSize);
  const resetView = () => {
    setQuery("");
    setSort(null);
    setFilters({});
    setGroupBy(null);
    setHiddenColumns([]);
    setColumnWidths({});
    setCollapsed(new Set());
    setPerPage(pageSize);
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
  const span = visibleCols.length + (selectable ? 1 : 0);
  /** The group header row: chevron, the group's value, its count and the columns' summaries. */
  const groupRow = (group: { name: string; items: typeof sorted }) => (
    <tr key={`group:${group.name}`} className="ad-data-table-group" data-collapsed={collapsed.has(group.name) || undefined}>
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
              <strong>{column.aggregate?.(group.items.map(({ row }) => row))}</strong>
            </span>
          ))}</div>
        </div>
      </td>
    </tr>
  );

  const chosen = new Set(selection);
  const allChosen =
    found.length > 0 && found.every(({ key }) => chosen.has(key));
  const someChosen = !allChosen && found.some(({ key }) => chosen.has(key));
  const toggleAll = () =>
    setSelection(
      allChosen
        ? selection.filter((key) => !found.some((item) => item.key === key))
        : [...new Set([...selection, ...found.map(({ key }) => key)])],
    );
  const toggle = (key: string) =>
    setSelection(
      chosen.has(key)
        ? selection.filter((k) => k !== key)
        : [...selection, key],
    );
  // Ascending, descending, then back to the original order.
  const cycleSort = (key: string) =>
    setSort(
      sort?.key !== key
        ? { key, direction: "asc" }
        : sort.direction === "asc"
          ? { key, direction: "desc" }
          : null,
    );

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
    (groupColumn
      ? groups.flatMap((group) => {
          const inPage = visible.filter((item) => groupOf(item.row) === group.name);
          if (collapsed.has(group.name)) return current === 0 ? [{ header: group, items: [] }] : [];
          return inPage.length ? [{ header: group, items: inPage }] : [];
        })
      : [{ header: null, items: visible }]
    ).map(({ header, items }) => (
      <Fragment key={header ? `g:${header.name}` : "rows"}>
        {header && groupRow(header)}
        {items.map(({ row, index, key }) => (
      <tr
        key={key}
        data-selected={chosen.has(key) || undefined}
        data-clickable={onRowClick ? true : undefined}
        onClick={onRowClick && (() => onRowClick(row, index))}
      >
        {selectable && (
          <td
            className="ad-data-table-check"
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
          <td key={column.key} data-align={column.align}
            data-label={typeof column.title === "string" ? column.title : column.key}
            data-primary={column.key === visibleCols[0]?.key || undefined}>
            {column.render
              ? column.render(row, index)
              : (field(row, column.key) as ReactNode)}
          </td>
        ))}
      </tr>
        ))}
      </Fragment>
    ))
  );

  return (
    <div
      {...mark("DataTable", p)}
      data-dense={dense || undefined}
      data-striped={striped || undefined}
      data-selectable={selectable || undefined}
    >
      {(caption || searchable || groupable || cols.length > 1 || viewChanged) && (
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
            {cols.length > 1 && <>
              <IconButton ref={columnsAnchor} size="sm" variant="ghost" icon="grid"
                label={tr("Столбцы")} aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)} />
              <Popover open={columnsOpen} onOpenChange={setColumnsOpen} anchorRef={columnsAnchor} label={tr("Столбцы")}>
                <div className="ad-data-table-columns">
                  {cols.map((column) => <Checkbox key={column.key} size="sm"
                    label={typeof column.title === "string" ? column.title : column.key}
                    checked={!hiddenColumns.includes(column.key)}
                    onValueChange={(shown) => setHiddenColumns((current) => shown
                      ? current.filter((key) => key !== column.key)
                      : visibleCols.length > 1 ? [...current, column.key] : current)} />)}
                </div>
              </Popover>
            </>}
            <IconButton size="sm" variant="ghost" icon="download" label={tr("Экспорт CSV")}
              onClick={() => {
                const url = URL.createObjectURL(new Blob(["\uFEFF", dataTableCsv(visibleCols, sorted.map(({ row }) => row))], { type: "text/csv;charset=utf-8" }));
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
              <strong>{column.title}</strong> {describe(filters[column.key]!)}
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
      <div className="ad-data-table-scroll" style={{ maxHeight }}>
        <table>
          <thead>
            <tr>
              {selectable && (
                <th className="ad-data-table-check">
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
                const direction =
                  sort?.key === column.key ? sort.direction : undefined;
                const width = columnWidths[column.key];
                const resize = (delta: number, base: number) =>
                  setColumnWidths((current) => ({ ...current, [column.key]: Math.max(96, Math.min(800, Math.round(base + delta))) }));
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-align={column.align}
                    style={{ width: width ?? column.width }}
                    aria-sort={
                      direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    <span className="ad-data-table-head">
                      {sortable ? (
                        <button
                          type="button"
                          className="ad-data-table-sort"
                          data-direction={direction}
                          onClick={() => cycleSort(column.key)}
                        >
                          {column.title}
                          <Icon name="chevron" />
                        </button>
                      ) : (
                        column.title
                      )}
                      {kinds.get(column.key) && (
                        <ColumnFilter
                          column={column as AnyColumn}
                          kind={kinds.get(column.key) as "text" | "values" | "range"}
                          options={distinct(column as AnyColumn, rows)}
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
                        aria-valuetext={width ? `${width}px` : column.width ?? tr("Авто")}
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
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {(perPage || activeFilters.length > 0 || (selectable && selection.length > 0)) && (
        <div className="ad-data-table-foot">
          <span>
            {selectable && selection.length > 0
              ? tr("Выбрано: {count}", { count: selection.length })
              : perPage
                ? tr("{from}–{to} из {count}", { from: visible.length ? current * perPage + 1 : 0, to: current * perPage + visible.length, count: sorted.length })
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
                {current + 1} / {pages}
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
