import { useRef, useState } from "react";
import { Button, Menu } from "@ad-voice/ui";

export default function MenuExample() {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={anchor}
        icon="more"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Действия
      </Button>
      <Menu
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        items={[
          { label: "Переименовать", icon: "pencil" },
          { label: "Скачать", icon: "download" },
          { separator: true },
          { label: "Удалить", icon: "trash", danger: true },
        ]}
      />
    </>
  );
}
