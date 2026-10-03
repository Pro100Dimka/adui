import { useMemo, useState, type ReactNode } from "react";
import { mark, useControllable } from "../../../core/base";
import { Checkbox } from "../../controls/Checkbox/Checkbox";
import { IconButton } from "../../controls/IconButton/IconButton";
import { TextField } from "../../controls/TextField/TextField";
import { Icon } from "../../layout/Icon/Icon";
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRow,
  DataTableSort,
} from "../shared";

const field = (row: DataTableRow, key: string) =>
  (row as Record<string, unknown>)[key];

/** Text of a cell for sorting and search: numbers stay numbers. */
function cellValue(column: DataTableColumn, row: DataTableRow) {
  const raw = column.value ? column.value(row) : field(row, column.key);
  return typeof raw === "number" ? raw : raw == null ? "" : String(raw);
}

/**
 * A data table: sortable columns, row selection with "select all", search, pages, a sticky
 * header when it scrolls, loading and empty states. Plain `columns: string[]` with array
 * rows still works.
 */
export function DataTable<T extends DataTableRow = DataTableRow>({
  columns = ["Дата", "Событие", "Статус"],
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
  pageSize,
  maxHeight,
  dense = false,
  striped = false,
  loading = false,
  empty = "Нет данных",
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
  const [page, setPage] = useState(0);

  const keyed = rows.map((row, index) => ({
    row,
    index,
    key: rowKey(row, index),
  }));
  const found = query
    ? keyed.filter(({ row }) =>
        cols.some((column) =>
          String(cellValue(column as DataTableColumn, row))
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      )
    : keyed;
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
  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const current = Math.min(page, pages - 1);
  const visible = pageSize
    ? sorted.slice(current * pageSize, (current + 1) * pageSize)
    : sorted;

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

  const span = cols.length + (selectable ? 1 : 0);
  const body: ReactNode = loading ? (
    Array.from({ length: Math.min(pageSize ?? 4, 6) }, (_, i) => (
      <tr key={i} className="ad-data-table-loading">
        {Array.from({ length: span }, (__, j) => (
          <td key={j}>
            <i />
          </td>
        ))}
      </tr>
    ))
  ) : visible.length === 0 ? (
    <tr>
      <td className="ad-data-table-empty" colSpan={span}>
        {empty}
      </td>
    </tr>
  ) : (
    visible.map(({ row, index, key }) => (
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
              label={<span className="ad-sr-only">Выбрать строку</span>}
            />
          </td>
        )}
        {cols.map((column) => (
          <td key={column.key} data-align={column.align}>
            {column.render
              ? column.render(row, index)
              : (field(row, column.key) as ReactNode)}
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <div
      {...mark("DataTable", p)}
      data-dense={dense || undefined}
      data-striped={striped || undefined}
    >
      {(caption || searchable) && (
        <div className="ad-data-table-bar">
          {caption && <strong>{caption}</strong>}
          {searchable && (
            <TextField
              size="sm"
              placeholder="Поиск…"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              startAdornment={<Icon name="search" />}
              clearable
              aria-label="Поиск по таблице"
            />
          )}
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
                    label={<span className="ad-sr-only">Выбрать все</span>}
                  />
                </th>
              )}
              {cols.map((column) => {
                const sortable = column.sortable ?? true;
                const direction =
                  sort?.key === column.key ? sort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-align={column.align}
                    style={{ width: column.width }}
                    aria-sort={
                      direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
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
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {(pageSize || (selectable && selection.length > 0)) && (
        <div className="ad-data-table-foot">
          <span>
            {selectable && selection.length > 0
              ? `Выбрано: ${selection.length}`
              : `${sorted.length} ${query ? "найдено" : "всего"}`}
          </span>
          {pageSize && pages > 1 && (
            <span className="ad-data-table-pages">
              <IconButton
                size="xs"
                variant="ghost"
                icon="prev"
                label="Предыдущая страница"
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
                label="Следующая страница"
                className="ad-data-table-next"
                disabled={current >= pages - 1}
                onClick={() => setPage(current + 1)}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
