import { useControllable } from "../../../core/base";
import { FieldFrame } from "../internal";
import { IconButton } from "../IconButton/IconButton";
import { InputBase } from "../InputBase/InputBase";
import type { TextFieldProps } from "../shared";

export const TextField = ({
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
  className,
  size,
  tone: _tone,
  material: _material,
  style: _style,
  children: _children,
  ...input
}: TextFieldProps) => {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <FieldFrame
      className={`ad-text-field-shell ${className ?? ""}`}
      label={label}
      required={input.required}
      description={description}
      error={error}
    >
      <InputBase
        size={size}
        disabled={input.disabled}
        readOnly={input.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={
          <>
            {clearable && current && (
              <IconButton
                size="xs"
                variant="ghost"
                icon="close"
                label="Очистить"
                disabled={input.disabled || input.readOnly}
                onClick={() => setCurrent("")}
              />
            )}
            {endAdornment}
          </>
        }
      >
        <input
          {...input}
          ref={inputRef}
          value={current}
          aria-invalid={!!error || undefined}
          onChange={(e) => setCurrent(e.currentTarget.value)}
        />
      </InputBase>
    </FieldFrame>
  );
};
