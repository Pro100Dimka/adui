import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function MenuExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Button ref={anchor} icon="more" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>Открыть меню</U.Button><U.Menu open={open} onOpenChange={setOpen} anchorRef={anchor} items={items} /></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
