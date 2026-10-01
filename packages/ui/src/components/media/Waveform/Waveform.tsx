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
import { VolumeControl } from "../VolumeControl/VolumeControl";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { TransportBar } from "../TransportBar/TransportBar";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { CircularGauge } from "../CircularGauge/CircularGauge";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

export const Waveform = define<WaveformProps>("Waveform", p => {
  const duration = Math.max(.001, p.duration ?? 231);
  const [position, seek] = useControllable(p.position, p.defaultPosition ?? 0, p.onSeek);
  const d = useMemo(() => {
    const points = p.points ?? Array.from({ length: 280 }, (_, i) => (2 + 24 * (.3 + .7 * Math.sin(i * .032) ** 2) * (.22 + .78 * Math.abs(Math.sin(i * 1.723)))) / 32);
    return points.map((v, i) => { const x = i / Math.max(1, points.length - 1) * 600, a = clamp(Math.abs(v), 0, 1) * 30; return `M${x.toFixed(2)} ${(32 - a).toFixed(2)}V${(32 + a).toFixed(2)}`; }).join("");
  }, [p.points]);
  const x = clamp(position / duration, 0, 1) * 600;
  return <div {...mark("Waveform", p)}><svg viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true"><path d={d} stroke={p.color ?? "#ff416c"} strokeWidth={1} fill="none" /><path d={`M${x} 3V61`} stroke="#ffe0e5" strokeWidth={1.5} /></svg><input type="range" min={0} max={duration} step={.01} value={clamp(position, 0, duration)} disabled={p.disabled} aria-label={p.label ?? "Позиция воспроизведения"} onChange={e => seek(Number(e.currentTarget.value))} /></div>;
});
