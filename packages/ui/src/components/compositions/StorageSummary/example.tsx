import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function StorageSummaryExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.StorageSummary onTemporaryFiles={() => alert("Временных файлов нет")} />;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
