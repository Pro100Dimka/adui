import { Grid, Stack, Typography } from "@ad-voice/ui";

const headings = [
  ["display", "Neo UI"],
  ["h1", "Главный заголовок"],
  ["h2", "Заголовок раздела"],
  ["h3", "Заголовок блока"],
  ["title", "Название карточки"],
] as const;
const text = [
  ["body", "Основной текст интерфейса."],
  ["body-sm", "Компактный вспомогательный текст."],
  ["label", "Подпись поля"],
  ["caption", "Обновлено в 12:48"],
  ["eyebrow", "Neo UI"],
  ["mono", "48 kHz · 24 bit"],
] as const;

export default function TypographyExample() {
  return (
    <Stack gap={4}>
      <Grid minChildWidth="min(100%, 18rem)" gap={5}>
        {[headings, text].map((scale) => (
          <Grid
            key={scale[0][0]}
            columns="minmax(4.5rem, auto) minmax(0, 1fr)"
            gap={3}
            align="baseline"
          >
            {scale.map(([variant, sample]) => [
              <Typography key={`${variant}-key`} variant="mono" tone="muted">
                {variant}
              </Typography>,
              <Typography key={variant} variant={variant}>
                {sample}
              </Typography>,
            ])}
          </Grid>
        ))}
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
