import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function TextFieldExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=<><U.TextField value={text} onValueChange={setText} clearable icon="user" label="Имя" /><U.TextField placeholder="Пустое поле" /><U.Field label="Ошибка" error="Проверьте введённое значение"><U.TextField defaultValue="Неверный код" /></U.Field></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
