import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion";
import { Icon, Surface } from "../../layout";
import { Badge, MessageBar } from "../../feedback";
import { IconButton, Select, Slider, ToggleButton } from "../../controls";
import { type WaveformProps, type VolumeControlProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type CircularGaugeProps, type SparklineProps } from "../_shared";
import { WaveDecoration } from "../WaveDecoration";
import { Waveform } from "../Waveform";
import { VolumeControl } from "../VolumeControl";
import { AudioPlayer } from "../AudioPlayer";
import { TransportBar } from "../TransportBar";
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

export const ParticleLayer = define<CommonProps>("ParticleLayer", p => {
  const ref = useRef<SVGSVGElement>(null);
  const points = useMemo(() => { let seed = 23; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647); return Array.from({ length: 65 }, () => ({ x: rnd() * 600, y: rnd() * 130, r: .3 + rnd() * 1.3, a: .1 + rnd() * .7 })); }, []);
  useDecoration(ref, t => ref.current?.querySelectorAll("circle").forEach((n, i) => n.setAttribute("opacity", String(.15 + .65 * (.5 + .5 * Math.sin(t * .8 + i))))));
  return <svg {...mark("ParticleLayer", p)} ref={ref} viewBox="0 0 600 130" aria-hidden="true">{points.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r={v.r} opacity={v.a} fill={i % 6 ? "#ff426d" : "#ffe2eb"} />)}</svg>;
});
