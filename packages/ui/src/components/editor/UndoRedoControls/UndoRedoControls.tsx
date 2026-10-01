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
import { ZoomControl } from "../ZoomControl/ZoomControl";

export const UndoRedoControls = define<UndoRedoControlsProps>("UndoRedoControls", p => <div {...mark("UndoRedoControls", p)}><IconButton icon="undo" label="Отменить" onClick={p.onUndo} disabled={p.canUndo === false} /><IconButton icon="redo" label="Повторить" onClick={p.onRedo} disabled={p.canRedo === false} /></div>);
