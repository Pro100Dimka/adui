import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function RoleEmblemExample() {
  const { notice, setNotice } = useExampleState();
  const demo = row(
    <>
      <U.RoleEmblem />
      <U.RoleEmblem role="guest" />
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
