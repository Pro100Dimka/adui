import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function CopyableFieldExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.CopyableField defaultValue="AD-DEMO-ROOM-2026" label="Код комнаты" />;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
