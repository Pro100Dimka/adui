import type { MouseEventHandler, ReactNode, Ref } from "react";
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
  /** The control has a value, so a floating label stays raised. */
  filled?: boolean;
  ref?: Ref<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const InputBase = ({
  startAdornment,
  endAdornment,
  disabled,
  readOnly,
  error,
  multiline,
  variant = "outlined",
  label,
  filled,
  ref,
  onClick,
  children,
  ...p
}: InputBaseProps) => (
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
      {label && <span className="ad-input-label">{label}</span>}
      {children}
    </span>
    {endAdornment && (
      <span className="ad-input-adornment" data-position="end">
        {endAdornment}
      </span>
    )}
  </div>
);
