import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function SwitchExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.Switch checked={checked} onValueChange={setChecked} label="Мониторинг входа" /><U.Switch label="Недоступно" disabled /></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
