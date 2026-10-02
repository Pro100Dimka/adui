import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function HeaderExample(){
  return <U.Stack gap={4}><U.Header level={1} eyebrow="A&D Voice" title="Настройки" description="Заголовок страницы" icon="settings" actions={<U.Button size="sm">Сохранить</U.Button>} /><U.Header level={3} compact title="Аудио" description="Тот же компонент в компактном режиме" /></U.Stack>;
}
