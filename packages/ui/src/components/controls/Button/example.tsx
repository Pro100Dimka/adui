import React from "react";
import { U, row, useExampleState } from "../../../dev/exampleHelpers";
export default function ButtonExample() {
  const {notice,setNotice,alert}=useExampleState();
  const demo=<><U.Stack gap={3}>{(["xs","sm","md","lg"] as const).map(size=><U.Stack key={size} direction="row" gap={2} align="center" wrap><U.Typography variant="caption" tone="muted">{size.toUpperCase()}</U.Typography><U.Button size={size} variant="primary" icon="save" onClick={() => alert("Сохранено")}>Сохранить</U.Button><U.Button size={size}>Отмена</U.Button><U.IconButton size={size} icon="settings" label="Настройки" /></U.Stack>)}</U.Stack><U.Divider /><U.Stack direction="row" gap={2} wrap><U.Button variant="ghost">Подробнее</U.Button><U.Button variant="danger">Удалить</U.Button><U.Button disabled>Недоступно</U.Button><U.Button loading>Загрузка</U.Button></U.Stack></>;
  return <>{demo}<U.Toast floating open={!!notice} message={notice} onClose={()=>setNotice("")} /></>;
}
