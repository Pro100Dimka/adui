import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ButtonExample() {
  const {value,setValue,checked,setChecked,open,setOpen,text,setText,choice,setChoice,notice,setNotice,note,setNote,history,setHistory,cursor,setCursor,anchor,alert,items}=useExampleState();
  const demo=row(<><U.Button variant="primary" icon="save" onClick={() => alert("Сохранено")}>Сохранить</U.Button><U.Button>Отмена</U.Button><U.Button variant="ghost">Подробнее</U.Button><U.Button variant="danger">Удалить</U.Button><U.Button disabled>Недоступно</U.Button><U.Button loading>Загрузка</U.Button></>);
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
