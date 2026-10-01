import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion";
import { Icon, Surface } from "../../layout";
import { Badge, MessageBar } from "../../feedback";
import { IconButton, Select, Slider, ToggleButton } from "../../controls";
import { type WaveformProps, type VolumeControlProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type CircularGaugeProps, type SparklineProps } from "../shared";
import { WaveDecoration } from "../WaveDecoration";
import { ParticleLayer } from "../ParticleLayer";
import { Waveform } from "../Waveform";
import { VolumeControl } from "../VolumeControl";
import { AudioPlayer } from "../AudioPlayer";
import { TransportBar } from "../TransportBar";
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

export const CircularGauge = define<CircularGaugeProps>("CircularGauge", p => <div {...mark("CircularGauge", p)}>
  <RotaryKnob value={p.value ?? 72} label={p.label ?? "Микрофон"} diameter={p.diameter ?? 132} showValue={p.showValue} readOnly />
</div>);
