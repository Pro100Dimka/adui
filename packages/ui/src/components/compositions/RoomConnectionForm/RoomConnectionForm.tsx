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
import { ModelStatusCard } from "../ModelStatusCard";
import { StorageSummary } from "../StorageSummary";
import { DiagnosticsPanel } from "../DiagnosticsPanel";
import { PerformanceSummary } from "../PerformanceSummary";

export const RoomConnectionForm = define<RoomConnectionFormProps>("RoomConnectionForm", p => {
  const [mode, setMode] = useState<"join" | "create">("join"), [name, setName] = useState(p.defaultName ?? "Дмитрий"), [code, setCode] = useState(""), [error, setError] = useState("");
  const submit = () => { if (!name.trim() || (mode === "join" && !code.trim())) { setError("Заполните обязательные поля"); return; } setError(""); p.onSubmit?.({ mode, name, code }); };
  return <Card {...p} className={`ad-room-connection-form ${p.className ?? ""}`} title="Пойте вместе" description="Создайте комнату или войдите по коду." icon="users"><Tabs value={mode} onValueChange={v => setMode(v as "join" | "create")} items={[{ value: "join", label: "Войти по коду" }, { value: "create", label: "Создать комнату" }]} /><Field label="Имя" required><TextField value={name} onValueChange={setName} clearable /></Field>{mode === "join" && <Field label="Код комнаты" required><TextField value={code} onValueChange={setCode} placeholder="Введите код комнаты" /></Field>}<Button variant="primary" icon="login" onClick={submit}>{mode === "join" ? "Войти в комнату" : "Создать комнату"}</Button>{error && <span role="alert" className="ad-field-error">{error}</span>}</Card>;
});
