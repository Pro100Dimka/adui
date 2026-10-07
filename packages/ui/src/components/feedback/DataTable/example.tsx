import { useState } from "react";
import { Badge, Button, DataTable, Stack, Typography, copyText } from "@ad-voice/ui";
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
      <Badge size="sm" tone={statuses[t.status][1]}>
        {statuses[t.status][0]}
      </Badge>
    ),
  },
];

export default function DataTableExample() {
  const [largeRows, setLargeRows] = useState<Track[] | null>(null);
  return (
    <Stack gap={3}>
      <Stack direction="row" align="center" gap={3} wrap>
        <Button
          size="sm"
          icon="database"
          aria-label="Переключить объём данных"
          onClick={() => setLargeRows((rows) => rows ? null : Array.from({ length: 10_000 }, (_, index) => ({
            ...tracks[index % tracks.length], id: `large-${index}`, title: `${tracks[index % tracks.length].title} · ${index + 1}`,
          })))}
        >
          {largeRows ? "Вернуть 8 строк" : "Проверить 10 000 строк"}
        </Button>
        <Typography variant="caption" tone="muted">
          Shift + заголовок — несколько сортировок. «Столбцы» — порядок и закрепление.
        </Typography>
      </Stack>
    <DataTable
      key={largeRows ? "virtual" : "paged"}
      caption="Треки"
      columns={columns}
      rows={largeRows ?? tracks}
      rowKey={(track) => track.id}
      defaultSorting={[{ key: "artist", direction: "asc" }, { key: "plays", direction: "desc" }]}
      defaultColumnPinning={{ left: ["title"], right: ["status"] }}
      pageSize={largeRows ? undefined : 6}
      pageSizeOptions={[6, 12, 24]}
      virtualize={Boolean(largeRows)}
      maxHeight={480}
      rowNumbers
      densityToggle
      renderRowDetails={(track) => (
        <Stack gap={2}>
          <Typography variant="title">{track.title}</Typography>
          <Typography tone="muted">{track.artist} · {track.plays.toLocaleString("ru-RU")} прослушиваний</Typography>
          <Typography variant="mono">ID: {track.id}</Typography>
        </Stack>
      )}
      renderRowActions={(track) => (
        <Button size="sm" icon="copy" aria-label={`Скопировать название: ${track.title}`} onClick={() => { void copyText(track.title); }}>
          Копия
        </Button>
      )}
      selectable
      searchable
      filterable
      groupable
      defaultGroupBy={largeRows ? null : "artist"}
    />
    </Stack>
  );
}
