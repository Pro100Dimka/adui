import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function TextExample() {
  const { open, notice, setNotice } = useExampleState();
  const demo = (
    <div className="typography-sample">
      <U.Text as="h2" variant="title">
        Заголовок
      </U.Text>
      <U.Text>Основной текст интерфейса</U.Text>
      <U.Text variant="muted">Описание и вспомогательные подписи</U.Text>
      <U.Text variant="eyebrow">A&D VOICE</U.Text>
    </div>
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
