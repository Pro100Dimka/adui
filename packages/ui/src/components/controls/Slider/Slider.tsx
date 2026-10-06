import { tr, useTr } from "../../../core/i18n";
import React from "react";
import { clamp, mark, useControllable } from "../../../core/base";
import { FieldFrame, useFieldIds } from "../internal";
import type { SliderProps } from "../shared";
export const Slider = (p: SliderProps) => {
  const tr = useTr();
  const min = p.min ?? 0,
    max = Math.max(min, p.max ?? 100);
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? 35,
    p.onValueChange,
  );
  const current = clamp(value, min, max),
    percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const ids = useFieldIds(p.label, undefined);
  return (
    <FieldFrame ids={ids} className="ad-slider-field" label={p.label}>
      <input
        {...mark("Slider", p)}
        ref={p.ref}
        type="range"
        value={current}
        min={min}
        max={max}
        step={p.step ?? 1}
        disabled={p.disabled}
        aria-labelledby={p["aria-labelledby"] ?? ids.aria["aria-labelledby"]}
        aria-label={p["aria-label"] ?? (p.label ? undefined : tr("Значение"))}
        style={{ "--ad-level": `${percent}%`, ...p.style } as React.CSSProperties}
        onChange={(e) => setValue(Number(e.currentTarget.value))}
      />
    </FieldFrame>
  );
};
