import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function NumberFieldExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.NumberField label="Порт" defaultValue={8081} min={1} max={65535} />;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
