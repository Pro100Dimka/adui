import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { TextField } from "../../controls/TextField/TextField";
import { Dialog } from "../../feedback/Dialog/Dialog";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../shared";
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";
import { TimeRuler } from "../TimeRuler/TimeRuler";
import { LyricsLane } from "../LyricsLane/LyricsLane";
import { Playhead } from "../Playhead/Playhead";
import { SelectionOverlay } from "../SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid/PianoRollGrid";
import { ZoomControl } from "../ZoomControl/ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls/UndoRedoControls";

export const NoteBlock = define<NoteBlockProps>("NoteBlock", p => {
  const [geometry, setGeometry] = useControllable(p.value, { x: p.x ?? 25, y: p.y ?? 60, width: p.width ?? 80 }, p.onChange);
  const latest = useRef(geometry); latest.current = geometry;
  const drag = useRef<{ x: number; y: number; start: NoteGeometry; resize: boolean; ratio: number } | null>(null);
  const [selected, setSelected] = useState(false);
  const end = () => { if (drag.current) p.onCommit?.(latest.current); drag.current = null; };
  return <div {...mark("NoteBlock", p, undefined, p.selected || selected ? "is-selected" : undefined)} role="button" tabIndex={0} aria-label={p.label ?? "Нота C4"}
    style={{ left: geometry.x, top: geometry.y, width: geometry.width, ...p.style }}
    onPointerDown={e => { if (e.button) return; e.stopPropagation(); const parent = e.currentTarget.parentElement; const ratio = parent ? parent.getBoundingClientRect().width / parent.offsetWidth : 1; drag.current = { x: e.clientX, y: e.clientY, start: geometry, resize: (e.target as Element).classList.contains("ad-note-resize"), ratio }; e.currentTarget.setPointerCapture(e.pointerId); setSelected(true); }}
    onPointerMove={e => {
      const data = drag.current, parent = e.currentTarget.parentElement; if (!data || !parent) return;
      const dx = (e.clientX - data.x) / data.ratio, dy = (e.clientY - data.y) / data.ratio;
      const next = data.resize ? { ...data.start, width: clamp(Math.round((data.start.width + dx) / 5) * 5, 15, parent.clientWidth - data.start.x) } : { ...data.start, x: clamp(Math.round((data.start.x + dx) / 5) * 5, 0, parent.clientWidth - data.start.width), y: clamp(Math.round((data.start.y + dy) / 18) * 18, 0, parent.clientHeight - 18) };
      latest.current = next; setGeometry(next);
    }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onKeyDown={e => { if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return; const parent = e.currentTarget.parentElement; if (!parent) return; e.preventDefault(); const next = { ...geometry, x: clamp(geometry.x + (e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0), 0, parent.clientWidth - geometry.width), y: clamp(geometry.y + (e.key === "ArrowUp" ? -18 : e.key === "ArrowDown" ? 18 : 0), 0, parent.clientHeight - 18) }; setGeometry(next); p.onCommit?.(next); }}><span className="ad-note-resize" aria-hidden="true" /></div>;
});
