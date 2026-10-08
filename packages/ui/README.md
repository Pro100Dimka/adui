# @ad-voice/ui

Neo UI — React + TypeScript UI kit: glass/ruby surfaces, animated neon borders, fields, tabs, dialogs, audio controls and a melody editor.

## Install

Live docs: https://pro100dimka.github.io/adui/

The package is installed from its GitHub release; React and ReactDOM are peer dependencies.

```bash
npm install https://github.com/Pro100Dimka/adui/releases/download/v2.8.3/ad-voice-ui-2.8.3.tgz react react-dom
```

Import the stylesheet once in the app entry point:

```ts
import "@ad-voice/ui/styles.css";
```

## Theme

Two colours build the whole palette (a primary scale, a secondary scale and tinted neutrals):

```tsx
import { ThemeProvider } from "@ad-voice/ui";

<ThemeProvider theme="violet">…</ThemeProvider>            // a ready pair
<ThemeProvider primary="#2f7bff" secondary="#9cc4ff">…</ThemeProvider>
<ThemeProvider tokens={{ "primary-900": "#0a1430" }}>…</ThemeProvider> // any token by hand
```

## Usage

```tsx
import { Button, Card, Switch, TextField } from "@ad-voice/ui";

export function SettingsCard() {
  return (
    <Card title="Настройки" border>
      <TextField label="Имя в онлайн-комнате" defaultValue="BBB" clearable />
      <Switch label="Радио включено" defaultChecked />
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
    </Card>
  );
}
```

Every stateful component works both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`).

## DataTable

`DataTable` includes multi-column sorting, per-column filters with distinct-value autocomplete, grouping and aggregates, search, selection, column visibility/order/pinning, lazy row details, row actions, row numbers, density controls, CSV export, and responsive cards. Readers can resize columns by dragging the header edge or focusing it and pressing ←/→; double-clicking the edge restores its original width. `resizableColumns={false}` disables all handles, and `resizable: false` disables one column.

Set `pageSize` to enable pagination. `pageSizeOptions` provides footer choices (the initial size is always included), and the footer shows the visible result range. The reset button clears sorting, filters, grouping, search, hidden columns, resized widths, and the chosen page size. See the live `DataTable` example in the documentation for complete column and row definitions.

Click a header to cycle ascending/descending/unsorted; Shift-click adds another sort criterion. `sorting` / `defaultSorting` / `onSortingChange` manage the ordered array of criteria. The existing single-column `sort` API remains supported. `columnOrder` and `columnPinning` have the same controlled/default/change pattern; pinning is `{ left: ["name"], right: ["status"] }`. The Columns menu exposes keyboard-accessible reordering and pinning. `renderRowDetails(row, index)` is called only for expanded, mounted rows; `expandedRows` contains stable row keys. `renderRowActions` adds an isolated actions cell (`rowActionsWidth` defaults to 96px). Enable `rowNumbers` and `densityToggle` as needed.

For a remote table, supply only the current page and control the state used by your data client:

```tsx
import { useState } from "react";
import { DataTable, type DataTablePagination, type DataTableSort } from "@ad-voice/ui";

type Person = { id: string; name: string };
const columns = [{ key: "name", title: "Name" }];

export function PeopleTable({ rows, total, loading }: { rows: Person[]; total: number; loading: boolean }) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({ pageIndex: 0, pageSize: 25 });
  // Your data client loads rows for query, sorting and pagination; cancel stale requests there.
  return <DataTable columns={columns} rows={rows} rowCount={total} loading={loading}
    searchable query={query} onQueryChange={setQuery}
    sorting={sorting} onSortingChange={setSorting}
    pagination={pagination} onPaginationChange={setPagination}
    manualFiltering manualSorting manualPagination />;
}
```

Manual flags are independent: the table does not fetch data and does not re-filter, re-sort or re-slice the corresponding server results. Provide `rowCount` for exact remote page counts. Without it, remote pagination keeps the current page and offers Next while the received page is full. Selection keys survive changing remote pages. Column filters search the complete distinct-value set before offering up to 100 suggestions; the actual row filter is not capped.

For an unpaginated large dataset use `virtualize maxHeight={480}`. The table mounts a viewport-sized range plus `overscan`, measures variable row/detail heights, and keeps a scrollable table on narrow screens rather than converting virtual rows into cards. Pinned tables also keep their horizontal table layout on narrow screens. `estimatedRowHeight` is the initial estimate, not a fixed-height restriction. Small paginated tables do not need virtualization. Stable row keys are important for measured heights, details and selection.

## Responsiveness

The package pauses decorative work outside the viewport and in hidden tabs. Its shared motion clock stops when no visible work remains; consumers do not need a separate animation scheduler. Playback updates are isolated from transport and volume controls. Audio analysis and loader image processing yield between short CPU work slices, and unmounting cancels stale results. Processed loader images are capped at 2048px on the longest side; turning background removal off restores the original upload.

Router updates are immediate by default. Opt into native snapshot transitions with `transition` only when their temporary interruption of pointer interaction suits your screen; normal CSS entrances do not require it.

Animated border geometry is initialized and resized in small batches on the shared clock, only while visible. Light positions use the cached contour instead of querying SVG geometry on every frame. Offscreen borders keep their light position without measuring layout or advancing the effect.

Keep `rows`, `columns`, `options`, and `initialValues` immutable: replace them when their contents change. Stable references allow expensive derived results to be reused across selection, navigation, and other local UI changes. Do not memoize every prop automatically.

For large tables, use `pageSize` or opt into `virtualize` to bound mounted rows. Virtualization bounds rendering, not the cost of client-side sorting/filtering: use the manual server contracts for datasets that are too large to process locally. Open Select/Autocomplete lists are not virtualized: filter very large datasets before supplying options. `PeoplePicker.onSearch(query, signal)` receives an optional `AbortSignal`; forward it to your data client to cancel superseded requests. Expensive custom renderers, validators, and aggregates still need their own work budget.

## Entry points

```ts
import { Button, Card, Dialog, AudioPlayer } from "@ad-voice/ui";
import { PianoRollGrid } from "@ad-voice/ui/editor";
import { Router } from "@ad-voice/ui/router";
import { Form, FormFields, useForm } from "@ad-voice/ui/forms";
import { ThemeProvider, useMotion } from "@ad-voice/ui/core";
```

## RotaryKnob

Canvas-rendered volume knob. Drag near the edge to rotate, drag from the center to move linearly, click the outer scale to jump. Wheel and arrow keys change the value, Shift gives a fine step, PageUp/PageDown change by 10, Home/End set 0/100, Escape cancels a drag, double-click resets. `onValueChange` fires while adjusting, `onValueCommit` after the gesture. `readOnly` turns it into a gauge.
