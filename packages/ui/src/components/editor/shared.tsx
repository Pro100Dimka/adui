import React, { useRef, useState } from "react";
import { clamp, define, mark, useControllable, type CommonProps } from "../../core/base";
import { ButtonGroup } from "../layout";
import { IconButton, Select, TextField } from "../controls";
import { Dialog } from "../feedback";

import { PianoKeyboard } from "./PianoKeyboard";
import { TimeRuler } from "./TimeRuler";
import { NoteBlock } from "./NoteBlock";
import { LyricsLane } from "./LyricsLane";
import { Playhead } from "./Playhead";
import { SelectionOverlay } from "./SelectionOverlay";
import { PianoRollGrid } from "./PianoRollGrid";
import { ZoomControl } from "./ZoomControl";
import { UndoRedoControls } from "./UndoRedoControls";

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
