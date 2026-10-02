import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { Badge } from "../../feedback/Badge/Badge";
import { MessageBar } from "../../feedback/MessageBar/MessageBar";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { Slider } from "../../controls/Slider/Slider";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import { type WaveformProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type SparklineProps } from "../shared";
import { Waveform } from "../Waveform/Waveform";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { Sparkline } from "../Sparkline/Sparkline";

export const WaveDecoration = define<CommonProps>("WaveDecoration", p => {
  const ref = useRef<SVGSVGElement>(null); const uid = useId().replace(/:/g, "");
  const paint = (t: number) => ref.current?.querySelectorAll("path").forEach((path, j) => {
    let d = "";
    for (let i = 0; i <= 65; i++) { const x = i / 65 * 600, y = 65 + (j - 11) * 2.5 + Math.sin(i * .115 + t * .6 + j * .08) * 24 + Math.sin(i * .19 - t * .31) * 9; d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`; }
    path.setAttribute("d", d);
  });
  useDecoration(ref, paint);
  return <svg {...mark("WaveDecoration", p)} ref={ref} viewBox="0 0 600 130" aria-hidden="true"><defs><linearGradient id={`wave-${uid}`}>{[[0, 0], [.2, .3], [.7, 1], [1, .35]].map(([offset, opacity]) => <stop key={offset} offset={offset} stopColor="#ff426d" stopOpacity={opacity} />)}</linearGradient></defs>{Array.from({ length: 22 }, (_, j) => <path key={j} d="M0 65H600" fill="none" stroke={`url(#wave-${uid})`} strokeWidth={j % 7 === 0 ? 1.2 : .65} opacity={.5 + j % 4 * .13} />)}</svg>;
});
