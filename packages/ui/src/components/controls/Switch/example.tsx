import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function SwitchExample() {
  const {checked,setChecked,notice,setNotice}=useExampleState();
  const demo=<U.Stack gap={2}>{(["xs","sm","md","lg"] as const).map(size=><U.Switch key={size} size={size} checked={checked} onValueChange={setChecked} label={`Мониторинг · ${size}`} />)}</U.Stack>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
