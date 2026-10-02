import type { ReactNode, RefObject, KeyboardEventHandler } from "react";
import type { CommonProps, Tone } from "../../core/base";
export interface DialogProps extends CommonProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string | false;
  danger?: boolean;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
}
export interface PopoverProps extends CommonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorRef?: RefObject<HTMLElement | null>;
  label?: string;
  role?: "dialog" | "menu" | "listbox";
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  align?: "start" | "end";
  matchAnchorWidth?: boolean;
}
export interface MenuItemData {
  id?: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}
export interface MenuItemProps extends CommonProps, MenuItemData {}
export interface MenuProps extends PopoverProps {
  items?: MenuItemData[];
}
export interface ToastProps extends CommonProps {
  message?: ReactNode;
  open?: boolean;
  duration?: number;
  onClose?: () => void;
  floating?: boolean;
}
export interface BadgeProps extends CommonProps {
  label?: string;
}
export interface StatusIndicatorProps extends CommonProps {
  status?: Tone;
  label?: ReactNode;
}
export interface ProgressBarProps extends CommonProps {
  value?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
}
export interface StepsProps extends CommonProps {
  steps?: string[];
  current?: number;
}
export interface EmptyStateProps extends CommonProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}
export interface KeyValueListProps extends CommonProps {
  items?: Array<[ReactNode, ReactNode]>;
}
export interface DataTableProps extends CommonProps {
  columns?: string[];
  rows?: ReactNode[][];
  caption?: string;
}
export interface CollapsibleSectionProps extends CommonProps {
  title?: string;
  icon?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
