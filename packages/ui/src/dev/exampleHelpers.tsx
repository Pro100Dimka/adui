import React, { useRef, useState } from "react";
import * as UI from "../index";
import * as Editor from "../editor";
import type { NoteGeometry } from "../editor";
export const U = { ...UI, ...Editor };
export const row = (children: React.ReactNode) => <div className="sample-row">{children}</div>;
export function useExampleState() {
  const [value,setValue]=useState(35), [checked,setChecked]=useState(true), [open,setOpen]=useState(false);
  const [text,setText]=useState("Дмитрий"), [choice,setChoice]=useState("one"), [notice,setNotice]=useState("");
  const [note,setNote]=useState<NoteGeometry>({x:25,y:54,width:95}); const [history,setHistory]=useState([0]), [cursor,setCursor]=useState(0);
  const anchor=useRef<HTMLButtonElement>(null); const alert=(message="Действие выполнено в примере")=>setNotice(message);
  const items=[{label:"Переименовать",icon:"pencil",onSelect:()=>alert("Переименование выбрано")},{label:"Копировать",icon:"copy",onSelect:()=>{void U.copyText("A&D UI");alert("Скопировано");}},{separator:true},{label:"Удалить",icon:"trash",danger:true,onSelect:()=>alert("Удаление выбрано. Файлы не затрагиваются.")}];
  return {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items};
}
