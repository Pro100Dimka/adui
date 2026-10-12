const e=`import {
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cssRem, mark, type CommonProps } from "../../../core/base";
import { createResizeObserver } from "../../../core/environment";

export interface TooltipProps extends CommonProps {
  /** What the tooltip says. */
  content: ReactNode;
  /** The element it explains; it gets \`aria-describedby\`. */
  children: ReactElement;
  /** Preferred side; it flips when there is no room. */
  placement?: "top" | "bottom";
}

/**
 * A short explanation that appears on hover or keyboard focus. It lives in the top layer, so
 * no scrolling or clipping container can cut it off, and it flips to the side with room.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  ...p
}: TooltipProps) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const hovered = useRef(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const node = tip.current;
    const target = trigger.current;
    if (!open || !node || !target) return;
    if (typeof node.showPopover === "function") node.showPopover();
    const position = () => {
      const anchor = target.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      const gap = 8;
      const above =
        placement === "top"
          ? anchor.top > box.height + gap * 2
          : innerHeight - anchor.bottom < box.height + gap * 2;
      const left = Math.max(
        gap,
        Math.min(
          innerWidth - box.width - gap,
          anchor.left + anchor.width / 2 - box.width / 2,
        ),
      );
      node.style.left = cssRem(left);
      node.style.top = cssRem(
        above ? anchor.top - box.height - gap : anchor.bottom + gap,
      );
      node.dataset.adSide = above ? "above" : "below";
    };
    position();
    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; position(); });
    };
    const observer = createResizeObserver(schedule);
    observer.observe(target);
    observer.observe(node);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (
        typeof node.hidePopover === "function" &&
        node.matches(":popover-open")
      )
        node.hidePopover();
    };
  }, [open, placement]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  return (
    <span
      ref={trigger}
      className="ad-tooltip-trigger"
      onMouseEnter={() => { hovered.current = true; show(); }}
      onMouseLeave={() => {
        hovered.current = false;
        if (!trigger.current?.contains(document.activeElement)) hide();
      }}
      onFocus={show}
      onBlur={() => { if (!hovered.current) hide(); }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") { event.preventDefault(); hide(); }
      }}
    >
      {isValidElement<{ "aria-describedby"?: string }>(children)
        ? cloneElement(
            children,
            {
              "aria-describedby": [children.props["aria-describedby"], open ? id : undefined].filter(Boolean).join(" ") || undefined,
            },
          )
        : children}
      {open && (
        <span
          {...mark("Tooltip", p)}
          ref={tip}
          id={id}
          role="tooltip"
          popover="manual"
        >
          {content}
        </span>
      )}
    </span>
  );
}
`;export{e as default};
