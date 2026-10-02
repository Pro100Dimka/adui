import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function HeaderExample() {
  return (
    <Playground
      stretch
      knobs={{
        level: { options: ["1", "2", "3", "4"], value: "2" },
        icon: { value: true },
        compact: { value: false },
      }}
      code={(v) =>
        jsx("Header", {
          level: Number(v.level),
          eyebrow: "Настройки",
          title: "Аудио",
          description: "Драйвер, задержка и мониторинг",
          icon: v.icon ? "audio" : undefined,
          compact: v.compact,
          actions: { expr: '<Button size="sm">Сбросить</Button>' },
        })
      }
    >
      {(v) => (
        <U.Header
          level={Number(v.level) as 1 | 2 | 3 | 4}
          eyebrow="Настройки"
          title="Аудио"
          description="Драйвер, задержка и мониторинг"
          icon={v.icon ? "audio" : undefined}
          compact={v.compact}
          actions={<U.Button size="sm">Сбросить</U.Button>}
        />
      )}
    </Playground>
  );
}
