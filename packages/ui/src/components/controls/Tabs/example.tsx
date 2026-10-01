import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function TabsExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.Tabs value={choice} onValueChange={setChoice} items={[{ value: "one", label: "Внешний вид", icon: "palette", id: "demo-tab-one", panelId: "demo-panel" }, { value: "two", label: "Аудио", icon: "audio", id: "demo-tab-two", panelId: "demo-panel" }, { value: "three", label: "Ключи ENV", icon: "key", id: "demo-tab-three", panelId: "demo-panel" }]} /><U.TabPanel id="demo-panel" labelledBy={`demo-tab-${choice}`}>Выбрана вкладка: {choice}</U.TabPanel></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
