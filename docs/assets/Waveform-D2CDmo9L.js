const e=`import { useTr } from "../../../core/i18n";\r
import { useSvgId } from "../../../core/artwork";\r
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";\r
import { clamp, mark, timeText, useControllable } from "../../../core/base";\r
import { seeded } from "../../../core/noise";\r
import { type WaveformProps } from "../shared";\r
import { useWaveformPeaks } from "./useWaveformPeaks";\r
\r
/** Drawing space: a symmetric track around the midline, like a studio editor shows it. */\r
const W = 1000;\r
const H = 100;\r
const MID = H / 2;\r
const COLUMNS = 400;\r
const KEY_STEP = 5;\r
\r
/**\r
 * A believable song for when no audio is given: intro, verses and louder choruses, a\r
 * kick on every beat, and sample-level detail in between.\r
 */\r
const demoSong = (() => {\r
  const random = seeded(2741);\r
  return Array.from({ length: 600 }, (_, i) => {\r
    const t = i / 600;\r
    const section = 0.4 + 0.6 * Math.sin(t * Math.PI * 3.2) ** 2;\r
    const fade = Math.min(1, i / 24, (600 - i) / 30);\r
    const kick = Math.exp(-(i % 12) / 2.2);\r
    const detail = random() ** 0.7;\r
    return section * fade * (0.3 + 0.7 * (0.5 * kick + 0.5 * detail));\r
  });\r
})();\r
\r
/**\r
 * Resamples to fixed columns: an outer outline and a core of average loudness. Mastered\r
 * tracks hit full scale almost everywhere, so drawing raw peaks gives a flat brick; like\r
 * streaming players, the outline follows loudness (never above the real peak) and the\r
 * range between quiet and loud passages is stretched, while true silence stays a line.\r
 */\r
function columns(peaks: readonly number[], rms?: readonly number[]) {\r
  const outer: number[] = [];\r
  const ratio: number[] = [];\r
  for (let c = 0; c < COLUMNS; c += 1) {\r
    const from = Math.floor((c / COLUMNS) * peaks.length);\r
    const to = Math.max(\r
      from + 1,\r
      Math.floor(((c + 1) / COLUMNS) * peaks.length),\r
    );\r
    let peak = 0;\r
    let mean = 0;\r
    for (let i = from; i < to; i += 1) {\r
      peak = Math.max(peak, Math.abs(peaks[i] ?? 0));\r
      mean += rms ? (rms[i] ?? 0) : Math.abs(peaks[i] ?? 0) * 0.58;\r
    }\r
    mean /= to - from;\r
    const level = Math.min(peak, mean * 1.9);\r
    outer.push(level);\r
    ratio.push(level > 0 ? Math.min(1, mean / level) : 0);\r
  }\r
  const sorted = [...outer].sort((a, b) => a - b);\r
  const high = sorted[sorted.length - 1] || 0.0001;\r
  const low = Math.min(\r
    sorted[Math.floor(sorted.length * 0.05)] * 0.7,\r
    high * 0.6,\r
  );\r
  const top = outer.map((v) => clamp((v - low) / (high - low), 0, 1));\r
  return { top, core: top.map((v, i) => v * ratio[i]) };\r
}\r
\r
/** A filled outline of the levels, mirrored above and below the midline. */\r
function mirrored(levels: readonly number[]) {\r
  const x = (i: number) => ((i / (levels.length - 1)) * W).toFixed(1);\r
  const y = (v: number, side: 1 | -1) =>\r
    (MID + side * (0.6 + v * (MID - 3))).toFixed(1);\r
  const upper = levels.map((v, i) => \`\${x(i)} \${y(v, -1)}\`);\r
  const lower = levels.map((v, i) => \`\${x(i)} \${y(v, 1)}\`).reverse();\r
  return \`M\${upper.join("L")}L\${lower.join("L")}Z\`;\r
}\r
\r
/**\r
 * Seekable waveform drawn the way studio editors show audio: a dense, symmetric track with\r
 * translucent peaks around a solid core of average loudness. The played part burns ruby\r
 * and brightens towards the light-beam cursor; hovering previews the seek point and its\r
 * time. Click or drag to seek, arrows step 5 s, Home/End jump to the edges. Peaks come\r
 * from \`points\` or are decoded from \`src\`.\r
 */\r
export function Waveform({\r
  duration: total,\r
  position: controlled,\r
  defaultPosition = 0,\r
  onSeek,\r
  points,\r
  src,\r
  bins = 600,\r
  color,\r
  label,\r
  disabled = false,\r
  ...p\r
}: WaveformProps) {\r
  const tr = useTr();\r
  const id = useSvgId();\r
  const surface = useRef<HTMLDivElement>(null);\r
  const drag = useRef<{ pointerId: number; position: number } | null>(null);\r
  const [hover, setHover] = useState<number | null>(null);\r
  const decoded = useWaveformPeaks(points ? null : src, bins);\r
  const loading = !points && !!src && decoded === null;\r
  const { peaksPath, corePath } = useMemo(() => {\r
    const { top, core } = points\r
      ? columns(points)\r
      : decoded\r
        ? columns(decoded.peaks, decoded.rms)\r
        : columns(demoSong);\r
    return { peaksPath: mirrored(top), corePath: mirrored(core) };\r
  }, [points, decoded]);\r
  // The track's shape as mask pictures, made once per shape; the bloom's is blurred in the picture.\r
  const masks = useMemo(() => {\r
    const picture = (body: string) =>\r
      \`url("data:image/svg+xml,\${encodeURIComponent(\`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 \${W} \${H}' preserveAspectRatio='none'>\${body}</svg>\`)}")\`;\r
    return {\r
      peaks: picture(\`<path d='\${peaksPath}'/>\`),\r
      core: picture(\`<path d='\${corePath}'/>\`),\r
      bloom: picture(\`<filter id='b' x='-5%' y='-50%' width='110%' height='200%'><feGaussianBlur stdDeviation='4'/></filter><path d='\${corePath}' filter='url(#b)'/>\`),\r
    };\r
  }, [peaksPath, corePath]);\r
  const duration = Math.max(0.001, total ?? 231);\r
  const [value, seek] = useControllable(controlled, defaultPosition, onSeek);\r
  const position = clamp(value, 0, duration);\r
  const progress = clamp(position / duration, 0, 1);\r
  const played = progress * W;\r
  const ahead = Math.max(0, (hover ?? 0) * W - played);\r
  // Playing = the position keeps creeping forward; sparks fly only then.\r
  const [playing, setPlaying] = useState(false);\r
  const previous = useRef(position);\r
  useEffect(() => {\r
    const step = position - previous.current;\r
    previous.current = position;\r
    if (step <= 0 || step > 1.5) return setPlaying(false);\r
    setPlaying(true);\r
    const timer = setTimeout(() => setPlaying(false), 300);\r
    return () => clearTimeout(timer);\r
  }, [position]);\r
  const shape = points\r
    ? "points"\r
    : decoded\r
      ? "file"\r
      : "demo";\r
\r
  const ratio = (event: PointerEvent<HTMLDivElement>) => {\r
    const box = surface.current?.getBoundingClientRect();\r
    return box?.width ? clamp((event.clientX - box.left) / box.width, 0, 1) : 0;\r
  };\r
  const finish = (cancelled = false) => {\r
    const current = drag.current;\r
    if (!current) return;\r
    drag.current = null;\r
    if (surface.current?.hasPointerCapture(current.pointerId))\r
      surface.current.releasePointerCapture(current.pointerId);\r
    if (cancelled && !disabled) seek(clamp(current.position, 0, duration));\r
    setHover(null);\r
  };\r
\r
  return (\r
    <div\r
      {...mark("Waveform", p)}\r
      ref={surface}\r
      role="slider"\r
      tabIndex={disabled ? -1 : 0}\r
      aria-label={label ?? tr("Позиция воспроизведения")}\r
      aria-valuemin={0}\r
      aria-valuemax={Math.round(duration)}\r
      aria-valuenow={Math.round(position)}\r
      aria-valuetext={timeText(position)}\r
      aria-disabled={disabled || undefined}\r
      data-loading={loading || undefined}\r
      data-playing={playing || undefined}\r
      style={\r
        {\r
          ...p.style,\r
          "--ad-wave-hover": hover === null ? undefined : \`\${hover * 100}%\`,\r
          ...(color ? { "--ad-wave-color": color } : {}),\r
        } as React.CSSProperties\r
      }\r
      onPointerDown={(event) => {\r
        if (disabled || event.button !== 0 || !event.isPrimary || drag.current) return;\r
        event.preventDefault();\r
        event.currentTarget.focus({ preventScroll: true });\r
        drag.current = { pointerId: event.pointerId, position };\r
        event.currentTarget.setPointerCapture(event.pointerId);\r
        seek(ratio(event) * duration);\r
      }}\r
      onPointerMove={(event) => {\r
        if (disabled) return;\r
        setHover(ratio(event));\r
        if (drag.current?.pointerId === event.pointerId)\r
          seek(ratio(event) * duration);\r
      }}\r
      onPointerUp={(event) => { if (drag.current?.pointerId === event.pointerId) finish(); }}\r
      onPointerCancel={(event) => { if (drag.current?.pointerId === event.pointerId) finish(true); }}\r
      onLostPointerCapture={(event) => { if (drag.current?.pointerId === event.pointerId) finish(true); }}\r
      onPointerLeave={() => setHover(null)}\r
      onKeyDown={(event) => {\r
        if (disabled) return;\r
        if (event.key === "Escape" && drag.current) {\r
          event.preventDefault();\r
          finish(true);\r
          return;\r
        }\r
        const next = {\r
          ArrowRight: position + KEY_STEP,\r
          ArrowLeft: position - KEY_STEP,\r
          Home: 0,\r
          End: duration,\r
        }[event.key];\r
        if (next === undefined) return;\r
        event.preventDefault();\r
        seek(clamp(next, 0, duration));\r
      }}\r
    >\r
      <span className="ad-waveform-floor" style={{ transform: \`scaleX(\${progress})\` }} aria-hidden />\r
      {/* The track itself never repaints during playback: everything that follows the position\r
          is a layer moved or stretched by transform over these still pictures. */}\r
      <svg\r
        key={shape}\r
        className="ad-waveform-base"\r
        viewBox={\`0 0 \${W} \${H}\`}\r
        preserveAspectRatio="none"\r
        aria-hidden="true"\r
      >\r
        <defs>\r
          <clipPath id={\`\${id}-track\`}>\r
            <path d={peaksPath} />\r
          </clipPath>\r
          {/* Brushed silver: brightest along the midline, fading to the edges. */}\r
          <linearGradient id={\`\${id}-silver\`} x1="0" x2="0" y1="0" y2="1">\r
            <stop offset="0" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />\r
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />\r
            <stop offset="1" stopColor="var(--ad-neutral-300)" stopOpacity="0.35" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-solid\`} x1="0" x2="0" y1="0" y2="1">\r
            <stop offset="0" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />\r
            <stop offset="0.5" stopColor="#fff" />\r
            <stop offset="1" stopColor="var(--ad-neutral-200)" stopOpacity="0.8" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-depth\`} x1="0" x2="0" y1="0" y2="1">\r
            {/* Lit from above: the upper half catches light, the lower sinks into shadow. */}\r
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />\r
            <stop offset="0.42" stopColor="#fff" stopOpacity="0" />\r
            <stop offset="0.56" stopColor="#000" stopOpacity="0" />\r
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />\r
          </linearGradient>\r
        </defs>\r
        <line className="ad-waveform-axis" x2={W} y1={MID} y2={MID} />\r
        <path className="ad-waveform-peaks" d={peaksPath} fill={\`url(#\${id}-silver)\`} />\r
        <path className="ad-waveform-core" d={corePath} fill={\`url(#\${id}-solid)\`} />\r
        <path className="ad-waveform-edge" d={peaksPath} />\r
      </svg>\r
      {ahead > 0 && (\r
        <svg className="ad-waveform-overlay" viewBox={\`0 0 \${W} \${H}\`} preserveAspectRatio="none" aria-hidden="true">\r
          <clipPath id={\`\${id}-ahead\`}>\r
            <rect x={played} width={ahead} height={H} />\r
          </clipPath>\r
          <g clipPath={\`url(#\${id}-ahead)\`} className="ad-waveform-ahead">\r
            <path d={peaksPath} />\r
            <path d={corePath} />\r
          </g>\r
        </svg>\r
      )}\r
      {/* Played: the ruby light seen through the track's shape, stretched up to the position\r
          (so it still builds up along the played part and peaks at the cursor). */}\r
      <span className="ad-waveform-layer ad-waveform-bloom" style={{ maskImage: masks.bloom, WebkitMaskImage: masks.bloom }} aria-hidden>\r
        <i style={{ transform: \`scaleX(\${progress})\` }} />\r
      </span>\r
      <span className="ad-waveform-layer ad-waveform-lit" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>\r
        <i style={{ transform: \`scaleX(\${progress})\` }} />\r
      </span>\r
      <span className="ad-waveform-layer ad-waveform-lit ad-waveform-lit-core" style={{ maskImage: masks.core, WebkitMaskImage: masks.core }} aria-hidden>\r
        <i style={{ transform: \`scaleX(\${progress})\` }} />\r
      </span>\r
      <span className="ad-waveform-layer ad-waveform-sheen-clip" data-ad-paused={progress === 0 ? "" : undefined} style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>\r
        <span className="ad-waveform-window" style={{ transform: \`translateX(calc(\${progress * 100}% - 100%))\` }}>\r
          <span className="ad-waveform-window-inner" style={{ transform: \`translateX(calc(100% - \${progress * 100}%))\` }}>\r
            <i className="ad-waveform-sheen" />\r
          </span>\r
        </span>\r
      </span>\r
      <span className="ad-waveform-layer ad-waveform-depth" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden />\r
      <span className="ad-waveform-layer ad-waveform-shade" style={{ maskImage: masks.peaks, WebkitMaskImage: masks.peaks }} aria-hidden>\r
        <span className="ad-waveform-follow" style={{ transform: \`translateX(\${progress * 100}%)\` }}>\r
          <i className="ad-waveform-spot" />\r
        </span>\r
      </span>\r
      <span className="ad-waveform-follow" style={{ transform: \`translateX(\${progress * 100}%)\` }} aria-hidden>\r
        <span className="ad-waveform-cursor">\r
          <span className="ad-waveform-sparks" data-ad-paused={playing ? undefined : ""}>\r
            {Array.from({ length: 8 }, (_, i) => (\r
              <i key={i} />\r
            ))}\r
          </span>\r
        </span>\r
      </span>\r
      {hover !== null && !disabled && (\r
        <span className="ad-waveform-hover" aria-hidden>\r
          <span className="ad-waveform-tip">{timeText(hover * duration)}</span>\r
        </span>\r
      )}\r
    </div>\r
  );\r
}\r
`;export{e as default};
