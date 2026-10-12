import { useLayoutEffect, useRef } from "react";
import { cssRem, mark } from "../../../core/base";
import { createResizeObserver } from "../../../core/environment";
import { type PopoverProps } from "../shared";

// Native manual popovers do not arbitrate dismissal. Keep nested layers above their parent.
const layers: HTMLDivElement[] = [];

export const Popover = (p: PopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(p);
  latest.current = p;
  const reposition = useRef<(() => void) | undefined>(undefined);
  useLayoutEffect(() => { reposition.current?.(); }, [p.align, p.matchAnchorWidth]);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !p.open) return;
    const position = () => {
      const { align, matchAnchorWidth } = latest.current;
      const target = p.anchorRef?.current?.getBoundingClientRect();
      const gap = 8;
      const viewport = window.visualViewport;
      const width = viewport?.width ?? innerWidth, height = viewport?.height ?? innerHeight;
      const x = viewport?.offsetLeft ?? 0, y = viewport?.offsetTop ?? 0;
      node.style.setProperty("--ad-popover-available-width", cssRem(width - gap * 2));
      node.style.setProperty("--ad-popover-available-height", cssRem(height - gap * 2));
      node.style.minWidth = target && matchAnchorWidth
        ? cssRem(Math.min(target.width, width - gap * 2)) : "";
      const measured = node.getBoundingClientRect();
      const r = { width: node.offsetWidth || measured.width, height: node.offsetHeight || measured.height };
      // Long menus need local scrolling; short menus keep their decorative caret unclipped.
      node.style.overflowY = node.scrollHeight > node.clientHeight ? "auto" : "";
      const desired = target
        ? align === "start"
          ? target.left
          : target.right - r.width
        : x + width / 2 - r.width / 2;
      const left = Math.max(x + gap, Math.min(x + width - r.width - gap, desired));
      const roomBelow = target ? y + height - target.bottom : height / 2;
      const roomAbove = target ? target.top - y : height / 2;
      const placeAbove =
        !!target && roomBelow < r.height + gap + 8 && roomAbove > roomBelow;
      const rawTop = target
        ? placeAbove
          ? target.top - r.height - gap
          : target.bottom + gap
        : y + height / 2 - r.height / 2;
      const top = Math.max(y + gap, Math.min(y + height - r.height - gap, rawTop));
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
    const childIndex = layers.findIndex(layer => node.contains(layer));
    layers.splice(childIndex < 0 ? layers.length : childIndex, 0, node);
    position();
    reposition.current = position;
    let frame = 0;
    const schedulePosition = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; position(); });
    };
    if (p.autoFocus !== false)
      (
        node.querySelector<HTMLElement>(
          '[aria-selected="true"]:not(:disabled)',
        ) ??
        node.querySelector<HTMLElement>(
          'button:not(:disabled),input,[tabindex="0"]',
        )
      )?.focus();
    const dismiss = (e: PointerEvent) => {
      if (layers.at(-1) !== node || e.defaultPrevented) return;
      const path = e.composedPath();
      if (
        !path.includes(node) &&
        !path.includes(p.anchorRef?.current as EventTarget)
      )
        latest.current.onOpenChange?.(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && layers.at(-1) === node) {
        e.preventDefault();
        latest.current.onOpenChange?.(false);
        p.anchorRef?.current?.focus();
      }
    };
    const observer = createResizeObserver(schedulePosition);
    observer.observe(node);
    if (p.anchorRef?.current) observer.observe(p.anchorRef.current);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    window.visualViewport?.addEventListener("resize", schedulePosition);
    window.visualViewport?.addEventListener("scroll", schedulePosition);
    return () => {
      layers.splice(layers.indexOf(node), 1);
      reposition.current = undefined;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
      window.visualViewport?.removeEventListener("resize", schedulePosition);
      window.visualViewport?.removeEventListener("scroll", schedulePosition);
      if (document.activeElement && node.contains(document.activeElement) && p.anchorRef?.current?.isConnected)
        p.anchorRef.current.focus();
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
