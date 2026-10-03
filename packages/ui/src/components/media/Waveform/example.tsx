import { useEffect, useState } from "react";
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
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setPosition((v) => (v + (now - last) / 1000) % DURATION);
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  return (
    <U.Waveform
      style={{ width: "min(100%, 52rem)" }}
      label="Позиция в записи"
      src={file}
      duration={DURATION}
      position={position}
      onSeek={setPosition}
      disabled={disabled}
    />
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
