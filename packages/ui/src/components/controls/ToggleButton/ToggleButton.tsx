import { forwardRef } from "react";
import { useControllable } from "../../../core/base";
import { buttonView, type ToggleButtonProps } from "../shared";

export const ToggleButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton({
  checked,
  defaultChecked = false,
  onValueChange,
  onClick,
  ...p
}, ref) {
  const [value, setValue] = useControllable(
    checked,
    defaultChecked,
    onValueChange,
  );
  return buttonView(
    {
      ...p,
      ref,
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
});
