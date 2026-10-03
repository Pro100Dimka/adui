import {
  Playground,
  U,
  expr,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

const options = [
  "WASAPI Shared",
  "WASAPI Exclusive",
  "ASIO",
  "DirectSound",
  "Core Audio",
];

export default function AutocompleteExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        clearable: { value: true },
        disabled: { value: false },
      }}
      code={(v, c) =>
        `const options = ${JSON.stringify(options)};\n\n` +
        jsx("Autocomplete", {
          label: "Аудиодрайвер",
          placeholder: "Начните вводить…",
          description: "Подсказки фильтруются по мере ввода",
          options: expr("options"),
          startAdornment: expr('<Icon name="search" />'),
          variant: c.variant,
          size: c.size,
          labelPlacement: v.floating ? "floating" : undefined,
          clearable: v.clearable,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.Autocomplete
          label="Аудиодрайвер"
          placeholder="Начните вводить…"
          description="Подсказки фильтруются по мере ввода"
          options={options}
          startAdornment={<U.Icon name="search" />}
          variant={v.variant}
          size={v.size}
          labelPlacement={v.floating ? "floating" : "top"}
          clearable={v.clearable}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
