import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function StatusIndicatorExample() {
  const { open, notice, setNotice } = useExampleState();
  const demo = row(
    <>
      {(["success", "processing", "pending", "error", "offline"] as const).map(
        (status) => (
          <U.StatusIndicator key={status} status={status} />
        ),
      )}
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
