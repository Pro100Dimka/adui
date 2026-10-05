const e=`import { tr } from "../../../core/i18n";
import { memo, useState, type CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

const BLACK = new Set([1, 3, 6, 8, 10]);
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Whether a MIDI note is a black key. */
export const isBlackKey = (midi: number): boolean => BLACK.has(((midi % 12) + 12) % 12);
/** Scientific pitch name of a MIDI note: 60 is "C4". */
export const noteName = (midi: number): string =>
  \`\${NAMES[((midi % 12) + 12) % 12]}\${Math.floor(midi / 12) - 1}\`;

export interface PianoKeyboardProps extends CommonProps {
  /** Lowest and highest MIDI notes shown, bottom to top. */
  minMidi?: number;
  maxMidi?: number;
  /** The note being sung or played now; its key lights up. */
  activeMidi?: number;
  /** The active note is the right one: the key turns green and pulses. */
  hit?: boolean;
  /** Which keys carry their name. */
  labels?: "all" | "octaves" | "none";
  /** Pressing a key, e.g. to hear its pitch. Without it the keyboard is a picture. */
  onKeyPress?: (midi: number) => void;
  label?: string;
}

/** Positions in semitone rows from the top; turned into percentages of the keyboard's height. */
const whiteKeys = (min: number, max: number) => {
  const rows = max - min + 1;
  const white = Array.from({ length: rows }, (_, i) => max - i).filter((midi) => !isBlackKey(midi));
  const centers = white.map((midi) => max - midi + 0.5);
  return white.map((midi, i) => {
    const center = centers[i] ?? 0;
    const top = i ? (center + (centers[i - 1] ?? 0)) / 2 : 0;
    const bottom = i === white.length - 1 ? rows : (center + (centers[i + 1] ?? rows)) / 2;
    return { midi, top, size: bottom - top };
  });
};

/**
 * A vertical piano keyboard that fills its box: the sung note's key glows, a correct one turns
 * green and pulses, a pressed key dips like a real one.
 */
export const PianoKeyboard = memo(function PianoKeyboard({
  minMidi = 55,
  maxMidi = 79,
  activeMidi,
  hit = false,
  labels = "all",
  onKeyPress,
  label,
  ...p
}: PianoKeyboardProps) {
  const [pressed, setPressed] = useState<number>();
  const rows = Math.max(1, maxMidi - minMidi + 1);
  const pct = (value: number) => \`\${(value / rows) * 100}%\`;
  const named = (midi: number) => labels === "all" || (labels === "octaves" && midi % 12 === 0);
  const press = (midi: number) => {
    setPressed(midi);
    onKeyPress?.(midi);
    window.setTimeout(() => setPressed((current) => (current === midi ? undefined : current)), 220);
  };
  const key = (midi: number, top: number, size: number, black: boolean) => {
    const props = {
      className: "ad-piano-key",
      "data-black": black || undefined,
      "data-active": midi === activeMidi || undefined,
      "data-hit": (midi === activeMidi && hit) || undefined,
      "data-pressed": midi === pressed || undefined,
      style: { top: pct(top), height: pct(size) } as CSSProperties,
      children: named(midi) ? <span>{noteName(midi)}</span> : null,
    };
    return onKeyPress ? (
      <button key={midi} type="button" aria-label={noteName(midi)} onPointerDown={() => press(midi)} {...props} />
    ) : (
      <span key={midi} {...props} />
    );
  };
  const blacks = Array.from({ length: rows }, (_, i) => maxMidi - i).filter(isBlackKey);

  return (
    <div
      {...mark("PianoKeyboard", p)}
      role={onKeyPress ? "group" : "img"}
      aria-label={label ?? tr("Клавиатура {from}–{to}", { from: noteName(minMidi), to: noteName(maxMidi) })}
      style={{ ...p.style, "--ad-keys": rows } as CSSProperties}
    >
      {whiteKeys(minMidi, maxMidi).map(({ midi, top, size }) => key(midi, top, size, false))}
      {blacks.map((midi) => key(midi, maxMidi - midi + 0.16, 0.68, true))}
    </div>
  );
});
`;export{e as default};
