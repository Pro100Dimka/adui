import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function IconButtonExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<>{["folder", "trash", "sliders", "more"].map(icon => <U.IconButton key={icon} icon={icon} label={icon} onClick={() => alert(icon)} />)}<U.IconButton icon="play" label="Воспроизвести" round variant="primary" /></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
