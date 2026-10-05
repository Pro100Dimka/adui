import { tr } from "../../../core/i18n";
import React from "react";
import { clamp, mark, useControllable } from "../../../core/base";
import type { SliderProps } from "../shared";
export const Slider = (p: SliderProps) => {
  const min = p.min ?? 0,
    max = Math.max(min, p.max ?? 100);
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? 35,
    p.onValueChange,
  );
  const current = clamp(value, min, max),
    percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  return (
    <input
      {...mark("Slider", p)}
      ref={p.ref}
      id={p.id}
      type="range"
      value={current}
      min={min}
      max={max}
      step={p.step ?? 1}
      disabled={p.disabled}
      aria-label={p.label ?? tr("Значение")}
      style={{ "--ad-level": `${percent}%`, ...p.style } as React.CSSProperties}
      onChange={(e) => setValue(Number(e.currentTarget.value))}
    />
  );
};
