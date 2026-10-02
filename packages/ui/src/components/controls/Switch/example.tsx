import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function SwitchExample() {
  return (
    <Playground
      knobs={{
        size: { options: sizes, value: "md" },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("Switch", {
          label: "Мониторинг голоса",
          defaultChecked: true,
          size: c.size,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.Stack gap={3}>
          <U.Switch
            label="Мониторинг голоса"
            defaultChecked
            size={v.size}
            disabled={v.disabled}
          />
          <U.Switch
            label="Шумоподавление"
            size={v.size}
            disabled={v.disabled}
          />
        </U.Stack>
      )}
    </Playground>
  );
}
