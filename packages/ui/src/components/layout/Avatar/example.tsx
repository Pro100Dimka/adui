import { Avatar, Stack } from "@ad-voice/ui";

export default function AvatarExample() {
  return (
    <Stack direction="row" gap={2}>
      <Avatar name="Дмитрий" />
      <Avatar name="Анна" />
      <Avatar name="Богдан" />
    </Stack>
  );
}
