import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion";
import { Icon, Surface } from "../../layout";
import { Badge, MessageBar } from "../../feedback";
import { IconButton, Select, Slider, ToggleButton } from "../../controls";
import { type WaveformProps, type VolumeControlProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type CircularGaugeProps, type SparklineProps } from "../_shared";
import { WaveDecoration } from "../WaveDecoration";
import { ParticleLayer } from "../ParticleLayer";
import { Waveform } from "../Waveform";
import { VolumeControl } from "../VolumeControl";
import { AudioPlayer } from "../AudioPlayer";
import { TransportBar } from "../TransportBar";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

export const LevelMeter = define<LevelMeterProps>("LevelMeter", p => {
  const value = clamp(p.value ?? 72);
  return <div {...mark("LevelMeter", p)} role="meter" aria-label={p.label ?? "Уровень сигнала"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>{Array.from({ length: 28 }, (_, i) => <i key={i} data-lit={i / 28 < value / 100} style={{ height: p.segmented ? 18 : 12 + 19 * Math.sin(i * .35) ** 2 }} />)}</div>;
});
