import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function TiltExample() {
  return (
    <Playground
      knobs={{
        max: { value: 14, min: 8, max: 24 },
        glare: { value: true },
      }}
      code={(v) =>
        jsx(
          "Tilt",
          {
            max: v.max === 14 ? undefined : v.max,
            glare: v.glare ? undefined : expr("false"),
          },
          '<Card material="ruby" title="Сейчас поёт" icon="mic" />',
        )
      }
    >
      {(v) => (
        <U.Tilt max={v.max} glare={v.glare}>
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
