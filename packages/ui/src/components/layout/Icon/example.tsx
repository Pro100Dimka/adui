import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function IconExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<>{["music", "audio", "folder", "wave", "chip", "users", "sliders", "save"].map(icon => <div key={icon} className="icon-specimen"><U.Icon name={icon} size={27} /><small>{icon}</small></div>)}</>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
