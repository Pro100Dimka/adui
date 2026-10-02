import { useControllable } from "../../../core/base";
import { buttonView, type ToggleButtonProps } from "../shared";

export const ToggleButton = ({
  checked,
  defaultChecked = false,
  onValueChange,
  onClick,
  ...p
}: ToggleButtonProps) => {
  const [value, setValue] = useControllable(
    checked,
    defaultChecked,
    onValueChange,
  );
  return buttonView(
    {
      ...p,
      "aria-label": p["aria-label"] ?? (!p.children ? p.label : undefined),
      "aria-pressed": value,
      children: p.children ?? (p.icon ? null : p.label),
      label: undefined,
      onClick: (e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setValue(!value);
      },
    },
    "ToggleButton",
  );
};
