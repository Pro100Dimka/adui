import { tr, useTr } from "../../../core/i18n";
import { useId } from "react";
import { clamp, mark } from "../../../core/base";
import { type ProgressBarProps } from "../shared";

/** A fixed, natural-looking row of wave bars; its loudness varies like a song's. */
const WAVE = Array.from({ length: 64 }, (_, i) =>
  0.25 + 0.75 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 1.3)),
);
const wavePath = WAVE.map((level, i) => {
  const half = level * 10;
  return `M${i * 2 + 0.4} ${12 - half}h1.2v${half * 2}h-1.2z`;
}).join("");

export const ProgressBar = (p: ProgressBarProps) => {
  const tr = useTr();
  const max = Math.max(0.0001, p.max ?? 100);
  const value = clamp(p.value ?? 56, 0, max);
  const share = p.indeterminate ? 35 : (value / max) * 100;
  const clip = `ad-wave-${useId().replace(/:/g, "")}`;
  return (
    <div
      {...mark("ProgressBar", p)}
      role="progressbar"
      aria-label={p.label ?? tr("Прогресс")}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={p.indeterminate ? undefined : value}
      data-indeterminate={p.indeterminate || undefined}
      data-variant={p.variant === "wave" ? "wave" : undefined}
    >
      {p.variant === "wave" ? (
        <svg viewBox="0 0 128 24" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <clipPath id={clip}>
              <rect width={(128 * share) / 100} height="24" />
            </clipPath>
          </defs>
          <path className="ad-progress-wave-idle" d={wavePath} />
          <path className="ad-progress-wave-done" d={wavePath} clipPath={`url(#${clip})`} />
        </svg>
      ) : (
        <span style={{ width: `${share}%` }} />
      )}
    </div>
  );
};
