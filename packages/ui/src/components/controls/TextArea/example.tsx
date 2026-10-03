import {
  Playground,
  U,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

export default function TextAreaExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        error: { value: false },
        readOnly: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("TextArea", {
          label: "Комментарий к записи",
          placeholder: "Что получилось, что исправить…",
          variant: c.variant,
          size: c.size,
          labelPlacement: v.floating ? "floating" : undefined,
          description: v.error ? undefined : "Видят только участники комнаты",
          error: v.error ? "Не больше 500 символов" : undefined,
          readOnly: v.readOnly,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.TextArea
          label="Комментарий к записи"
          placeholder="Что получилось, что исправить…"
          variant={v.variant}
          size={v.size}
          labelPlacement={v.floating ? "floating" : "top"}
          description={v.error ? undefined : "Видят только участники комнаты"}
          error={v.error ? "Не больше 500 символов" : undefined}
          readOnly={v.readOnly}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
