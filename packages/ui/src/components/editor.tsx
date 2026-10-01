import React, { useRef, useState } from "react";
import {
  clamp,
  define,
  mark,
  useControllable,
  type CommonProps,
} from "../core/base";
import { ButtonGroup } from "./layout";
import { IconButton, Select, TextField } from "./controls";
import { Dialog } from "./feedback";

export interface PianoKeyboardProps extends CommonProps {
  onNote?: (midi: number) => void;
  activeNote?: number;
}
export const PianoKeyboard = define<PianoKeyboardProps>(
  "PianoKeyboard",
  (p) => {
    const [active, setActive] = useState<number>();
    const whites = [83, 81, 79, 77, 76, 74, 72, 71, 69, 67, 65, 64, 62, 60];
    const play = (midi: number) => {
      setActive(midi);
      p.onNote?.(midi);
    };
    return (
      <div {...mark("PianoKeyboard", p)} aria-label="Клавиатура">
        {whites.map((midi, i) => (
          <React.Fragment key={midi}>
            <button
              type="button"
              aria-label={`Нота MIDI ${midi}`}
              className={
                (p.activeNote ?? active) === midi ? "is-active" : undefined
              }
              onClick={() => play(midi)}
            >
              {midi % 12 === 0 ? `C${Math.floor(midi / 12) - 1}` : ""}
            </button>
            {i < whites.length - 1 && midi - whites[i + 1] === 2 && (
              <button
                type="button"
                className="ad-black-key"
                style={{ top: (i + 1) * 18 - 5 }}
                aria-label={`Нота MIDI ${midi - 1}`}
                onClick={() => play(midi - 1)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  },
);
export interface TimeRulerProps extends CommonProps {
  measures?: number;
  onSeek?: (beat: number) => void;
}
export const TimeRuler = define<TimeRulerProps>("TimeRuler", (p) => (
  <div {...mark("TimeRuler", p)}>
    {Array.from({ length: p.measures ?? 8 }, (_, i) => (
      <button key={i} type="button" onClick={() => p.onSeek?.(i * 4)}>
        {i + 1}
      </button>
    ))}
  </div>
));
export interface NoteGeometry {
  x: number;
  y: number;
  width: number;
}
export interface NoteBlockProps extends CommonProps {
  x?: number;
  y?: number;
  width?: number;
  value?: NoteGeometry;
  onChange?: (value: NoteGeometry) => void;
  onCommit?: (value: NoteGeometry) => void;
  selected?: boolean;
  label?: string;
}
export const NoteBlock = define<NoteBlockProps>("NoteBlock", (p) => {
  const [geometry, setGeometry] = useControllable(
    p.value,
    { x: p.x ?? 25, y: p.y ?? 60, width: p.width ?? 80 },
    p.onChange,
  );
  const latest = useRef(geometry);
  latest.current = geometry;
  const drag = useRef<{
    x: number;
    y: number;
    start: NoteGeometry;
    resize: boolean;
    ratio: number;
  } | null>(null);
  const [selected, setSelected] = useState(false);
  const end = () => {
    if (drag.current) p.onCommit?.(latest.current);
    drag.current = null;
  };
  return (
    <div
      {...mark(
        "NoteBlock",
        p,
        undefined,
        p.selected || selected ? "is-selected" : undefined,
      )}
      role="button"
      tabIndex={0}
      aria-label={p.label ?? "Нота C4"}
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        ...p.style,
      }}
      onPointerDown={(e) => {
        if (e.button) return;
        e.stopPropagation();
        const parent = e.currentTarget.parentElement;
        const ratio = parent
          ? parent.getBoundingClientRect().width / parent.offsetWidth
          : 1;
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          start: geometry,
          resize: (e.target as Element).classList.contains("ad-note-resize"),
          ratio,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setSelected(true);
      }}
      onPointerMove={(e) => {
        const data = drag.current,
          parent = e.currentTarget.parentElement;
        if (!data || !parent) return;
        const dx = (e.clientX - data.x) / data.ratio,
          dy = (e.clientY - data.y) / data.ratio;
        const next = data.resize
          ? {
              ...data.start,
              width: clamp(
                Math.round((data.start.width + dx) / 5) * 5,
                15,
                parent.clientWidth - data.start.x,
              ),
            }
          : {
              ...data.start,
              x: clamp(
                Math.round((data.start.x + dx) / 5) * 5,
                0,
                parent.clientWidth - data.start.width,
              ),
              y: clamp(
                Math.round((data.start.y + dy) / 18) * 18,
                0,
                parent.clientHeight - 18,
              ),
            };
        latest.current = next;
        setGeometry(next);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={(e) => {
        if (
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        )
          return;
        const parent = e.currentTarget.parentElement;
        if (!parent) return;
        e.preventDefault();
        const next = {
          ...geometry,
          x: clamp(
            geometry.x +
              (e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0),
            0,
            parent.clientWidth - geometry.width,
          ),
          y: clamp(
            geometry.y +
              (e.key === "ArrowUp" ? -18 : e.key === "ArrowDown" ? 18 : 0),
            0,
            parent.clientHeight - 18,
          ),
        };
        setGeometry(next);
        p.onCommit?.(next);
      }}
    >
      <span className="ad-note-resize" aria-hidden="true" />
    </div>
  );
});
export interface LyricsLaneProps extends CommonProps {
  words?: string[];
  onChange?: (words: string[]) => void;
}
export const LyricsLane = define<LyricsLaneProps>("LyricsLane", (p) => {
  const [words, setWords] = useControllable(
    p.words,
    ["Первая", "фраза", "мелодии", "вторая", "фраза"],
    p.onChange,
  );
  const [editing, setEditing] = useState<number | null>(null),
    [draft, setDraft] = useState("");
  return (
    <>
      <div {...mark("LyricsLane", p)}>
        {words.map((text, i) => (
          <button
            type="button"
            key={i}
            onDoubleClick={() => {
              setDraft(text);
              setEditing(i);
            }}
          >
            {text}
          </button>
        ))}
      </div>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title="Изменить слово"
        onConfirm={() => {
          if (editing !== null)
            setWords(words.map((v, i) => (i === editing ? draft : v)));
        }}
      >
        <TextField value={draft} onValueChange={setDraft} label="Текст" />
      </Dialog>
    </>
  );
});
export interface PlayheadProps extends CommonProps {
  x?: number;
}
export const Playhead = define<PlayheadProps>("Playhead", (p) => (
  <div
    {...mark("Playhead", p)}
    aria-hidden="true"
    style={{ left: p.x ?? 85, ...p.style }}
  />
));
export interface SelectionOverlayProps extends CommonProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
export const SelectionOverlay = define<SelectionOverlayProps>(
  "SelectionOverlay",
  (p) => (
    <div
      {...mark("SelectionOverlay", p)}
      aria-hidden="true"
      style={{
        left: p.x ?? 40,
        top: p.y ?? 45,
        width: p.width ?? 170,
        height: p.height ?? 75,
        ...p.style,
      }}
    />
  ),
);
export interface PianoRollGridProps extends CommonProps {
  notes?: NoteGeometry[];
  onChange?: (notes: NoteGeometry[]) => void;
  selection?: boolean;
}
export const PianoRollGrid = define<PianoRollGridProps>(
  "PianoRollGrid",
  (p) => {
    const [notes, setNotes] = useControllable(
      p.notes,
      [
        [30, 90, 58],
        [100, 72, 36],
        [152, 90, 90],
        [260, 108, 65],
        [335, 90, 73],
        [430, 54, 42],
      ].map(([x, y, width]) => ({ x, y, width })),
      p.onChange,
    );
    const [head, setHead] = useState(100);
    return (
      <div {...mark("PianoRollGrid", p)}>
        <TimeRuler onSeek={(n) => setHead(60 + n * 9)} />
        <LyricsLane />
        <PianoKeyboard />
        <div className="ad-note-world">
          {notes.map((note, i) => (
            <NoteBlock
              key={i}
              value={note}
              onChange={(v) => setNotes(notes.map((n, j) => (i === j ? v : n)))}
            />
          ))}
          {p.selection && <SelectionOverlay />}
        </div>
        <Playhead x={head} />
      </div>
    );
  },
);
export interface ZoomControlProps extends CommonProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onFit?: () => void;
}
export const ZoomControl = define<ZoomControlProps>("ZoomControl", (p) => {
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? 100,
    p.onValueChange,
  );
  return (
    <div {...mark("ZoomControl", p)}>
      <IconButton
        icon="minus"
        label="Уменьшить"
        onClick={() => setValue(clamp(value - 25, 50, 200))}
      />
      <IconButton
        icon="plus"
        label="Увеличить"
        onClick={() => setValue(clamp(value + 25, 50, 200))}
      />
      <Select
        label="Масштаб"
        options={["50%", "75%", "100%", "125%", "150%", "175%", "200%"]}
        value={value + "%"}
        onValueChange={(v) => setValue(parseInt(v))}
      />
      <IconButton
        icon="fit"
        label="Вписать"
        onClick={() => {
          setValue(100);
          p.onFit?.();
        }}
      />
    </div>
  );
});
export interface UndoRedoControlsProps extends CommonProps {
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}
export const UndoRedoControls = define<UndoRedoControlsProps>(
  "UndoRedoControls",
  (p) => (
    <div {...mark("UndoRedoControls", p)}>
      <IconButton
        icon="undo"
        label="Отменить"
        onClick={p.onUndo}
        disabled={p.canUndo === false}
      />
      <IconButton
        icon="redo"
        label="Повторить"
        onClick={p.onRedo}
        disabled={p.canRedo === false}
      />
    </div>
  ),
);
