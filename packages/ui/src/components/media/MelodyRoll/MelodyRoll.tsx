import { useTr } from "../../../core/i18n";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type WheelEvent } from "react";
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";
import { createMelodyGlow } from "./melody-glow.js";

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
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<ReturnType<typeof createMelodyGlow>>(null);
  const [glowReady, setGlowReady] = useState(false);
  const [span, setSpan] = useControllable(windowProp, defaultWindow, onWindowChange);
  const indexed = useMemo(() => {
    let low = 60, high = 64;
    const blocks: { start: number; end: number; notes: readonly MelodyNote[] }[] = [];
    // Preserve input order and overlapping notes; skip whole blocks outside the viewport.
    for (let i = 0; i < notes.length; i += 128) {
      const block = notes.slice(i, i + 128);
      let start = Infinity, end = -Infinity;
      for (const note of block) {
        low = Math.min(low, note.pitch);
        high = Math.max(high, note.pitch);
        start = Math.min(start, note.start);
        end = Math.max(end, note.end);
      }
      blocks.push({ start, end, notes: block });
    }
    return { low: low - 2, high: high + 2, blocks };
  }, [notes]);
  const low = minPitch ?? indexed.low;
  const high = Math.max(low + 4, maxPitch ?? indexed.high);
  const rows = high - low + 1;
  const from = position - span * lead;
  const origin = Math.floor(from / span) * span;
  const x = (seconds: number) => ((seconds - from) / span) * 100;
  const rangeStart = glowReady ? origin : from;
  const rangeEnd = glowReady ? origin + span * 2 : from + span;
  const visible = useMemo(() => indexed.blocks.filter(block => block.end >= rangeStart && block.start <= rangeEnd)
    .flatMap(block => block.notes.filter(note => note.end >= rangeStart && note.start <= rangeEnd)), [indexed, rangeStart, rangeEnd]);
  // Keep the note elements unchanged until their visibility, playback phase or hit changes.
  const phases = glowReady ? "" : visible.map(note => note.end < from || note.start > from + span ? 'x' : position >= note.start && position <= note.end ? 'n' : position > note.end ? 'p' : '-').join('');
  const hits = hitIds?.size ? visible.map(note => hitIds.has(note.id) ? 'h' : '-').join('') : '';
  const glowState = { beat: clamp(beat, 0, 1), pitch: livePitch, high, rows, lead, accuracy: clamp(accuracy, 0, 1), level: clamp(level, 0, 1), hit, position, span, notes: visible, hits, showLyrics };
  useEffect(() => {
    if (!root.current) return;
    glow.current = createMelodyGlow(root.current, { ...glowState, trail: trail.current }, setGlowReady);
    return () => { glow.current?.dispose(); glow.current = null; };
  }, []);
  useLayoutEffect(() => { glow.current?.update(glowState); }, [beat, livePitch, high, rows, lead, accuracy, level, hit, position, span, visible, hits, showLyrics]);
  const nativeHits = glowReady ? "" : hits;
  const noteElements = useMemo(() => glowReady ? undefined : visible.map((note, i) => {
    const hidden = phases[i] === 'x';
    return (
      <span key={note.id} className="ad-melody-note" data-hit={(!hidden && nativeHits[i] === 'h') || undefined}
        data-now={phases[i] === 'n' || undefined} data-past={phases[i] === 'p' || undefined}
        style={{
          visibility: hidden ? 'hidden' : undefined,
          left: `${((note.start - origin) / span) * 100}%`,
          width: `${Math.max(0.6, ((note.end - note.start) / span) * 100)}%`,
          top: `${((high - note.pitch) / rows) * 100}%`,
        }}>
        {showLyrics && note.lyric && <span>{note.lyric}</span>}
      </span>
    );
  }), [glowReady, visible, phases, nativeHits, showLyrics, origin, span, high, rows]);

  // The voice trail: recent pitches, dropped on silence and when playback jumps back.
  const trail = useRef<{ t: number; pitch?: number }[]>([]);
  if (trail.current.at(-1)?.t !== position) {
    if (position < (trail.current.at(-1)?.t ?? position)) trail.current = trail.current.filter(point => point.t < position);
    const expired = trail.current.findIndex(point => point.t > position - TRAIL);
    trail.current.splice(0, expired < 0 ? trail.current.length : expired);
    trail.current.push({ t: position, pitch: livePitch });
  }
  const segments = glowReady ? [] : trail.current.reduce<string[]>((paths, point, i, all) => {
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

  // Playback updates the worker; keep the native surface unchanged between structural edits.
  const nativeState = glowReady ? null : glowState;
  const content = useMemo(() => (
      <div className="ad-melody-roll-content">
      <PianoKeyboard
        className="ad-melody-roll-keys"
        minMidi={low}
        maxMidi={high}
        activeMidi={glowReady || livePitch === undefined ? undefined : Math.round(livePitch)}
        hit={!glowReady && hit}
        labels={rows > 30 ? "octaves" : "all"}
        onKeyPress={onKeyPress}
      />
      <div className="ad-melody-roll-lane" aria-hidden="true">
        <span className="ad-melody-roll-seconds" style={glowReady ? undefined : { "--ad-roll-shift": `${(-(((from % 1) + 1) % 1) / span) * 100}cqw` } as CSSProperties} />
        {/* The notes sit on a strip in song time that slides under the playhead: playback moves
            one layer instead of laying out and repainting every note on every tick. */}
        <div className="ad-melody-roll-strip" style={glowReady ? undefined : { transform: `translateX(${(((origin - from) / span) * 100).toFixed(3)}%)` }}>
        {noteElements}
        </div>
        {!glowReady && <svg className="ad-melody-trail" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ "--ad-roll-accuracy": clamp(accuracy, 0, 1) } as CSSProperties}>
          {segments.flatMap((d, i) => [
            <path key={`${i}-wide`} data-halo="wide" d={d} vectorEffect="non-scaling-stroke" />,
            <path key={`${i}-near`} data-halo="near" d={d} vectorEffect="non-scaling-stroke" />,
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />,
          ])}
        </svg>}
        <span className="ad-melody-playhead" style={{ left: `${lead * 100}%` }}>
          <span className="ad-melody-playhead-light" style={{ opacity: glowReady ? 0 : clamp(beat, 0, 1) }} />
        </span>
        {!glowReady && livePitch !== undefined && (
          <span
            className="ad-melody-voice"
            data-hit={hit || undefined}
            style={{ left: `${lead * 100}%`, top: `${((high - livePitch + 0.5) / rows) * 100}%`, "--ad-roll-level": clamp(level, 0, 1), "--ad-roll-accuracy": clamp(accuracy, 0, 1) } as CSSProperties}
          />
        )}
      </div>
      </div>
  ), [glowReady, noteElements, low, high, rows, onKeyPress, lead, nativeState]);

  return (
    <div
      {...mark("MelodyRoll", p)}
      ref={root}
      role="img"
      aria-label={label ?? tr("Мелодия")}
      onWheel={zoom}
      style={
        {
          ...p.style,
          "--ad-roll-rows": rows,
          "--ad-roll-beat": glowReady ? 0 : clamp(beat, 0, 1),
          "--ad-roll-second": `${100 / span}cqw`,
        } as CSSProperties
      }
    >
      <span className="ad-melody-roll-light" aria-hidden="true" style={{ opacity: glowReady ? 0 : clamp(beat, 0, 1) }} />
      {content}
    </div>
  );
};
