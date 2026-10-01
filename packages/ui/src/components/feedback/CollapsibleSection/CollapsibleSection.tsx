import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { Button, IconButton } from "../../controls";
import { Card, DialogHeader, DialogBody, DialogActions, Divider, Icon, IconTile, Text } from "../../layout";
import { type DialogProps, type PopoverProps, type MenuItemData, type MenuItemProps, type MenuProps, type ToastProps, type BadgeProps, type StatusIndicatorProps, type ProgressBarProps, type StepsProps, type EmptyStateProps, type MetricCardProps, type KeyValueListProps, type DataTableProps, type CollapsibleSectionProps, type CodeViewerProps } from "../shared";
import { Dialog } from "../Dialog";
import { Popover } from "../Popover";
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
import { CodeViewer } from "../CodeViewer";

export const CollapsibleSection = define<CollapsibleSectionProps>("CollapsibleSection", p => {
  const [open, setOpen] = useControllable(p.open, p.defaultOpen ?? false, p.onOpenChange);
  return <details {...mark("CollapsibleSection", p, "card")} open={open} onToggle={e => { if (e.currentTarget.open !== open) setOpen(e.currentTarget.open); }}><summary><Icon name={p.icon ?? "braces"} /><span>{p.title ?? "Технический JSON"}</span><Icon name="chevron" size={18} /></summary><div className="ad-collapse-content">{p.children ?? "Содержимое раскрывающегося раздела."}</div></details>;
});
