import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function SelectExample(){const {notice,setNotice}=useExampleState();const demo=<U.Stack direction="row" gap={2} wrap>{(["xs","sm","md","lg"] as const).map(size=><U.Select key={size} size={size} label={size.toUpperCase()} options={["WASAPI Shared","WASAPI Exclusive","ASIO"]} style={{flex:"1 1 9rem"}}/>)}</U.Stack>;return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")}/></>}
