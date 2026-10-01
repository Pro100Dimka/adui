import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../core/base";
import { ButtonGroup } from "../layout/ButtonGroup/ButtonGroup";
import { IconButton } from "../controls/IconButton/IconButton";
import { Select } from "../controls/Select/Select";
import { TextField } from "../controls/TextField/TextField";
import { Dialog } from "../feedback/Dialog/Dialog";

import { PianoKeyboard } from "./PianoKeyboard/PianoKeyboard";
import { TimeRuler } from "./TimeRuler/TimeRuler";
import { NoteBlock } from "./NoteBlock/NoteBlock";
import { LyricsLane } from "./LyricsLane/LyricsLane";
import { Playhead } from "./Playhead/Playhead";
import { SelectionOverlay } from "./SelectionOverlay/SelectionOverlay";
import { PianoRollGrid } from "./PianoRollGrid/PianoRollGrid";
import { ZoomControl } from "./ZoomControl/ZoomControl";
import { UndoRedoControls } from "./UndoRedoControls/UndoRedoControls";

export interface PianoKeyboardProps extends CommonProps { onNote?: (midi: number) => void; activeNote?: number }

export interface TimeRulerProps extends CommonProps { measures?: number; onSeek?: (beat: number) => void }

export interface NoteGeometry { x: number; y: number; width: number }

export interface NoteBlockProps extends CommonProps { x?: number; y?: number; width?: number; value?: NoteGeometry; onChange?: (value: NoteGeometry) => void; onCommit?: (value: NoteGeometry) => void; selected?: boolean; label?: string }

export interface LyricsLaneProps extends CommonProps { words?: string[]; onChange?: (words: string[]) => void }

export interface PlayheadProps extends CommonProps { x?: number }

export interface SelectionOverlayProps extends CommonProps { x?: number; y?: number; width?: number; height?: number }

export interface PianoRollGridProps extends CommonProps { notes?: NoteGeometry[]; onChange?: (notes: NoteGeometry[]) => void; selection?: boolean }

export interface ZoomControlProps extends CommonProps { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; onFit?: () => void }

export interface UndoRedoControlsProps extends CommonProps { canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void }
