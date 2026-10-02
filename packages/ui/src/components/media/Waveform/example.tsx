import { useState } from "react";
import { Waveform } from "@ad-voice/ui";

export default function WaveformExample() {
  const [position, setPosition] = useState(64);
  return (
    <Waveform
      label="Позиция в записи"
      duration={231}
      position={position}
      onSeek={setPosition}
    />
  );
}
