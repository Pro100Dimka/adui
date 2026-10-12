import { forwardRef } from "react";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import type { TabProps } from "../shared";

export const Tab = /* @__PURE__ */ forwardRef<HTMLButtonElement, TabProps>(function Tab({
  selected = false,
  panelId,
  icon,
  endIcon,
  label,
  children,
  tabIndex,
  variant: _variant,
  loading: _loading,
  round: _round,
  size: _size,
  tone: _tone,
  material: _material,
  ...p
}, ref) { return (
  <button
    {...p}
    {...mark("Tab", { ...p, size: _size })}
    ref={ref}
    type="button"
    role="tab"
    aria-selected={selected}
    aria-controls={panelId}
    tabIndex={tabIndex ?? (selected ? 0 : -1)}
  >
    {icon && <Icon name={icon} />}
    <span className="ad-tab-label">{children ?? label}</span>
    {endIcon && <Icon name={endIcon} />}
  </button>
); });
