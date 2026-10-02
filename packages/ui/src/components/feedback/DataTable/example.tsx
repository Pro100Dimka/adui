import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function DataTableExample() {
  const { notice, setNotice } = useExampleState();
  const demo = <U.DataTable />;
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
