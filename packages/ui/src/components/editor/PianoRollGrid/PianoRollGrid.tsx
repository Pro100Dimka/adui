import { useEffect, useRef, useState, type CSSProperties } from "react";
import { clamp, mark, useControllable } from "../../../core/base";
import { Toolbar } from "../../layout/Toolbar/Toolbar";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { Icon } from "../../layout/Icon/Icon";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import type { NoteGeometry, PianoRollGridProps } from "../shared";

/** Geometry units: 6 per rem horizontally, 18 per pitch row vertically; one beat is 18 units. */
const UNIT = 6;
const ROW = 18;
const BEAT = 18;
const LENGTH = 252;
const KEYS = [
  "C5",
  "B4",
  "A#4",
  "A4",
  "G#4",
  "G4",
  "F#4",
  "F4",
  "E4",
  "D#4",
  "D4",
  "C#4",
];
const LYRICS = ["Ночь", "го", "рит", "ог", "ня", "ми"];
const DEFAULT_NOTES: NoteGeometry[] = [
  { x: 9, y: 8 * ROW, width: 30 },
  { x: 45, y: 5 * ROW, width: 15 },
  { x: 66, y: 3 * ROW, width: 30 },
  { x: 108, y: 5 * ROW, width: 27 },
  { x: 144, y: 8 * ROW, width: 33 },
  { x: 189, y: 10 * ROW, width: 45 },
];

const rowOf = (note: NoteGeometry) =>
  clamp(Math.round(note.y / ROW), 0, KEYS.length - 1);

export const PianoRollGrid = (p: PianoRollGridProps) => {
  const [notes, setNotes] = useControllable(p.notes, DEFAULT_NOTES, p.onChange);
  const [head, setHead] = useControllable(p.playhead, 100, p.onPlayheadChange);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [box, setBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const world = useRef<HTMLDivElement>(null);

  // Playback: two beats per second, looping over the visible length.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setHead((h) => (h + ((now - last) / 1000) * BEAT * 2) % LENGTH);
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, setHead]);

  const rem = () =>
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const toUnits = (px: number) => px / ((rem() / UNIT) * zoom);

  const dragNote = (
    index: number,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setPicked(index);
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = { x: event.clientX, y: event.clientY, note: notes[index] };
    const rowPx = event.currentTarget.parentElement
      ? event.currentTarget.parentElement.clientHeight / KEYS.length
      : 28;
    const move = (e: PointerEvent) =>
      setNotes((all) =>
        all.map((n, i) =>
          i === index
            ? {
                ...n,
                x: clamp(
                  start.note.x + toUnits(e.clientX - start.x),
                  0,
                  LENGTH - n.width,
                ),
                y:
                  clamp(
                    rowOf(start.note) +
                      Math.round((e.clientY - start.y) / rowPx),
                    0,
                    KEYS.length - 1,
                  ) * ROW,
              }
            : n,
        ),
      );
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    setPicked(null);
    if (!p.selection || !world.current) return;
    const r = world.current.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    setBox({ x, y, w: 0, h: 0 });
    const move = (e: PointerEvent) =>
      setBox({
        x: Math.min(x, e.clientX - r.left),
        y: Math.min(y, e.clientY - r.top),
        w: Math.abs(e.clientX - r.left - x),
        h: Math.abs(e.clientY - r.top - y),
      });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const at = (units: number) =>
    `calc(${units / UNIT}rem * var(--ad-editor-zoom))`;

  return (
    <div {...mark("PianoRollGrid", p)} data-playing={playing || undefined}>
      {p.showToolbar !== false && (
        <Toolbar>
          <IconButton
            variant="primary"
            round
            icon={playing ? "pause" : "play"}
            label={playing ? "Пауза" : "Воспроизвести"}
            onClick={() => setPlaying((v) => !v)}
          />
          <ButtonGroup>
            <IconButton variant="ghost" icon="undo" label="Отменить" />
            <IconButton variant="ghost" icon="redo" label="Повторить" />
          </ButtonGroup>
          <span className="ad-piano-roll-zoom">
            <Icon name="search" />
            <Slider
              size="sm"
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onValueChange={setZoom}
              label="Масштаб"
            />
          </span>
        </Toolbar>
      )}
      <div
        className="ad-piano-roll-stage"
        style={
          {
            "--ad-editor-zoom": zoom,
            "--ad-roll-rows": KEYS.length,
          } as CSSProperties
        }
      >
        <div className="ad-piano-roll-corner" />
        <div
          className="ad-piano-roll-ruler"
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHead(clamp(toUnits(e.clientX - r.left), 0, LENGTH));
          }}
        >
          {Array.from({ length: LENGTH / BEAT }, (_, i) => (
            <span
              key={i}
              style={{ left: at(i * BEAT) }}
              data-bar={i % 4 === 0 || undefined}
            >
              {i % 4 === 0 ? i / 4 + 1 : ""}
            </span>
          ))}
          <i className="ad-piano-roll-head-mark" style={{ left: at(head) }} />
        </div>
        <div className="ad-piano-roll-keyboard">
          {KEYS.map((key) => (
            <span key={key} data-sharp={key.includes("#") || undefined}>
              {key}
            </span>
          ))}
        </div>
        <div
          className="ad-note-world"
          ref={world}
          onPointerDown={startSelection}
        >
          {KEYS.map((key, i) => (
            <i
              key={key}
              className="ad-piano-roll-row"
              data-sharp={key.includes("#") || undefined}
              style={{ top: `calc(${i} * 100% / var(--ad-roll-rows))` }}
            />
          ))}
          {notes.map((n, i) => (
            <button
              key={i}
              type="button"
              className="ad-note"
              aria-label={`${KEYS[rowOf(n)]}, ${LYRICS[i] ?? ""}`}
              data-active={(head >= n.x && head <= n.x + n.width) || undefined}
              data-picked={picked === i || undefined}
              style={{
                left: at(n.x),
                width: at(n.width),
                top: `calc(${rowOf(n)} * 100% / var(--ad-roll-rows))`,
              }}
              onPointerDown={(e) => dragNote(i, e)}
            />
          ))}
          {box && (
            <div
              className="ad-selection"
              style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
            />
          )}
          <div className="ad-playhead" style={{ left: at(head) }} />
        </div>
        {p.showLyrics !== false && (
          <>
            <div className="ad-piano-roll-corner" />
            <div className="ad-lyrics-lane">
              {notes.map((n, i) => (
                <span
                  key={i}
                  style={{ left: at(n.x) }}
                  data-active={
                    (head >= n.x && head <= n.x + n.width) || undefined
                  }
                  data-sung={head > n.x + n.width || undefined}
                >
                  {LYRICS[i] ?? ""}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
