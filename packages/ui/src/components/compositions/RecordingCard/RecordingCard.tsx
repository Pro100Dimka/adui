import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion/hooks";
import { ArtworkFrame } from "../../layout/ArtworkFrame/ArtworkFrame";
import { Avatar } from "../../layout/Avatar/Avatar";
import { ButtonGroup } from "../../layout/ButtonGroup/ButtonGroup";
import { Card } from "../../layout/Card/Card";
import { Icon } from "../../layout/Icon/Icon";
import { IconTile } from "../../layout/IconTile/IconTile";
import { SectionHeader } from "../../layout/SectionHeader/SectionHeader";
import { Text } from "../../layout/Text/Text";
import { illustrations } from "../../layout/shared";
import { Button } from "../../controls/Button/Button";
import { Field } from "../../controls/Field/Field";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Tabs } from "../../controls/Tabs/Tabs";
import { TextField } from "../../controls/TextField/TextField";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import { Badge } from "../../feedback/Badge/Badge";
import { Dialog } from "../../feedback/Dialog/Dialog";
import { KeyValueList } from "../../feedback/KeyValueList/KeyValueList";
import { Menu } from "../../feedback/Menu/Menu";
import { MetricCard } from "../../feedback/MetricCard/MetricCard";
import { ProgressBar } from "../../feedback/ProgressBar/ProgressBar";
import { StatusIndicator } from "../../feedback/StatusIndicator/StatusIndicator";
import { Steps } from "../../feedback/Steps/Steps";
import { Toast } from "../../feedback/Toast/Toast";
import { type MenuItemData } from "../../feedback/shared";
import { AudioPlayer } from "../../media/AudioPlayer/AudioPlayer";
import { LevelMeter } from "../../media/LevelMeter/LevelMeter";
import { RotaryKnob } from "../../media/RotaryKnob/RotaryKnob";
import { VolumeControl } from "../../media/VolumeControl/VolumeControl";
import { type RoleEmblemProps, type RecordingCardProps, type ProcessingTaskCardProps, type ParticipantCardProps, type ProfileCardProps, type ThemeName, type ThemePickerProps, type RoomConnection, type RoomConnectionFormProps, type ModelStatusCardProps, type StorageSummaryProps, type DiagnosticsPanelProps, type PerformanceSummaryProps } from "../shared";
import { RoleEmblem } from "../RoleEmblem/RoleEmblem";
import { ProcessingTaskCard } from "../ProcessingTaskCard/ProcessingTaskCard";
import { ParticipantCard } from "../ParticipantCard/ParticipantCard";
import { ProfileCard } from "../ProfileCard/ProfileCard";
import { ThemePicker } from "../ThemePicker/ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm/RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard/ModelStatusCard";
import { StorageSummary } from "../StorageSummary/StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel/DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary/PerformanceSummary";

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
