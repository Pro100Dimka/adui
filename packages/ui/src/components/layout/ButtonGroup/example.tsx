import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function ButtonGroupExample() {
  const {notice,setNotice,alert}=useExampleState();
  const demo=<U.ButtonGroup><U.Button icon="copy" onClick={() => alert("Копировать")}>Копировать</U.Button><U.Button icon="download" onClick={() => alert("Экспорт")}>Экспорт</U.Button><U.IconButton icon="refresh" label="Обновить" onClick={() => alert("Обновить")} /><U.IconButton icon="play" label="Запустить" variant="primary" onClick={() => alert("Запустить")} /></U.ButtonGroup>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
