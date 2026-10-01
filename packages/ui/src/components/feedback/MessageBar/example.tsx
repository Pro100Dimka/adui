import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function MessageBarExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.MessageBar tone="error">Недостаточно свободного места</U.MessageBar><U.MessageBar tone="success">Все параметры сохранены</U.MessageBar></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
