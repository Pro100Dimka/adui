import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function KeyValueListExample() {
  const { open, notice, setNotice } = useExampleState();
  const demo = <U.KeyValueList />;
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
