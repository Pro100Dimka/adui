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
import { PianoRollGrid } from "../PianoRollGrid";
import { ZoomControl } from "../ZoomControl";
import { UndoRedoControls } from "../UndoRedoControls";

export const SelectionOverlay = define<SelectionOverlayProps>("SelectionOverlay", p => <div {...mark("SelectionOverlay", p)} aria-hidden="true" style={{ left: p.x ?? 40, top: p.y ?? 45, width: p.width ?? 170, height: p.height ?? 75, ...p.style }} />);
