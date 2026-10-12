import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function SignalBarsExample() {
  return (
    <Playground
      knobs={{
        level: { value: 3, min: 1, max: 4 },
        weak: { value: false },
      }}
      code={(v) =>
        jsx("SignalBars", {
          level: v.level,
          weak: v.weak ? true : undefined,
        })
      }
    >
      {(v) => (
        <U.Stack direction="row" gap={3} align="center">
          <U.SignalBars level={v.level} weak={v.weak} style={{ fontSize: "2rem" }} />
          <U.Typography variant="title">{v.weak ? "Связь неустойчива" : "Связь хорошая"}</U.Typography>
        </U.Stack>
      )}
    </Playground>
  );
}
