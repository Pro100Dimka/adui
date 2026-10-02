import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function FilePickerExample() {
  return (
    <Playground
      knobs={{
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
        />
      )}
    </Playground>
  );
}
