import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function DialogExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Button onClick={() => setOpen(true)} icon="grid">Открыть диалог</U.Button><U.Dialog open={open} onOpenChange={setOpen} title="Сохранить настройки?" description="Общий React-диалог. Escape закрывает окно и возвращает фокус." onConfirm={() => alert("Настройки сохранены")} /></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
