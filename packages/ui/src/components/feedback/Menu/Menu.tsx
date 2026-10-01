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
import { Toast } from "../Toast/Toast";
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { MetricCard } from "../MetricCard/MetricCard";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";
import { CodeViewer } from "../CodeViewer/CodeViewer";

export const Menu = define<MenuProps>("Menu", p => <Popover {...p} role="menu" className={`ad-menu ${p.className ?? ""}`} onKeyDown={e => {
  if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(e.key)) return;
  if (e.key === "Tab") { p.onOpenChange?.(false); return; }
  e.preventDefault(); const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
}}>{(p.items ?? []).map((item, i) => item.separator ? <Divider key={item.id ?? i} /> : <MenuItem key={item.id ?? i} {...item} onSelect={() => { p.onOpenChange?.(false); p.anchorRef?.current?.focus(); item.onSelect?.(); }} />)}</Popover>);
