import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function AvatarExample() {
  const { open, notice, setNotice } = useExampleState();
  const demo = row(
    <>
      <U.Avatar name="Дмитрий" />
      <U.Avatar name="Анна" />
      <U.Avatar name="Богдан" />
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
