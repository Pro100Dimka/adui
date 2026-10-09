import { useContext, useEffect, useState } from "react";
import { ExamplePreviewContext, Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

/** A voice-like level: syllables rise and fall, with short pauses between phrases. */
function useDemoVoice(enabled: boolean) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const phrase = Math.sin(t * 0.9) > -0.35 ? 1 : 0.05;
      const syllable =
        Math.abs(Math.sin(t * 7.3)) * (0.55 + 0.45 * Math.sin(t * 2.1));
      setLevel(Math.round(phrase * syllable * 90 + Math.random() * 8));
    }, 60);
    return () => clearInterval(timer);
  }, [enabled]);
  return level;
}

export default function LevelMeterExample() {
  const preview = useContext(ExamplePreviewContext);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>();
  const level = useDemoVoice(!stream && !preview);
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const toggleMicrophone = async () => {
    if (stream) return setStream(null);
    try {
      setError(undefined);
      setStream(await navigator.mediaDevices.getUserMedia({ audio: true }));
    } catch {
      setError("Нет доступа к микрофону");
    }
  };

  return (
    <Playground
      stretch
      knobs={{ active: { value: true }, compact: { value: false } }}
      code={(v) =>
        jsx("LevelMeter", {
          label: "Микрофон",
          ...(stream ? { stream: expr("stream") } : { value: expr("level") }),
          active: v.active ? undefined : expr("false"),
          compact: v.compact,
        })
      }
      extra={
        <U.Stack direction="row" gap={3} align="center" wrap>
          <U.Button
            size="sm"
            icon="mic"
            variant={stream ? "primary" : "secondary"}
            onClick={toggleMicrophone}
          >
            {stream ? "Отключить микрофон" : "Подключить микрофон"}
          </U.Button>
          <U.Typography variant="caption" tone={error ? "danger" : "muted"}>
            {error ??
              (stream ? "Слушаю ваш микрофон" : "Сейчас — симуляция голоса")}
          </U.Typography>
        </U.Stack>
      }
    >
      {(v) => (
        <U.LevelMeter
          label="Микрофон"
          value={preview ? 48 : level}
          stream={stream}
          active={v.active}
          compact={v.compact}
        />
      )}
    </Playground>
  );
}
