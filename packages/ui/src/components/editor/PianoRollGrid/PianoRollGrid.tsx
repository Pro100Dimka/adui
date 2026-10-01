import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout";
import { IconButton, Select, TextField } from "../../controls";
import { Dialog } from "../../feedback";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../_shared";
import { PianoKeyboard } from "../PianoKeyboard";
import { TimeRuler } from "../TimeRuler";
import { NoteBlock } from "../NoteBlock";
import { LyricsLane } from "../LyricsLane";
import { Playhead } from "../Playhead";
import { SelectionOverlay } from "../SelectionOverlay";
import { ZoomControl } from "../ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls";

export const PianoRollGrid = define<PianoRollGridProps>("PianoRollGrid", p => {
  const [notes, setNotes] = useControllable(p.notes, [[30, 90, 58], [100, 72, 36], [152, 90, 90], [260, 108, 65], [335, 90, 73], [430, 54, 42]].map(([x, y, width]) => ({ x, y, width })), p.onChange);
  const [head, setHead] = useState(100);
  return <div {...mark("PianoRollGrid", p)}><TimeRuler onSeek={n => setHead(60 + n * 9)} /><LyricsLane /><PianoKeyboard /><div className="ad-note-world">{notes.map((note, i) => <NoteBlock key={i} value={note} onChange={v => setNotes(notes.map((n, j) => i === j ? v : n))} />)}{p.selection && <SelectionOverlay />}</div><Playhead x={head} /></div>;
});
