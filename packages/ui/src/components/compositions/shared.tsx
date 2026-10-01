import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../core/base";
import { SvgAsset } from "../../core/artwork";
import { useDecoration } from "../../core/motion/hooks";
import { ArtworkFrame } from "../layout/ArtworkFrame/ArtworkFrame";
import { Avatar } from "../layout/Avatar/Avatar";
import { ButtonGroup } from "../layout/ButtonGroup/ButtonGroup";
import { Card } from "../layout/Card/Card";
import { Icon } from "../layout/Icon/Icon";
import { IconTile } from "../layout/IconTile/IconTile";
import { SectionHeader } from "../layout/SectionHeader/SectionHeader";
import { Text } from "../layout/Text/Text";
import { illustrations } from "../layout/shared";
import { Button } from "../controls/Button/Button";
import { Field } from "../controls/Field/Field";
import { FilePicker } from "../controls/FilePicker/FilePicker";
import { IconButton } from "../controls/IconButton/IconButton";
import { Tabs } from "../controls/Tabs/Tabs";
import { TextField } from "../controls/TextField/TextField";
import { ToggleButton } from "../controls/ToggleButton/ToggleButton";
import { Badge } from "../feedback/Badge/Badge";
import { Dialog } from "../feedback/Dialog/Dialog";
import { KeyValueList } from "../feedback/KeyValueList/KeyValueList";
import { Menu } from "../feedback/Menu/Menu";
import { MetricCard } from "../feedback/MetricCard/MetricCard";
import { ProgressBar } from "../feedback/ProgressBar/ProgressBar";
import { StatusIndicator } from "../feedback/StatusIndicator/StatusIndicator";
import { Steps } from "../feedback/Steps/Steps";
import { Toast } from "../feedback/Toast/Toast";
import { type MenuItemData } from "../feedback/shared";
import { AudioPlayer } from "../media/AudioPlayer/AudioPlayer";
import { LevelMeter } from "../media/LevelMeter/LevelMeter";
import { RotaryKnob } from "../media/RotaryKnob/RotaryKnob";
import { VolumeControl } from "../media/VolumeControl/VolumeControl";

import { RoleEmblem } from "./RoleEmblem/RoleEmblem";
import { RecordingCard } from "./RecordingCard/RecordingCard";
import { ProcessingTaskCard } from "./ProcessingTaskCard/ProcessingTaskCard";
import { ParticipantCard } from "./ParticipantCard/ParticipantCard";
import { ProfileCard } from "./ProfileCard/ProfileCard";
import { ThemePicker } from "./ThemePicker/ThemePicker";
import { RoomConnectionForm } from "./RoomConnectionForm/RoomConnectionForm";
import { ModelStatusCard } from "./ModelStatusCard/ModelStatusCard";
import { StorageSummary } from "./StorageSummary/StorageSummary";
import { DiagnosticsPanel } from "./DiagnosticsPanel/DiagnosticsPanel";
import { PerformanceSummary } from "./PerformanceSummary/PerformanceSummary";

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
