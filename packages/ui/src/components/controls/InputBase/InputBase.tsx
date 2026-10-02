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
    onClick={onClick}
  >
    {startAdornment && (
      <span className="ad-input-adornment" data-position="start">
        {startAdornment}
      </span>
    )}
    <span className="ad-input-base-content">{children}</span>
    {endAdornment && (
      <span className="ad-input-adornment" data-position="end">
        {endAdornment}
      </span>
    )}
  </div>
);
