import { Stack } from "@ad-voice/ui";
import { RoleEmblem } from "@ad-voice/ui/composites";

export default function RoleEmblemExample() {
  return (
    <Stack direction="row" gap={4} align="center">
      <RoleEmblem role="host" />
      <RoleEmblem role="guest" />
    </Stack>
  );
}
