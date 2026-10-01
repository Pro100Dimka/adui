import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ToggleButtonExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.ToggleButton checked={checked} onValueChange={setChecked} icon="volume" label="Выключить звук" /><U.ToggleButton icon="wave">Прослушивание</U.ToggleButton><U.Text variant="muted">Выбрано: {String(checked)}</U.Text></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
