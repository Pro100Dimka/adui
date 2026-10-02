import React, { useRef } from "react";
import { assignRef, define, useControllable } from "../../../core/base";
import { InputBase } from "../InputBase/InputBase";
import { IconButton } from "../IconButton/IconButton";
import type { TextFieldProps } from "../shared";

export const TextField = define<TextFieldProps>("TextField", (p) => {
  const {
    label,
    description,
    error,
    clearable,
    startAdornment,
    endAdornment,
    value,
    defaultValue = "",
    onValueChange,
    inputRef,
    ...input
  } = p;
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  const localRef = useRef<HTMLInputElement>(null);
  const end = (
    <>
      {clearable && (
        <IconButton
          size="xs"
          variant="ghost"
          icon="close"
          label="Очистить"
          disabled={p.disabled || p.readOnly}
          onClick={() => setCurrent("")}
        />
      )}{" "}
      {endAdornment}
    </>
  );
  return (
    <label
      className={`ad-text-field-shell ${p.className ?? ""}`}
      data-ad-invalid={!!error || undefined}
    >
      {label && (
        <span className="ad-field-label">
          {label}
          {p.required ? " *" : ""}
        </span>
      )}
      <InputBase
        size={p.size}
        disabled={p.disabled}
        readOnly={p.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={end}
      >
        <input
          {...input}
          className={undefined}
          style={undefined}
          ref={(n) => {
            localRef.current = n;
            assignRef(inputRef, n);
          }}
          value={current}
          aria-invalid={!!error || undefined}
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
