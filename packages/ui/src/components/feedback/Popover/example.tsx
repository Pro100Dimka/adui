import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function PopoverExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Button ref={anchor} icon="sliders" onClick={() => setOpen(v => !v)}>Открыть параметры</U.Button><U.Popover open={open} onOpenChange={setOpen} anchorRef={anchor} label="Громкость"><U.VolumeControl value={value} onValueChange={setValue} /></U.Popover></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
