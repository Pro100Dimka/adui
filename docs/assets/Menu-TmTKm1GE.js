const n=`import { Divider } from "../../layout/Divider/Divider";
import { Popover } from "../Popover/Popover";
import { MenuItem } from "../MenuItem/MenuItem";
import type { MenuProps } from "../shared";
export const Menu = (p: MenuProps) => (
  <Popover
    {...p}
    role="menu"
    className={\`ad-menu \${p.className ?? ""}\`}
    onKeyDown={(e) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(e.key))
        return;
      if (e.key === "Tab") {
        p.onOpenChange?.(false);
        return;
      }
      e.preventDefault();
      const buttons = Array.from(
        e.currentTarget.querySelectorAll("button:not(:disabled)"),
      ) as HTMLButtonElement[];
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? buttons.length - 1
            : (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next]?.focus();
    }}
  >
    {(p.items ?? []).map((item, i) =>
      item.separator ? (
        <Divider key={item.id ?? String(i)} />
      ) : (
        <MenuItem
          key={item.id ?? String(i)}
          {...item}
          onSelect={() => {
            p.onOpenChange?.(false);
            p.anchorRef?.current?.focus();
            item.onSelect?.();
          }}
        />
      ),
    )}
  </Popover>
);
`;export{n as default};
