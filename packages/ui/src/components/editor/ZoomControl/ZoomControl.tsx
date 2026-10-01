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
import { LyricsLane } from "../LyricsLane/LyricsLane";
import { Playhead } from "../Playhead/Playhead";
import { SelectionOverlay } from "../SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid/PianoRollGrid";
import { UndoRedoControls } from "../UndoRedoControls/UndoRedoControls";

export const ZoomControl = define<ZoomControlProps>("ZoomControl", p => {
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? 100, p.onValueChange);
  return <div {...mark("ZoomControl", p)}><IconButton icon="minus" label="Уменьшить" onClick={() => setValue(clamp(value - 25, 50, 200))} /><IconButton icon="plus" label="Увеличить" onClick={() => setValue(clamp(value + 25, 50, 200))} /><Select label="Масштаб" options={["50%", "75%", "100%", "125%", "150%", "175%", "200%"]} value={value + "%"} onValueChange={v => setValue(parseInt(v))} /><IconButton icon="fit" label="Вписать" onClick={() => { setValue(100); p.onFit?.(); }} /></div>;
});
