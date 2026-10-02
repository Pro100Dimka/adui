import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function RotaryKnobExample() {
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
    <>
      <div className="sample-row sample-knob-row">
        <U.RotaryKnob
          diameter={300}
          value={value}
          onValueChange={setValue}
          onValueCommit={(v) => setNotice(`Громкость: ${v}%`)}
          label="Громкость"
        />
      </div>
      <span className="sample-note">
        Это прямой React-порт premium-knob-interactive-neon(2).html: круговой
        drag, линейный drag из центра, выбор по шкале, колесо, клавиатура,
        Shift, Escape и double-click reset.
      </span>
    </>
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
