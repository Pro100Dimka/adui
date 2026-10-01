import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function SceneIllustrationExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<>{(["planet", "mountains", "server", "database"] as const).map(variant => <U.SceneIllustration key={variant} variant={variant} />)}</>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
