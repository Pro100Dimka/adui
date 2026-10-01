import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { Button, IconButton } from "../../controls";
import { Card, DialogHeader, DialogBody, DialogActions, Divider, Icon, IconTile, Text } from "../../layout";
import { type DialogProps, type PopoverProps, type MenuItemData, type MenuItemProps, type MenuProps, type ToastProps, type BadgeProps, type StatusIndicatorProps, type ProgressBarProps, type StepsProps, type EmptyStateProps, type MetricCardProps, type KeyValueListProps, type DataTableProps, type CollapsibleSectionProps, type CodeViewerProps } from "../shared";
import { Dialog } from "../Dialog";
import { MenuItem } from "../MenuItem";
import { Menu } from "../Menu";
import { Toast } from "../Toast";
import { Badge } from "../Badge";
import { StatusIndicator } from "../StatusIndicator";
import { ProgressBar } from "../ProgressBar";
import { Steps } from "../Steps";
import { MessageBar } from "../MessageBar";
import { EmptyState } from "../EmptyState";
import { MetricCard } from "../MetricCard";
import { KeyValueList } from "../KeyValueList";
import { DataTable } from "../DataTable";
import { CollapsibleSection } from "../CollapsibleSection";
import { CodeViewer } from "../CodeViewer";

export const Popover = define<PopoverProps>("Popover", p => {
  const ref = useRef<HTMLDivElement>(null); const change = useRef(p.onOpenChange); change.current = p.onOpenChange;
  useLayoutEffect(() => {
    const node = ref.current; if (!node || !p.open) return;
    const position = () => {
      const target = p.anchorRef?.current?.getBoundingClientRect();
      const r = node.getBoundingClientRect();
      node.style.left = `${Math.max(8, Math.min(innerWidth - r.width - 8, (target?.right ?? innerWidth / 2) - r.width))}px`;
      node.style.top = `${Math.max(8, Math.min(innerHeight - r.height - 8, (target?.bottom ?? innerHeight / 2) + 8))}px`;
    };
    const supports = typeof node.showPopover === "function";
    if (supports) node.showPopover();
    position(); node.querySelector<HTMLElement>('button:not(:disabled),input,[tabindex="0"]')?.focus();
    const dismiss = (e: PointerEvent) => { const path = e.composedPath(); if (!path.includes(node) && !path.includes(p.anchorRef?.current as EventTarget)) change.current?.(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); change.current?.(false); p.anchorRef?.current?.focus(); } };
    document.addEventListener("pointerdown", dismiss); document.addEventListener("keydown", key);
    window.addEventListener("resize", position); window.addEventListener("scroll", position, true);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", key); window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); if (supports && node.matches(":popover-open")) node.hidePopover(); };
  }, [p.open, p.anchorRef]);
  if (!p.open) return null;
  return <div {...mark("Popover", p, "dialog")} ref={ref} role={p.role ?? "dialog"} aria-label={p.label} popover="manual" onKeyDown={p.onKeyDown} style={{ margin: 0, position: "fixed", ...p.style }}>{p.children}</div>;
});
