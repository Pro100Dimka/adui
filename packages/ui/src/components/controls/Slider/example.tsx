import { useState } from "react";
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

export default function SliderExample() {
  const [volume, setVolume] = useState(65);
  return (
    <Playground
      stretch
      knobs={{
        size: { options: sizes, value: "md" },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("Slider", {
          label: "Громкость",
          value: expr("volume"),
          onValueChange: expr("setVolume"),
          size: c.size,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.Stack gap={2}>
          <U.Stack direction="row" justify="between" align="center">
            <U.Typography variant="label">Громкость</U.Typography>
            <U.Typography variant="mono" tone="muted">
              {volume}%
            </U.Typography>
          </U.Stack>
          <U.Slider
            label="Громкость"
            value={volume}
            onValueChange={setVolume}
            size={v.size}
            disabled={v.disabled}
          />
        </U.Stack>
      )}
    </Playground>
  );
}
