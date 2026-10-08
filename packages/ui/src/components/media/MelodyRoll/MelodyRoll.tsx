import { tr, useTr } from "../../../core/i18n";
import { useRef, type CSSProperties, type WheelEvent } from "react";
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";

export interface MelodyNote {
  id: string;
  /** Seconds. */
  start: number;
  end: number;
  /** MIDI pitch: 60 is C4. */
  pitch: number;
  /** Syllable sung on the note. */
  lyric?: string;
}

export interface MelodyRollProps extends CommonProps {
  notes?: readonly MelodyNote[];
  /** Playback position, seconds. */
  position?: number;
  /** Seconds shown across the lane; the wheel zooms it when uncontrolled or with `onWindowChange`. */
  window?: number;
  defaultWindow?: number;
  onWindowChange?: (seconds: number) => void;
  /** Where the playhead sits across the lane, 0–1. */
  lead?: number;
  /** Pitch range shown; by default the notes' own range with a little air. */
  minPitch?: number;
  maxPitch?: number;
  /** The singer's pitch now, as a fractional MIDI note; nothing when silent. */
  livePitch?: number;
  /** How close the singer is to the note under the playhead, 0–1: colours the voice marker. */
  accuracy?: number;
  /** The singer is on the right note now: marker and key turn green. */
  hit?: boolean;
  /** Notes already sung right: they turn green with a burst. */
  hitIds?: ReadonlySet<string>;
  /** Loudness of the voice, 0–1: the marker swells with it. */
  level?: number;
  /** Pulse of the music, 0–1 (e.g. the kick drum): the playhead and lane flash with it. */
  beat?: number;
  /** Syllables inside the notes. */
  showLyrics?: boolean;
  /** Pressing a key, e.g. to hear its pitch. */
  onKeyPress?: (midi: number) => void;
  label?: string;
}

const DEMO: MelodyNote[] = [
  { id: "1", start: 0.4, end: 1.1, pitch: 64, lyric: "Ночь" },
  { id: "2", start: 1.2, end: 1.6, pitch: 67, lyric: "го" },
  { id: "3", start: 1.7, end: 2.5, pitch: 69, lyric: "рит" },
  { id: "4", start: 2.7, end: 3.4, pitch: 67, lyric: "ог" },
  { id: "5", start: 3.5, end: 4.3, pitch: 64, lyric: "ня" },
  { id: "6", start: 4.5, end: 5.8, pitch: 62, lyric: "ми" },
  { id: "7", start: 6.2, end: 6.9, pitch: 60, lyric: "и" },
  { id: "8", start: 7, end: 8.2, pitch: 64, lyric: "нас" },
];
// The voice trail keeps this much of the past, in seconds.
const TRAIL = 3;

/**
 * The karaoke melody lane: notes glide towards the playhead, the singer's voice is a marker that
 * leaves a trail, notes sung right flash green, and the lane breathes with the music. The keyboard
 * on the left shows which key the voice is on. Scroll the wheel to zoom in or out in time.
 */
