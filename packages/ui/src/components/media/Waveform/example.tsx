import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function WaveformExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<U.Waveform position={value} duration={231} onSeek={setValue} />;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
