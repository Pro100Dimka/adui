import type { CSSProperties, ReactNode } from "react";
import { clamp, mark, type CommonProps } from "../../../core/base";

export interface LyricWord {
  id: string;
  text: string;
  /** How much of the word is sung, 0–1; it fills left to right. */
  progress?: number;
}

export interface KaraokeLyricsProps extends CommonProps {
  /** The line being sung now. */
  current?: readonly LyricWord[];
  /** The line after it, dimmed below. */
  next?: readonly LyricWord[];
  /** Shown in place of the current line, e.g. a countdown before it. */
  message?: ReactNode;
  /** Keys of the lines: a new key fades the line in, the same key keeps it in place. */
  currentKey?: string | number;
  nextKey?: string | number;
  /** The music's percussion, 0–1: the line swells and glows with the kick and flashes with the snare. */
  kick?: number;
  snare?: number;
  pulse?: number;
}

const DEMO: LyricWord[] = [
  { id: "1", text: "Ночь", progress: 1 },
  { id: "2", text: "горит", progress: 0.55 },
  { id: "3", text: "огнями", progress: 0 },
];

const line = (words: readonly LyricWord[], sung: boolean) =>
  words.map((word) => (
    <span
      key={word.id}
      className="ad-lyric-word"
      style={{ "--ad-lyric-fill": `${Math.round(clamp(sung ? (word.progress ?? 0) : 0, 0, 1) * 100)}%` } as CSSProperties}
    >
      {word.text}{" "}
    </span>
  ));

/** Karaoke lyrics: the current line fills as it is sung and breathes with the drums; the next one waits below. */
export const KaraokeLyrics = ({
  current = DEMO,
  next = [{ id: "4", text: "и" }, { id: "5", text: "нас" }, { id: "6", text: "зовёт" }],
  message,
  currentKey,
  nextKey,
  kick = 0,
  snare = 0,
  pulse = 0,
  ...p
}: KaraokeLyricsProps) => (
  <div
    {...mark("KaraokeLyrics", p)}
    aria-live="off"
    style={{ ...p.style, "--ad-lyric-kick": kick, "--ad-lyric-snare": snare, "--ad-lyric-pulse": pulse } as CSSProperties}
  >
    <p key={currentKey} className="ad-lyrics-current" data-message={message !== undefined || undefined}>
      {message ?? line(current, true)}
    </p>
    <p key={nextKey} className="ad-lyrics-next" aria-hidden={message !== undefined || undefined}>
      {message === undefined && line(next, false)}
    </p>
  </div>
);
