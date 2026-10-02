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
import { Toast } from "../Toast/Toast";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Steps } from "../Steps/Steps";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";

export const Badge = define<BadgeProps>("Badge", (p) => (
  <span {...mark("Badge", p)}>{p.children ?? p.label ?? "GPU"}</span>
));
