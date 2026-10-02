import { useState } from "react";
import { Button, Toast } from "@ad-voice/ui";

export default function ToastExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon="save" onClick={() => setOpen(true)}>
        Сохранить
      </Button>
      <Toast
        floating
        open={open}
        message="Настройки сохранены"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
