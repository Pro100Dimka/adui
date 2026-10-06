import { useState } from "react";
import { Stack, TabPanel, Tabs, Typography } from "@ad-voice/ui";

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
    <Stack gap={3}>
      <Tabs label="Настройки" items={items} value={tab} onValueChange={setTab} />
      <TabPanel labelledBy={`tab-${tab}`}>
        <Typography variant="body-sm" tone="muted">{panels[tab]}</Typography>
      </TabPanel>
    </Stack>
  );
}
