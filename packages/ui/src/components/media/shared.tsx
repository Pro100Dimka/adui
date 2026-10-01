import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../core/base";
import { useDecoration } from "../../core/motion/hooks";
import { Icon } from "../layout/Icon/Icon";
import { Surface } from "../layout/Surface/Surface";
import { Badge } from "../feedback/Badge/Badge";
import { MessageBar } from "../feedback/MessageBar/MessageBar";
import { IconButton } from "../controls/IconButton/IconButton";
import { Select } from "../controls/Select/Select";
import { Slider } from "../controls/Slider/Slider";
import { ToggleButton } from "../controls/ToggleButton/ToggleButton";

import { WaveDecoration } from "./WaveDecoration/WaveDecoration";
import { ParticleLayer } from "./ParticleLayer/ParticleLayer";
import { Waveform } from "./Waveform/Waveform";
import { VolumeControl } from "./VolumeControl/VolumeControl";
import { AudioPlayer } from "./AudioPlayer/AudioPlayer";
import { TransportBar } from "./TransportBar/TransportBar";
import { LevelMeter } from "./LevelMeter/LevelMeter";
import { RotaryKnob } from "./RotaryKnob/RotaryKnob";
import { CircularGauge } from "./CircularGauge/CircularGauge";
import { Sparkline } from "./Sparkline/Sparkline";
import { LatencyIndicator } from "./LatencyIndicator/LatencyIndicator";

export interface WaveformProps extends CommonProps { duration?: number; position?: number; defaultPosition?: number; onSeek?: (time: number) => void; points?: number[]; color?: string; label?: string; disabled?: boolean }

export interface VolumeControlProps extends CommonProps { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; muted?: boolean; defaultMuted?: boolean; onMute?: (muted: boolean) => void; showValue?: boolean }

export interface AudioPlayerProps extends CommonProps { src?: string; duration?: number; onTimeChange?: (time: number) => void; onPlayingChange?: (playing: boolean) => void; points?: number[]; volume?: number }

export interface LevelMeterProps extends CommonProps { value?: number; label?: string; segmented?: boolean }

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

export interface CircularGaugeProps extends CommonProps {
  value?: number;
  label?: string;
  unit?: string;
  icon?: string;
  diameter?: number;
  showValue?: boolean;
}

export interface SparklineProps extends CommonProps { values?: number[]; color?: string; label?: string }
