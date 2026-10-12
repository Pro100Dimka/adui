import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function HeaderExample() {
  return (
    <Playground
      stretch
      knobs={{
        level: { value: 2, min: 1, max: 4 },
        icon: { value: true },
        compact: { value: false },
      }}
      code={(v) =>
        jsx("Header", {
          level: v.level,
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
          level={v.level as 1 | 2 | 3 | 4}
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
