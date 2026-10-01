import React, { useRef, useState } from "react";
import {
  copyText,
  define,
  mark,
  useControllable,
  type CommonProps,
  type Tone,
} from "../core/base";
import { SvgAsset } from "../core/artwork";
import { useDecoration } from "../core/motion";
import {
  ArtworkFrame,
  Avatar,
  ButtonGroup,
  Card,
  Icon,
  IconTile,
  SectionHeader,
  Text,
  illustrations,
} from "./layout";
import {
  Button,
  Field,
  FilePicker,
  IconButton,
  Tabs,
  TextField,
  ToggleButton,
} from "./controls";
import {
  Badge,
  Dialog,
  KeyValueList,
  Menu,
  MetricCard,
  ProgressBar,
  StatusIndicator,
  Steps,
  Toast,
  type MenuItemData,
} from "./feedback";
import { AudioPlayer, LevelMeter, RotaryKnob, VolumeControl } from "./media";
export interface RoleEmblemProps extends CommonProps {
  role?: "host" | "guest";
}
export const RoleEmblem = define<RoleEmblemProps>("RoleEmblem", (p) => {
  const ref = useRef<HTMLDivElement>(null);
  useDecoration(ref, (t) =>
    ref.current
      ?.querySelectorAll<SVGGElement>("[data-host-orbit]")
      .forEach((g) =>
        g.setAttribute(
          "transform",
          `rotate(${t * (g.classList.contains("host-motion__inner-rear") || g.classList.contains("host-motion__inner-front") ? 360 / 5.6 : -360 / 8.4)} 65 65)`,
        ),
      ),
  );
  return (
    <div
      {...mark(
        "RoleEmblem",
        p,
        undefined,
        p.role === "guest" ? "ad-role-guest" : undefined,
      )}
      ref={ref}
    >
      {p.role === "guest" ? (
        <>
          <Icon name="user" size={42} />
          <strong>GUEST</strong>
        </>
      ) : (
        <SvgAsset node={illustrations.host} />
      )}
    </div>
  );
});
export interface RecordingCardProps extends CommonProps {
  title?: string;
  duration?: number;
  src?: string;
  art?: "planet" | "mountains" | "city" | "silk" | "horizon" | "landscape";
  onDelete?: () => void;
  onOpenFolder?: () => void;
  onRename?: (name: string) => void;
}
export const RecordingCard = define<RecordingCardProps>(
  "RecordingCard",
  (p) => {
    const [dialog, setDialog] = useState<"delete" | "rename" | null>(null),
      [menu, setMenu] = useState(false),
      [draft, setDraft] = useState(
        p.title ?? "Recording · 30.09.2026, 00:57:03",
      ),
      [title, setTitle] = useState(draft),
      [notice, setNotice] = useState("");
    const anchor = useRef<HTMLButtonElement>(null);
    return (
      <Card
        {...p}
        title={undefined}
        className={`ad-recording-card ${p.className ?? ""}`}
      >
        <ArtworkFrame variant={p.art ?? "planet"} />
        <div className="ad-recording-content">
          <h3>{p.title ?? title}</h3>
          <StatusIndicator status="success" label="Файл готов · Анализ готов" />
          <AudioPlayer duration={p.duration ?? 67} src={p.src} />
        </div>
        <div className="ad-recording-actions">
          <IconButton
            icon="folder"
            label="Открыть папку"
            onClick={() =>
              p.onOpenFolder
                ? p.onOpenFolder()
                : setNotice("Открытие папки подключается в приложении")
            }
          />
          <IconButton
            icon="trash"
            label="Удалить"
            onClick={() => setDialog("delete")}
          />
          <IconButton
            ref={anchor}
            icon="more"
            label="Меню"
            aria-haspopup="menu"
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          />
        </div>
        <Menu
          anchorRef={anchor}
          open={menu}
          onOpenChange={setMenu}
          items={[
            {
              label: "Переименовать",
              icon: "pencil",
              onSelect: () => {
                setDraft(p.title ?? title);
                setDialog("rename");
              },
            },
          ]}
        />
        <Dialog
          open={dialog !== null}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          danger={dialog === "delete"}
          title={
            dialog === "delete" ? "Удалить запись?" : "Переименовать запись"
          }
          description={
            dialog === "delete"
              ? "Без обработчика приложения этот пример не удаляет файлы."
              : undefined
          }
          onConfirm={() => {
            if (dialog === "delete") p.onDelete?.();
            else {
              setTitle(draft);
              p.onRename?.(draft);
            }
          }}
        >
          {dialog === "rename" && (
            <TextField
              value={draft}
              onValueChange={setDraft}
              label="Название"
            />
          )}
        </Dialog>
        <Toast
          floating
          open={!!notice}
          message={notice}
          onClose={() => setNotice("")}
        />
      </Card>
    );
  },
);
export interface ProcessingTaskCardProps extends CommonProps {
  title?: string;
  status?: Tone;
  value?: number;
}
export const ProcessingTaskCard = define<ProcessingTaskCardProps>(
  "ProcessingTaskCard",
  (p) => (
    <Card
      {...p}
      title={undefined}
      className={`ad-processing-task-card ${p.className ?? ""}`}
    >
      <SectionHeader
        icon="chip"
        title={p.title ?? "Обработка песни"}
        description="Kaggle · демонстрационная задача"
        actions={<StatusIndicator status={p.status ?? "processing"} />}
      />
      <ProgressBar value={p.value ?? 56} />
      <div className="ad-task-meta">
        <Text>{p.value ?? 56}%</Text>
        <Text variant="muted">0:54</Text>
      </div>
      <Steps current={3} />
    </Card>
  ),
);
export interface ParticipantCardProps extends CommonProps {
  name?: string;
  role?: "host" | "guest";
  volume?: number;
  onVolumeChange?: (value: number) => void;
  muted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}
