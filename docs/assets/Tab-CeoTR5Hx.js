const n=`import { forwardRef } from "react";\r
import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import type { TabProps } from "../shared";\r
\r
export const Tab = /* @__PURE__ */ forwardRef<HTMLButtonElement, TabProps>(function Tab({\r
  selected = false,\r
  panelId,\r
  icon,\r
  endIcon,\r
  label,\r
  children,\r
  tabIndex,\r
  variant: _variant,\r
  loading: _loading,\r
  round: _round,\r
  size: _size,\r
  tone: _tone,\r
  material: _material,\r
  ...p\r
}, ref) { return (\r
  <button\r
    {...p}\r
    {...mark("Tab", { ...p, size: _size })}\r
    ref={ref}\r
    type="button"\r
    role="tab"\r
    aria-selected={selected}\r
    aria-controls={panelId}\r
    tabIndex={tabIndex ?? (selected ? 0 : -1)}\r
  >\r
    {icon && <Icon name={icon} />}\r
    <span className="ad-tab-label">{children ?? label}</span>\r
    {endIcon && <Icon name={endIcon} />}\r
  </button>\r
); });\r
`;export{n as default};
