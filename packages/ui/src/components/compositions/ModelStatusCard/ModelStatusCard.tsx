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
import { RecordingCard } from "../RecordingCard";
import { ProcessingTaskCard } from "../ProcessingTaskCard";
import { ParticipantCard } from "../ParticipantCard";
import { ProfileCard } from "../ProfileCard";
import { ThemePicker } from "../ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const ModelStatusCard = define<ModelStatusCardProps>("ModelStatusCard", p => {
  const [open, setOpen] = useState(false);
  return <Card {...p} title={undefined} className={`ad-model-status-card ${p.className ?? ""}`}><IconTile icon={p.icon ?? "chip"} /><div><strong>{p.title ?? "ASR (whisper-base)"}</strong><StatusIndicator status={p.status ?? "success"} label="Готова" /></div><IconButton icon="chevron" label="Детали модели" variant="ghost" onClick={() => p.onDetails ? p.onDetails() : setOpen(true)} /><Dialog open={open} onOpenChange={setOpen} title={p.title ?? "Модель"} description="Готова к использованию. Это демонстрационные данные интерфейса." /></Card>;
});
