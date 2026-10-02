import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ToolbarExample() {
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
    <U.Toolbar>
      <U.ButtonGroup>
        <U.ToggleButton icon="cursor" label="Выделение" defaultChecked />
        <U.IconButton icon="pencil" label="Карандаш" />
        <U.IconButton icon="eraser" label="Ластик" />
      </U.ButtonGroup>
      <U.Divider vertical />
      <U.Select options={["C#4", "D4", "E4"]} label="Тональность" />
      <U.Button
        icon="save"
        variant="primary"
        onClick={() => alert("Сохранено")}
      >
        Сохранить
      </U.Button>
    </U.Toolbar>
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
