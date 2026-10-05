const e=`import { tr } from "../../../core/i18n";
import { useRef, useState } from "react";
import { mark } from "../../../core/base";
import { Button } from "../Button/Button";
import { Icon } from "../../layout/Icon/Icon";
import type { FilePickerProps } from "../shared";
export const FilePicker = (p: FilePickerProps) => {
  const input = useRef<HTMLInputElement>(null),
    [names, setNames] = useState(""),
    [over, setOver] = useState(false);
  const choose = () => (p.onPick ? p.onPick() : input.current?.click());
  const take = (files: File[]) => {
    setNames(files.map((f) => f.name).join(", "));
    p.onFiles?.(files);
  };
  const picked = p.value ?? names;
  if (p.variant === "zone")
    return (
      <button
        type="button"
        {...mark("FilePicker", p)}
        data-variant="zone"
        data-over={over || undefined}
        disabled={p.disabled}
        onClick={choose}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(Array.from(e.dataTransfer.files));
        }}
      >
        <Icon name={p.icon ?? "upload"} />
        <span className="ad-file-picker-text">
          <strong>{p.label ?? tr("Выбрать файл")}</strong>
          <small key={picked} data-picked={!!picked || undefined}>
            {picked || p.description || tr("или перетащите его сюда")}
          </small>
        </span>
        <input
          type="file"
          ref={input}
          hidden
          accept={p.accept}
          multiple={p.multiple}
          onChange={(e) => {
            take(Array.from(e.currentTarget.files ?? []) as File[]);
            e.currentTarget.value = "";
          }}
        />
      </button>
    );
  return (
    <div {...mark("FilePicker", p)}>
      <Button
        size={p.size}
        icon={p.icon ?? "folder"}
        disabled={p.disabled}
        onClick={choose}
      >
        {p.label ?? tr("Выбрать файл")}
      </Button>
      <small key={picked} data-picked={!!picked || undefined}>
        {picked || p.description || tr("Файл не выбран")}
      </small>
      <input
        type="file"
        ref={input}
        hidden
        accept={p.accept}
        multiple={p.multiple}
        onChange={(e) => {
          take(Array.from(e.currentTarget.files ?? []) as File[]);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
};
`;export{e as default};
