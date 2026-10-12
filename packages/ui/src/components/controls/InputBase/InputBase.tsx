import { forwardRef, type MouseEventHandler, type ReactNode, type Ref } from "react";
import { mark, type CommonProps } from "../../../core/base";
import type { InputVariant } from "../shared";

export interface InputBaseProps extends CommonProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  multiline?: boolean;
  variant?: InputVariant;
  /** Floating label drawn inside the box; it rises when focused or filled. */
  label?: ReactNode;
  /** Id of the floating label, for the control's aria-labelledby. */
  labelId?: string;
  /** The control has a value, so a floating label stays raised. */
  filled?: boolean;
  ref?: Ref<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const InputBase = /* @__PURE__ */ forwardRef<HTMLDivElement, InputBaseProps>(function InputBase({
  startAdornment,
  endAdornment,
  disabled,
  readOnly,
  error,
  multiline,
  variant = "outlined",
  label,
  labelId,
  filled,
  onClick,
  children,
  ...p
}, ref) { return (
  <div
    {...mark("InputBase", p, "input")}
    ref={ref}
    data-disabled={disabled || undefined}
    data-readonly={readOnly || undefined}
    data-invalid={error || undefined}
    data-multiline={multiline || undefined}
    data-ad-variant={variant}
    data-floating={label ? "" : undefined}
    data-filled={filled || undefined}
    onClick={onClick}
  >
    {startAdornment && (
      <span className="ad-input-adornment" data-position="start">
        {startAdornment}
      </span>
    )}
    <span className="ad-input-base-content">
      {label && <span className="ad-input-label" id={labelId}>{label}</span>}
      {children}
    </span>
    {endAdornment && (
      <span className="ad-input-adornment" data-position="end">
        {endAdornment}
      </span>
    )}
  </div>
); });
