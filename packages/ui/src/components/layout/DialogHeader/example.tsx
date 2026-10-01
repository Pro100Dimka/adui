import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function DialogHeaderExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.DialogHeader><h2>Настройки</h2><U.IconButton label="Закрыть" icon="close" variant="ghost" onClick={() => alert()} /></U.DialogHeader>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
