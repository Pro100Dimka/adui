import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function IconTileExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<>{["music", "chip", "database", "users", "stethoscope"].map(icon => <U.IconTile key={icon} icon={icon} />)}</>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
