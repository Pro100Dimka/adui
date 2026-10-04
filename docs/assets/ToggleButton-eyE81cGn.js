const e=`import { useControllable } from "../../../core/base";\r
import { buttonView, type ToggleButtonProps } from "../shared";\r
\r
export const ToggleButton = ({\r
  checked,\r
  defaultChecked = false,\r
  onValueChange,\r
  onClick,\r
  ...p\r
}: ToggleButtonProps) => {\r
  const [value, setValue] = useControllable(\r
    checked,\r
    defaultChecked,\r
    onValueChange,\r
  );\r
  return buttonView(\r
    {\r
      ...p,\r
      "aria-label": p["aria-label"] ?? (!p.children ? p.label : undefined),\r
      "aria-pressed": value,\r
      children: p.children ?? (p.icon ? null : p.label),\r
      label: undefined,\r
      onClick: (e) => {\r
        onClick?.(e);\r
        if (!e.defaultPrevented) setValue(!value);\r
      },\r
    },\r
    "ToggleButton",\r
  );\r
};\r
`;export{e as default};
