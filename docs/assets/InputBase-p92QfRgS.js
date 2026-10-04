const r=`import type { MouseEventHandler, ReactNode, Ref } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import type { InputVariant } from "../shared";\r
\r
export interface InputBaseProps extends CommonProps {\r
  startAdornment?: ReactNode;\r
  endAdornment?: ReactNode;\r
  disabled?: boolean;\r
  readOnly?: boolean;\r
  error?: boolean;\r
  multiline?: boolean;\r
  variant?: InputVariant;\r
  /** Floating label drawn inside the box; it rises when focused or filled. */\r
  label?: ReactNode;\r
  /** Id of the floating label, for the control's aria-labelledby. */\r
  labelId?: string;\r
  /** The control has a value, so a floating label stays raised. */\r
  filled?: boolean;\r
  ref?: Ref<HTMLDivElement>;\r
  onClick?: MouseEventHandler<HTMLDivElement>;\r
}\r
\r
export const InputBase = ({\r
  startAdornment,\r
  endAdornment,\r
  disabled,\r
  readOnly,\r
  error,\r
  multiline,\r
  variant = "outlined",\r
  label,\r
  labelId,\r
  filled,\r
  ref,\r
  onClick,\r
  children,\r
  ...p\r
}: InputBaseProps) => (\r
  <div\r
    {...mark("InputBase", p, "input")}\r
    ref={ref}\r
    data-disabled={disabled || undefined}\r
    data-readonly={readOnly || undefined}\r
    data-invalid={error || undefined}\r
    data-multiline={multiline || undefined}\r
    data-ad-variant={variant}\r
    data-floating={label ? "" : undefined}\r
    data-filled={filled || undefined}\r
    onClick={onClick}\r
  >\r
    {startAdornment && (\r
      <span className="ad-input-adornment" data-position="start">\r
        {startAdornment}\r
      </span>\r
    )}\r
    <span className="ad-input-base-content">\r
      {label && <span className="ad-input-label" id={labelId}>{label}</span>}\r
      {children}\r
    </span>\r
    {endAdornment && (\r
      <span className="ad-input-adornment" data-position="end">\r
        {endAdornment}\r
      </span>\r
    )}\r
  </div>\r
);\r
`;export{r as default};
