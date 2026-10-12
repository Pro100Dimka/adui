import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ProgressBarExample() {
  return (
    <Playground
      stretch
      knobs={{
        value: { value: 35, min: 0, max: 100 },
        indeterminate: { value: false },
      }}
      code={(v) =>
        jsx("ProgressBar", {
          label: "Обработка записи",
          value: v.indeterminate ? undefined : v.value,
          indeterminate: v.indeterminate,
        })
      }
    >
      {(v) => (
        <U.Stack gap={2}>
          <U.Stack direction="row" justify="between">
            <U.Typography variant="label">Обработка записи</U.Typography>
            <U.Typography variant="mono" tone="muted">
              {v.indeterminate ? "…" : `${v.value}%`}
            </U.Typography>
          </U.Stack>
          <U.ProgressBar
            label="Обработка записи"
            value={v.value}
            indeterminate={v.indeterminate}
          />
        </U.Stack>
      )}
    </Playground>
  );
}
