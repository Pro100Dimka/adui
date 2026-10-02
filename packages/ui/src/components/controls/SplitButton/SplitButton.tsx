import { useRef, useState } from "react";
import { mark } from "../../../core/base";
import { Menu } from "../../feedback/Menu/Menu";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { variantMaterial } from "../internal";
import type { SplitButtonProps } from "../shared";

export const SplitButton = (p: SplitButtonProps) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const variant = p.variant ?? "primary";
  return (
    <div
      {...mark("SplitButton", p, variantMaterial[variant])}
      data-ad-variant={variant}
    >
      <Button
        className="ad-split-button-main"
        size={p.size}
        variant="ghost"
        icon={p.icon ?? "save"}
        onClick={p.onClick}
      >
        {p.children ?? p.label ?? "Сохранить"}
      </Button>
      <IconButton
        className="ad-split-button-trigger"
        size={p.size}
        ref={anchor}
        variant="ghost"
        icon="chevron"
        label="Другие действия"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      <Menu
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        align="end"
        items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]}
      />
    </div>
  );
};
