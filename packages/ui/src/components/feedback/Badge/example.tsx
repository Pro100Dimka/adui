import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function BadgeExample() {
  const { notice, setNotice } = useExampleState();
  const demo = row(
    <>
      <U.Badge>GPU</U.Badge>
      <U.Badge>Вы</U.Badge>
      <U.Badge tone="success">Готово</U.Badge>
      <U.Badge tone="error">Ошибка</U.Badge>
    </>,
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
