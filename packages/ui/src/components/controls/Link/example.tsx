import { Link, Stack } from "@ad-voice/ui";

export default function LinkExample() {
  return (
    <Stack direction="row" gap={4} wrap>
      <Link href="#/components/button">Документация</Link>
      <Link href="#/components/button" icon="document">
        С иконкой
      </Link>
      <Link href="https://react.dev" external underline="always">
        Внешняя ссылка
      </Link>
    </Stack>
  );
}
