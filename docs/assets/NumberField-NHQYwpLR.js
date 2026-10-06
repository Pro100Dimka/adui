const n=`import { tr, useTr } from "../../../core/i18n";
import { classes, clamp, useControllable } from "../../../core/base";
import { IconButton } from "../IconButton/IconButton";
import { TextField } from "../TextField/TextField";
import type { NumberFieldProps } from "../shared";

export const NumberField = ({
  value,
  defaultValue = 0,
  onValueChange,
  min,
  max,
  step = 1,
  endAdornment,
  className,
  controls = true,
  ...p
}: NumberFieldProps) => {
  const tr = useTr();
  const [current, setCurrent] = useControllable<number | "">(
    value,
    defaultValue,
    onValueChange,
  );
  const low = min === undefined ? -Infinity : Number(min);
  const high = max === undefined ? Infinity : Number(max);
  const locked = p.disabled || p.readOnly;
  // toFixed avoids 0.1 + 0.2 style drift when stepping by fractions.
  const nudge = (direction: 1 | -1) =>
    setCurrent(
      clamp(
        Number(((current || 0) + direction * Number(step)).toFixed(10)),
        low,
        high,
      ),
    );
  return (
    <TextField
      {...p}
      className={classes("ad-number-field", className)}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={String(current)}
      onValueChange={(v) => setCurrent(v === "" ? "" : Number(v))}
      endAdornment={
        <>
          {endAdornment}
          {controls && <>
          <IconButton
            size="xs"
            variant="ghost"
            icon="minus"
            label={tr("Уменьшить")}
            disabled={locked || (current !== "" && current <= low)}
            onClick={() => nudge(-1)}
          />
          <IconButton
            size="xs"
            variant="ghost"
            icon="plus"
            label={tr("Увеличить")}
            disabled={locked || (current !== "" && current >= high)}
            onClick={() => nudge(1)}
          />
          </>}
        </>
      }
    />
  );
};
`;export{n as default};
