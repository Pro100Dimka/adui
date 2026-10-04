import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";
import type { DataTableColumn } from "@ad-voice/ui";

type Track = {
  id: string;
  title: string;
  artist: string;
  seconds: number;
  plays: number;
  status: "ready" | "processing" | "error";
};

const tracks: Track[] = [
  ["Ночь горит огнями", "Аура", 214, 1840, "ready"],
  ["Сквозь бетон", "Норд", 187, 920, "ready"],
  ["Рубиновый рассвет", "Мия", 242, 3110, "processing"],
  ["Шёпот волн", "Аура", 199, 640, "ready"],
  ["Город без сна", "Кай", 228, 2405, "error"],
  ["Лёд и пламя", "Мия", 176, 1290, "ready"],
  ["Последний трамвай", "Норд", 205, 455, "processing"],
  ["Неон", "Кай", 231, 5020, "ready"],
].map(([title, artist, seconds, plays, status], i) => ({
  id: `t${i}`,
  title,
  artist,
  seconds,
  plays,
  status,
})) as Track[];

const statuses = {
  ready: ["Готово", "success"],
  processing: ["Обработка", "processing"],
  error: ["Ошибка", "error"],
} as const;

const columns: DataTableColumn<Track>[] = [
  { key: "title", title: "Трек", groupable: false, aggregate: (rows) => `${rows.length} трек.` },
  { key: "artist", title: "Исполнитель" },
  {
    key: "seconds",
    title: "Длина",
    align: "end",
    groupable: false,
    aggregate: (rows) => {
      const total = rows.reduce((sum, t) => sum + t.seconds, 0);
      return `Σ ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    },
    render: (t) =>
      `${Math.floor(t.seconds / 60)}:${String(t.seconds % 60).padStart(2, "0")}`,
  },
  {
    key: "plays",
    title: "Прослушивания",
    align: "end",
    groupable: false,
    aggregate: (rows) => `Σ ${rows.reduce((sum, t) => sum + t.plays, 0).toLocaleString("ru-RU")}`,
    render: (t) => t.plays.toLocaleString("ru-RU"),
  },
  {
    key: "status",
    title: "Статус",
    value: (t) => statuses[t.status][0],
    render: (t) => (
      <U.Badge size="sm" tone={statuses[t.status][1]}>
        {statuses[t.status][0]}
      </U.Badge>
    ),
  },
];

export default function DataTableExample() {
  return (
    <Playground
      stretch
      knobs={{
        selectable: { value: true },
        searchable: { value: true },
        filterable: { value: true },
        groupBy: { options: ["none", "artist", "status"], value: "artist" },
        dense: { value: false },
        striped: { value: false },
        loading: { value: false },
      }}
      code={(v) =>
        jsx("DataTable", {
          caption: "Треки",
          columns: expr("columns"),
          rows: expr("tracks"),
          rowKey: expr("(t) => t.id"),
          defaultSort: expr('{ key: "plays", direction: "desc" }'),
          pageSize: 6,
          selectable: v.selectable,
          searchable: v.searchable,
          filterable: v.filterable,
          groupable: true,
          defaultGroupBy: v.groupBy === "none" ? undefined : v.groupBy,
          dense: v.dense,
          striped: v.striped,
          loading: v.loading,
        })
      }
    >
      {(v) => (
        <U.DataTable
          style={{ width: "min(100%, 48rem)" }}
          caption="Треки"
          columns={columns}
          rows={tracks}
          rowKey={(t) => t.id}
          defaultSort={{ key: "plays", direction: "desc" }}
          pageSize={6}
          selectable={v.selectable}
          searchable={v.searchable}
          filterable={v.filterable}
          groupable
          key={v.groupBy}
          defaultGroupBy={v.groupBy === "none" ? null : v.groupBy}
          dense={v.dense}
          striped={v.striped}
          loading={v.loading}
        />
      )}
    </Playground>
  );
}
