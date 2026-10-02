import {
  Playground,
  U,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

export default function NumberFieldExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("NumberField", {
          label: "Задержка, мс",
          description: "От 0 до 500 с шагом 10",
          min: 0,
          max: 500,
          step: 10,
          defaultValue: 120,
          variant: c.variant,
          size: c.size,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.NumberField
          label="Задержка, мс"
          description="От 0 до 500 с шагом 10"
          min={0}
          max={500}
          step={10}
          defaultValue={120}
          variant={v.variant}
          size={v.size}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
