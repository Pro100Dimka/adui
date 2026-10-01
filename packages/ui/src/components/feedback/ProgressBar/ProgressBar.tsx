import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Card } from "../../layout/Card/Card";
import { DialogHeader } from "../../layout/DialogHeader/DialogHeader";
import { DialogBody } from "../../layout/DialogBody/DialogBody";
import { DialogActions } from "../../layout/DialogActions/DialogActions";
import { Divider } from "../../layout/Divider/Divider";
import { Icon } from "../../layout/Icon/Icon";
import { IconTile } from "../../layout/IconTile/IconTile";
import { Text } from "../../layout/Text/Text";
import { type DialogProps, type PopoverProps, type MenuItemData, type MenuItemProps, type MenuProps, type ToastProps, type BadgeProps, type StatusIndicatorProps, type ProgressBarProps, type StepsProps, type EmptyStateProps, type MetricCardProps, type KeyValueListProps, type DataTableProps, type CollapsibleSectionProps, type CodeViewerProps } from "../shared";
import { Dialog } from "../Dialog/Dialog";
import { Popover } from "../Popover/Popover";
import { MenuItem } from "../MenuItem/MenuItem";
import { Menu } from "../Menu/Menu";
import { Toast } from "../Toast/Toast";
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { MetricCard } from "../MetricCard/MetricCard";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";
import { CodeViewer } from "../CodeViewer/CodeViewer";

export const ProgressBar = define<ProgressBarProps>("ProgressBar", p => {
  const max = Math.max(0.0001, p.max ?? 100); const value = clamp(p.value ?? 56, 0, max);
  return <div {...mark("ProgressBar", p)} role="progressbar" aria-label={p.label ?? "Прогресс"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={p.indeterminate ? undefined : value} data-indeterminate={p.indeterminate || undefined}>
    <span style={{ width: p.indeterminate ? "35%" : `${value / max * 100}%` }} />
  </div>;
});
