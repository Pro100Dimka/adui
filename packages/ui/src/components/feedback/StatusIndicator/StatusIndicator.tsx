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
import { ProgressBar } from "../ProgressBar";
import { Steps } from "../Steps";
import { MessageBar } from "../MessageBar";
import { EmptyState } from "../EmptyState";
import { MetricCard } from "../MetricCard";
import { KeyValueList } from "../KeyValueList";
import { DataTable } from "../DataTable";
import { CollapsibleSection } from "../CollapsibleSection";
import { CodeViewer } from "../CodeViewer";

export const StatusIndicator = define<StatusIndicatorProps>("StatusIndicator", ({ status = "success", ...p }) => {
  const names = { success: "check", error: "warning", warning: "warning", processing: "processing", pending: "clock", offline: "minus", info: "info" };
  const labels = { success: "Готово", error: "Ошибка", warning: "Внимание", processing: "Обработка", pending: "В очереди", offline: "Не подключено", info: "Информация" };
  return <span {...mark("StatusIndicator", { ...p, tone: status })}><span className="ad-status-dot"><Icon name={names[status]} size={18} /></span><span>{p.label ?? labels[status]}</span></span>;
});
