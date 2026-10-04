const n=`import { classes, clamp, useControllable } from "../../../core/base";\r
import { IconButton } from "../IconButton/IconButton";\r
import { TextField } from "../TextField/TextField";\r
import type { NumberFieldProps } from "../shared";\r
\r
export const NumberField = ({\r
  value,\r
  defaultValue = 0,\r
  onValueChange,\r
  min,\r
  max,\r
  step = 1,\r
  endAdornment,\r
  className,\r
  controls = true,\r
  ...p\r
}: NumberFieldProps) => {\r
  const [current, setCurrent] = useControllable<number | "">(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const low = min === undefined ? -Infinity : Number(min);\r
  const high = max === undefined ? Infinity : Number(max);\r
  const locked = p.disabled || p.readOnly;\r
  // toFixed avoids 0.1 + 0.2 style drift when stepping by fractions.\r
  const nudge = (direction: 1 | -1) =>\r
    setCurrent(\r
      clamp(\r
        Number(((current || 0) + direction * Number(step)).toFixed(10)),\r
        low,\r
        high,\r
      ),\r
    );\r
  return (\r
    <TextField\r
      {...p}\r
      className={classes("ad-number-field", className)}\r
      type="number"\r
      inputMode="decimal"\r
      min={min}\r
      max={max}\r
      step={step}\r
      value={String(current)}\r
      onValueChange={(v) => setCurrent(v === "" ? "" : Number(v))}\r
      endAdornment={\r
        <>\r
          {endAdornment}\r
          {controls && <>\r
          <IconButton\r
            size="xs"\r
            variant="ghost"\r
            icon="minus"\r
            label="Уменьшить"\r
            disabled={locked || (current !== "" && current <= low)}\r
            onClick={() => nudge(-1)}\r
          />\r
          <IconButton\r
            size="xs"\r
            variant="ghost"\r
            icon="plus"\r
            label="Увеличить"\r
            disabled={locked || (current !== "" && current >= high)}\r
            onClick={() => nudge(1)}\r
          />\r
          </>}\r
        </>\r
      }\r
    />\r
  );\r
};\r
`;export{n as default};
