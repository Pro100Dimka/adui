import { mark, type CommonProps } from "../../../core/base";

export interface EqualizerProps extends CommonProps {
  /** Number of bars. */
  bars?: number;
  /** Bars move only while playing. */
  playing?: boolean;
  label?: string;
}

/** "Now playing" bars that bounce at different tempos. */
export function Equalizer({
  bars = 5,
  playing = true,
  label,
  ...p
}: EqualizerProps) {
  return (
    <span
      {...mark("Equalizer", p)}
      role="img"
      aria-label={label ?? (playing ? "Играет" : "Пауза")}
      data-playing={playing || undefined}
    >
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          style={{
            animationDuration: `${0.55 + ((i * 37) % 50) / 100}s`,
            animationDelay: `${-((i * 53) % 70) / 100}s`,
          }}
        />
      ))}
    </span>
  );
}
