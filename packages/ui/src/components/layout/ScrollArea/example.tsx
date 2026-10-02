import { Badge, ScrollArea, Stack, Typography } from "@ad-voice/ui";

export default function ScrollAreaExample() {
  return (
    <ScrollArea height="12rem" label="Записи">
      <Stack gap={2}>
        {Array.from({ length: 12 }, (_, i) => (
          <Stack key={i} direction="row" justify="between" align="center">
            <Typography variant="body-sm">Запись {i + 1}</Typography>
            <Badge tone="success">Готово</Badge>
          </Stack>
        ))}
      </Stack>
    </ScrollArea>
  );
}
