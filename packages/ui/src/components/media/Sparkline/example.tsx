import { Sparkline, Stack, Typography } from "@ad-voice/ui";

export default function SparklineExample() {
  return (
    <Stack gap={1}>
      <Typography variant="label">Задержка сети, мс</Typography>
      <Sparkline
        label="Задержка сети"
        values={[18, 22, 19, 31, 44, 26, 24, 21, 38, 27, 23, 20]}
      />
    </Stack>
  );
}