export const ParticipantCard = define<ParticipantCardProps>(
  "ParticipantCard",
  (p) => {
    const [volume, setVolume] = useControllable(p.volume, 72, p.onVolumeChange),
      [muted, setMuted] = useControllable(p.muted, false, p.onMuteChange),
      [open, setOpen] = useState(false);
    return (
      <Card {...p} className={`ad-participant-card ${p.className ?? ""}`}>
        <RoleEmblem role={p.role} />
        <div className="ad-participant-info">
          <h3>
            {p.name ?? "Release Host"} <Badge>Вы</Badge>
          </h3>
          <StatusIndicator
            status={muted ? "offline" : "success"}
            label={muted ? "Микрофон отключён" : "Говорит…"}
          />
          <LevelMeter value={muted ? 0 : 72} />
        </div>
        <RotaryKnob
          value={volume}
          onValueChange={setVolume}
          label="Громкость"
          diameter={124}
        />
        <ToggleButton
          checked={muted}
          onValueChange={setMuted}
          icon="volume"
          label="Отключить микрофон"
        />
        <IconButton
          icon="sliders"
          label="Параметры"
          onClick={() => setOpen(true)}
        />
        <Dialog open={open} onOpenChange={setOpen} title="Параметры участника">
          <VolumeControl value={volume} onValueChange={setVolume} />
        </Dialog>
      </Card>
    );
  },
);
export interface ProfileCardProps extends CommonProps {
  name?: string;
  onPhoto?: (file: File) => void;
}
export const ProfileCard = define<ProfileCardProps>("ProfileCard", (p) => (
  <Card {...p} title="Профиль">
    <div className="ad-profile-line">
      <Avatar name={p.name ?? "Дмитрий"} />
      <div>
        <p>Его видят друзья и участники комнаты</p>
        <FilePicker
          label="Выбрать фото"
          icon="upload"
          accept="image/*"
          onFiles={(files) => {
            if (files[0]) p.onPhoto?.(files[0]);
          }}
        />
      </div>
    </div>
  </Card>
));
export type ThemeName = "ruby" | "light" | "green" | "violet";
export interface ThemePickerProps extends CommonProps {
  value?: ThemeName;
  defaultValue?: ThemeName;
  onValueChange?: (value: ThemeName) => void;
}
export const ThemePicker = define<ThemePickerProps>("ThemePicker", (p) => {
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? "ruby",
    p.onValueChange,
  );
  const themes: Array<[ThemeName, string, string]> = [
    ["ruby", "Тёмная", "#ff244c"],
    ["light", "Светлая", "#ecc794"],
    ["green", "Зелёная", "#10deae"],
    ["violet", "Фиолетовая", "#b680ff"],
  ];
  return (
    <div {...mark("ThemePicker", p)} aria-label="Тема">
      {themes.map(([key, name, color]) => (
        <Button
          key={key}
          aria-pressed={key === value}
          onClick={() => setValue(key)}
        >
          <span
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${color}, #09070c 80%)`,
            }}
          >
            <Icon name="music" size={32} />
          </span>
          <strong>{name}</strong>
        </Button>
      ))}
    </div>
  );
});
export interface RoomConnection {
  mode: "join" | "create";
  name: string;
  code: string;
}
export interface RoomConnectionFormProps extends CommonProps {
  defaultName?: string;
  onSubmit?: (value: RoomConnection) => void;
}
export const RoomConnectionForm = define<RoomConnectionFormProps>(
  "RoomConnectionForm",
  (p) => {
    const [mode, setMode] = useState<"join" | "create">("join"),
      [name, setName] = useState(p.defaultName ?? "Дмитрий"),
      [code, setCode] = useState(""),
      [error, setError] = useState("");
    const submit = () => {
      if (!name.trim() || (mode === "join" && !code.trim())) {
        setError("Заполните обязательные поля");
        return;
      }
      setError("");
      p.onSubmit?.({ mode, name, code });
    };
    return (
      <Card
        {...p}
        className={`ad-room-connection-form ${p.className ?? ""}`}
        title="Пойте вместе"
        description="Создайте комнату или войдите по коду."
        icon="users"
      >
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "join" | "create")}
          items={[
            { value: "join", label: "Войти по коду" },
            { value: "create", label: "Создать комнату" },
          ]}
        />
        <Field label="Имя" required>
          <TextField value={name} onValueChange={setName} clearable />
        </Field>
        {mode === "join" && (
          <Field label="Код комнаты" required>
            <TextField
              value={code}
              onValueChange={setCode}
              placeholder="Введите код комнаты"
            />
          </Field>
        )}
        <Button variant="primary" icon="login" onClick={submit}>
          {mode === "join" ? "Войти в комнату" : "Создать комнату"}
        </Button>
        {error && (
          <span role="alert" className="ad-field-error">
            {error}
          </span>
        )}
      </Card>
    );
  },
);
export interface ModelStatusCardProps extends CommonProps {
  title?: string;
  icon?: string;
  status?: Tone;
  onDetails?: () => void;
}
export const ModelStatusCard = define<ModelStatusCardProps>(
  "ModelStatusCard",
  (p) => {
    const [open, setOpen] = useState(false);
    return (
      <Card
        {...p}
        title={undefined}
        className={`ad-model-status-card ${p.className ?? ""}`}
      >
        <IconTile icon={p.icon ?? "chip"} />
        <div>
          <strong>{p.title ?? "ASR (whisper-base)"}</strong>
          <StatusIndicator status={p.status ?? "success"} label="Готова" />
        </div>
        <IconButton
          icon="chevron"
          label="Детали модели"
          variant="ghost"
          onClick={() => (p.onDetails ? p.onDetails() : setOpen(true))}
        />
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title={p.title ?? "Модель"}
          description="Готова к использованию. Это демонстрационные данные интерфейса."
        />
      </Card>
    );
  },
);
export interface StorageSummaryProps extends CommonProps {
  used?: number;
  total?: number;
  onClearCache?: () => void;
  onTemporaryFiles?: () => void;
}
export const StorageSummary = define<StorageSummaryProps>(
  "StorageSummary",
  (p) => {
    const [open, setOpen] = useState(false),
      total = p.total ?? 128,
      used = p.used ?? 36.8;
    return (
      <Card
        {...p}
        title="Память / хранилище"
        icon="database"
        description="Управление кэшем и временными файлами"
      >
        <div className="ad-storage-meta">
          <Text>Свободно: {Math.max(0, total - used).toFixed(1)} GB</Text>
          <Text>
            Используется: {used} / {total} GB
          </Text>
        </div>
        <ProgressBar value={used} max={total} label="Использовано места" />
        <ButtonGroup>
          <Button icon="trash" onClick={() => setOpen(true)}>
            Очистить кэш
          </Button>
          <Button icon="history" onClick={p.onTemporaryFiles}>
            Временные файлы
          </Button>
        </ButtonGroup>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Очистить кэш?"
          description="Без подключения приложения файлы не удаляются."
          onConfirm={p.onClearCache}
        />
      </Card>
    );
  },
);
export interface DiagnosticsPanelProps extends CommonProps {
  onRefresh?: () => void;
  items?: Array<[React.ReactNode, React.ReactNode]>;
}
export const DiagnosticsPanel = define<DiagnosticsPanelProps>(
  "DiagnosticsPanel",
  (p) => (
    <Card {...p} title="Диагностика" icon="stethoscope">
      <KeyValueList items={p.items} />
      <ButtonGroup>
        <Button
          icon="copy"
          onClick={() => {
            void copyText(
              JSON.stringify(
                { demo: true, backend: "Ready", audio: "Running" },
                null,
                2,
              ),
            );
          }}
        >
          Копировать
        </Button>
        <Button icon="refresh" onClick={p.onRefresh}>
          Обновить
        </Button>
      </ButtonGroup>
    </Card>
  ),
);
export interface PerformanceSummaryProps extends CommonProps {
  pitch?: number;
  rhythm?: number;
  stability?: number;
  score?: number;
  advice?: string;
}
export const PerformanceSummary = define<PerformanceSummaryProps>(
  "PerformanceSummary",
  (p) => (
    <div {...mark("PerformanceSummary", p)}>
      <div className="ad-metric-grid">
        <MetricCard value={p.pitch ?? 49} title="Высота" />
        <MetricCard
          value={p.rhythm ?? 0}
          title="Ритм"
          icon="wave"
          description="Точность начала нот"
        />
        <MetricCard
          value={p.stability ?? 0}
          title="Стабильность"
          icon="clock"
          description="Удержание высоты"
        />
      </div>
      <Card title="Нужно потренироваться">
        <div className="ad-summary-score">
          <strong>{p.score ?? 16}</strong>
          <span>общая оценка</span>
        </div>
        <p>
          {p.advice ??
            "Потренируйте вступления: слушайте сильную долю и начинайте точно на ней."}
        </p>
      </Card>
    </div>
  ),
);