export const MelodyRoll = ({
  notes = DEMO,
  position = 2,
  window: windowProp,
  defaultWindow = 8,
  onWindowChange,
  lead = 0.25,
  minPitch,
  maxPitch,
  livePitch,
  accuracy = 0,
  hit = false,
  hitIds,
  level = 0,
  beat = 0,
  showLyrics = false,
  onKeyPress,
  label,
  ...p
}: MelodyRollProps) => {
  const tr = useTr();
  const [span, setSpan] = useControllable(windowProp, defaultWindow, onWindowChange);
  const pitches = notes.map((note) => note.pitch);
  const low = minPitch ?? Math.min(...pitches, 60) - 2;
  const high = Math.max(low + 4, maxPitch ?? Math.max(...pitches, 64) + 2);
  const rows = high - low + 1;
  const from = position - span * lead;
  const x = (seconds: number) => ((seconds - from) / span) * 100;
  const y = (pitch: number) => ((high - pitch) / rows) * 100;
  const visible = notes.filter((note) => note.end >= from && note.start <= from + span);

  // The voice trail: recent pitches, dropped on silence and when playback jumps back.
  const trail = useRef<{ t: number; pitch?: number }[]>([]);
  if (trail.current.at(-1)?.t !== position) {
    const kept = trail.current.filter((point) => point.t > position - TRAIL && point.t < position);
    trail.current = [...kept, { t: position, pitch: livePitch }];
  }
  const segments = trail.current.reduce<string[]>((paths, point, i, all) => {
    if (point.pitch === undefined) return paths;
    const joined = i > 0 && all[i - 1]?.pitch !== undefined;
    const at = `${x(point.t).toFixed(2)},${(((high - point.pitch + 0.5) / rows) * 100).toFixed(2)}`;
    if (joined) paths[paths.length - 1] += ` L${at}`;
    else paths.push(`M${at}`);
    return paths;
  }, []);

  const zoom = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.deltaY) return;
    setSpan(clamp(span * (event.deltaY > 0 ? 1.12 : 1 / 1.12), 2, 20));
  };

  return (
    <div
      {...mark("MelodyRoll", p)}
      role="img"
      aria-label={label ?? tr("Мелодия")}
      onWheel={zoom}
      style={
        {
          ...p.style,
          "--ad-roll-rows": rows,
          "--ad-roll-beat": clamp(beat, 0, 1),
          "--ad-roll-level": clamp(level, 0, 1),
          "--ad-roll-accuracy": clamp(accuracy, 0, 1),
          "--ad-roll-second": `${100 / span}cqw`,
          "--ad-roll-shift": `${(-(((from % 1) + 1) % 1) / span) * 100}cqw`,
        } as CSSProperties
      }
    >
      <PianoKeyboard
        className="ad-melody-roll-keys"
        minMidi={low}
        maxMidi={high}
        activeMidi={livePitch === undefined ? undefined : Math.round(livePitch)}
        hit={hit}
        labels={rows > 30 ? "octaves" : "all"}
        onKeyPress={onKeyPress}
      />
      <div className="ad-melody-roll-lane" aria-hidden="true">
        <span className="ad-melody-roll-seconds" />
        {/* The notes sit on a strip in song time that slides under the playhead: playback moves
            one layer instead of laying out and repainting every note on every tick. */}
        <div className="ad-melody-roll-strip" style={{ transform: `translateX(${((-from / span) * 100).toFixed(3)}%)` }}>
        {visible.map((note) => (
          <span
            key={note.id}
            className="ad-melody-note"
            data-hit={hitIds?.has(note.id) || undefined}
            data-now={(position >= note.start && position <= note.end) || undefined}
            data-past={position > note.end || undefined}
            style={{
              left: `${(note.start / span) * 100}%`,
              width: `${Math.max(0.6, ((note.end - note.start) / span) * 100)}%`,
              top: `${y(note.pitch)}%`,
            }}
          >
            {showLyrics && note.lyric && <span>{note.lyric}</span>}
          </span>
        ))}
        </div>
        <svg className="ad-melody-trail" viewBox="0 0 100 100" preserveAspectRatio="none">
          {segments.flatMap((d, i) => [
            <path key={`${i}-wide`} data-halo="wide" d={d} vectorEffect="non-scaling-stroke" />,
            <path key={`${i}-near`} data-halo="near" d={d} vectorEffect="non-scaling-stroke" />,
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />,
          ])}
        </svg>
        <span className="ad-melody-playhead" style={{ left: `${lead * 100}%` }} />
        {livePitch !== undefined && (
          <span
            className="ad-melody-voice"
            data-hit={hit || undefined}
            style={{ left: `${lead * 100}%`, top: `${((high - livePitch + 0.5) / rows) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
};
