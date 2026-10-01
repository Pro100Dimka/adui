import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function CardExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.Card title="Память / хранилище" description="Общая карточка с содержимым" icon="database" border><U.ProgressBar value={35} /></U.Card>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
