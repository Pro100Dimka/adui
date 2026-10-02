import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function ToastExample() {
  const { open, notice, setNotice, alert } = useExampleState();
  const demo = (
    <>
      <U.Toast message="Настройки сохранены" />
      <U.Button onClick={() => alert("Всплывающее уведомление")}>
        Показать уведомление
      </U.Button>
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
