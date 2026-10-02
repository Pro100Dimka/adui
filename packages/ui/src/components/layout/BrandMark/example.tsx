import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function BrandMarkExample() {
  const { open, notice, setNotice } = useExampleState();
  const demo = <U.BrandMark />;
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
