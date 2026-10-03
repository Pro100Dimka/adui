import {
  Compare,
  Playground,
  U,
  expr,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

export default function TextFieldExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        icon: { value: true },
        clearable: { value: true },
        required: { value: false },
        error: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("TextField", {
          label: "Имя в комнате",
          placeholder: "Как вас называть?",
          variant: c.variant,
          size: c.size,
          labelPlacement: v.floating ? "floating" : undefined,
          startAdornment: v.icon ? expr('<Icon name="user" />') : undefined,
          clearable: v.clearable,
          required: v.required,
          description: v.error ? undefined : "Видно другим участникам",
          error: v.error ? "Имя уже занято" : undefined,
          disabled: v.disabled,
        })
      }
      extra={
        <Compare
          items={inputVariants.map((variant) => ({
            label: variant,
            node: (
              <U.TextField
                variant={variant}
                size="sm"
                placeholder="Поиск"
                startAdornment={<U.Icon name="search" />}
              />
            ),
          }))}
        />
      }
    >
      {(v) => (
        <U.TextField
          label="Имя в комнате"
          placeholder="Как вас называть?"
          defaultValue="Дмитрий"
          variant={v.variant}
          size={v.size}
          labelPlacement={v.floating ? "floating" : "top"}
          startAdornment={v.icon ? <U.Icon name="user" /> : undefined}
          clearable={v.clearable}
          required={v.required}
          description={v.error ? undefined : "Видно другим участникам"}
          error={v.error ? "Имя уже занято" : undefined}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
