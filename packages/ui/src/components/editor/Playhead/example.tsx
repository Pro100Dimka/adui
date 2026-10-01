import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function PlayheadExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<div className="sample-note-world"><U.Playhead x={85} /></div>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
