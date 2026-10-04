import { useEffect, useState } from "react";
import { KaraokeLyrics, type LyricWord } from "@ad-voice/ui";

const lines = [["Ночь", "горит", "огнями"], ["и", "нас", "зовёт"], ["домой", "сквозь", "тьму"]];
const wordSeconds = 0.6;

export default function KaraokeLyricsExample() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      setTime(((now - start) / 1000) % (lines.length * 3 * wordSeconds + 1.5));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const index = Math.min(lines.length - 1, Math.floor(time / (3 * wordSeconds)));
  const words = (row: number): LyricWord[] =>
    (lines[row] ?? []).map((text, i) => ({
      id: `${row}-${i}`,
      text,
      progress: (time - (row * 3 + i) * wordSeconds) / wordSeconds,
    }));
  const kick = Math.max(0, 1 - ((time * 2) % 1) * 4);
  return (
    <div style={{ width: "100%", padding: "2rem 0", background: "#000", borderRadius: "1rem" }}>
      <KaraokeLyrics current={words(index)} next={words(index + 1)} currentKey={index} nextKey={index + 1} kick={kick} pulse={kick / 2} />
    </div>
  );
}
