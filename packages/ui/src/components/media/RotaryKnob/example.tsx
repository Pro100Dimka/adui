import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

export default function RotaryKnobExample() {
  return (
    <Playground
      knobs={{
        size: { options: sizes.filter((s) => s !== "xs"), value: "md" },
        readOnly: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("RotaryKnob", {
          label: "Громкость",
          value: expr("volume"),
          onValueChange: expr("setVolume"),
          size: c.size,
          readOnly: v.readOnly,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.RotaryKnob
          label="Громкость"
          defaultValue={65}
          size={v.size}
          readOnly={v.readOnly}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
