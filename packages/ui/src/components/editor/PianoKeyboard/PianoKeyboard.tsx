import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { TextField } from "../../controls/TextField/TextField";
import { Dialog } from "../../feedback/Dialog/Dialog";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../shared";
import { TimeRuler } from "../TimeRuler/TimeRuler";
import { NoteBlock } from "../NoteBlock/NoteBlock";
import { LyricsLane } from "../LyricsLane/LyricsLane";
import { Playhead } from "../Playhead/Playhead";
import { SelectionOverlay } from "../SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid/PianoRollGrid";
import { ZoomControl } from "../ZoomControl/ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls/UndoRedoControls";

export const PianoKeyboard = define<PianoKeyboardProps>("PianoKeyboard", p => {
  const [active, setActive] = useState<number>();
  const whites = [83, 81, 79, 77, 76, 74, 72, 71, 69, 67, 65, 64, 62, 60];
  const play = (midi: number) => { setActive(midi); p.onNote?.(midi); };
  return <div {...mark("PianoKeyboard", p)} aria-label="Клавиатура">{whites.map((midi, i) => <React.Fragment key={midi}>
    <button type="button" aria-label={`Нота MIDI ${midi}`} className={(p.activeNote ?? active) === midi ? "is-active" : undefined} onClick={() => play(midi)}>{midi % 12 === 0 ? `C${Math.floor(midi / 12) - 1}` : ""}</button>
    {i < whites.length - 1 && midi - whites[i + 1] === 2 && <button type="button" className="ad-black-key" style={{ top: (i + 1) * 18 - 5 }} aria-label={`Нота MIDI ${midi - 1}`} onClick={() => play(midi - 1)} />}
  </React.Fragment>)}</div>;
});
