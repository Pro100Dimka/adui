const n=`import { useRef, useState } from "react";\r
import { mark } from "../../../core/base";\r
import { Menu } from "../../feedback/Menu/Menu";\r
import { Button } from "../Button/Button";\r
import { IconButton } from "../IconButton/IconButton";\r
import { variantMaterial } from "../internal";\r
import type { SplitButtonProps } from "../shared";\r
\r
export const SplitButton = (p: SplitButtonProps) => {\r
  const [open, setOpen] = useState(false);\r
  const anchor = useRef<HTMLButtonElement>(null);\r
  const variant = p.variant ?? "primary";\r
  return (\r
    <div\r
      {...mark("SplitButton", p, variantMaterial[variant])}\r
      data-ad-variant={variant}\r
    >\r
      <Button\r
        className="ad-split-button-main"\r
        size={p.size}\r
        variant="ghost"\r
        icon={p.icon ?? "save"}\r
        onClick={p.onClick}\r
      >\r
        {p.children ?? p.label ?? "Сохранить"}\r
      </Button>\r
      <IconButton\r
        className="ad-split-button-trigger"\r
        size={p.size}\r
        ref={anchor}\r
        variant="ghost"\r
        icon="chevron"\r
        label="Другие действия"\r
        aria-haspopup="menu"\r
        aria-expanded={open}\r
        onClick={() => setOpen((v) => !v)}\r
      />\r
      <Menu\r
        open={open}\r
        onOpenChange={setOpen}\r
        anchorRef={anchor}\r
        align="end"\r
        items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]}\r
      />\r
    </div>\r
  );\r
};\r
`;export{n as default};
