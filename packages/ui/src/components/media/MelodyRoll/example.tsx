import { useEffect, useRef, useState } from "react";
import { MelodyRoll, Switch, useDecoration, type MelodyNote } from "@ad-voice/ui";

const melody = [64, 67, 69, 67, 64, 62, 60, 64, 65, 67, 72, 71, 69, 67];
const syllables = ["Ночь", "го", "рит", "ог", "ня", "ми", "и", "нас", "зо", "вёт", "до", "мой", "сквозь", "тьму"];
const notes: MelodyNote[] = melody.map((pitch, i) => ({
  id: String(i), start: i * 0.85, end: i * 0.85 + 0.7, pitch, lyric: syllables[i],
}));
const length = notes.length * 0.85 + 1;

/** A singer imitated: wavers around the melody, sometimes off by a semitone, louder on long notes. */
export default function MelodyRollExample() {
  const [position, setPosition] = useState(0);
  const [lyrics, setLyrics] = useState(true);
  const hits = useRef(new Set<string>());
  // Plays on the library's motion clock: in step with every animation, still when out of view.
  const box = useRef<HTMLDivElement>(null);
  useDecoration(box, (time) => setPosition(time % length));
  const note = notes.find((item) => position >= item.start && position <= item.end);
  const off = note && Number(note.id) % 4 === 3 ? 1 : 0;
  const livePitch = note ? note.pitch + off + Math.sin(position * 9) * 0.25 : undefined;
  const accuracy = livePitch === undefined || !note ? 0 : Math.max(0, 1 - Math.abs(livePitch - note.pitch));
  const hit = accuracy > 0.6;
  if (position < 0.1) hits.current.clear();
  if (note && hit && position > note.start + 0.35) hits.current.add(note.id);
  const beat = Math.max(0, 1 - ((position * 2) % 1) * 3);

  return (
    <div ref={box} style={{ display: "grid", gap: "0.75rem", width: "100%" }}>
      <div style={{ height: "14rem" }}>
        <MelodyRoll notes={notes} position={position} livePitch={livePitch} accuracy={accuracy} hit={hit}
          hitIds={hits.current} level={note ? 0.5 + Math.sin(position * 5) * 0.3 : 0} beat={beat} showLyrics={lyrics} />
      </div>
      <Switch label="Слоги на нотах" checked={lyrics} onValueChange={setLyrics} />
    </div>
  );
}
