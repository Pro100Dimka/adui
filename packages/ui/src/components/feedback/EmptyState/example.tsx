import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function EmptyStateExample() {
  const { open, notice, setNotice, alert } = useExampleState();
  const demo = (
    <U.EmptyState
      action={
        <U.Button variant="primary" icon="plus" onClick={() => alert()}>
          Добавить запись
        </U.Button>
      }
    />
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
