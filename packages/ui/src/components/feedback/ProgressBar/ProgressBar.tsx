import { clamp, mark } from "../../../core/base";
import { type ProgressBarProps } from "../shared";

export const ProgressBar = (p: ProgressBarProps) => {
  const max = Math.max(0.0001, p.max ?? 100);
  const value = clamp(p.value ?? 56, 0, max);
  return (
    <div
      {...mark("ProgressBar", p)}
      role="progressbar"
      aria-label={p.label ?? "Прогресс"}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={p.indeterminate ? undefined : value}
      data-indeterminate={p.indeterminate || undefined}
    >
      <span
        style={{ width: p.indeterminate ? "35%" : `${(value / max) * 100}%` }}
      />
    </div>
  );
};
