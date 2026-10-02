import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function ParticipantCardExample() {
  const { notice, setNotice } = useExampleState();
  const demo = <U.ParticipantCard />;
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
