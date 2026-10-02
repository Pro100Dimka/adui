import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function MessageBarExample() {
  const { notice, setNotice } = useExampleState();
  const demo = (
    <>
      <U.MessageBar tone="error">Недостаточно свободного места</U.MessageBar>
      <U.MessageBar tone="success">Все параметры сохранены</U.MessageBar>
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
