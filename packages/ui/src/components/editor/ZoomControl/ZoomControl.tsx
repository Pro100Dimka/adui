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
import { PianoRollGrid } from "../PianoRollGrid";
import { UndoRedoControls } from "../UndoRedoControls";

export const ZoomControl = define<ZoomControlProps>("ZoomControl", p => {
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? 100, p.onValueChange);
  return <div {...mark("ZoomControl", p)}><IconButton icon="minus" label="Уменьшить" onClick={() => setValue(clamp(value - 25, 50, 200))} /><IconButton icon="plus" label="Увеличить" onClick={() => setValue(clamp(value + 25, 50, 200))} /><Select label="Масштаб" options={["50%", "75%", "100%", "125%", "150%", "175%", "200%"]} value={value + "%"} onValueChange={v => setValue(parseInt(v))} /><IconButton icon="fit" label="Вписать" onClick={() => { setValue(100); p.onFit?.(); }} /></div>;
});
