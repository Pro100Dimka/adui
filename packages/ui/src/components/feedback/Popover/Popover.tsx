import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import {
  clamp,
  copyText,
  cssRem,
  define,
  mark,
  useControllable,
  type CommonProps,
  type Tone,
} from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Card } from "../../layout/Card/Card";
import { DialogBody } from "../../layout/DialogBody/DialogBody";
import { DialogActions } from "../../layout/DialogActions/DialogActions";
import { Divider } from "../../layout/Divider/Divider";
import { Icon } from "../../layout/Icon/Icon";
import { Text } from "../../layout/Text/Text";
import {
  type DialogProps,
  type PopoverProps,
  type MenuItemData,
  type MenuItemProps,
  type MenuProps,
  type ToastProps,
  type BadgeProps,
  type StatusIndicatorProps,
  type ProgressBarProps,
  type StepsProps,
  type EmptyStateProps,
  type KeyValueListProps,
  type DataTableProps,
  type CollapsibleSectionProps,
} from "../shared";
import { Dialog } from "../Dialog/Dialog";
import { MenuItem } from "../MenuItem/MenuItem";
import { Menu } from "../Menu/Menu";
import { Toast } from "../Toast/Toast";
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";

export const Popover = define<PopoverProps>("Popover", (p) => {
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
});
