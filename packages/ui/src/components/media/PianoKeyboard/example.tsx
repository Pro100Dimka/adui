import { useState } from "react";
import { PianoKeyboard, Stack, Switch, Typography, noteName } from "@ad-voice/ui";

export default function PianoKeyboardExample() {
  const [active, setActive] = useState(67);
  const [hit, setHit] = useState(true);
  return (
    <Stack direction="row" align="center" gap={6} style={{ height: "20rem" }}>
      <Stack style={{ width: "5rem", height: "100%" }}>
        <PianoKeyboard minMidi={55} maxMidi={79} activeMidi={active} hit={hit} onKeyPress={setActive} />
      </Stack>
      <Stack gap={3}>
        <Typography variant="title">Нота: {noteName(active)}</Typography>
        <Typography variant="caption" tone="muted">Нажмите на клавишу</Typography>
        <Switch label="Попадание" checked={hit} onValueChange={setHit} />
      </Stack>
    </Stack>
  );
}
