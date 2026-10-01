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
import { Toast } from "../Toast";
import { Badge } from "../Badge";
import { StatusIndicator } from "../StatusIndicator";
import { Steps } from "../Steps";
import { MessageBar } from "../MessageBar";
import { EmptyState } from "../EmptyState";
import { MetricCard } from "../MetricCard";
import { KeyValueList } from "../KeyValueList";
import { DataTable } from "../DataTable";
import { CollapsibleSection } from "../CollapsibleSection";
import { CodeViewer } from "../CodeViewer";

export const ProgressBar = define<ProgressBarProps>("ProgressBar", p => {
  const max = Math.max(0.0001, p.max ?? 100); const value = clamp(p.value ?? 56, 0, max);
  return <div {...mark("ProgressBar", p)} role="progressbar" aria-label={p.label ?? "Прогресс"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={p.indeterminate ? undefined : value} data-indeterminate={p.indeterminate || undefined}>
    <span style={{ width: p.indeterminate ? "35%" : `${value / max * 100}%` }} />
  </div>;
});
