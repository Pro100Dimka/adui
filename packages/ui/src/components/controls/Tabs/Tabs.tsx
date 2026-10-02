import { useLayoutEffect, useRef, useState } from "react";
import { mark, useControllable, type TokenStyle } from "../../../core/base";
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
  const selected = items.findIndex((item) => item.value === value);

  // The indicator slides under the selected tab; it follows resizes and label changes.
  const [indicator, setIndicator] = useState<TokenStyle>();
  useLayoutEffect(() => {
    const tab = buttons.current[selected];
    if (!tab) return setIndicator(undefined);
    const place = () =>
      setIndicator({
        "--ad-tabs-x": `${tab.offsetLeft}px`,
        "--ad-tabs-w": `${tab.offsetWidth}px`,
      });
    place();
    const observer = new ResizeObserver(place);
    observer.observe(tab);
    if (tab.parentElement) observer.observe(tab.parentElement);
    return () => observer.disconnect();
  }, [selected, items.length]);

  return (
    <nav
      {...mark("Tabs", p)}
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
      {indicator && (
        <span className="ad-tabs-indicator" style={indicator} aria-hidden />
      )}
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
