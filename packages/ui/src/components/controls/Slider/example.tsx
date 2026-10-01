import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function SliderExample() {
  const {value,setValue,notice,setNotice}=useExampleState();
  const demo=<U.Stack gap={2}>{(["xs","sm","md","lg"] as const).map(size=><U.Stack key={size} direction="row" gap={2} align="center"><U.Typography variant="caption" tone="muted">{size.toUpperCase()}</U.Typography><U.Slider size={size} value={value} onValueChange={setValue} label={`Громкость ${size}`} /></U.Stack>)}</U.Stack>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
