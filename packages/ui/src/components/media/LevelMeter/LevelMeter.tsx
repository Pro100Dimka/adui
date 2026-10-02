import { clamp, mark } from "../../../core/base";
import { type LevelMeterProps } from "../shared";

export const LevelMeter = (p: LevelMeterProps) => {
  const value = clamp(p.value ?? 72);
  return (
    <div
      {...mark("LevelMeter", p)}
      role="meter"
      aria-label={p.label ?? "Уровень сигнала"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      {Array.from({ length: 28 }, (_, i) => (
        <i
          key={i}
          data-lit={i / 28 < value / 100}
          style={{
            height: p.segmented ? 18 : 12 + 19 * Math.sin(i * 0.35) ** 2,
          }}
        />
      ))}
    </div>
  );
};
