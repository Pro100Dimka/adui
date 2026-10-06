import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function FilePickerExample() {
  return (
    <Playground
      knobs={{
        variant: { options: ["avatar", "button", "zone"], value: "avatar" },
        size: { options: sizes, value: "md" },
        multiple: { value: false },
      }}
      code={(v, c) => {
        const avatar = v.variant === "avatar";
        return jsx("FilePicker", {
          label: avatar ? "Изменить фото" : "Выбрать запись",
          description: avatar ? undefined : "WAV, MP3 или FLAC",
          name: avatar ? "Pro100Yojik" : undefined,
          accept: avatar ? "image/*" : "audio/*",
          multiple: avatar ? undefined : v.multiple,
          size: c.size,
          variant: v.variant === "button" ? undefined : v.variant,
        });
      }}
    >
      {(v) => {
        const avatar = v.variant === "avatar";
        return (
        <U.FilePicker
          label={avatar ? "Изменить фото" : "Выбрать запись"}
          description={avatar ? undefined : "WAV, MP3 или FLAC"}
          name={avatar ? "Pro100Yojik" : undefined}
          accept={avatar ? "image/*" : "audio/*"}
          multiple={avatar ? false : v.multiple}
          size={v.size}
          variant={v.variant as "avatar" | "button" | "zone"}
        />
        );
      }}
    </Playground>
  );
}
