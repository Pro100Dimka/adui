import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion";
import { ArtworkFrame, Avatar, ButtonGroup, Card, Icon, IconTile, SectionHeader, Text, illustrations } from "../../layout";
import { Button, Field, FilePicker, IconButton, Tabs, TextField, ToggleButton } from "../../controls";
import { Badge, Dialog, KeyValueList, Menu, MetricCard, ProgressBar, StatusIndicator, Steps, Toast, type MenuItemData } from "../../feedback";
import { AudioPlayer, LevelMeter, RotaryKnob, VolumeControl } from "../../media";
import { type RoleEmblemProps, type RecordingCardProps, type ProcessingTaskCardProps, type ParticipantCardProps, type ProfileCardProps, type ThemeName, type ThemePickerProps, type RoomConnection, type RoomConnectionFormProps, type ModelStatusCardProps, type StorageSummaryProps, type DiagnosticsPanelProps, type PerformanceSummaryProps } from "../_shared";
import { RoleEmblem } from "../RoleEmblem";
import { RecordingCard } from "../RecordingCard";
import { ProcessingTaskCard } from "../ProcessingTaskCard";
import { ProfileCard } from "../ProfileCard";
import { ThemePicker } from "../ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const ParticipantCard = define<ParticipantCardProps>("ParticipantCard", p => {
  const [volume, setVolume] = useControllable(p.volume, 72, p.onVolumeChange), [muted, setMuted] = useControllable(p.muted, false, p.onMuteChange), [open, setOpen] = useState(false);
  return <Card {...p} className={`ad-participant-card ${p.className ?? ""}`}><RoleEmblem role={p.role} /><div className="ad-participant-info"><h3>{p.name ?? "Release Host"} <Badge>Вы</Badge></h3><StatusIndicator status={muted ? "offline" : "success"} label={muted ? "Микрофон отключён" : "Говорит…"} /><LevelMeter value={muted ? 0 : 72} /></div><RotaryKnob value={volume} onValueChange={setVolume} label="Громкость" diameter={124} /><ToggleButton checked={muted} onValueChange={setMuted} icon="volume" label="Отключить микрофон" /><IconButton icon="sliders" label="Параметры" onClick={() => setOpen(true)} /><Dialog open={open} onOpenChange={setOpen} title="Параметры участника"><VolumeControl value={volume} onValueChange={setVolume} /></Dialog></Card>;
});
