import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function PageHeaderExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.PageHeader eyebrow="Результат исполнения" title="Анализ исполнения" description="Общие шапки, материалы и действия" icon="wave" actions={<U.Button icon="close" onClick={() => alert()}>Закрыть</U.Button>} />;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
