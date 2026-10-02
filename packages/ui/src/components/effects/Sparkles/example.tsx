import { Badge, Sparkles, Stack, Typography } from "@ad-voice/ui";

export default function SparklesExample() {
  return (
    <Stack direction="row" gap={6} align="center" wrap>
      <Sparkles count={12} style={{ fontSize: "1.5rem" }}>
        <Typography variant="h3">Лучший вокал</Typography>
      </Sparkles>
      <Sparkles count={6}>
        <Badge tone="warning">Топ-1</Badge>
      </Sparkles>
    </Stack>
  );
}
