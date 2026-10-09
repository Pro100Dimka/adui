import type { CommonProps } from "../../core/base";
export interface WaveformProps extends CommonProps {
  duration?: number;
  position?: number;
  defaultPosition?: number;
  onSeek?: (time: number) => void;
  /** Ready peaks (any scale, any count); without them the shape is read from `src`. */
  points?: readonly number[];
  /** An audio file (URL, File or Blob) whose peaks are decoded in the browser. */
  src?: string | Blob | null;
  /** How many bars to decode from `src` (clamped to 1–10,000; non-finite values use 600). */
  bins?: number;
  color?: string;
  label?: string;
  disabled?: boolean;
}
export interface AudioPlayerProps extends CommonProps {
  src?: string;
  duration?: number;
  /** Use an external audio engine instead of creating an HTMLAudioElement. */
  playing?: boolean;
  /** Current position supplied by an external audio engine. */
  position?: number;
  disabled?: boolean;
  onTimeChange?: (time: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  points?: number[];
  volume?: number;
  defaultVolume?: number;
  showVolume?: boolean;
}
export interface LevelMeterProps extends CommonProps {
  /** Current level, 0–100; change it as often as you like. */
  value?: number;
  /** A live input (e.g. from getUserMedia) the meter listens to by itself; overrides `value`. */
  stream?: MediaStream | null;
  /** Off (muted, disconnected): the wave settles and dims. */
  active?: boolean;
  /** Small pill-sized meter for lists and participant rows. */
  compact?: boolean;
  label?: string;
}
export interface RotaryKnobProps extends CommonProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  step?: number;
  fineStep?: number;
  resetValue?: number;
  /** Value range; 0–100 (percent) by default. */
  min?: number;
  max?: number;
  /** The readout and typed input show value × this (e.g. 100 for a 0–2 gain shown as 0–200 %). */
  displayScale?: number;
  /** Unit after the shown number; "%" by default. */
  suffix?: string;
  label?: string;
  /** Print the label under the knob (otherwise it is only read out and shown on hover). */
  showLabel?: boolean;
  showValue?: boolean;
  diameter?: number;
}
export type RotaryKnobController = {
  get value(): number;
  setValue(next: number, notify?: boolean): void;
  reset(): void;
};
export interface SparklineProps extends CommonProps {
  values?: number[];
  /** Scale to the values' own range instead of from zero, so small changes fill the height. */
  fit?: boolean;
  color?: string;
  label?: string;
}
