import { Divider, Stack, Typography } from "@neo-ui-kit/react";

export default function DividerExample() {
  return (
    <Stack>
      <Typography>Аудио</Typography>
      <Divider />
      <Stack direction="row" align="center">
        <Typography>Вход</Typography>
        <Divider vertical />
        <Typography>Выход</Typography>
      </Stack>
    </Stack>
  );
}
