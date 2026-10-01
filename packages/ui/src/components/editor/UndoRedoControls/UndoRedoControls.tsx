import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout";
import { IconButton, Select, TextField } from "../../controls";
import { Dialog } from "../../feedback";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../shared";
import { PianoKeyboard } from "../PianoKeyboard";
import { TimeRuler } from "../TimeRuler";
import { NoteBlock } from "../NoteBlock";
import { LyricsLane } from "../LyricsLane";
import { Playhead } from "../Playhead";
import { SelectionOverlay } from "../SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid";
import { ZoomControl } from "../ZoomControl";

export const UndoRedoControls = define<UndoRedoControlsProps>("UndoRedoControls", p => <div {...mark("UndoRedoControls", p)}><IconButton icon="undo" label="Отменить" onClick={p.onUndo} disabled={p.canUndo === false} /><IconButton icon="redo" label="Повторить" onClick={p.onRedo} disabled={p.canRedo === false} /></div>);
