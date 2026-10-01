import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function UndoRedoControlsExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.Button onClick={() => { setHistory([...history.slice(0, cursor + 1), history[cursor] + 1]); setCursor(cursor + 1); }}>Изменить</U.Button><strong>{history[cursor]}</strong><U.UndoRedoControls canUndo={cursor > 0} canRedo={cursor < history.length - 1} onUndo={() => setCursor(c => c - 1)} onRedo={() => setCursor(c => c + 1)} /></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
