import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function SparklineExample() {
  const { notice, setNotice } = useExampleState();
  const demo = <U.Sparkline />;
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
