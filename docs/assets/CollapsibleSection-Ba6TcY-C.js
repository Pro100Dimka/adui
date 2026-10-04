const n=`import { mark, useControllable } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type CollapsibleSectionProps } from "../shared";\r
\r
export const CollapsibleSection = (p: CollapsibleSectionProps) => {\r
  const [open, setOpen] = useControllable(\r
    p.open,\r
    p.defaultOpen ?? false,\r
    p.onOpenChange,\r
  );\r
  return (\r
    <details\r
      {...mark("CollapsibleSection", p, "card")}\r
      open={open}\r
      onToggle={(e) => {\r
        if (e.currentTarget.open !== open) setOpen(e.currentTarget.open);\r
      }}\r
    >\r
      <summary>\r
        <Icon name={p.icon ?? "braces"} />\r
        <span className="ad-collapse-heading">\r
          <span>{p.title ?? "Технический JSON"}</span>\r
          {p.description && <small>{p.description}</small>}\r
        </span>\r
        <Icon name="chevron" size={18} />\r
      </summary>\r
      <div className="ad-collapse-content">\r
        {p.children ?? "Содержимое раскрывающегося раздела."}\r
      </div>\r
    </details>\r
  );\r
};\r
`;export{n as default};
