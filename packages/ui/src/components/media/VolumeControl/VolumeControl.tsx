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
import { AudioPlayer } from "../AudioPlayer";
import { TransportBar } from "../TransportBar";
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

export const VolumeControl = define<VolumeControlProps>("VolumeControl", p => {
  const [volume, setVolume] = useControllable(p.value, p.defaultValue ?? 35, p.onValueChange);
  const [muted, setMuted] = useControllable(p.muted, p.defaultMuted ?? false, p.onMute);
  return <div {...mark("VolumeControl", p, "glass")}><ToggleButton checked={muted} onValueChange={setMuted} icon="volume" label="Выключить звук" variant="ghost" /><Slider value={volume} onValueChange={setVolume} label="Громкость" />{p.showValue !== false && <output>{volume}</output>}</div>;
});
