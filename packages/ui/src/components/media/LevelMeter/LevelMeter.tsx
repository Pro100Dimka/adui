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
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { CircularGauge } from "../CircularGauge/CircularGauge";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

export const LevelMeter = define<LevelMeterProps>("LevelMeter", p => {
  const value = clamp(p.value ?? 72);
  return <div {...mark("LevelMeter", p)} role="meter" aria-label={p.label ?? "Уровень сигнала"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>{Array.from({ length: 28 }, (_, i) => <i key={i} data-lit={i / 28 < value / 100} style={{ height: p.segmented ? 18 : 12 + 19 * Math.sin(i * .35) ** 2 }} />)}</div>;
});
