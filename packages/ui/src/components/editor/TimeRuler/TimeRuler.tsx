import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../../core/base";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { TextField } from "../../controls/TextField/TextField";
import { Dialog } from "../../feedback/Dialog/Dialog";
import { type PianoKeyboardProps, type TimeRulerProps, type NoteGeometry, type NoteBlockProps, type LyricsLaneProps, type PlayheadProps, type SelectionOverlayProps, type PianoRollGridProps, type ZoomControlProps, type UndoRedoControlsProps } from "../shared";
import { PianoKeyboard } from "../PianoKeyboard/PianoKeyboard";
import { NoteBlock } from "../NoteBlock/NoteBlock";
import { LyricsLane } from "../LyricsLane/LyricsLane";
import { Playhead } from "../Playhead/Playhead";
import { SelectionOverlay } from "../SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid/PianoRollGrid";
import { ZoomControl } from "../ZoomControl/ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls/UndoRedoControls";

export const TimeRuler = define<TimeRulerProps>("TimeRuler", p => <div {...mark("TimeRuler", p)}>{Array.from({ length: p.measures ?? 8 }, (_, i) => <button key={i} type="button" onClick={() => p.onSeek?.(i * 4)}>{i + 1}</button>)}</div>);
