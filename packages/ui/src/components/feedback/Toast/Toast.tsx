import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { Button, IconButton } from "../../controls";
import { Card, DialogHeader, DialogBody, DialogActions, Divider, Icon, IconTile, Text } from "../../layout";
import { type DialogProps, type PopoverProps, type MenuItemData, type MenuItemProps, type MenuProps, type ToastProps, type BadgeProps, type StatusIndicatorProps, type ProgressBarProps, type StepsProps, type EmptyStateProps, type MetricCardProps, type KeyValueListProps, type DataTableProps, type CollapsibleSectionProps, type CodeViewerProps } from "../_shared";
import { Dialog } from "../Dialog";
import { Popover } from "../Popover";
import { MenuItem } from "../MenuItem";
import { Menu } from "../Menu";
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

export const Toast = define<ToastProps>("Toast", ({ open = true, duration = 3600, onClose, ...p }) => {
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => { if (!open || !onClose || duration <= 0) return; const id = window.setTimeout(() => close.current?.(), duration); return () => clearTimeout(id); }, [open, duration, !!onClose]);
  if (!open) return null;
  return <div {...mark("Toast", p, "dialog", p.floating ? "ad-toast-floating" : undefined)} role={p.tone === "error" ? "alert" : "status"} aria-live={p.tone === "error" ? "assertive" : "polite"}><Icon name={p.tone === "error" ? "warning" : "check"} size={20} /><span>{p.message ?? p.children ?? "Настройки сохранены"}</span></div>;
});
