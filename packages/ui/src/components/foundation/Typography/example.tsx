import { Grid, Stack, Typography } from "@ad-voice/ui";

const scale = [
  ["display", "A&D Voice"],
  ["h1", "Главный заголовок"],
  ["h2", "Заголовок раздела"],
  ["h3", "Заголовок блока"],
  ["title", "Название карточки"],
  ["body", "Основной текст интерфейса."],
  ["body-sm", "Компактный вспомогательный текст."],
  ["label", "Подпись поля"],
  ["caption", "Обновлено в 12:48"],
  ["eyebrow", "A&D Voice"],
  ["mono", "48 kHz · 24 bit"],
] as const;

export default function TypographyExample() {
  return (
    <Stack gap={4}>
      <Grid
        columns="minmax(4.5rem, auto) minmax(0, 1fr)"
        gap={3}
        align="baseline"
      >
        {scale.map(([variant, text]) => [
          <Typography key={`${variant}-key`} variant="mono" tone="muted">
            {variant}
          </Typography>,
          <Typography key={variant} variant={variant}>
            {text}
          </Typography>,
        ])}
      </Grid>
      <Stack direction="row" gap={3} wrap>
        {(["muted", "accent", "success", "warning", "danger"] as const).map(
          (tone) => (
            <Typography key={tone} variant="body-sm" tone={tone}>
              {tone}
            </Typography>
          ),
        )}
      </Stack>
    </Stack>
  );
}
