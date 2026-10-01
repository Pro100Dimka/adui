import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../core/base";
import { Button } from "../controls/Button/Button";
import { IconButton } from "../controls/IconButton/IconButton";
import { Card } from "../layout/Card/Card";
import { DialogHeader } from "../layout/DialogHeader/DialogHeader";
import { DialogBody } from "../layout/DialogBody/DialogBody";
import { DialogActions } from "../layout/DialogActions/DialogActions";
import { Divider } from "../layout/Divider/Divider";
import { Icon } from "../layout/Icon/Icon";
import { IconTile } from "../layout/IconTile/IconTile";
import { Text } from "../layout/Text/Text";

import { Dialog } from "./Dialog/Dialog";
import { Popover } from "./Popover/Popover";
import { MenuItem } from "./MenuItem/MenuItem";
import { Menu } from "./Menu/Menu";
import { Toast } from "./Toast/Toast";
import { Badge } from "./Badge/Badge";
import { StatusIndicator } from "./StatusIndicator/StatusIndicator";
import { ProgressBar } from "./ProgressBar/ProgressBar";
import { Steps } from "./Steps/Steps";
import { MessageBar } from "./MessageBar/MessageBar";
import { EmptyState } from "./EmptyState/EmptyState";
import { MetricCard } from "./MetricCard/MetricCard";
import { KeyValueList } from "./KeyValueList/KeyValueList";
import { DataTable } from "./DataTable/DataTable";
import { CollapsibleSection } from "./CollapsibleSection/CollapsibleSection";
import { CodeViewer } from "./CodeViewer/CodeViewer";

export interface DialogProps extends CommonProps {
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  title?: ReactNode; description?: ReactNode; confirmLabel?: string; cancelLabel?: string | false;
  danger?: boolean; onConfirm?: () => boolean | void | Promise<boolean | void>;
}

export interface PopoverProps extends CommonProps {
  open?: boolean; onOpenChange?: (open: boolean) => void; anchorRef?: RefObject<HTMLElement | null>; label?: string;
  role?: "dialog" | "menu"; onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

export interface MenuItemData { id?: string; label?: string; icon?: string; disabled?: boolean; danger?: boolean; separator?: boolean; onSelect?: () => void }

export interface MenuItemProps extends CommonProps, MenuItemData {}

export interface MenuProps extends PopoverProps { items?: MenuItemData[] }

export interface ToastProps extends CommonProps { message?: ReactNode; open?: boolean; duration?: number; onClose?: () => void; floating?: boolean }

export interface BadgeProps extends CommonProps { label?: string }

export interface StatusIndicatorProps extends CommonProps { status?: Tone; label?: ReactNode }

export interface ProgressBarProps extends CommonProps { value?: number; max?: number; label?: string; indeterminate?: boolean }

export interface StepsProps extends CommonProps { steps?: string[]; current?: number }

export interface EmptyStateProps extends CommonProps { title?: string; description?: string; icon?: string; action?: ReactNode }

export interface MetricCardProps extends CommonProps { title?: string; description?: string; icon?: string; value?: number; unit?: string }

export interface KeyValueListProps extends CommonProps { items?: Array<[ReactNode, ReactNode]> }

export interface DataTableProps extends CommonProps { columns?: string[]; rows?: ReactNode[][]; caption?: string }

export interface CollapsibleSectionProps extends CommonProps { title?: string; icon?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }

export interface CodeViewerProps extends CommonProps { value?: unknown; label?: string }
