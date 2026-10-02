import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function TiltExample() {
  return (
    <Playground
      knobs={{
        max: { options: ["8", "14", "24"], value: "14" },
        glare: { value: true },
      }}
      code={(v) =>
        jsx(
          "Tilt",
          {
            max: v.max === "14" ? undefined : Number(v.max),
            glare: v.glare ? undefined : expr("false"),
          },
          '<Card material="ruby" title="Сейчас поёт" icon="mic" />',
        )
      }
    >
      {(v) => (
        <U.Tilt max={Number(v.max)} glare={v.glare}>
          <U.Card
            material="ruby"
            title="Сейчас поёт"
            icon="mic"
            description="Release Host · 02:41"
          />
        </U.Tilt>
      )}
    </Playground>
  );
}
