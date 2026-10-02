import React, { useMemo, useRef, useState } from "react";
import { define, mark, useControllable } from "../../../core/base";
import { Toolbar } from "../../layout/Toolbar/Toolbar";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import type { NoteGeometry, PianoRollGridProps } from "../shared";
export const PianoRollGrid = define<PianoRollGridProps>(
  "PianoRollGrid",
  (p) => {
    const defaults: NoteGeometry[] = [
      { x: 30, y: 90, width: 58 },
      { x: 100, y: 72, width: 36 },
      { x: 152, y: 90, width: 90 },
      { x: 260, y: 108, width: 65 },
      { x: 335, y: 90, width: 73 },
    ];
    const [notes, setNotes] = useControllable(p.notes, defaults, p.onChange);
    const [zoom, setZoom] = useState(1),
      [head, setHead] = useControllable(p.playhead, 100, p.onPlayheadChange);
    const [selection, setSelection] = useState<{
      x: number;
      y: number;
      w: number;
      h: number;
    } | null>(null);
    const lyrics = ["Ночь", "горит", "огнями", "впереди"];
    return (
      <div {...mark("PianoRollGrid", p)}>
        {p.showToolbar !== false && (
          <Toolbar>
            <ButtonGroup>
              <IconButton icon="undo" label="Отменить" />
              <IconButton icon="redo" label="Повторить" />
            </ButtonGroup>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onValueChange={setZoom}
              label="Zoom"
            />
          </Toolbar>
        )}
        <div
          className="ad-piano-roll-stage"
          style={{ "--ad-editor-zoom": zoom } as React.CSSProperties}
        >
          <div className="ad-piano-roll-ruler">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i}>{i * 2}s</span>
            ))}
          </div>
          <div className="ad-piano-roll-keyboard">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i}>
                {
                  [
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
                  ][i]
                }
              </span>
            ))}
          </div>
          <div
            className="ad-note-world"
            onPointerDown={(e) => {
              if (!p.selection) return;
              const r = e.currentTarget.getBoundingClientRect();
              setSelection({
                x: e.clientX - r.left,
                y: e.clientY - r.top,
                w: 0,
                h: 0,
              });
            }}
          >
            {notes.map((n, i) => (
              <button
                key={i}
                className="ad-note"
                style={{
                  left: `${n.x / 6}rem`,
                  top: `${n.y / 6}rem`,
                  width: `${n.width / 6}rem`,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const start = e.clientX,
                    base = n.x;
                  (e.currentTarget as HTMLElement).setPointerCapture(
                    e.pointerId,
                  );
                  const move = (ev: PointerEvent) =>
                    setNotes(
                      notes.map((x, j) =>
                        j === i ? { ...x, x: base + ev.clientX - start } : x,
                      ),
                    );
                  const up = () => {
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                  };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
              />
            ))}
            {selection && (
              <div
                className="ad-selection"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.w || "18%",
                  height: selection.h || "30%",
                }}
              />
            )}
            <div className="ad-playhead" style={{ left: `${head / 6}rem` }} />
          </div>
          {p.showLyrics !== false && (
            <div className="ad-lyrics-lane">
              {lyrics.map((x, i) => (
                <span key={i}>{x}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
