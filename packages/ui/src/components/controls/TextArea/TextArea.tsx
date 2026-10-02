import { useControllable } from "../../../core/base";
import { FieldFrame } from "../internal";
import { InputBase } from "../InputBase/InputBase";
import type { TextAreaProps } from "../shared";

export const TextArea = ({
  value,
  defaultValue = "",
  onValueChange,
  label,
  description,
  error,
  startAdornment,
  endAdornment,
  className,
  size,
  variant,
  tone: _tone,
  material: _material,
  style: _style,
  ...textarea
}: TextAreaProps) => {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <FieldFrame
      className={`ad-text-area ${className ?? ""}`}
      label={label}
      required={textarea.required}
      description={description}
      error={error}
    >
      <InputBase
        size={size}
        variant={variant}
        multiline
        disabled={textarea.disabled}
        readOnly={textarea.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
      >
        <textarea
          {...textarea}
          value={current}
          onChange={(e) => setCurrent(e.currentTarget.value)}
        />
      </InputBase>
    </FieldFrame>
  );
};
