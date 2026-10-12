import { Stack, Text } from "@neo-ui-kit/react";

/** Lightweight text; Typography covers the full type scale. */
export default function TextExample() {
  return (
    <Stack gap={2}>
      <Text variant="eyebrow">NEO UI</Text>
      <Text as="h3" variant="title">
        Настройки комнаты
      </Text>
      <Text>Основной текст интерфейса</Text>
      <Text variant="muted">Вспомогательная подпись</Text>
    </Stack>
  );
}
