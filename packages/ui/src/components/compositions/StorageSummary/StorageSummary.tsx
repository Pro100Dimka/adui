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
import { ParticipantCard } from "../ParticipantCard";
import { ProfileCard } from "../ProfileCard";
import { ThemePicker } from "../ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const StorageSummary = define<StorageSummaryProps>("StorageSummary", p => {
  const [open, setOpen] = useState(false), total = p.total ?? 128, used = p.used ?? 36.8;
  return <Card {...p} title="Память / хранилище" icon="database" description="Управление кэшем и временными файлами"><div className="ad-storage-meta"><Text>Свободно: {Math.max(0, total - used).toFixed(1)} GB</Text><Text>Используется: {used} / {total} GB</Text></div><ProgressBar value={used} max={total} label="Использовано места" /><ButtonGroup><Button icon="trash" onClick={() => setOpen(true)}>Очистить кэш</Button><Button icon="history" onClick={p.onTemporaryFiles}>Временные файлы</Button></ButtonGroup><Dialog open={open} onOpenChange={setOpen} title="Очистить кэш?" description="Без подключения приложения файлы не удаляются." onConfirm={p.onClearCache} /></Card>;
});
