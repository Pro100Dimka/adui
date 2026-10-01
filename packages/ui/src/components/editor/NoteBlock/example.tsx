import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function NoteBlockExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><div className="sample-note-world"><U.NoteBlock value={note} onChange={setNote} /></div><span className="sample-note">Перетаскивайте ноту и её правый край. Стрелки тоже работают.</span></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
