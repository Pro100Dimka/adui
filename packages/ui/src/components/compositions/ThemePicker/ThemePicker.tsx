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
import { RoomConnectionForm } from "../RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const ThemePicker = define<ThemePickerProps>("ThemePicker", p => {
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? "ruby", p.onValueChange);
  const themes: Array<[ThemeName, string, string]> = [["ruby", "Тёмная", "#ff244c"], ["light", "Светлая", "#ecc794"], ["green", "Зелёная", "#10deae"], ["violet", "Фиолетовая", "#b680ff"]];
  return <div {...mark("ThemePicker", p)} aria-label="Тема">{themes.map(([key, name, color]) => <Button key={key} aria-pressed={key === value} onClick={() => setValue(key)}><span style={{ background: `radial-gradient(ellipse at 50% 100%, ${color}, #09070c 80%)` }}><Icon name="music" size={32} /></span><strong>{name}</strong></Button>)}</div>;
});
