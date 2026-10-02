import { Stack, Text } from "@ad-voice/ui";

/** Lightweight text; Typography covers the full type scale. */
export default function TextExample() {
  return (
    <Stack gap={2}>
      <Text variant="eyebrow">A&D Voice</Text>
      <Text as="h3" variant="title">
        Настройки комнаты
      </Text>
      <Text>Основной текст интерфейса</Text>
      <Text variant="muted">Вспомогательная подпись</Text>
    </Stack>
  );
}
