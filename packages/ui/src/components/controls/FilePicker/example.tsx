import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function FilePickerExample() {
  return (
    <Playground
      knobs={{
        variant: { options: ["button", "zone"], value: "button" },
        size: { options: sizes, value: "md" },
        multiple: { value: false },
      }}
      code={(v, c) =>
        jsx("FilePicker", {
          label: "Выбрать запись",
          description: "WAV, MP3 или FLAC",
          accept: "audio/*",
          multiple: v.multiple,
          size: c.size,
          variant: v.variant === "button" ? undefined : v.variant,
        })
      }
    >
      {(v) => (
        <U.FilePicker
          label="Выбрать запись"
          description="WAV, MP3 или FLAC"
          accept="audio/*"
          multiple={v.multiple}
          size={v.size}
          variant={v.variant as "button" | "zone"}
        />
      )}
    </Playground>
  );
}
