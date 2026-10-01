import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion";
import { ArtworkFrame, Avatar, ButtonGroup, Card, Icon, IconTile, SectionHeader, Text, illustrations } from "../../layout";
import { Button, Field, FilePicker, IconButton, Tabs, TextField, ToggleButton } from "../../controls";
import { Badge, Dialog, KeyValueList, Menu, MetricCard, ProgressBar, StatusIndicator, Steps, Toast, type MenuItemData } from "../../feedback";
import { AudioPlayer, LevelMeter, RotaryKnob, VolumeControl } from "../../media";
import { type RoleEmblemProps, type RecordingCardProps, type ProcessingTaskCardProps, type ParticipantCardProps, type ProfileCardProps, type ThemeName, type ThemePickerProps, type RoomConnection, type RoomConnectionFormProps, type ModelStatusCardProps, type StorageSummaryProps, type DiagnosticsPanelProps, type PerformanceSummaryProps } from "../shared";
import { RoleEmblem } from "../RoleEmblem";
import { ProcessingTaskCard } from "../ProcessingTaskCard";
import { ParticipantCard } from "../ParticipantCard";
import { ProfileCard } from "../ProfileCard";
import { ThemePicker } from "../ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const RecordingCard = define<RecordingCardProps>("RecordingCard", p => {
  const [dialog, setDialog] = useState<"delete" | "rename" | null>(null), [menu, setMenu] = useState(false), [draft, setDraft] = useState(p.title ?? "Recording · 30.09.2026, 00:57:03"), [title, setTitle] = useState(draft), [notice, setNotice] = useState("");
  const anchor = useRef<HTMLButtonElement>(null);
  return <Card {...p} title={undefined} className={`ad-recording-card ${p.className ?? ""}`}><ArtworkFrame variant={p.art ?? "planet"} /><div className="ad-recording-content"><h3>{p.title ?? title}</h3><StatusIndicator status="success" label="Файл готов · Анализ готов" /><AudioPlayer duration={p.duration ?? 67} src={p.src} /></div>
    <div className="ad-recording-actions"><IconButton icon="folder" label="Открыть папку" onClick={() => p.onOpenFolder ? p.onOpenFolder() : setNotice("Открытие папки подключается в приложении")} /><IconButton icon="trash" label="Удалить" onClick={() => setDialog("delete")} /><IconButton ref={anchor} icon="more" label="Меню" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(v => !v)} /></div>
    <Menu anchorRef={anchor} open={menu} onOpenChange={setMenu} items={[{ label: "Переименовать", icon: "pencil", onSelect: () => { setDraft(p.title ?? title); setDialog("rename"); } }]} />
    <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }} danger={dialog === "delete"} title={dialog === "delete" ? "Удалить запись?" : "Переименовать запись"} description={dialog === "delete" ? "Без обработчика приложения этот пример не удаляет файлы." : undefined} onConfirm={() => { if (dialog === "delete") p.onDelete?.(); else { setTitle(draft); p.onRename?.(draft); } }}>{dialog === "rename" && <TextField value={draft} onValueChange={setDraft} label="Название" />}</Dialog>
    <Toast floating open={!!notice} message={notice} onClose={() => setNotice("")} />
  </Card>;
});
