import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function SelectExample() {
  const {notice,setNotice}=useExampleState();
  const demo=<U.Stack gap={2}>{(["xs","sm","md","lg"] as const).map(size=><U.Select key={size} size={size} label={`Драйвер · ${size}`} options={["WASAPI Shared", "WASAPI Exclusive", "ASIO"]} />)}</U.Stack>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
