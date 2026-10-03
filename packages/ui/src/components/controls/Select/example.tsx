import {
  Playground,
  U,
  expr,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

const options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO", "DirectSound"];

export default function SelectExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        icon: { value: true },
        error: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        `const options = ${JSON.stringify(options)};\n\n` +
        jsx("Select", {
          label: "Аудиодрайвер",
          placeholder: "Выберите драйвер",
          options: expr("options"),
          icon: v.icon ? "audio" : undefined,
          variant: c.variant,
          size: c.size,
          labelPlacement: v.floating ? "floating" : undefined,
          description: v.error ? undefined : "ASIO даёт минимальную задержку",
          error: v.error ? "Драйвер недоступен" : undefined,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.Select
          label="Аудиодрайвер"
          placeholder="Выберите драйвер"
          options={options}
          icon={v.icon ? "audio" : undefined}
          variant={v.variant}
          size={v.size}
          labelPlacement={v.floating ? "floating" : "top"}
          description={v.error ? undefined : "ASIO даёт минимальную задержку"}
          error={v.error ? "Драйвер недоступен" : undefined}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
