import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import type { TabProps } from "../shared";

export const Tab = ({
  selected = false,
  panelId,
  icon,
  endIcon,
  label,
  children,
  ref,
  variant: _variant,
  loading: _loading,
  round: _round,
  size: _size,
  tone: _tone,
  material: _material,
  ...p
}: TabProps) => (
  <button
    {...p}
    {...mark("Tab", { ...p, size: _size })}
    ref={ref}
    type="button"
    role="tab"
    aria-selected={selected}
    aria-controls={panelId}
    tabIndex={selected ? 0 : -1}
  >
    {icon && <Icon name={icon} />}
    <span className="ad-tab-label">{children ?? label}</span>
    {endIcon && <Icon name={endIcon} />}
  </button>
);
