const n=`import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface EqualizerProps extends CommonProps {\r
  /** Number of bars. */\r
  bars?: number;\r
  /** Bars move only while playing. */\r
  playing?: boolean;\r
  /** Bar heights 0–1 from a live spectrum; they replace the built-in bounce. */\r
  levels?: readonly number[];\r
  /** Shifts the bounce, in seconds, so neighbouring equalizers do not move in step. */\r
  phase?: number;\r
  label?: string;\r
}\r
\r
/** "Now playing" bars that bounce at different tempos. */\r
export function Equalizer({\r
  bars = 5,\r
  playing = true,\r
  levels,\r
  phase = 0,\r
  label,\r
  ...p\r
}: EqualizerProps) {\r
  return (\r
    <span\r
      {...mark("Equalizer", p)}\r
      role="img"\r
      aria-label={label ?? (playing ? "Играет" : "Пауза")}\r
      data-playing={(playing && !levels) || undefined}\r
      data-live={levels ? "" : undefined}\r
    >\r
      {Array.from({ length: bars }, (_, i) => (\r
        <i\r
          key={i}\r
          style={\r
            levels\r
              ? { scale: \`1 \${Math.max(0.08, Math.min(1, levels[Math.floor((i / bars) * levels.length)] ?? 0))}\` }\r
              : {\r
                  animationDuration: \`\${0.55 + ((i * 37) % 50) / 100}s\`,\r
                  animationDelay: \`\${-((i * 53) % 70) / 100 - phase}s\`,\r
                }\r
          }\r
        />\r
      ))}\r
    </span>\r
  );\r
}\r
`;export{n as default};
