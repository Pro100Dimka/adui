import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function SurfaceExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.Surface border><U.Text>Общая поверхность</U.Text><U.Text as="p" variant="muted">Материал отделён от содержимого и расположения.</U.Text></U.Surface>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
