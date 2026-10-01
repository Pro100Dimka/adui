import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function CircularGaugeExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><div className="sample-row sample-knob-row"><U.CircularGauge diameter={180} value={72} label="Микрофон" /></div><span className="sample-note">CircularGauge — read-only вариант того же точного регулятора: визуал идентичен RotaryKnob, но пользователь не может менять значение.</span></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
