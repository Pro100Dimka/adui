const r=`import { useControllable } from "../../../core/base";\r
import { FieldFrame, fieldLabel, useFieldIds } from "../internal";\r
import { IconButton } from "../IconButton/IconButton";\r
import { InputBase } from "../InputBase/InputBase";\r
import type { TextFieldProps } from "../shared";\r
\r
export const TextField = ({\r
  label,\r
  description,\r
  error,\r
  clearable,\r
  startAdornment,\r
  endAdornment,\r
  value,\r
  defaultValue = "",\r
  onValueChange,\r
  inputRef,\r
  className,\r
  size,\r
  variant,\r
  labelPlacement = "top",\r
  tone: _tone,\r
  material: _material,\r
  style: _style,\r
  children: _children,\r
  ...input\r
}: TextFieldProps) => {\r
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
      className={\`ad-text-field-shell \${className ?? ""}\`}\r
      label={floating ? undefined : label}\r
      required={input.required}\r
      description={description}\r
      error={error}\r
    >\r
      <InputBase\r
        size={size}\r
        variant={variant}\r
        labelId={ids.label}\r
        label={floating ? fieldLabel(label, input.required) : undefined}\r
        filled={!!current}\r
        disabled={input.disabled}\r
        readOnly={input.readOnly}\r
        error={!!error}\r
        startAdornment={startAdornment}\r
        endAdornment={\r
          <>\r
            {clearable && current && (\r
              <IconButton\r
                size="xs"\r
                variant="ghost"\r
                icon="close"\r
                label="Очистить"\r
                disabled={input.disabled || input.readOnly}\r
                onClick={() => setCurrent("")}\r
              />\r
            )}\r
            {endAdornment}\r
          </>\r
        }\r
      >\r
        <input\r
          {...ids.aria}\r
          {...input}\r
          ref={inputRef}\r
          value={current}\r
          aria-invalid={!!error || undefined}\r
          onChange={(e) => setCurrent(e.currentTarget.value)}\r
        />\r
      </InputBase>\r
    </FieldFrame>\r
  );\r
};\r
`;export{r as default};
