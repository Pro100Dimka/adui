import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ButtonGroupExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.ButtonGroup><U.Button icon="copy">Копировать</U.Button><U.Button icon="download">Экспорт</U.Button><U.IconButton icon="refresh" label="Обновить" /></U.ButtonGroup>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
