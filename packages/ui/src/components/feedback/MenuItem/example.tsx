import { Card, Divider, MenuItem, Stack } from "@ad-voice/ui";

/** MenuItem is what Menu renders for each entry; use it to build a custom menu surface. */
export default function MenuItemExample() {
  return (
    <Card material="dialog" padding="sm">
      <Stack role="menu" aria-label="Действия с записью" gap={1}>
        <MenuItem label="Переименовать" icon="pencil" />
        <MenuItem label="Скачать" icon="download" />
        <Divider />
        <MenuItem label="Удалить" icon="trash" danger />
      </Stack>
    </Card>
  );
}
