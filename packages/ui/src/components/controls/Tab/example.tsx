import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

/** A single Tab is the building block of Tabs; most screens use Tabs directly. */
export default function TabExample() {
  return (
    <Playground
      knobs={{
        size: { options: sizes, value: "md" },
        selected: { value: true },
      }}
      code={(v, c) =>
        jsx(
          "Tab",
          { icon: "audio", selected: v.selected, size: c.size },
          "Аудио",
        )
      }
    >
      {(v) => (
        <div role="tablist" aria-label="Пример вкладки">
          <U.Tab icon="audio" selected={v.selected} size={v.size}>
            Аудио
          </U.Tab>
        </div>
      )}
    </Playground>
  );
}
