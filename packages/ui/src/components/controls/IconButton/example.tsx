import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function IconButtonExample() {
  const {notice,setNotice,alert}=useExampleState();
  const demo=<U.ButtonGroup><U.IconButton icon="folder" label="Открыть папку" onClick={() => alert("Открыть папку")} /><U.IconButton icon="trash" label="Удалить" variant="danger" onClick={() => alert("Удалить")} /><U.IconButton icon="sliders" label="Параметры" onClick={() => alert("Параметры")} /><U.IconButton icon="more" label="Ещё" onClick={() => alert("Ещё")} /><U.IconButton icon="play" label="Воспроизвести" variant="primary" onClick={() => alert("Воспроизвести")} /></U.ButtonGroup>;
  return <>{row(demo)}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
