import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function StatusIndicatorExample() {
  const {
    value,
    setValue,
    checked,
    setChecked,
    open,
    setOpen,
    text,
    setText,
    choice,
    setChoice,
    notice,
    setNotice,
    note,
    setNote,
    history,
    setHistory,
    cursor,
    setCursor,
    anchor,
    alert,
    items,
  } = useExampleState();
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
