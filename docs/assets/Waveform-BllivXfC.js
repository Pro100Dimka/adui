const e=`import { tr } from "../../../core/i18n";
import { useSvgId } from "../../../core/artwork";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { clamp, mark, timeText, useControllable } from "../../../core/base";
import { seeded } from "../../../core/noise";
import { type WaveformProps } from "../shared";
import { useWaveformPeaks } from "./useWaveformPeaks";

/** Drawing space: a symmetric track around the midline, like a studio editor shows it. */
const W = 1000;
const H = 100;
const MID = H / 2;
const COLUMNS = 400;
const KEY_STEP = 5;

/**
 * A believable song for when no audio is given: intro, verses and louder choruses, a
 * kick on every beat, and sample-level detail in between.
 */
const demoSong = (() => {
  const random = seeded(2741);
  return Array.from({ length: 600 }, (_, i) => {
    const t = i / 600;
    const section = 0.4 + 0.6 * Math.sin(t * Math.PI * 3.2) ** 2;
    const fade = Math.min(1, i / 24, (600 - i) / 30);
    const kick = Math.exp(-(i % 12) / 2.2);
    const detail = random() ** 0.7;
    return section * fade * (0.3 + 0.7 * (0.5 * kick + 0.5 * detail));
  });
})();

/**
 * Resamples to fixed columns: an outer outline and a core of average loudness. Mastered
 * tracks hit full scale almost everywhere, so drawing raw peaks gives a flat brick; like
 * streaming players, the outline follows loudness (never above the real peak) and the
 * range between quiet and loud passages is stretched, while true silence stays a line.
 */
function columns(peaks: readonly number[], rms?: readonly number[]) {
  const outer: number[] = [];
  const ratio: number[] = [];
  for (let c = 0; c < COLUMNS; c += 1) {
    const from = Math.floor((c / COLUMNS) * peaks.length);
    const to = Math.max(
      from + 1,
      Math.floor(((c + 1) / COLUMNS) * peaks.length),
    );
    let peak = 0;
    let mean = 0;
    for (let i = from; i < to; i += 1) {
      peak = Math.max(peak, Math.abs(peaks[i]));
      mean += rms ? rms[i] : Math.abs(peaks[i]) * 0.58;
    }
    mean /= to - from;
    const level = Math.min(peak, mean * 1.9);
    outer.push(level);
    ratio.push(level > 0 ? Math.min(1, mean / level) : 0);
  }
  const sorted = [...outer].sort((a, b) => a - b);
  const high = sorted[sorted.length - 1] || 0.0001;
  const low = Math.min(
    sorted[Math.floor(sorted.length * 0.05)] * 0.7,
    high * 0.6,
  );
  const top = outer.map((v) => clamp((v - low) / (high - low), 0, 1));
  return { top, core: top.map((v, i) => v * ratio[i]) };
}

/** A filled outline of the levels, mirrored above and below the midline. */
function mirrored(levels: readonly number[]) {
  const x = (i: number) => ((i / (levels.length - 1)) * W).toFixed(1);
  const y = (v: number, side: 1 | -1) =>
    (MID + side * (0.6 + v * (MID - 3))).toFixed(1);
  const upper = levels.map((v, i) => \`\${x(i)} \${y(v, -1)}\`);
  const lower = levels.map((v, i) => \`\${x(i)} \${y(v, 1)}\`).reverse();
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;
}

/**
 * Seekable waveform drawn the way studio editors show audio: a dense, symmetric track with
 * translucent peaks around a solid core of average loudness. The played part burns ruby
 * and brightens towards the light-beam cursor; hovering previews the seek point and its
 * time. Click or drag to seek, arrows step 5 s, Home/End jump to the edges. Peaks come
 * from \`points\` or are decoded from \`src\`.
 */
export function Waveform({
  duration: total,
  position: controlled,
  defaultPosition = 0,
  onSeek,
  points,
  src,
  bins = 600,
  color,
  label,
  disabled = false,
  ...p
}: WaveformProps) {
  const id = useSvgId();
  const surface = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const decoded = useWaveformPeaks(points ? null : src, bins);
  const loading = !points && !!src && decoded === null;
  const { peaksPath, corePath } = useMemo(() => {
    const { top, core } = points?.length
      ? columns(points)
      : decoded?.peaks.length
        ? columns(decoded.peaks, decoded.rms)
        : columns(demoSong);
    return { peaksPath: mirrored(top), corePath: mirrored(core) };
  }, [points, decoded]);
  // The track's shape as mask pictures, made once per shape; the bloom's is blurred in the picture.
  const masks = useMemo(() => {
    const picture = (body: string) =>
      \`url("data:image/svg+xml,\${encodeURIComponent(\`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 \${W} \${H}' preserveAspectRatio='none'>\${body}</svg>\`)}")\`;
    return {
      peaks: picture(\`<path d='\${peaksPath}'/>\`),
      core: picture(\`<path d='\${corePath}'/>\`),
      bloom: picture(\`<filter id='b' x='-5%' y='-50%' width='110%' height='200%'><feGaussianBlur stdDeviation='4'/></filter><path d='\${corePath}' filter='url(#b)'/>\`),
    };
  }, [peaksPath, corePath]);
  const duration = Math.max(0.001, total ?? 231);
  const [position, seek] = useControllable(controlled, defaultPosition, onSeek);
  const progress = clamp(position / duration, 0, 1);
  const played = progress * W;
  const ahead = Math.max(0, (hover ?? 0) * W - played);
  // Playing = the position keeps creeping forward; sparks fly only then.
  const [playing, setPlaying] = useState(false);
  const previous = useRef(position);
  useEffect(() => {
    const step = position - previous.current;
    previous.current = position;
    if (step <= 0 || step > 1.5) return;
    setPlaying(true);
    const timer = setTimeout(() => setPlaying(false), 300);
    return () => clearTimeout(timer);
  }, [position]);
  const shape = points?.length
    ? "points"
    : decoded?.peaks.length
      ? "file"
      : "demo";

  const ratio = (event: PointerEvent<HTMLDivElement>) => {
    const box = surface.current?.getBoundingClientRect();
    return box?.width ? clamp((event.clientX - box.left) / box.width, 0, 1) : 0;
  };

  return (
    <div
      {...mark("Waveform", p)}
      ref={surface}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ?? tr("Позиция воспроизведения")}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(position)}
      aria-valuetext={timeText(position)}
      aria-disabled={disabled || undefined}
      data-loading={loading || undefined}
      data-playing={playing || undefined}
      style={
        {
          ...p.style,
          "--ad-wave-played": \`\${progress * 100}%\`,
          "--ad-wave-progress": progress,
          "--ad-wave-hover": hover === null ? undefined : \`\${hover * 100}%\`,
          ...(color ? { "--ad-wave-color": color } : {}),
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(ratio(event) * duration);
      }}
      onPointerMove={(event) => {
        if (disabled) return;
        setHover(ratio(event));
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          seek(ratio(event) * duration);
      }}
      onPointerLeave={() => setHover(null)}
      onKeyDown={(event) => {
        if (disabled) return;
        const next = {
          ArrowRight: position + KEY_STEP,
          ArrowLeft: position - KEY_STEP,
          Home: 0,
          End: duration,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        seek(clamp(next, 0, duration));
      }}
    >
      <span className="ad-waveform-floor" aria-hidden />
      {/* The track itself never repaints during playback: everything that follows the position
          is a layer moved or stretched by transform over these still pictures. */}
      <svg
        key={shape}
        className="ad-waveform-base"
        viewBox={\`0 0 \${W} \${H}\`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={\`\${id}-track\`}>
            <path d={peaksPath} />
          </clipPath>
          {/* Brushed silver: brightest along the midline, fading to the edges. */}
          <linearGradient id={\`\${id}-silver\`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={\`\${id}-solid\`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="1" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id={\`\${id}-depth\`} x1="0" x2="0" y1="0" y2="1">
            {/* Lit from above: the upper half catches light, the lower sinks into shadow. */}
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.56" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <line className="ad-waveform-axis" x2={W} y1={MID} y2={MID} />
        <path className="ad-waveform-peaks" d={peaksPath} fill={\`url(#\${id}-silver)\`} />
        <path className="ad-waveform-core" d={corePath} fill={\`url(#\${id}-solid)\`} />
        <path className="ad-waveform-edge" d={peaksPath} />
      </svg>
      {ahead > 0 && (
        <svg className="ad-waveform-overlay" viewBox={\`0 0 \${W} \${H}\`} preserveAspectRatio="none" aria-hidden="true">
          <clipPath id={\`\${id}-ahead\`}>
            <rect x={played} width={ahead} height={H} />
          </clipPath>
          <g clipPath={\`url(#\${id}-ahead)\`} className="ad-waveform-ahead">
            <path d={peaksPath} />
            <path d={corePath} />
          </g>
        </svg>
      )}
      {/* Played: the ruby light seen through the track's shape, stretched up to the position
          (so it still builds up along the played part and peaks at the cursor). */}
      <span className="ad-waveform-layer ad-waveform-bloom" style={{ maskImage: masks.bloom, WebkitMaskImage: masks.bloom }} aria-hidden>
        <i />
      </span>
      <span className="ad-waveform-layer ad-waveform-lit" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>
        <i />
      </span>
      <span className="ad-waveform-layer ad-waveform-lit ad-waveform-lit-core" style={{ maskImage: masks.core, WebkitMaskImage: masks.core }} aria-hidden>
        <i />
      </span>
      <span className="ad-waveform-layer ad-waveform-sheen-clip" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>
        <span className="ad-waveform-window">
          <span className="ad-waveform-window-inner">
            <i className="ad-waveform-sheen" />
          </span>
        </span>
      </span>
      <span className="ad-waveform-layer ad-waveform-depth" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden />
      <span className="ad-waveform-layer ad-waveform-shade" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>
        <span className="ad-waveform-follow">
          <i className="ad-waveform-spot" />
        </span>
      </span>
      <span className="ad-waveform-follow" aria-hidden>
        <span className="ad-waveform-cursor">
          <span className="ad-waveform-sparks">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </span>
      </span>
      {hover !== null && !disabled && (
        <span className="ad-waveform-hover" aria-hidden>
          <span className="ad-waveform-tip">{timeText(hover * duration)}</span>
        </span>
      )}
    </div>
  );
}
`;export{e as default};
