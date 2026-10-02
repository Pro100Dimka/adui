import type { CommonProps } from "../../core/base";
export interface WaveformProps extends CommonProps {
  duration?: number;
  position?: number;
  defaultPosition?: number;
  onSeek?: (time: number) => void;
  points?: number[];
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
  value?: number;
  label?: string;
  segmented?: boolean;
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
