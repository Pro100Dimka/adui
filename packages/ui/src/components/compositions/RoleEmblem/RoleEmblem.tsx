import React, { useRef, useState } from "react";
import { copyText, define, mark, useControllable, type CommonProps, type Tone } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion";
import { ArtworkFrame, Avatar, ButtonGroup, Card, Icon, IconTile, SectionHeader, Text, illustrations } from "../../layout";
import { Button, Field, FilePicker, IconButton, Tabs, TextField, ToggleButton } from "../../controls";
import { Badge, Dialog, KeyValueList, Menu, MetricCard, ProgressBar, StatusIndicator, Steps, Toast, type MenuItemData } from "../../feedback";
import { AudioPlayer, LevelMeter, RotaryKnob, VolumeControl } from "../../media";
import { type RoleEmblemProps, type RecordingCardProps, type ProcessingTaskCardProps, type ParticipantCardProps, type ProfileCardProps, type ThemeName, type ThemePickerProps, type RoomConnection, type RoomConnectionFormProps, type ModelStatusCardProps, type StorageSummaryProps, type DiagnosticsPanelProps, type PerformanceSummaryProps } from "../shared";
import { RecordingCard } from "../RecordingCard";
import { ProcessingTaskCard } from "../ProcessingTaskCard";
import { ParticipantCard } from "../ParticipantCard";
import { ProfileCard } from "../ProfileCard";
import { ThemePicker } from "../ThemePicker";
import { RoomConnectionForm } from "../RoomConnectionForm";
import { ModelStatusCard } from "../ModelStatusCard";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const RoleEmblem = define<RoleEmblemProps>("RoleEmblem", p => {
  const ref = useRef<HTMLDivElement>(null);
  useDecoration(ref, t => ref.current?.querySelectorAll<SVGGElement>("[data-host-orbit]").forEach(g => g.setAttribute("transform", `rotate(${t * (g.classList.contains("host-motion__inner-rear") || g.classList.contains("host-motion__inner-front") ? 360 / 5.6 : -360 / 8.4)} 65 65)`)));
  return <div {...mark("RoleEmblem", p, undefined, p.role === "guest" ? "ad-role-guest" : undefined)} ref={ref}>{p.role === "guest" ? <><Icon name="user" size={42} /><strong>GUEST</strong></> : <SvgAsset node={illustrations.host} />}</div>;
});
