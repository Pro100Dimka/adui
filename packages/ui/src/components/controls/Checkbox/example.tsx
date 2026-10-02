import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function CheckboxExample() {
  return (
    <Playground
      knobs={{
        size: { options: sizes, value: "md" },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("Checkbox", {
          label: "Сохранять запись после выступления",
          defaultChecked: true,
          size: c.size,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.Stack gap={3}>
          <U.Checkbox
            label="Сохранять запись после выступления"
            defaultChecked
            size={v.size}
            disabled={v.disabled}
          />
          <U.Checkbox
            label="Отправлять анализ на почту"
            size={v.size}
            disabled={v.disabled}
          />
        </U.Stack>
      )}
    </Playground>
  );
}
