import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { Surface } from "../../layout/Surface/Surface";
import { Badge } from "../../feedback/Badge/Badge";
import { MessageBar } from "../../feedback/MessageBar/MessageBar";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { Slider } from "../../controls/Slider/Slider";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import { type WaveformProps, type VolumeControlProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type CircularGaugeProps, type SparklineProps } from "../shared";
import { WaveDecoration } from "../WaveDecoration/WaveDecoration";
import { ParticleLayer } from "../ParticleLayer/ParticleLayer";
import { Waveform } from "../Waveform/Waveform";
import { VolumeControl } from "../VolumeControl/VolumeControl";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { TransportBar } from "../TransportBar/TransportBar";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

export const CircularGauge = define<CircularGaugeProps>("CircularGauge", p => <div {...mark("CircularGauge", p)}>
  <RotaryKnob value={p.value ?? 72} label={p.label ?? "Микрофон"} diameter={p.diameter ?? 132} showValue={p.showValue} readOnly />
</div>);
