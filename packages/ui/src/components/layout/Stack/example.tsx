import { Button, Stack } from "@neo-ui-kit/react";

/** Column on phones, row from md: one prop instead of media queries. */
export default function StackExample() {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: 2, md: 3 }}
      align={{ base: "stretch", md: "center" }}
    >
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
      <Button icon="eye">Предпросмотр</Button>
      <Button variant="ghost">Отмена</Button>
    </Stack>
  );
}
