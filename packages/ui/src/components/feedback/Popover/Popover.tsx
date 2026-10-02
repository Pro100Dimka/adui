import { useLayoutEffect, useRef } from "react";
import { cssRem, mark } from "../../../core/base";
import { type PopoverProps } from "../shared";

export const Popover = (p: PopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const change = useRef(p.onOpenChange);
  change.current = p.onOpenChange;
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !p.open) return;
    const position = () => {
      const target = p.anchorRef?.current?.getBoundingClientRect();
      const gap = 8;
      if (target && p.matchAnchorWidth)
        node.style.minWidth = cssRem(target.width);
      const r = node.getBoundingClientRect();
      const desired = target
        ? p.align === "start"
          ? target.left
          : target.right - r.width
        : innerWidth / 2 - r.width / 2;
      const left = Math.max(8, Math.min(innerWidth - r.width - 8, desired));
      const roomBelow = target ? innerHeight - target.bottom : innerHeight / 2;
      const roomAbove = target ? target.top : innerHeight / 2;
      const placeAbove =
        !!target && roomBelow < r.height + gap + 8 && roomAbove > roomBelow;
      const rawTop = target
        ? placeAbove
          ? target.top - r.height - gap
          : target.bottom + gap
        : innerHeight / 2 - r.height / 2;
      const top = Math.max(8, Math.min(innerHeight - r.height - 8, rawTop));
      node.style.left = cssRem(left);
      node.style.top = cssRem(top);
      node.dataset.adSide = placeAbove ? "above" : "below";
      if (target) {
        const anchorX = Math.max(
          24,
          Math.min(r.width - 24, target.left + target.width / 2 - left),
        );
        node.style.setProperty("--ad-popover-anchor-x", cssRem(anchorX));
      } else {
        node.style.removeProperty("--ad-popover-anchor-x");
      }
    };
    const supports = typeof node.showPopover === "function";
    if (supports) node.showPopover();
    position();
    node
      .querySelector<HTMLElement>('button:not(:disabled),input,[tabindex="0"]')
      ?.focus();
    const dismiss = (e: PointerEvent) => {
      const path = e.composedPath();
      if (
        !path.includes(node) &&
        !path.includes(p.anchorRef?.current as EventTarget)
      )
        change.current?.(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        change.current?.(false);
        p.anchorRef?.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      if (supports && node.matches(":popover-open")) node.hidePopover();
    };
  }, [p.open, p.anchorRef]);
  if (!p.open) return null;
  return (
    <div
      {...mark("Popover", p, "dialog")}
      ref={ref}
      role={p.role ?? "dialog"}
      aria-label={p.label}
      popover="manual"
      onKeyDown={p.onKeyDown}
      style={{ margin: 0, position: "fixed", ...p.style }}
    >
      {p.children}
    </div>
  );
};
