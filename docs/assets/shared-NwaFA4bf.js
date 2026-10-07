const e=`import type { CommonProps } from "../../core/base";\r
export interface WaveformProps extends CommonProps {\r
  duration?: number;\r
  position?: number;\r
  defaultPosition?: number;\r
  onSeek?: (time: number) => void;\r
  /** Ready peaks (any scale, any count); without them the shape is read from \`src\`. */\r
  points?: readonly number[];\r
  /** An audio file (URL, File or Blob) whose peaks are decoded in the browser. */\r
  src?: string | Blob | null;\r
  /** How many bars to decode from \`src\` (clamped to 1–10,000; non-finite values use 600). */
  bins?: number;\r
  color?: string;\r
  label?: string;\r
  disabled?: boolean;\r
}\r
export interface AudioPlayerProps extends CommonProps {\r
  src?: string;\r
  duration?: number;\r
  onTimeChange?: (time: number) => void;\r
  onPlayingChange?: (playing: boolean) => void;\r
  points?: number[];\r
  volume?: number;\r
  defaultVolume?: number;\r
  showVolume?: boolean;\r
}\r
export interface LevelMeterProps extends CommonProps {\r
  /** Current level, 0–100; change it as often as you like. */\r
  value?: number;\r
  /** A live input (e.g. from getUserMedia) the meter listens to by itself; overrides \`value\`. */\r
  stream?: MediaStream | null;\r
  /** Off (muted, disconnected): the wave settles and dims. */\r
  active?: boolean;\r
  /** Small pill-sized meter for lists and participant rows. */\r
  compact?: boolean;\r
  label?: string;\r
}\r
export interface RotaryKnobProps extends CommonProps {\r
  value?: number;\r
  defaultValue?: number;\r
  onValueChange?: (value: number) => void;\r
  onValueCommit?: (value: number) => void;\r
  disabled?: boolean;\r
  readOnly?: boolean;\r
  step?: number;\r
  fineStep?: number;\r
  resetValue?: number;\r
  /** Value range; 0–100 (percent) by default. */\r
  min?: number;\r
  max?: number;\r
  /** The readout and typed input show value × this (e.g. 100 for a 0–2 gain shown as 0–200 %). */\r
  displayScale?: number;\r
  /** Unit after the shown number; "%" by default. */\r
  suffix?: string;\r
  label?: string;\r
  /** Print the label under the knob (otherwise it is only read out and shown on hover). */\r
  showLabel?: boolean;\r
  showValue?: boolean;\r
  diameter?: number;\r
}\r
export type RotaryKnobController = {\r
  get value(): number;\r
  setValue(next: number, notify?: boolean): void;\r
  reset(): void;\r
};\r
export interface SparklineProps extends CommonProps {\r
  values?: number[];\r
  /** Scale to the values' own range instead of from zero, so small changes fill the height. */\r
  fit?: boolean;\r
  color?: string;\r
  label?: string;\r
}\r
`;export{e as default};
