import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function CheckboxExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.Checkbox checked={checked} onValueChange={setChecked} label="Включить параметр" /><U.Checkbox label="Выключенный" /></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
