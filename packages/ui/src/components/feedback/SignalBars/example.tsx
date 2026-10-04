import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function SignalBarsExample() {
  return (
    <Playground
      knobs={{
        level: { options: ["1", "2", "3", "4"], value: "3" },
        weak: { value: false },
      }}
      code={(v) =>
        jsx("SignalBars", {
          level: expr(v.level),
          weak: v.weak ? true : undefined,
        })
      }
    >
      {(v) => (
        <U.Stack direction="row" gap={3} align="center">
          <U.SignalBars level={Number(v.level)} weak={v.weak} style={{ fontSize: "2rem" }} />
          <U.Typography variant="title">{v.weak ? "Связь неустойчива" : "Связь хорошая"}</U.Typography>
        </U.Stack>
      )}
    </Playground>
  );
}
