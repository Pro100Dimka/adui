import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function FieldExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.Field label="Имя в комнате" required description="Его увидят другие участники." info="Имя отображается в списке участников"><U.TextField value={text} onValueChange={setText} /></U.Field>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
