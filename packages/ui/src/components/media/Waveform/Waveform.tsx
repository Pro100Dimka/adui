import { useMemo } from "react";
import { clamp, mark, useControllable } from "../../../core/base";
import { type WaveformProps } from "../shared";

export const Waveform = (p: WaveformProps) => {
  const duration = Math.max(0.001, p.duration ?? 231);
  const [position, seek] = useControllable(
    p.position,
    p.defaultPosition ?? 0,
    p.onSeek,
  );
  const d = useMemo(() => {
    const points =
      p.points ??
      Array.from(
        { length: 280 },
        (_, i) =>
          (2 +
            24 *
              (0.3 + 0.7 * Math.sin(i * 0.032) ** 2) *
              (0.22 + 0.78 * Math.abs(Math.sin(i * 1.723)))) /
          32,
      );
    return points
      .map((v, i) => {
        const x = (i / Math.max(1, points.length - 1)) * 600,
          a = clamp(Math.abs(v), 0, 1) * 30;
        return `M${x.toFixed(2)} ${(32 - a).toFixed(2)}V${(32 + a).toFixed(2)}`;
      })
      .join("");
  }, [p.points]);
  const x = clamp(position / duration, 0, 1) * 600;
  return (
    <div {...mark("Waveform", p)}>
      <svg viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true">
        <path d={d} stroke={p.color ?? "#ff416c"} strokeWidth={1} fill="none" />
        <path d={`M${x} 3V61`} stroke="#ffe0e5" strokeWidth={1.5} />
      </svg>
      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={clamp(position, 0, duration)}
        disabled={p.disabled}
        aria-label={p.label ?? "Позиция воспроизведения"}
        onChange={(e) => seek(Number(e.currentTarget.value))}
      />
    </div>
  );
};
