const n=`import { tr } from "../../../core/i18n";
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
  return (
    <span
      {...mark("SignalBars", p)}
      role="img"
      aria-label={label ?? tr("Сигнал: {level} из {bars}", { level, bars })}
      data-weak={weak || undefined}
    >
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} data-lit={i < level || undefined} style={{ height: \`\${((i + 1) / bars) * 100}%\` }} />
      ))}
    </span>
  );
}
`;export{n as default};
