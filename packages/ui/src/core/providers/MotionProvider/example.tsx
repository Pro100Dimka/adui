import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function MotionProviderExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Switch checked={checked} onValueChange={setChecked} label="Движение в этом примере" /><U.MotionProvider enabled={checked}><U.AnimatedBorder><U.WaveDecoration style={{ height: 85 }} /></U.AnimatedBorder></U.MotionProvider></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
