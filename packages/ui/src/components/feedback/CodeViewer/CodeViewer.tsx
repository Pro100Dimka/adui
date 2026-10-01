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
import { StatusIndicator } from "../StatusIndicator";
import { ProgressBar } from "../ProgressBar";
import { Steps } from "../Steps";
import { MessageBar } from "../MessageBar";
import { EmptyState } from "../EmptyState";
import { MetricCard } from "../MetricCard";
import { KeyValueList } from "../KeyValueList";
import { DataTable } from "../DataTable";
import { CollapsibleSection } from "../CollapsibleSection";

export const CodeViewer = define<CodeViewerProps>("CodeViewer", p => {
  let text: string; try { text = typeof p.value === "string" ? p.value : JSON.stringify(p.value ?? { driver: "WASAPI Shared", sampleRate: 44100, enabled: true }, null, 2); } catch { text = "Значение не сериализуется в JSON"; }
  const [copied, setCopied] = useState(false);
  return <div {...mark("CodeViewer", p)}><IconButton variant="ghost" icon={copied ? "check" : "copy"} label={copied ? "Код скопирован" : "Копировать код"} onClick={async () => setCopied(await copyText(text))} /><pre aria-label={p.label}><code>{text}</code></pre></div>;
});
