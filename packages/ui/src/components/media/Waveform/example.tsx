import { useRef, useState } from "react";
import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

const DURATION = 231;

/** Plays along on its own, a frame at a time, so the cursor glides; seeking moves it. */
function PlayingWaveform({
  playing,
  disabled,
  file,
}: {
  playing: boolean;
  disabled: boolean;
  file: File | null;
}) {
  const [position, setPosition] = useState(64);
  // Plays on the library's motion clock: in step with every animation, still when out of view.
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);
  U.useDecoration(box, (time) => {
    if (playing && last.current !== null) setPosition((v) => (v + time - last.current!) % DURATION);
    last.current = time;
  });
  return (
    <div ref={box} style={{ width: "min(100%, 52rem)" }}>
    <U.Waveform
      label="Позиция в записи"
      src={file}
      duration={DURATION}
      position={position}
      onSeek={setPosition}
      disabled={disabled}
    />
    </div>
  );
}

export default function WaveformExample() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <Playground
      stretch
      knobs={{ playing: { value: true }, disabled: { value: false } }}
      code={(v) =>
        jsx("Waveform", {
          label: "Позиция в записи",
          src: file ? expr("file") : undefined,
          duration: DURATION,
          position: expr("position"),
          onSeek: expr("setPosition"),
          disabled: v.disabled,
        })
      }
      extra={
        <U.FilePicker
          size="sm"
          label="Свой трек"
          description={file ? file.name : "Волна построится прямо в браузере"}
          icon="music"
          accept="audio/*"
          onFiles={([next]) => next && setFile(next)}
        />
      }
    >
      {(v) => (
        <PlayingWaveform
          playing={v.playing}
          disabled={v.disabled}
          file={file}
        />
      )}
    </Playground>
  );
}
