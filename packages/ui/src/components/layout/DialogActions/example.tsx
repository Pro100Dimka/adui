import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function DialogActionsExample() {
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
  const demo = (
    <U.DialogActions>
      <U.Button onClick={() => alert("Отмена")}>Отмена</U.Button>
      <U.Button variant="primary" onClick={() => alert("Сохранено")}>
        Сохранить
      </U.Button>
    </U.DialogActions>
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
