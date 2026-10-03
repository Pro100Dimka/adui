import { useControllable } from "../../../core/base";
import { FieldFrame, fieldLabel } from "../internal";
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
  labelPlacement = "top",
  resize = "vertical",
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
  const floating = labelPlacement === "floating" && !!label;
  return (
    <FieldFrame
      className={`ad-text-area ad-text-area--resize-${resize} ${className ?? ""}`}
      label={floating ? undefined : label}
      required={textarea.required}
      description={description}
      error={error}
    >
      <InputBase
        size={size}
        variant={variant}
        label={floating ? fieldLabel(label, textarea.required) : undefined}
        filled={!!current}
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
