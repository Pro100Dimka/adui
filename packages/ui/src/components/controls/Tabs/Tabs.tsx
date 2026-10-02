import { useRef } from "react";
import { mark, useControllable } from "../../../core/base";
import { type TabsProps } from "../shared";
import { Tab } from "../Tab/Tab";

export const Tabs = (p: TabsProps) => {
  const items = p.items ?? [
    { value: "appearance", label: "Внешний вид", icon: "palette" },
    { value: "audio", label: "Аудио", icon: "audio" },
    { value: "advanced", label: "Дополнительно", icon: "wrench" },
  ];
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? items[0]?.value ?? "",
    p.onValueChange,
  );
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <nav
      {...mark("Tabs", p, "glass")}
      role="tablist"
      aria-label={p.label ?? "Разделы"}
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        const available = items
          .map((item, index) => ({ item, index }))
          .filter((x) => !x.item.disabled);
        if (!available.length) return;
        e.preventDefault();
        const current = available.findIndex(
          (x) => buttons.current[x.index] === document.activeElement,
        );
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? available.length - 1
              : (current +
                  (e.key === "ArrowRight" ? 1 : -1) +
                  available.length) %
                available.length;
        setValue(available[next].item.value);
        buttons.current[available[next].index]?.focus();
      }}
    >
      {items.map((item, index) => (
        <Tab
          key={item.value}
          id={item.id}
          ref={(n) => {
            buttons.current[index] = n;
          }}
          icon={item.icon}
          panelId={item.panelId}
          disabled={item.disabled}
          size={p.size}
          selected={item.value === value}
          onClick={() => setValue(item.value)}
        >
          {item.label}
        </Tab>
      ))}
    </nav>
  );
};
