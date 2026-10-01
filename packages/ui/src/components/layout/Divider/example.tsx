import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function DividerExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Text>Горизонтальный</U.Text><U.Divider />{row(<><U.Text>Слева</U.Text><U.Divider vertical /><U.Text>Справа</U.Text></>)}</>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
