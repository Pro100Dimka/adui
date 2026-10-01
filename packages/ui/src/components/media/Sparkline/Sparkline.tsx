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
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { LatencyIndicator } from "../LatencyIndicator";

export const Sparkline = define<SparklineProps>("Sparkline", p => {
  const values = p.values ?? [12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23];
  return <svg {...mark("Sparkline", p)} viewBox="0 0 240 70" role={p.label ? "img" : undefined} aria-label={p.label} aria-hidden={!p.label}><polyline points={values.map((v, i) => `${i / Math.max(1, values.length - 1) * 240},${65 - v}`).join(" ")} fill="none" stroke={p.color ?? "#ff416a"} strokeWidth={1.4} style={{ filter: "drop-shadow(0 0 4px #ff315c)" }} /></svg>;
});
