import { TabPanel, Typography } from "@ad-voice/ui";

/** Content of one tab; pair it with Tabs (see the Tabs page for the full pattern). */
export default function TabPanelExample() {
  return (
    <TabPanel labelledBy="tab-audio">
      <Typography variant="body-sm" tone="muted">
        Драйвер, задержка и мониторинг голоса.
      </Typography>
    </TabPanel>
  );
}
