import { useState } from "react";
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

export default function ToggleButtonExample() {
  const [on, setOn] = useState(true);
  return (
    <Playground
      knobs={{
        size: { options: sizes, value: "md" },
        icon: { value: true },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx(
          "ToggleButton",
          {
            checked: expr("on"),
            onValueChange: expr("setOn"),
            icon: v.icon ? "mic" : undefined,
            size: c.size,
            disabled: v.disabled,
          },
          "Микрофон",
        )
      }
    >
      {(v) => (
        <U.ToggleButton
          checked={on}
          onValueChange={setOn}
          icon={v.icon ? "mic" : undefined}
          size={v.size}
          disabled={v.disabled}
        >
          Микрофон
        </U.ToggleButton>
      )}
    </Playground>
  );
}
