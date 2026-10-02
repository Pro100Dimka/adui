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
import { Badge } from "../Badge/Badge";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { MessageBar } from "../MessageBar/MessageBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { KeyValueList } from "../KeyValueList/KeyValueList";
import { DataTable } from "../DataTable/DataTable";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";

export const Steps = define<StepsProps>("Steps", (p) => {
  const steps = p.steps ?? [
    "Подготовка",
    "Анализ",
    "Модель",
    "Обработка",
    "Проверка",
  ];
  return (
    <ol {...mark("Steps", p)}>
      {steps.map((label, i) => (
        <li
          key={`${i}-${label}`}
          aria-current={i === (p.current ?? 3) ? "step" : undefined}
        >
          <StatusIndicator
            status={
              i < (p.current ?? 3)
                ? "success"
                : i === (p.current ?? 3)
                  ? "processing"
                  : "pending"
            }
            label={label}
          />
          {i < steps.length - 1 && <Icon name="chevron" size={12} />}
        </li>
      ))}
    </ol>
  );
});
