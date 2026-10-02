import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function DialogExample() {
  const { open, setOpen, notice, setNotice, alert } = useExampleState();
  const demo = (
    <>
      <U.Button onClick={() => setOpen(true)} icon="grid">
        Открыть диалог
      </U.Button>
      <U.Dialog
        open={open}
        onOpenChange={setOpen}
        title="Сохранить настройки?"
        description="Общий React-диалог. Escape закрывает окно и возвращает фокус."
        onConfirm={() => alert("Настройки сохранены")}
      />
    </>
  );
  return (
    <>
      {demo}
      <U.Toast
        floating
        open={!!notice}
        message={notice}
        onClose={() => setNotice("")}
      />
    </>
  );
}
