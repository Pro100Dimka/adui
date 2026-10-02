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
import { Menu } from "../Menu/Menu";
import { Toast } from "../Toast/Toast";
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";

export const MenuItem = define<MenuItemProps>("MenuItem", (p) => (
  <Button
    role="menuitem"
    variant="ghost"
    icon={p.icon}
    disabled={p.disabled}
    tone={p.danger ? "error" : p.tone}
    className={`ad-menu-item ${p.className ?? ""}`}
    onClick={p.onSelect}
  >
    {p.label ?? p.children ?? "Действие"}
  </Button>
));
