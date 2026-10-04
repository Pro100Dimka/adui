const e=`import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { clamp, mark, useControllable, type CommonProps } from "../../../core/base";
import { PianoKeyboard, isBlackKey } from "../../media/PianoKeyboard/PianoKeyboard";

export interface PianoRollNote {
  id: string;
  /** Seconds. */
  start: number;
  end: number;
  /** MIDI pitch: 60 is C4. */
  pitch: number;
}
export interface PianoRollWord {
  id: string;
  text: string;
  start: number;
  end: number;
}
/** A drag in progress, measured from where it started; the owner applies its own rules (snapping, limits). */
export type PianoRollGesture =
  | { kind: "move"; ids: readonly string[]; pitch: number; seconds: number }
  | { kind: "resize"; id: string; edge: "start" | "end"; seconds: number };

export interface PianoRollProps extends CommonProps {
  notes?: readonly PianoRollNote[];
  words?: readonly PianoRollWord[];
  /** Length of the song, seconds. */
  duration?: number;
  /** Playback position, seconds. */
  position?: number;
  selected?: ReadonlySet<string>;
  /** Horizontal zoom, 1 = a comfortable default; Ctrl + wheel changes it. */
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** Pitch range, lowest to highest MIDI note. */
  minPitch?: number;
  maxPitch?: number;
  /** Keep the playhead in view while it moves. */
  follow?: boolean;
  /** Show the beat grid. */
  grid?: boolean;
  /** Seconds an arrow key moves a note. */
  nudgeSeconds?: number;
  onSelect?: (id: string, additive: boolean) => void;
  onSelectArea?: (ids: string[], additive: boolean) => void;
  onSeek?: (seconds: number) => void;
  onNoteDrag?: (gesture: PianoRollGesture) => void;
  onNoteDragEnd?: () => void;
  onNudge?: (id: string, pitch: number, seconds: number) => void;
  /** Pressing a key, e.g. to hear its pitch. */
  onKeyPress?: (midi: number) => void;
  label?: string;
}

const DEMO: PianoRollNote[] = [
  { id: "1", start: 0.4, end: 1.1, pitch: 64 },
  { id: "2", start: 1.2, end: 1.6, pitch: 67 },
  { id: "3", start: 1.7, end: 2.6, pitch: 69 },
  { id: "4", start: 2.8, end: 3.4, pitch: 67 },
  { id: "5", start: 3.5, end: 4.4, pitch: 64 },
  { id: "6", start: 4.6, end: 6, pitch: 62 },
];
const DEMO_WORDS: PianoRollWord[] = [
  { id: "a", text: "Ночь", start: 0.4, end: 1.1 },
  { id: "b", text: "горит", start: 1.2, end: 2.6 },
  { id: "c", text: "огнями", start: 2.8, end: 6 },
];

type Drag =
  | { kind: "move"; ids: string[]; x: number; y: number; secondPx: number; rowPx: number }
  | { kind: "resize"; id: string; edge: "start" | "end"; x: number; secondPx: number }
  | { kind: "area"; x: number; y: number; additive: boolean; box: DOMRect };

/**
 * A melody editor: notes on a piano grid with the keyboard at the left, a ruler to seek, the
 * syllables under the notes and the playhead. Drag a note to move it in time and pitch, drag its
 * edges to change its length, drag on the empty grid to select an area, Ctrl + wheel to zoom.
 */
export const PianoRoll = ({
  notes = DEMO,
  words = notes === DEMO ? DEMO_WORDS : [],
  duration = 8,
  position = 2,
  selected,
  zoom: zoomProp,
  defaultZoom = 1,
  onZoomChange,
  minPitch = 55,
  maxPitch = 79,
  follow = false,
  grid = true,
  nudgeSeconds = 0.05,
  onSelect,
  onSelectArea,
  onSeek,
  onNoteDrag,
  onNoteDragEnd,
  onNudge,
  onKeyPress,
  label,
  ...p
}: PianoRollProps) => {
  const [zoom, setZoom] = useControllable(zoomProp, defaultZoom, onZoomChange);
  const scroller = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const areaBox = useRef<HTMLDivElement>(null);
  const rows = maxPitch - minPitch + 1;
  const length = Math.max(duration, 1);
  const at = (seconds: number) => \`calc(var(--ad-pps) * \${seconds})\`;
  const row = (pitch: number) => \`calc(100% * \${(maxPitch - pitch) / rows})\`;
  const seconds = Array.from({ length: Math.ceil(length) + 1 }, (_, i) => i);

  // Following playback keeps the playhead a third of the way across the view.
  useEffect(() => {
    const box = scroller.current;
    const area = world.current;
    if (!follow || !box || !area) return;
    const x = (position / length) * area.offsetWidth;
    if (x < box.scrollLeft || x > box.scrollLeft + box.clientWidth * 0.8) box.scrollLeft = Math.max(0, x - box.clientWidth * 0.3);
  }, [follow, position, length, zoom]);

  const scale = () => {
    const area = world.current?.getBoundingClientRect();
    return { secondPx: (area?.width ?? 1) / length, rowPx: (area?.height ?? rows) / rows, area };
  };
  const startMove = (event: PointerEvent<HTMLElement>, note: PianoRollNote) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const ids = selected?.has(note.id) && !additive ? [...selected] : [note.id];
    onSelect?.(note.id, additive);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const { secondPx, rowPx } = scale();
    drag.current = { kind: "move", ids, x: event.clientX, y: event.clientY, secondPx, rowPx };
  };
  const startResize = (event: PointerEvent<HTMLElement>, note: PianoRollNote, edge: "start" | "end") => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { kind: "resize", id: note.id, edge, x: event.clientX, secondPx: scale().secondPx };
  };
  const startArea = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !world.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { kind: "area", x: event.clientX, y: event.clientY, additive: event.ctrlKey || event.shiftKey, box: world.current.getBoundingClientRect() };
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    if (current.kind === "move")
      onNoteDrag?.({ kind: "move", ids: current.ids, seconds: (event.clientX - current.x) / current.secondPx, pitch: -Math.round((event.clientY - current.y) / current.rowPx) });
    else if (current.kind === "resize")
      onNoteDrag?.({ kind: "resize", id: current.id, edge: current.edge, seconds: (event.clientX - current.x) / current.secondPx });
    else if (areaBox.current) {
      const left = Math.min(current.x, event.clientX) - current.box.left;
      const top = Math.min(current.y, event.clientY) - current.box.top;
      Object.assign(areaBox.current.style, {
        display: "block",
        left: \`\${left}px\`,
        top: \`\${top}px\`,
        width: \`\${Math.abs(event.clientX - current.x)}px\`,
        height: \`\${Math.abs(event.clientY - current.y)}px\`,
      });
    }
  };
  const end = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (current.kind !== "area") return onNoteDragEnd?.();
    if (areaBox.current) areaBox.current.style.display = "none";
    const { secondPx, rowPx } = scale();
    const x0 = (Math.min(current.x, event.clientX) - current.box.left) / secondPx;
    const x1 = (Math.max(current.x, event.clientX) - current.box.left) / secondPx;
    const top = maxPitch - (Math.max(current.y, event.clientY) - current.box.top) / rowPx;
    const bottom = maxPitch - (Math.min(current.y, event.clientY) - current.box.top) / rowPx;
    // A click without a drag seeks; a drag picks the notes inside the area.
    if (Math.abs(event.clientX - current.x) < 4 && Math.abs(event.clientY - current.y) < 4) return onSeek?.(clamp(x0, 0, length));
    onSelectArea?.(notes.filter((note) => note.end >= x0 && note.start <= x1 && note.pitch >= top - 1 && note.pitch <= bottom).map((note) => note.id), current.additive);
  };
  const nudge = (event: KeyboardEvent<HTMLElement>, note: PianoRollNote) => {
    const steps: Record<string, [number, number]> = {
      ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -nudgeSeconds], ArrowRight: [0, nudgeSeconds],
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    onNudge?.(note.id, step[0], step[1]);
  };
  const wheel = (event: WheelEvent<HTMLElement>) => {
    if (!event.ctrlKey || !event.deltaY) return;
    event.preventDefault();
    setZoom(clamp(zoom * (event.deltaY > 0 ? 1 / 1.15 : 1.15), 0.25, 6));
  };

  return (
    <div
      {...mark("PianoRoll", p)}
      role="application"
      aria-label={label ?? "Редактор мелодии"}
      data-grid={grid || undefined}
      style={{ ...p.style, "--ad-pps": \`\${4 * zoom}rem\`, "--ad-roll-rows": rows } as CSSProperties}
    >
      <div className="ad-piano-roll-scroll" ref={scroller} onWheel={wheel}>
        <div className="ad-piano-roll-corner" />
        <div className="ad-piano-roll-ruler" style={{ width: at(length) }}
          onPointerDown={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            onSeek?.(clamp(((event.clientX - box.left) / box.width) * length, 0, length));
          }}>
          {seconds.map((second) => (
            <span key={second} style={{ left: at(second) }} data-major={second % 5 === 0 || undefined}>{second}</span>
          ))}
          <i className="ad-piano-roll-head-mark" style={{ left: at(position) }} />
        </div>
        <PianoKeyboard className="ad-piano-roll-keys" minMidi={minPitch} maxMidi={maxPitch} labels="octaves" onKeyPress={onKeyPress} />
        <div className="ad-piano-roll-world" ref={world} style={{ width: at(length) }}
          onPointerDown={startArea} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
          {Array.from({ length: rows }, (_, i) => maxPitch - i).filter(isBlackKey).map((pitch) => (
            <i key={pitch} className="ad-piano-roll-row" style={{ top: row(pitch) }} />
          ))}
          {notes.map((note) => (
            <div key={note.id} className="ad-piano-roll-note" data-selected={selected?.has(note.id) || undefined}
              data-now={(position >= note.start && position <= note.end) || undefined}
              style={{ left: at(note.start), width: \`max(0.25rem, \${at(note.end - note.start)})\`, top: row(note.pitch) }}>
              <button type="button" className="ad-piano-roll-note-body" aria-label={\`Нота \${note.pitch}\`} aria-pressed={selected?.has(note.id) ?? false}
                onPointerDown={(event) => startMove(event, note)} onKeyDown={(event) => nudge(event, note)} />
              <span className="ad-piano-roll-edge" data-edge="start" aria-hidden="true" onPointerDown={(event) => startResize(event, note, "start")} />
              <span className="ad-piano-roll-edge" data-edge="end" aria-hidden="true" onPointerDown={(event) => startResize(event, note, "end")} />
            </div>
          ))}
          <div className="ad-piano-roll-area" ref={areaBox} />
          <span className="ad-piano-roll-playhead" style={{ left: at(position) }} />
        </div>
        {words.length > 0 && <>
          <div className="ad-piano-roll-corner" />
          <div className="ad-piano-roll-words" style={{ width: at(length) }}>
            {words.map((word) => (
              <span key={word.id} style={{ left: at(word.start), width: at(word.end - word.start) }}
                data-sung={position > word.end || undefined} data-now={(position >= word.start && position <= word.end) || undefined}>
                {word.text}
              </span>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
};
`;export{e as default};
