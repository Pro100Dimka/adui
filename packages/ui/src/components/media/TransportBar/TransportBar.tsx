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
import { LevelMeter } from "../LevelMeter";
import { RotaryKnob } from "../RotaryKnob";
import { CircularGauge } from "../CircularGauge";
import { Sparkline } from "../Sparkline";
import { LatencyIndicator } from "../LatencyIndicator";

export const TransportBar = define<AudioPlayerProps>("TransportBar", p => <Surface className={`ad-transport-bar ${p.className ?? ""}`}><AudioPlayer {...p} duration={p.duration ?? 231} /><VolumeControl defaultValue={70} showValue={false} /><Select label="Масштаб дорожки" options={["100%", "125%", "150%"]} /></Surface>);
