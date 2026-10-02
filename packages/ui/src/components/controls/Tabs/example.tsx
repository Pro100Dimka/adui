import { useState } from "react";
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

const items = [
  { value: "view", label: "Внешний вид", icon: "palette", id: "tab-view" },
  { value: "audio", label: "Аудио", icon: "audio", id: "tab-audio" },
  { value: "keys", label: "Ключи", icon: "key", id: "tab-keys" },
];
const panels: Record<string, string> = {
  view: "Тема, акцентный цвет и анимации интерфейса.",
  audio: "Драйвер, задержка и мониторинг голоса.",
  keys: "API-ключи сервисов обработки.",
};

export default function TabsExample() {
  const [tab, setTab] = useState("audio");
  return (
    <Playground
      stretch
      knobs={{ size: { options: sizes, value: "md" } }}
      code={(_, c) =>
        `const items = ${JSON.stringify(items.map(({ value, label, icon }) => ({ value, label, icon })))};\n\n` +
        jsx("Tabs", {
          label: "Настройки",
          items: expr("items"),
          value: expr("tab"),
          onValueChange: expr("setTab"),
          size: c.size,
        })
      }
    >
      {(v) => (
        <U.Stack gap={3}>
          <U.Tabs
            label="Настройки"
            items={items}
            value={tab}
            onValueChange={setTab}
            size={v.size}
          />
          <U.TabPanel labelledBy={`tab-${tab}`}>
            <U.Typography variant="body-sm" tone="muted">
              {panels[tab]}
            </U.Typography>
          </U.TabPanel>
        </U.Stack>
      )}
    </Playground>
  );
}
