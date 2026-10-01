import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function MenuItemExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<div role="menu"><U.MenuItem label="Переименовать" icon="pencil" onSelect={() => alert("Переименовать")} /><U.MenuItem label="Удалить" icon="trash" danger onSelect={() => alert("Удалить")} /></div>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
