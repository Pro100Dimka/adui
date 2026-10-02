import { Compare, Playground, U, jsx } from "../../../dev/exampleHelpers";

const tones = ["none", "success", "warning", "error", "info"] as const;

export default function BadgeExample() {
  return (
    <Playground
      knobs={{ tone: { options: tones, value: "success" } }}
      code={(v) =>
        jsx("Badge", { tone: v.tone === "none" ? undefined : v.tone }, "Готово")
      }
      extra={
        <Compare
          items={tones.map((tone) => ({
            label: tone,
            node: (
              <U.Badge tone={tone === "none" ? undefined : tone}>Метка</U.Badge>
            ),
          }))}
        />
      }
    >
      {(v) => (
        <U.Badge tone={v.tone === "none" ? undefined : v.tone}>Готово</U.Badge>
      )}
    </Playground>
  );
}
