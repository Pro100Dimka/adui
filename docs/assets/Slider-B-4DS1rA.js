const r=`import React from "react";\r
import { clamp, mark, useControllable } from "../../../core/base";\r
import type { SliderProps } from "../shared";\r
export const Slider = (p: SliderProps) => {\r
  const min = p.min ?? 0,\r
    max = Math.max(min, p.max ?? 100);\r
  const [value, setValue] = useControllable(\r
    p.value,\r
    p.defaultValue ?? 35,\r
    p.onValueChange,\r
  );\r
  const current = clamp(value, min, max),\r
    percent = max === min ? 0 : ((current - min) / (max - min)) * 100;\r
  return (\r
    <input\r
      {...mark("Slider", p)}\r
      ref={p.ref}\r
      id={p.id}\r
      type="range"\r
      value={current}\r
      min={min}\r
      max={max}\r
      step={p.step ?? 1}\r
      disabled={p.disabled}\r
      aria-label={p.label ?? "Значение"}\r
      style={{ "--ad-level": \`\${percent}%\`, ...p.style } as React.CSSProperties}\r
      onChange={(e) => setValue(Number(e.currentTarget.value))}\r
    />\r
  );\r
};\r
`;export{r as default};
