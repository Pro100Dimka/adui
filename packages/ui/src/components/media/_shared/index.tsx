import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion";
import { Icon, Surface } from "../../layout";
import { Badge, MessageBar } from "../../feedback";
import { IconButton, Select, Slider, ToggleButton } from "../../controls";

import { WaveDecoration } from "../WaveDecoration";
import { ParticleLayer } from "../ParticleLayer";
import { Waveform } from "../Waveform";
import { VolumeControl } from "../VolumeControl";
import { AudioPlayer } from "../AudioPlayer";
import { TransportBar } from "../TransportBar";
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

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
