import { useId, useMemo, useState } from "react";
import { clamp, mark, useControllable } from "../../../core/base";
import { type WaveformProps } from "../shared";

const BARS = 72;

/** Bars with a mirrored reflection: played part lit, hovered part previewed, needle at the position. */
export const Waveform = (p: WaveformProps) => {
  const duration = Math.max(0.001, p.duration ?? 231);
  const [position, seek] = useControllable(
    p.position,
    p.defaultPosition ?? 0,
    p.onSeek,
  );
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const bars = useMemo(() => {
    const source =
      p.points ??
      Array.from(
        { length: 280 },
        (_, i) =>
          (0.3 + 0.7 * Math.sin(i * 0.032) ** 2) *
          (0.22 + 0.78 * Math.abs(Math.sin(i * 1.723))),
      );
    return Array.from({ length: BARS }, (_, i) => {
      const from = Math.floor((i / BARS) * source.length);
      const to = Math.max(
        from + 1,
        Math.floor(((i + 1) / BARS) * source.length),
      );
      const slice = source.slice(from, to).map((v) => Math.abs(v));
      return clamp(Math.max(...slice), 0.06, 1);
    });
  }, [p.points]);
  const step = 600 / BARS;
  const played = clamp(position / duration, 0, 1) * 600;
  const rects = bars.map((v, i) => (
    <rect
      key={i}
      x={i * step + step * 0.18}
      y={44 - v * 40}
      width={step * 0.64}
      height={v * 40 + v * 14}
      rx={step * 0.32}
    />
  ));
  return (
    <div
      {...mark("Waveform", p)}
      data-hover={hover !== null || undefined}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        setHover(clamp((e.clientX - box.left) / box.width, 0, 1) * 600);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1f5" />
            <stop offset="0.35" stopColor={p.color ?? "#ff5c87"} />
            <stop offset="0.68" stopColor="#c2124a" />
            <stop offset="0.7" stopColor="#ff2f6a" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ff2f6a" stopOpacity="0.05" />
          </linearGradient>
          <clipPath id={`${id}-played`}>
            <rect width={played} height="64" />
          </clipPath>
          <clipPath id={`${id}-hover`}>
            <rect width={hover ?? 0} height="64" />
          </clipPath>
        </defs>
        <g className="ad-waveform-base">{rects}</g>
        <g className="ad-waveform-hover" clipPath={`url(#${id}-hover)`}>
          {rects}
        </g>
        <g
          className="ad-waveform-played"
          clipPath={`url(#${id}-played)`}
          fill={`url(#${id}-lit)`}
        >
          {rects}
        </g>
      </svg>
      <span
        className="ad-waveform-needle"
        style={{ left: `${(played / 600) * 100}%` }}
        aria-hidden
      />
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
