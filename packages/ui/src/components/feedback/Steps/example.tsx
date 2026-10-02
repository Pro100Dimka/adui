import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function StepsExample() {
  const { notice, setNotice } = useExampleState();
  const demo = <U.Steps current={3} />;
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
