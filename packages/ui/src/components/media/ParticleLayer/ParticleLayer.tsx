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
import { Waveform } from "../Waveform/Waveform";
import { VolumeControl } from "../VolumeControl/VolumeControl";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { TransportBar } from "../TransportBar/TransportBar";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { CircularGauge } from "../CircularGauge/CircularGauge";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

export const ParticleLayer = define<CommonProps>("ParticleLayer", p => {
  const ref = useRef<SVGSVGElement>(null);
  const points = useMemo(() => { let seed = 23; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647); return Array.from({ length: 65 }, () => ({ x: rnd() * 600, y: rnd() * 130, r: .3 + rnd() * 1.3, a: .1 + rnd() * .7 })); }, []);
  useDecoration(ref, t => ref.current?.querySelectorAll("circle").forEach((n, i) => n.setAttribute("opacity", String(.15 + .65 * (.5 + .5 * Math.sin(t * .8 + i))))));
  return <svg {...mark("ParticleLayer", p)} ref={ref} viewBox="0 0 600 130" aria-hidden="true">{points.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r={v.r} opacity={v.a} fill={i % 6 ? "#ff426d" : "#ffe2eb"} />)}</svg>;
});
