const n=`import {
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
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const node = tip.current;
    const anchor = trigger.current?.getBoundingClientRect();
    if (!open || !node || !anchor) return;
    if (typeof node.showPopover === "function") node.showPopover();
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
    return () => {
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
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => event.key === "Escape" && hide()}
    >
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{ "aria-describedby"?: string }>,
            {
              "aria-describedby": id,
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
`;export{n as default};
