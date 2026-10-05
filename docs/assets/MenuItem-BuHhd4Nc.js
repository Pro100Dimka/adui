const n=`import { tr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import type { MenuItemProps } from "../shared";

export const MenuItem = (p: MenuItemProps) => {
  const label = p.label ?? p.children ?? tr("Действие");
  return (
    <button
      {...mark("MenuItem", { ...p, tone: p.danger ? "error" : p.tone })}
      type="button"
      role="menuitem"
      disabled={p.disabled}
      onClick={p.onSelect}
    >
      <span className="ad-menu-item-icon" aria-hidden="true">
        <Icon name={p.icon ?? "more"} />
      </span>
      <span className="ad-menu-item-label">{label}</span>
      {p.endIcon && (
        <span className="ad-menu-item-end" aria-hidden="true">
          <Icon name={p.endIcon} />
        </span>
      )}
    </button>
  );
};
`;export{n as default};
