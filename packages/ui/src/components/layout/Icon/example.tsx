import { U } from "../../../dev/exampleHelpers";
export default function IconExample() {
  return (
    <U.Stack direction="row" gap={4} align="center">
      <U.Icon name="music" />
      <U.Icon name="settings" surface="tile" />
      <U.Icon name="audio" size="2rem" surface="tile" />
    </U.Stack>
  );
}
