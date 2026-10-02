import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function WaveDecorationExample() {
  const { notice, setNotice } = useExampleState();
  const demo = <U.WaveDecoration style={{ height: 150 }} />;
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
