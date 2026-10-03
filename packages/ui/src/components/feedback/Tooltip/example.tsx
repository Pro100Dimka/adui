import { IconButton, Stack, Tooltip } from "@ad-voice/ui";

export default function TooltipExample() {
  return (
    <Stack direction="row" gap={4} align="center">
      <Tooltip content="Оценка без физической задержки колонок и микрофона">
        <IconButton icon="info" label="Что это" variant="ghost" />
      </Tooltip>
      <Tooltip content="Сохранить запись" placement="bottom">
        <IconButton icon="save" label="Сохранить" />
      </Tooltip>
    </Stack>
  );
}
