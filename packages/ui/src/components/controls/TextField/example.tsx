import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function TextFieldExample() {
  const {text,setText,notice,setNotice}=useExampleState();
  const demo=<U.Stack gap={2}>{(["xs","sm","md","lg"] as const).map(size=><U.TextField key={size} size={size} value={text} onValueChange={setText} clearable icon="user" label={`Имя · ${size}`} placeholder={size.toUpperCase()} />)}</U.Stack>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
