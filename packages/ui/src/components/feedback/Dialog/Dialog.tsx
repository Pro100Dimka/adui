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
import { Popover } from "../Popover/Popover";
import { MenuItem } from "../MenuItem/MenuItem";
import { Menu } from "../Menu/Menu";
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

export const Dialog = define<DialogProps>("Dialog", p => {
  const [open, setOpen] = useControllable(p.open, p.defaultOpen ?? false, p.onOpenChange);
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>();
  const ref = useRef<HTMLDialogElement>(null); const titleId = useId(); const descId = useId();
  const alive = useRef(true); const before = useRef<HTMLElement | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useLayoutEffect(() => {
    const dialog = ref.current; if (!dialog) return;
    if (open && !dialog.open) { before.current = document.activeElement as HTMLElement; dialog.showModal(); }
    else if (!open && dialog.open) { dialog.close(); before.current?.focus(); }
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  return <dialog {...mark("Dialog", p, "dialog")} ref={ref} aria-labelledby={titleId} aria-describedby={p.description ? descId : undefined}
    onCancel={e => { e.preventDefault(); if (!pending) setOpen(false); }}
    onClick={e => { if (e.target !== ref.current || pending) return; const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setOpen(false); }}>
    <DialogHeader><h2 id={titleId}>{p.title ?? "Подтверждение"}</h2><IconButton variant="ghost" icon="close" label="Закрыть" disabled={pending} onClick={() => setOpen(false)} /></DialogHeader>
    <DialogBody>{p.description && <p id={descId}>{p.description}</p>}{p.children}{error && <MessageBar tone="error">{error}</MessageBar>}</DialogBody>
    <DialogActions>{p.cancelLabel !== false && <Button disabled={pending} onClick={() => setOpen(false)}>{p.cancelLabel ?? "Отмена"}</Button>}
      <Button variant={p.danger ? "danger" : "primary"} loading={pending} onClick={async () => {
        setPending(true); setError(undefined);
        try { const result = await p.onConfirm?.(); if (alive.current && result !== false) setOpen(false); }
        catch (reason) { if (alive.current) setError(reason instanceof Error ? reason.message : "Не удалось выполнить действие"); }
        finally { if (alive.current) setPending(false); }
      }}>{p.confirmLabel ?? "Готово"}</Button>
    </DialogActions>
  </dialog>;
});
