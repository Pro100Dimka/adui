import { clamp, mark } from "../../../core/base";
import { type LevelMeterProps } from "../shared";

const BARS = 28;

/** VU meter: lit bars rise from ruby to white, the top lit bar is the peak. */
export const LevelMeter = (p: LevelMeterProps) => {
  const value = clamp(p.value ?? 72);
  const lit = Math.round((value / 100) * BARS);
  return (
    <div
      {...mark("LevelMeter", p)}
      role="meter"
      aria-label={p.label ?? "Уровень сигнала"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      data-segmented={p.segmented || undefined}
    >
      {Array.from({ length: BARS }, (_, i) => (
        <i
          key={i}
          data-lit={i < lit || undefined}
          data-peak={i === lit - 1 || undefined}
          style={{
            height: p.segmented
              ? "100%"
              : `${38 + 62 * Math.sin(i * 0.35) ** 2}%`,
            animationDelay: `${(i * 137) % 900}ms`,
          }}
        />
      ))}
    </div>
  );
};
