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
import { Popover } from "../Popover/Popover";
import { MenuItem } from "../MenuItem/MenuItem";
import { Menu } from "../Menu/Menu";
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";

export const Toast = define<ToastProps>(
  "Toast",
  ({ open = true, duration = 3600, onClose, ...p }) => {
    const close = useRef(onClose);
    close.current = onClose;
    useEffect(() => {
      if (!open || !onClose || duration <= 0) return;
      const id = window.setTimeout(() => close.current?.(), duration);
      return () => clearTimeout(id);
    }, [open, duration, !!onClose]);
    if (!open) return null;
    return (
      <div
        {...mark(
          "Toast",
          p,
          "dialog",
          p.floating ? "ad-toast-floating" : undefined,
        )}
        role={p.tone === "error" ? "alert" : "status"}
        aria-live={p.tone === "error" ? "assertive" : "polite"}
      >
        <Icon name={p.tone === "error" ? "warning" : "check"} size={20} />
        <span>{p.message ?? p.children ?? "Настройки сохранены"}</span>
      </div>
    );
  },
);
