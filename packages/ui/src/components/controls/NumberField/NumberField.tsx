import { TextField } from "../TextField/TextField";
import type { NumberFieldProps } from "../shared";
export const NumberField = ({
  value,
  defaultValue = 0,
  onValueChange,
  ...p
}: NumberFieldProps) => (
  <TextField
    {...p}
    type="number"
    value={value === undefined ? undefined : String(value)}
    defaultValue={String(defaultValue)}
    onValueChange={(v) => onValueChange?.(v === "" ? "" : Number(v))}
  />
);
