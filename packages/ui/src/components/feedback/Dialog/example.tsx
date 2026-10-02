import { useState } from "react";
import { Button, Dialog } from "@ad-voice/ui";

export default function DialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" icon="trash" onClick={() => setOpen(true)}>
        Удалить запись
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        danger
        title="Удалить запись?"
        description="Файл и результаты анализа будут удалены без возможности восстановления."
        confirmLabel="Удалить"
        onConfirm={() => new Promise((done) => setTimeout(done, 800))}
      />
    </>
  );
}
