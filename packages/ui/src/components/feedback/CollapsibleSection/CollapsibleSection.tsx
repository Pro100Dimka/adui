import { tr, useTr } from "../../../core/i18n";
import { mark, useControllable } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type CollapsibleSectionProps } from "../shared";

export const CollapsibleSection = (p: CollapsibleSectionProps) => {
  const tr = useTr();
  const [open, setOpen] = useControllable(
    p.open,
    p.defaultOpen ?? false,
    p.onOpenChange,
  );
  return (
    <details
      {...mark("CollapsibleSection", p, "card")}
      open={open}
      onToggle={(e) => {
        if (e.currentTarget.open !== open) setOpen(e.currentTarget.open);
      }}
    >
      <summary>
        <Icon name={p.icon ?? "braces"} />
        <span className="ad-collapse-heading">
          <span>{p.title ?? tr("Технический JSON")}</span>
          {p.description && <small>{p.description}</small>}
        </span>
        <Icon name="chevron" size={18} />
      </summary>
      <div className="ad-collapse-content">
        {p.children ?? tr("Содержимое раскрывающегося раздела.")}
      </div>
    </details>
  );
};
