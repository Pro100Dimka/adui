import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function DialogActionsExample() {
  const { notice, setNotice, alert } = useExampleState();
  const demo = (
    <U.DialogActions>
      <U.Button onClick={() => alert("Отмена")}>Отмена</U.Button>
      <U.Button variant="primary" onClick={() => alert("Сохранено")}>
        Сохранить
      </U.Button>
    </U.DialogActions>
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
