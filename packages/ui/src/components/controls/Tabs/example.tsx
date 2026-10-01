import React, { useState } from "react";
import { U } from "../../../dev/exampleHelpers";

const items = [
  { value: "appearance", label: "Внешний вид", icon: "palette" },
  { value: "audio", label: "Аудио", icon: "audio" },
  { value: "env", label: "Ключи ENV", icon: "key" }
];

export default function TabsExample() {
  const [value, setValue] = useState("appearance");

  return (
    <U.Stack gap={4}>
      <U.Tabs value={value} onValueChange={setValue} items={items} />

      <U.Stack direction="row" gap={2} wrap="wrap">
        <U.Button size="small" onClick={() => setValue("appearance")}>Первая активная</U.Button>
        <U.Button size="small" onClick={() => setValue("audio")}>Средняя активная</U.Button>
        <U.Button size="small" onClick={() => setValue("env")}>Последняя активная</U.Button>
      </U.Stack>

      <U.Typography variant="caption" tone="muted">
        Крайние активные вкладки повторяют внешний край контейнера, а внутренние сохраняют скосы с двух сторон.
      </U.Typography>
    </U.Stack>
  );
}
