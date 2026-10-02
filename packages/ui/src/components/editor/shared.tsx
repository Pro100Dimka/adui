import type { CommonProps } from "../../core/base";
export interface NoteGeometry {x:number;y:number;width:number}
export interface PianoRollGridProps extends CommonProps {notes?:NoteGeometry[];onChange?:(notes:NoteGeometry[])=>void;selection?:boolean;showToolbar?:boolean;showLyrics?:boolean;playhead?:number;onPlayheadChange?:(x:number)=>void}
