const n=`import { useTr } from "../../../core/i18n";
import { mark, type CommonProps } from "../../../core/base";

export interface SignalBarsProps extends CommonProps {
  /** How many bars are lit, 0…\`bars\`. */
  level?: number;
  bars?: number;
  /** A weak or broken link: the lit bars turn to the warning colour. */
  weak?: boolean;
  label?: string;
}

/** Signal strength as rising bars, like a phone's reception; the lit ones glow. */
export function SignalBars({ level = 3, bars = 4, weak = false, label, ...p }: SignalBarsProps) {
  const tr = useTr();
  const count = Math.max(1, Number.isFinite(bars) ? Math.floor(bars) : 4);
  const strength = Math.max(0, Math.min(count, Number.isFinite(level) ? Math.round(level) : 0));
  return (
    <span
      {...mark("SignalBars", p)}
      role="img"
      aria-label={label ?? tr("Сигнал: {level} из {bars}", { level: strength, bars: count })}
      data-weak={weak || undefined}
    >
      {Array.from({ length: count }, (_, i) => (
        <i key={i} data-lit={i < strength || undefined} style={{ height: \`\${((i + 1) / count) * 100}%\` }} />
      ))}
    </span>
  );
}
`;export{n as default};
