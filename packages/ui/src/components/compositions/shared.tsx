import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../core/base";
import { SvgAsset } from "../../core/artwork";
import { useDecoration } from "../../core/motion";
import { ArtworkFrame, Avatar, ButtonGroup, Card, Icon, IconTile, SectionHeader, Text, illustrations } from "../layout";
import { Button, Field, FilePicker, IconButton, Tabs, TextField, ToggleButton } from "../controls";
import { Badge, Dialog, KeyValueList, Menu, MetricCard, ProgressBar, StatusIndicator, Steps, Toast, type MenuItemData } from "../feedback";
import { AudioPlayer, LevelMeter, RotaryKnob, VolumeControl } from "../media";

import { RoleEmblem } from "./RoleEmblem";
import { RecordingCard } from "./RecordingCard";
import { ProcessingTaskCard } from "./ProcessingTaskCard";
import { ParticipantCard } from "./ParticipantCard";
import { ProfileCard } from "./ProfileCard";
import { ThemePicker } from "./ThemePicker";
import { RoomConnectionForm } from "./RoomConnectionForm";
import { ModelStatusCard } from "./ModelStatusCard";
import { StorageSummary } from "./StorageSummary";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { PerformanceSummary } from "./PerformanceSummary";

export interface RoleEmblemProps extends CommonProps { role?: "host" | "guest" }

export interface RecordingCardProps extends CommonProps { title?: string; duration?: number; src?: string; art?: "planet" | "mountains" | "city" | "silk" | "horizon" | "landscape"; onDelete?: () => void; onOpenFolder?: () => void; onRename?: (name: string) => void }

export interface ProcessingTaskCardProps extends CommonProps { title?: string; status?: Tone; value?: number }

export interface ParticipantCardProps extends CommonProps { name?: string; role?: "host" | "guest"; volume?: number; onVolumeChange?: (value: number) => void; muted?: boolean; onMuteChange?: (muted: boolean) => void }

export interface ProfileCardProps extends CommonProps { name?: string; onPhoto?: (file: File) => void }

export type ThemeName = "ruby" | "light" | "green" | "violet";

export interface ThemePickerProps extends CommonProps { value?: ThemeName; defaultValue?: ThemeName; onValueChange?: (value: ThemeName) => void }

export interface RoomConnection { mode: "join" | "create"; name: string; code: string }

export interface RoomConnectionFormProps extends CommonProps { defaultName?: string; onSubmit?: (value: RoomConnection) => void }

export interface ModelStatusCardProps extends CommonProps { title?: string; icon?: string; status?: Tone; onDetails?: () => void }

export interface StorageSummaryProps extends CommonProps { used?: number; total?: number; onClearCache?: () => void; onTemporaryFiles?: () => void }

export interface DiagnosticsPanelProps extends CommonProps { onRefresh?: () => void; items?: Array<[React.ReactNode, React.ReactNode]> }

export interface PerformanceSummaryProps extends CommonProps { pitch?: number; rhythm?: number; stability?: number; score?: number; advice?: string }
