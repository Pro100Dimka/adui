import React from "react";
import { define, useControllable } from "../../../core/base";
import { InputBase } from "../InputBase/InputBase";
import type { TextAreaProps } from "../shared";
export const TextArea = define<TextAreaProps>("TextArea", (p) => {
  const {
    value,
    defaultValue = "",
    onValueChange,
    label,
    description,
    error,
    startAdornment,
    endAdornment,
    ...dom
  } = p;
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <label className={`ad-text-area ${p.className ?? ""}`}>
      {label && <span className="ad-field-label">{label}</span>}
      <InputBase
        size={p.size}
        multiline
        disabled={p.disabled}
        readOnly={p.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
      >
        <textarea
          {...dom}
          className={undefined}
          style={undefined}
          value={current}
          onChange={(e) => setCurrent(e.currentTarget.value)}
        />
      </InputBase>
      {(description || error) && (
        <small className={error ? "ad-field-error" : ""}>
          {error || description}
        </small>
      )}
    </label>
  );
});
