import React from "react";
import { define } from "../../../core/base";
import { TextField } from "../TextField/TextField";
import type { NumberFieldProps } from "../shared";
export const NumberField = define<NumberFieldProps>(
  "NumberField",
  ({ value, defaultValue = 0, onValueChange, ...p }) => (
    <TextField
      {...p}
      type="number"
      value={value === undefined ? undefined : String(value)}
      defaultValue={String(defaultValue)}
      onValueChange={(v) => onValueChange?.(v === "" ? "" : Number(v))}
    />
  ),
);
