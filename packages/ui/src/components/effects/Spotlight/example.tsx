import { Card, Grid, Spotlight, Typography } from "@ad-voice/ui";

export default function SpotlightExample() {
  return (
    <Grid minChildWidth="12rem" gap={3}>
      {["Комната", "Очередь", "Записи"].map((title) => (
        <Spotlight key={title}>
          <Card title={title} icon="music">
            <Typography variant="body-sm" tone="muted">
              Проведите курсором над карточкой.
            </Typography>
          </Card>
        </Spotlight>
      ))}
    </Grid>
  );
}
