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
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { TransportBar } from "../TransportBar/TransportBar";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { CircularGauge } from "../CircularGauge/CircularGauge";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

export const VolumeControl = define<VolumeControlProps>("VolumeControl", p => {
  const [volume, setVolume] = useControllable(p.value, p.defaultValue ?? 35, p.onValueChange);
  const [muted, setMuted] = useControllable(p.muted, p.defaultMuted ?? false, p.onMute);
  return <div {...mark("VolumeControl", p, "glass")}><ToggleButton checked={muted} onValueChange={setMuted} icon="volume" label="Выключить звук" variant="ghost" /><Slider value={volume} onValueChange={setVolume} label="Громкость" />{p.showValue !== false && <output>{volume}</output>}</div>;
});
