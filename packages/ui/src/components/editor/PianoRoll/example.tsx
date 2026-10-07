import { useRef, useState } from "react";
import { PianoRoll, Stack, type PianoRollGesture, type PianoRollNote } from "@ad-voice/ui";

const start: PianoRollNote[] = [
  { id: "1", start: 0.4, end: 1.1, pitch: 64 },
  { id: "2", start: 1.2, end: 1.6, pitch: 67 },
  { id: "3", start: 1.7, end: 2.6, pitch: 69 },
  { id: "4", start: 2.8, end: 3.4, pitch: 67 },
  { id: "5", start: 3.5, end: 4.4, pitch: 64 },
  { id: "6", start: 4.6, end: 6, pitch: 62 },
];
const snap = (seconds: number) => Math.round(seconds / 0.05) * 0.05;

/** The editor owns the notes: each drag is applied to the notes as they were when it began. */
export default function PianoRollExample() {
  const [notes, setNotes] = useState(start);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(["3"]));
  const [position, setPosition] = useState(2);
  const before = useRef<PianoRollNote[] | null>(null);
  const drag = (gesture: PianoRollGesture) => {
    const origin = (before.current ??= notes);
    setNotes(origin.map((note) => {
      if (gesture.kind === "move" && gesture.ids.includes(note.id))
        return { ...note, start: snap(note.start + gesture.seconds), end: snap(note.end + gesture.seconds), pitch: note.pitch + gesture.pitch };
      if (gesture.kind === "resize" && gesture.id === note.id)
        return gesture.edge === "start"
          ? { ...note, start: Math.min(note.end - 0.1, snap(note.start + gesture.seconds)) }
          : { ...note, end: Math.max(note.start + 0.1, snap(note.end + gesture.seconds)) };
      return note;
    }));
  };
  return (
    <Stack style={{ width: "100%", height: "22rem" }}>
      <PianoRoll notes={notes} selected={selected} position={position} duration={8}
        onSelect={(id, additive) => setSelected((current) => additive ? new Set([...current, id]) : new Set([id]))}
        onSelectArea={(ids) => setSelected(new Set(ids))}
        onSeek={setPosition} onNoteDrag={drag} onNoteDragEnd={() => (before.current = null)}
        onNudge={(id, pitch, seconds) => setNotes((all) => all.map((note) => note.id === id
          ? { ...note, pitch: note.pitch + pitch, start: note.start + seconds, end: note.end + seconds } : note))} />
    </Stack>
  );
}
