import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const materials = ["card", "glass", "ruby", "tile", "shell"] as const;

export default function CardExample() {
  return (
    <Playground
      stretch
      knobs={{
        material: { options: materials, value: "card" },
        border: { value: false },
      }}
      code={(v) =>
        jsx(
          "Card",
          {
            title: "Микрофон",
            description: "Shure SM58 · 48 kHz",
            icon: "mic",
            material: v.material === "card" ? undefined : v.material,
            border: v.border,
          },
          '<Button size="sm">Проверить</Button>',
        )
      }
    >
      {(v) => (
        <U.Card
          title="Микрофон"
          description="Shure SM58 · 48 kHz"
          icon="mic"
          material={v.material}
          border={v.border}
        >
          <U.Button size="sm">Проверить</U.Button>
        </U.Card>
      )}
    </Playground>
  );
}
