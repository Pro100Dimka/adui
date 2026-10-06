const e=`import { tr } from "../../../core/i18n";
import { useEffect, useRef, useState } from "react";
import { mark } from "../../../core/base";
import { Button } from "../Button/Button";
import { Icon } from "../../layout/Icon/Icon";
import { Avatar } from "../../layout/Avatar/Avatar";
import type { FilePickerProps } from "../shared";
export const FilePicker = (p: FilePickerProps) => {
  const input = useRef<HTMLInputElement>(null),
    [names, setNames] = useState(""),
    [preview, setPreview] = useState<string>(),
    [over, setOver] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => setPreview(undefined), [p.src]);
  const choose = () => (p.onPick ? p.onPick() : input.current?.click());
  const take = (files: File[]) => {
    const pickedFiles = p.variant === "avatar"
      ? files.filter((file) => file.type.startsWith("image/")).slice(0, 1)
      : files;
    if (!pickedFiles.length && p.variant === "avatar") return;
    setNames(pickedFiles.map((file) => file.name).join(", "));
    if (p.variant === "avatar") setPreview(URL.createObjectURL(pickedFiles[0]));
    p.onFiles?.(pickedFiles);
  };
  const picked = p.value ?? names;
  const fileInput = (
    <input type="file" ref={input} hidden accept={p.accept ?? (p.variant === "avatar" ? "image/*" : undefined)}
      multiple={p.variant === "avatar" ? false : p.multiple}
      onChange={(e) => {
        take(Array.from(e.currentTarget.files ?? []));
        e.currentTarget.value = "";
      }} />
  );
  if (p.variant === "avatar")
    return (
      <div {...mark("FilePicker", p)} data-variant="avatar" data-over={over || undefined}>
        <button type="button" className="ad-file-picker-avatar-button" disabled={p.disabled}
          aria-label={p.label ?? tr("Изменить фото")}
          onClick={choose}
          onDragOver={(e) => { e.preventDefault(); if (!p.disabled) setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            if (!p.disabled) take(Array.from(e.dataTransfer.files));
          }}>
          <Avatar name={p.name} src={preview ?? p.src} variant={p.avatarVariant ?? "host"} size={p.size} />
          <span className="ad-file-picker-avatar-edit" aria-hidden="true"><Icon name={p.icon ?? "pencil"} /></span>
        </button>
        {fileInput}
      </div>
    );
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
        {fileInput}
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
      {fileInput}
    </div>
  );
};
`;export{e as default};
