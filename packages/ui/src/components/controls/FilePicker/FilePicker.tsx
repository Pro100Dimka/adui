import React, { useRef, useState } from "react";
import { define, mark } from "../../../core/base";
import { Button } from "../Button/Button";
import type { FilePickerProps } from "../shared";
export const FilePicker = define<FilePickerProps>("FilePicker", (p) => {
  const input = useRef<HTMLInputElement>(null),
    [names, setNames] = useState("");
  return (
    <div {...mark("FilePicker", p)}>
      <Button
        size={p.size}
        icon={p.icon ?? "folder"}
        onClick={() => input.current?.click()}
      >
        {p.label ?? "Выбрать файл"}
      </Button>
      <small>{names || p.description || "Файл не выбран"}</small>
      <input
        type="file"
        ref={input}
        hidden
        accept={p.accept}
        multiple={p.multiple}
        onChange={(e) => {
          const files = Array.from(e.currentTarget.files ?? []) as File[];
          setNames(files.map((f) => f.name).join(", "));
          p.onFiles?.(files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
});
