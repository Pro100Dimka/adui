import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { clamp, copyText, define, mark, useControllable, type CommonProps, type Tone } from "../core/base";
import { Button, IconButton } from "./controls";
import { Card, DialogHeader, DialogBody, DialogActions, Divider, Icon, IconTile, Text } from "./layout";

export interface DialogProps extends CommonProps {
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  title?: ReactNode; description?: ReactNode; confirmLabel?: string; cancelLabel?: string | false;
  danger?: boolean; onConfirm?: () => boolean | void | Promise<boolean | void>;
}
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
export interface PopoverProps extends CommonProps {
  open?: boolean; onOpenChange?: (open: boolean) => void; anchorRef?: RefObject<HTMLElement | null>; label?: string;
  role?: "dialog" | "menu"; onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}
export const Popover = define<PopoverProps>("Popover", p => {
  const ref = useRef<HTMLDivElement>(null); const change = useRef(p.onOpenChange); change.current = p.onOpenChange;
  useLayoutEffect(() => {
    const node = ref.current; if (!node || !p.open) return;
    const position = () => {
      const target = p.anchorRef?.current?.getBoundingClientRect();
      const r = node.getBoundingClientRect();
      node.style.left = `${Math.max(8, Math.min(innerWidth - r.width - 8, (target?.right ?? innerWidth / 2) - r.width))}px`;
      node.style.top = `${Math.max(8, Math.min(innerHeight - r.height - 8, (target?.bottom ?? innerHeight / 2) + 8))}px`;
    };
    const supports = typeof node.showPopover === "function";
    if (supports) node.showPopover();
    position(); node.querySelector<HTMLElement>('button:not(:disabled),input,[tabindex="0"]')?.focus();
    const dismiss = (e: PointerEvent) => { const path = e.composedPath(); if (!path.includes(node) && !path.includes(p.anchorRef?.current as EventTarget)) change.current?.(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); change.current?.(false); p.anchorRef?.current?.focus(); } };
    document.addEventListener("pointerdown", dismiss); document.addEventListener("keydown", key);
    window.addEventListener("resize", position); window.addEventListener("scroll", position, true);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", key); window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); if (supports && node.matches(":popover-open")) node.hidePopover(); };
  }, [p.open, p.anchorRef]);
  if (!p.open) return null;
  return <div {...mark("Popover", p, "dialog")} ref={ref} role={p.role ?? "dialog"} aria-label={p.label} popover="manual" onKeyDown={p.onKeyDown} style={{ margin: 0, position: "fixed", ...p.style }}>{p.children}</div>;
});
export interface MenuItemData { id?: string; label?: string; icon?: string; disabled?: boolean; danger?: boolean; separator?: boolean; onSelect?: () => void }
export interface MenuItemProps extends CommonProps, MenuItemData {}
export const MenuItem = define<MenuItemProps>("MenuItem", p => <Button role="menuitem" variant="ghost" icon={p.icon} disabled={p.disabled} tone={p.danger ? "error" : p.tone} className={`ad-menu-item ${p.className ?? ""}`} onClick={p.onSelect}>{p.label ?? p.children ?? "Действие"}</Button>);
export interface MenuProps extends PopoverProps { items?: MenuItemData[] }
export const Menu = define<MenuProps>("Menu", p => <Popover {...p} role="menu" className={`ad-menu ${p.className ?? ""}`} onKeyDown={e => {
  if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(e.key)) return;
  if (e.key === "Tab") { p.onOpenChange?.(false); return; }
  e.preventDefault(); const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
}}>{(p.items ?? []).map((item, i) => item.separator ? <Divider key={item.id ?? i} /> : <MenuItem key={item.id ?? i} {...item} onSelect={() => { p.onOpenChange?.(false); p.anchorRef?.current?.focus(); item.onSelect?.(); }} />)}</Popover>);
export interface ToastProps extends CommonProps { message?: ReactNode; open?: boolean; duration?: number; onClose?: () => void; floating?: boolean }
export const Toast = define<ToastProps>("Toast", ({ open = true, duration = 3600, onClose, ...p }) => {
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => { if (!open || !onClose || duration <= 0) return; const id = window.setTimeout(() => close.current?.(), duration); return () => clearTimeout(id); }, [open, duration, !!onClose]);
  if (!open) return null;
  return <div {...mark("Toast", p, "dialog", p.floating ? "ad-toast-floating" : undefined)} role={p.tone === "error" ? "alert" : "status"} aria-live={p.tone === "error" ? "assertive" : "polite"}><Icon name={p.tone === "error" ? "warning" : "check"} size={20} /><span>{p.message ?? p.children ?? "Настройки сохранены"}</span></div>;
});
export interface BadgeProps extends CommonProps { label?: string }
export const Badge = define<BadgeProps>("Badge", p => <span {...mark("Badge", p)}>{p.children ?? p.label ?? "GPU"}</span>);
export interface StatusIndicatorProps extends CommonProps { status?: Tone; label?: ReactNode }
export const StatusIndicator = define<StatusIndicatorProps>("StatusIndicator", ({ status = "success", ...p }) => {
  const names = { success: "check", error: "warning", warning: "warning", processing: "processing", pending: "clock", offline: "minus", info: "info" };
  const labels = { success: "Готово", error: "Ошибка", warning: "Внимание", processing: "Обработка", pending: "В очереди", offline: "Не подключено", info: "Информация" };
  return <span {...mark("StatusIndicator", { ...p, tone: status })}><span className="ad-status-dot"><Icon name={names[status]} size={18} /></span><span>{p.label ?? labels[status]}</span></span>;
});
export interface ProgressBarProps extends CommonProps { value?: number; max?: number; label?: string; indeterminate?: boolean }
export const ProgressBar = define<ProgressBarProps>("ProgressBar", p => {
  const max = Math.max(0.0001, p.max ?? 100); const value = clamp(p.value ?? 56, 0, max);
  return <div {...mark("ProgressBar", p)} role="progressbar" aria-label={p.label ?? "Прогресс"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={p.indeterminate ? undefined : value} data-indeterminate={p.indeterminate || undefined}>
    <span style={{ width: p.indeterminate ? "35%" : `${value / max * 100}%` }} />
  </div>;
});
export interface StepsProps extends CommonProps { steps?: string[]; current?: number }
export const Steps = define<StepsProps>("Steps", p => {
  const steps = p.steps ?? ["Подготовка", "Анализ", "Модель", "Обработка", "Проверка"];
  return <ol {...mark("Steps", p)}>{steps.map((label, i) => <li key={`${i}-${label}`} aria-current={i === (p.current ?? 3) ? "step" : undefined}><StatusIndicator status={i < (p.current ?? 3) ? "success" : i === (p.current ?? 3) ? "processing" : "pending"} label={label} />{i < steps.length - 1 && <Icon name="chevron" size={12} />}</li>)}</ol>;
});
export const MessageBar = define<CommonProps>("MessageBar", p => <div {...mark("MessageBar", { ...p, tone: p.tone ?? "warning" })} role={p.tone === "error" ? "alert" : "status"}><Icon name={p.tone === "success" ? "check" : p.tone === "error" ? "warning" : "info"} size={22} /><span>{p.children ?? "Для операции нужно больше свободного места."}</span></div>);
export interface EmptyStateProps extends CommonProps { title?: string; description?: string; icon?: string; action?: ReactNode }
export const EmptyState = define<EmptyStateProps>("EmptyState", p => <div {...mark("EmptyState", p)}><Icon name={p.icon ?? "music"} size={44} /><h3>{p.title ?? "Пока нет записей"}</h3><p>{p.description ?? "Добавьте запись, чтобы начать."}</p>{p.action}</div>);
export interface MetricCardProps extends CommonProps { title?: string; description?: string; icon?: string; value?: number; unit?: string }
export const MetricCard = define<MetricCardProps>("MetricCard", p => <Card {...p} title={undefined} className={`ad-metric-card ${p.className ?? ""}`}><div className="ad-metric-heading"><IconTile icon={p.icon ?? "music"} /><div><Text variant="muted">{p.title ?? "Высота"}</Text><strong>{p.value ?? 49}{p.unit ?? "%"}</strong></div></div><ProgressBar value={p.value ?? 49} label={p.title} /><p>{p.description ?? "Доля нот, исполненных точно"}</p></Card>);
export interface KeyValueListProps extends CommonProps { items?: Array<[ReactNode, ReactNode]> }
export const KeyValueList = define<KeyValueListProps>("KeyValueList", p => <dl {...mark("KeyValueList", p)}>{(p.items ?? [["Python Backend", "Ready"], ["AudioService", "Running"], ["База данных", "Исправно"]]).map(([key, value], i) => <div key={i}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>);
export interface DataTableProps extends CommonProps { columns?: string[]; rows?: ReactNode[][]; caption?: string }
export const DataTable = define<DataTableProps>("DataTable", p => <table {...mark("DataTable", p)}>{p.caption && <caption>{p.caption}</caption>}<thead><tr>{(p.columns ?? ["Дата", "Событие", "Статус"]).map((name, i) => <th key={i} scope="col">{name}</th>)}</tr></thead><tbody>{(p.rows ?? [["30.09.2026, 13:24", "AnalysisCompleted", "Готово"], ["30.09.2026, 13:23", "RecordingRegistered", "Готово"]]).map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table>);
export interface CollapsibleSectionProps extends CommonProps { title?: string; icon?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
export const CollapsibleSection = define<CollapsibleSectionProps>("CollapsibleSection", p => {
  const [open, setOpen] = useControllable(p.open, p.defaultOpen ?? false, p.onOpenChange);
  return <details {...mark("CollapsibleSection", p, "card")} open={open} onToggle={e => { if (e.currentTarget.open !== open) setOpen(e.currentTarget.open); }}><summary><Icon name={p.icon ?? "braces"} /><span>{p.title ?? "Технический JSON"}</span><Icon name="chevron" size={18} /></summary><div className="ad-collapse-content">{p.children ?? "Содержимое раскрывающегося раздела."}</div></details>;
});
export interface CodeViewerProps extends CommonProps { value?: unknown; label?: string }
export const CodeViewer = define<CodeViewerProps>("CodeViewer", p => {
  let text: string; try { text = typeof p.value === "string" ? p.value : JSON.stringify(p.value ?? { driver: "WASAPI Shared", sampleRate: 44100, enabled: true }, null, 2); } catch { text = "Значение не сериализуется в JSON"; }
  const [copied, setCopied] = useState(false);
  return <div {...mark("CodeViewer", p)}><IconButton variant="ghost" icon={copied ? "check" : "copy"} label={copied ? "Код скопирован" : "Копировать код"} onClick={async () => setCopied(await copyText(text))} /><pre aria-label={p.label}><code>{text}</code></pre></div>;
});
