import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";

const items = [
  { value: "appearance", label: "Внешний вид", icon: "palette" },
  { value: "audio", label: "Аудио", icon: "audio" },
  { value: "env", label: "Ключи ENV", icon: "key" }
];

export default function TabsExample() {
  const { choice, setChoice } = useExampleState();
  return <U.Stack gap={4}>
    <U.Stack gap={2}>
      <U.Typography variant="label" tone="muted">SETTINGS · основной вариант</U.Typography>
      <U.Tabs appearance="settings" value={choice} onValueChange={setChoice} items={items} />
    </U.Stack>
    <U.Stack gap={2}>
      <U.Typography variant="label" tone="muted">FLUSH · максимально заполняет ячейку</U.Typography>
      <U.Tabs appearance="flush" defaultValue="appearance" items={items} />
    </U.Stack>
    <U.Stack gap={2}>
      <U.Typography variant="label" tone="muted">PREMIUM · более объёмный свет</U.Typography>
      <U.Tabs appearance="premium" defaultValue="appearance" items={items} />
    </U.Stack>
  </U.Stack>;
}
