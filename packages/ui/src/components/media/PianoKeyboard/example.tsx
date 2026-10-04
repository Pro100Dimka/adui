import { useState } from "react";
import { PianoKeyboard, Switch, Typography, noteName } from "@ad-voice/ui";

export default function PianoKeyboardExample() {
  const [active, setActive] = useState(67);
  const [hit, setHit] = useState(true);
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", height: "20rem" }}>
      <div style={{ width: "5rem", height: "100%" }}>
        <PianoKeyboard minMidi={55} maxMidi={79} activeMidi={active} hit={hit} onKeyPress={setActive} />
      </div>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Typography variant="title">Нота: {noteName(active)}</Typography>
        <Typography variant="caption" tone="muted">Нажмите на клавишу</Typography>
        <Switch label="Попадание" checked={hit} onValueChange={setHit} />
      </div>
    </div>
  );
}
