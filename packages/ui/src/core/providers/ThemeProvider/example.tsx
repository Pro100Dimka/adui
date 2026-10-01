import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ThemeProviderExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.ThemeProvider><U.Button variant="primary">Общая тема</U.Button></U.ThemeProvider><U.ThemeProvider tokens={{ "--ad-surface-ruby": "linear-gradient(140deg,#7b1644,#300817)", "--ad-shadow-ruby": "0 0 1.125rem #ff548955" }}><U.Button variant="primary">Локальные токены</U.Button></U.ThemeProvider></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
