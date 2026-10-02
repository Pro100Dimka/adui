import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clamp,
  define,
  mark,
  timeText,
  useControllable,
  type CommonProps,
} from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { Badge } from "../../feedback/Badge/Badge";
import { MessageBar } from "../../feedback/MessageBar/MessageBar";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { Slider } from "../../controls/Slider/Slider";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import {
  type WaveformProps,
  type AudioPlayerProps,
  type LevelMeterProps,
  type RotaryKnobProps,
  type RotaryKnobController,
  type SparklineProps,
} from "../shared";
import { WaveDecoration } from "../WaveDecoration/WaveDecoration";
import { Waveform } from "../Waveform/Waveform";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";

export const Sparkline = define<SparklineProps>("Sparkline", (p) => {
  const values = p.values ?? [
    12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23,
  ];
  return (
    <svg
      {...mark("Sparkline", p)}
      viewBox="0 0 240 70"
      role={p.label ? "img" : undefined}
      aria-label={p.label}
      aria-hidden={!p.label}
    >
      <polyline
        points={values
          .map(
            (v, i) => `${(i / Math.max(1, values.length - 1)) * 240},${65 - v}`,
          )
          .join(" ")}
        fill="none"
        stroke={p.color ?? "#ff416a"}
        strokeWidth={1.4}
        style={{ filter: "drop-shadow(0 0 0.25rem #ff315c)" }}
      />
    </svg>
  );
});
