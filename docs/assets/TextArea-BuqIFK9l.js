const r=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel, useFieldIds } from "../internal";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { TextAreaProps } from "../shared";\r
\r
export const TextArea = ({\r
  value,\r
  defaultValue = "",\r
  onValueChange,\r
  label,\r
  description,\r
  error,\r
  startAdornment,\r
  endAdornment,\r
  className,\r
  size,\r
  variant,\r
  labelPlacement = "top",\r
  resize = "vertical",\r
  tone: _tone,\r
  material: _material,\r
  style: _style,\r
  ...textarea\r
}: TextAreaProps) => {\r
  const [current, setCurrent] = useControllable(\r
    value,\r
    defaultValue,\r
    onValueChange,\r
  );\r
  const ids = useFieldIds(label, description || error);\r
  const floating = labelPlacement === "floating" && !!label;\r
  return (\r
    <FieldFrame\r
      ids={ids}\r
      className={\`ad-text-area ad-text-area--resize-\${resize} \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={textarea.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(label, textarea.required) : undefined}\r
        filled={!!current}\r
        multiline\r
        disabled={textarea.disabled}\r
        readOnly={textarea.readOnly}\r
        error={!!error}\r
        startAdornment={startAdornment}\r
        endAdornment={endAdornment}\r
      >\r
        <textarea\r
          {...ids.aria}\r
          {...textarea}\r
          value={current}\r
          onChange={(e) => setCurrent(e.currentTarget.value)}\r
        />\r
      </InputBase>\r
    </FieldFrame>\r
  );\r
};\r
`;export{r as default};
