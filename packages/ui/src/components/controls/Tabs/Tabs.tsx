import { useLayoutEffect, useRef, useState } from "react";
import {
  mark,
  ripple,
  useControllable,
  type TokenStyle,
} from "../../../core/base";
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

  // The blade follows the selected tab and is told when it is travelling, to squash and flare.
  const [place, setPlace] = useState<TokenStyle>();
  const [moving, setMoving] = useState(false);
  const first = useRef(true);
  useLayoutEffect(() => {
    const tab = buttons.current[selected];
    if (!tab) return setPlace(undefined);
    const update = () =>
      setPlace({
        "--ad-tabs-x": `${tab.offsetLeft}px`,
        "--ad-tabs-w": `${tab.offsetWidth}px`,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tab);
    if (tab.parentElement) observer.observe(tab.parentElement);
    let timer = 0;
    if (!first.current) {
      setMoving(true);
      timer = window.setTimeout(() => setMoving(false), 420);
    }
    first.current = false;
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [selected, items.length]);

  return (
    <nav
      {...mark("Tabs", p)}
      role="tablist"
      aria-label={p.label ?? "Разделы"}
      data-moving={moving || undefined}
      onPointerDown={(e) => {
        const tab = (e.target as HTMLElement).closest<HTMLElement>(".ad-tab");
        if (tab && !tab.matches(":disabled")) ripple(tab, e.clientX, e.clientY);
      }}
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
      {place && (
        <>
          <span className="ad-tabs-trail" style={place} aria-hidden />
          <span className="ad-tabs-indicator" style={place} aria-hidden>
            <span className="ad-tabs-blade" />
          </span>
          <span className="ad-tabs-rail" style={place} aria-hidden />
        </>
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
