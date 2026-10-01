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
import { SelectionOverlay } from "../SelectionOverlay";
import { PianoRollGrid } from "../PianoRollGrid";
import { ZoomControl } from "../ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls";

export const Playhead = define<PlayheadProps>("Playhead", p => <div {...mark("Playhead", p)} aria-hidden="true" style={{ left: p.x ?? 85, ...p.style }} />);
