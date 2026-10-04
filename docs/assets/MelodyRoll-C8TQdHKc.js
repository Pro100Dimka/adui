const n=`import { useRef, type CSSProperties, type WheelEvent } from "react";\r
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";\r
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";\r
\r
export interface MelodyNote {\r
  id: string;\r
  /** Seconds. */\r
  start: number;\r
  end: number;\r
  /** MIDI pitch: 60 is C4. */\r
  pitch: number;\r
  /** Syllable sung on the note. */\r
  lyric?: string;\r
}\r
\r
export interface MelodyRollProps extends CommonProps {\r
  notes?: readonly MelodyNote[];\r
  /** Playback position, seconds. */\r
  position?: number;\r
  /** Seconds shown across the lane; the wheel zooms it when uncontrolled or with \`onWindowChange\`. */\r
  window?: number;\r
  defaultWindow?: number;\r
  onWindowChange?: (seconds: number) => void;\r
  /** Where the playhead sits across the lane, 0–1. */\r
  lead?: number;\r
  /** Pitch range shown; by default the notes' own range with a little air. */\r
  minPitch?: number;\r
  maxPitch?: number;\r
  /** The singer's pitch now, as a fractional MIDI note; nothing when silent. */\r
  livePitch?: number;\r
  /** How close the singer is to the note under the playhead, 0–1: colours the voice marker. */\r
  accuracy?: number;\r
  /** The singer is on the right note now: marker and key turn green. */\r
  hit?: boolean;\r
  /** Notes already sung right: they turn green with a burst. */\r
  hitIds?: ReadonlySet<string>;\r
  /** Loudness of the voice, 0–1: the marker swells with it. */\r
  level?: number;\r
  /** Pulse of the music, 0–1 (e.g. the kick drum): the playhead and lane flash with it. */\r
  beat?: number;\r
  /** Syllables inside the notes. */\r
  showLyrics?: boolean;\r
  /** Pressing a key, e.g. to hear its pitch. */\r
  onKeyPress?: (midi: number) => void;\r
  label?: string;\r
}\r
\r
const DEMO: MelodyNote[] = [\r
  { id: "1", start: 0.4, end: 1.1, pitch: 64, lyric: "Ночь" },\r
  { id: "2", start: 1.2, end: 1.6, pitch: 67, lyric: "го" },\r
  { id: "3", start: 1.7, end: 2.5, pitch: 69, lyric: "рит" },\r
  { id: "4", start: 2.7, end: 3.4, pitch: 67, lyric: "ог" },\r
  { id: "5", start: 3.5, end: 4.3, pitch: 64, lyric: "ня" },\r
  { id: "6", start: 4.5, end: 5.8, pitch: 62, lyric: "ми" },\r
  { id: "7", start: 6.2, end: 6.9, pitch: 60, lyric: "и" },\r
  { id: "8", start: 7, end: 8.2, pitch: 64, lyric: "нас" },\r
];\r
// The voice trail keeps this much of the past, in seconds.\r
const TRAIL = 3;\r
\r
/**\r
 * The karaoke melody lane: notes glide towards the playhead, the singer's voice is a marker that\r
 * leaves a trail, notes sung right flash green, and the lane breathes with the music. The keyboard\r
 * on the left shows which key the voice is on. Scroll the wheel to zoom in or out in time.\r
 */\r
export const MelodyRoll = ({\r
  notes = DEMO,\r
  position = 2,\r
  window: windowProp,\r
  defaultWindow = 8,\r
  onWindowChange,\r
  lead = 0.25,\r
  minPitch,\r
  maxPitch,\r
  livePitch,\r
  accuracy = 0,\r
  hit = false,\r
  hitIds,\r
  level = 0,\r
  beat = 0,\r
  showLyrics = false,\r
  onKeyPress,\r
  label,\r
  ...p\r
}: MelodyRollProps) => {\r
  const [span, setSpan] = useControllable(windowProp, defaultWindow, onWindowChange);\r
  const pitches = notes.map((note) => note.pitch);\r
  const low = minPitch ?? Math.min(...pitches, 60) - 2;\r
  const high = Math.max(low + 4, maxPitch ?? Math.max(...pitches, 64) + 2);\r
  const rows = high - low + 1;\r
  const from = position - span * lead;\r
  const x = (seconds: number) => ((seconds - from) / span) * 100;\r
  const y = (pitch: number) => ((high - pitch) / rows) * 100;\r
  const visible = notes.filter((note) => note.end >= from && note.start <= from + span);\r
\r
  // The voice trail: recent pitches, dropped on silence and when playback jumps back.\r
  const trail = useRef<{ t: number; pitch?: number }[]>([]);\r
  if (trail.current.at(-1)?.t !== position) {\r
    const kept = trail.current.filter((point) => point.t > position - TRAIL && point.t < position);\r
    trail.current = [...kept, { t: position, pitch: livePitch }];\r
  }\r
  const segments = trail.current.reduce<string[]>((paths, point, i, all) => {\r
    if (point.pitch === undefined) return paths;\r
    const joined = i > 0 && all[i - 1]?.pitch !== undefined;\r
    const at = \`\${x(point.t).toFixed(2)},\${(((high - point.pitch + 0.5) / rows) * 100).toFixed(2)}\`;\r
    if (joined) paths[paths.length - 1] += \` L\${at}\`;\r
    else paths.push(\`M\${at}\`);\r
    return paths;\r
  }, []);\r
\r
  const zoom = (event: WheelEvent<HTMLDivElement>) => {\r
    if (!event.deltaY) return;\r
    setSpan(clamp(span * (event.deltaY > 0 ? 1.12 : 1 / 1.12), 2, 20));\r
  };\r
\r
  return (\r
    <div\r
      {...mark("MelodyRoll", p)}\r
      role="img"\r
      aria-label={label ?? "Мелодия"}\r
      onWheel={zoom}\r
      style={\r
        {\r
          ...p.style,\r
          "--ad-roll-rows": rows,\r
          "--ad-roll-beat": clamp(beat, 0, 1),\r
          "--ad-roll-level": clamp(level, 0, 1),\r
          "--ad-roll-accuracy": clamp(accuracy, 0, 1),\r
          "--ad-roll-second": \`\${100 / span}%\`,\r
          "--ad-roll-shift": \`\${(-(from % 1) / span) * 100}%\`,\r
        } as CSSProperties\r
      }\r
    >\r
      <PianoKeyboard\r
        className="ad-melody-roll-keys"\r
        minMidi={low}\r
        maxMidi={high}\r
        activeMidi={livePitch === undefined ? undefined : Math.round(livePitch)}\r
        hit={hit}\r
        labels={rows > 30 ? "octaves" : "all"}\r
        onKeyPress={onKeyPress}\r
      />\r
      <div className="ad-melody-roll-lane" aria-hidden="true">\r
        {visible.map((note) => (\r
          <span\r
            key={note.id}\r
            className="ad-melody-note"\r
            data-hit={hitIds?.has(note.id) || undefined}\r
            data-now={(position >= note.start && position <= note.end) || undefined}\r
            data-past={position > note.end || undefined}\r
            style={{\r
              left: \`\${x(note.start)}%\`,\r
              width: \`\${Math.max(0.6, ((note.end - note.start) / span) * 100)}%\`,\r
              top: \`\${y(note.pitch)}%\`,\r
            }}\r
          >\r
            {showLyrics && note.lyric && <span>{note.lyric}</span>}\r
          </span>\r
        ))}\r
        <svg className="ad-melody-trail" viewBox="0 0 100 100" preserveAspectRatio="none">\r
          {segments.map((d, i) => (\r
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />\r
          ))}\r
        </svg>\r
        <span className="ad-melody-playhead" style={{ left: \`\${lead * 100}%\` }} />\r
        {livePitch !== undefined && (\r
          <span\r
            className="ad-melody-voice"\r
            data-hit={hit || undefined}\r
            style={{ left: \`\${lead * 100}%\`, top: \`\${((high - livePitch + 0.5) / rows) * 100}%\` }}\r
          />\r
        )}\r
      </div>\r
    </div>\r
  );\r
};\r
`;export{n as default};
