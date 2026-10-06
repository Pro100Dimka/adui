const n=`import { tr, useTr } from "../../../core/i18n";
import { useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import { mark, type CommonProps } from "../../../core/base";

export interface EqualizerProps extends CommonProps {
  /** Number of bars. */
  bars?: number;
  /** Bars move only while playing. */
  playing?: boolean;
  /** Bar heights 0–1 from a live spectrum; they replace the built-in bounce. */
  levels?: readonly number[];
  /** Shifts the bounce, in seconds, so neighbouring equalizers do not move in step. */
  phase?: number;
  label?: string;
}

/** "Now playing" bars that bounce at different tempos. */
export function Equalizer({
  bars = 5,
  playing = true,
  levels,
  phase = 0,
  label,
  ...p
}: EqualizerProps) {
  const tr = useTr();
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  usePauseOffscreen(pauseRef);
  return (
    <span
      {...mark("Equalizer", p)}
      ref={pauseRef}
      role="img"
      aria-label={label ?? (playing ? tr("Играет") : tr("Пауза"))}
      data-playing={(playing && !levels) || undefined}
      data-live={levels ? "" : undefined}
    >
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          style={
            levels
              ? { scale: \`1 \${Math.max(0.08, Math.min(1, levels[Math.floor((i / bars) * levels.length)] ?? 0))}\` }
              : {
                  animationDuration: \`\${0.55 + ((i * 37) % 50) / 100}s\`,
                  animationDelay: \`\${-((i * 53) % 70) / 100 - phase}s\`,
                }
          }
        />
      ))}
    </span>
  );
}
`;export{n as default};
