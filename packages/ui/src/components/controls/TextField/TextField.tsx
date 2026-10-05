import { tr } from "../../../core/i18n";
import { useControllable } from "../../../core/base";
import { FieldFrame, fieldLabel, useFieldIds } from "../internal";
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
  variant,
  labelPlacement = "top",
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
  const ids = useFieldIds(label, description || error);
  const floating = labelPlacement === "floating" && !!label;
  return (
    <FieldFrame
      ids={ids}
      className={`ad-text-field-shell ${className ?? ""}`}
      label={floating ? undefined : label}
      required={input.required}
      description={description}
      error={error}
    >
      <InputBase
        size={size}
        variant={variant}
        labelId={ids.label}
        label={floating ? fieldLabel(label, input.required) : undefined}
        filled={!!current}
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
                label={tr("Очистить")}
                disabled={input.disabled || input.readOnly}
                onClick={() => setCurrent("")}
              />
            )}
            {endAdornment}
          </>
        }
      >
        <input
          {...ids.aria}
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
