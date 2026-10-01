import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout";
import { IconButton, Select, TextField } from "../../controls";
import { Dialog } from "../../feedback";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../_shared";
import { PianoKeyboard } from "../PianoKeyboard";
import { TimeRuler } from "../TimeRuler";
import { NoteBlock } from "../NoteBlock";
import { Playhead } from "../Playhead";
import { SelectionOverlay } from "../SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid";
import { ZoomControl } from "../ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls";

export const LyricsLane = define<LyricsLaneProps>("LyricsLane", p => {
  const [words, setWords] = useControllable(p.words, ["Первая", "фраза", "мелодии", "вторая", "фраза"], p.onChange);
  const [editing, setEditing] = useState<number | null>(null), [draft, setDraft] = useState("");
  return <><div {...mark("LyricsLane", p)}>{words.map((text, i) => <button type="button" key={i} onDoubleClick={() => { setDraft(text); setEditing(i); }}>{text}</button>)}</div>
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) setEditing(null); }} title="Изменить слово" onConfirm={() => { if (editing !== null) setWords(words.map((v, i) => i === editing ? draft : v)); }}><TextField value={draft} onValueChange={setDraft} label="Текст" /></Dialog>
  </>;
});
