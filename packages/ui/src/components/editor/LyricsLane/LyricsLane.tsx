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
import { NoteBlock } from "../NoteBlock/NoteBlock";
import { Playhead } from "../Playhead/Playhead";
import { SelectionOverlay } from "../SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid/PianoRollGrid";
import { ZoomControl } from "../ZoomControl/ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls/UndoRedoControls";

export const LyricsLane = define<LyricsLaneProps>("LyricsLane", p => {
  const [words, setWords] = useControllable(p.words, ["Первая", "фраза", "мелодии", "вторая", "фраза"], p.onChange);
  const [editing, setEditing] = useState<number | null>(null), [draft, setDraft] = useState("");
  return <><div {...mark("LyricsLane", p)}>{words.map((text, i) => <button type="button" key={i} onDoubleClick={() => { setDraft(text); setEditing(i); }}>{text}</button>)}</div>
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) setEditing(null); }} title="Изменить слово" onConfirm={() => { if (editing !== null) setWords(words.map((v, i) => i === editing ? draft : v)); }}><TextField value={draft} onValueChange={setDraft} label="Текст" /></Dialog>
  </>;
});
