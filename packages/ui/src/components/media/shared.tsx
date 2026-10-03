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
  /** How many bars to decode from `src`. */
  bins?: number;
  color?: string;
  label?: string;
  disabled?: boolean;
}
export interface AudioPlayerProps extends CommonProps {
  src?: string;
  duration?: number;
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
  label?: string;
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
  color?: string;
  label?: string;
}
