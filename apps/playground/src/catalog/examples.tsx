import React, { useRef, useState } from "react";
import * as UI from "@ad-voice/ui";
import * as Editor from "@ad-voice/ui/editor";
import type { NoteGeometry } from "@ad-voice/ui/editor";

// Catalogue convenience namespace. Heavy editor primitives intentionally live in
// the separate @ad-voice/ui/editor entry point in the publishable package.
const U = { ...UI, ...Editor };

const row = (children: React.ReactNode) => (
  <div className="sample-row">{children}</div>
);
export const wide = new Set([
  "PageHeader",
  "Tabs",
  "Toolbar",
  "DataTable",
  "Steps",
  "TransportBar",
  "PianoRollGrid",
  "RecordingCard",
  "ProcessingTaskCard",
  "ParticipantCard",
  "RoomConnectionForm",
  "PerformanceSummary",
  "DiagnosticsPanel",
  "ThemePicker",
  "StorageSummary",
  "SceneIllustration",
]);

export function Example({ name }: { name: string }) {
  const [value, setValue] = useState(35),
    [checked, setChecked] = useState(true),
    [open, setOpen] = useState(false);
  const [text, setText] = useState("Дмитрий"),
    [choice, setChoice] = useState("one"),
    [notice, setNotice] = useState("");
  const [note, setNote] = useState<NoteGeometry>({ x: 25, y: 54, width: 95 });
  const [history, setHistory] = useState([0]),
    [cursor, setCursor] = useState(0);
  const anchor = useRef<HTMLButtonElement>(null);
  const alert = (message = "Действие выполнено в примере") =>
    setNotice(message);
  const items = [
    {
      label: "Переименовать",
      icon: "pencil",
      onSelect: () => alert("Переименование выбрано"),
    },
    {
      label: "Копировать",
      icon: "copy",
      onSelect: () => {
        void U.copyText("A&D UI");
        alert("Скопировано");
      },
    },
    { separator: true },
    {
      label: "Удалить",
      icon: "trash",
      danger: true,
      onSelect: () => alert("Удаление выбрано. Файлы не затрагиваются."),
    },
  ];
  let demo: React.ReactNode;
  switch (name) {
    case "ThemeProvider":
      demo = row(
        <>
          <U.ThemeProvider>
            <U.Button variant="primary">Общая тема</U.Button>
          </U.ThemeProvider>
          <U.ThemeProvider
            tokens={{
              "--ad-surface-ruby": "linear-gradient(140deg,#7b1644,#300817)",
              "--ad-shadow-ruby": "0 0 18px #ff548955",
            }}
          >
            <U.Button variant="primary">Локальные токены</U.Button>
          </U.ThemeProvider>
        </>,
      );
      break;
    case "MotionProvider":
      demo = (
        <>
          <U.Switch
            checked={checked}
            onValueChange={setChecked}
            label="Движение в этом примере"
          />
          <U.MotionProvider enabled={checked}>
            <U.AnimatedBorder>
              <U.WaveDecoration style={{ height: 85 }} />
            </U.AnimatedBorder>
          </U.MotionProvider>
        </>
      );
      break;
    case "Icon":
      demo = row(
        <>
          {[
            "music",
            "audio",
            "folder",
            "wave",
            "chip",
            "users",
            "sliders",
            "save",
          ].map((icon) => (
            <div key={icon} className="icon-specimen">
              <U.Icon name={icon} size={27} />
              <small>{icon}</small>
            </div>
          ))}
        </>,
      );
      break;
    case "IconTile":
      demo = row(
        <>
          {["music", "chip", "database", "users", "stethoscope"].map((icon) => (
            <U.IconTile key={icon} icon={icon} />
          ))}
        </>,
      );
      break;
    case "Avatar":
      demo = row(
        <>
          <U.Avatar name="Дмитрий" />
          <U.Avatar name="Анна" />
          <U.Avatar name="Богдан" />
        </>,
      );
      break;
    case "Surface":
      demo = (
        <U.Surface border>
          <U.Text>Общая поверхность</U.Text>
          <U.Text as="p" variant="muted">
            Материал отделён от содержимого и расположения.
          </U.Text>
        </U.Surface>
      );
      break;
    case "Card":
      demo = (
        <U.Card
          title="Память / хранилище"
          description="Общая карточка с содержимым"
          icon="database"
          border
        >
          <U.ProgressBar value={35} />
        </U.Card>
      );
      break;
    case "Dialog":
      demo = (
        <>
          <U.Button onClick={() => setOpen(true)} icon="grid">
            Открыть диалог
          </U.Button>
          <U.Dialog
            open={open}
            onOpenChange={setOpen}
            title="Сохранить настройки?"
            description="Общий React-диалог. Escape закрывает окно и возвращает фокус."
            onConfirm={() => alert("Настройки сохранены")}
          />
        </>
      );
      break;
    case "DialogHeader":
      demo = (
        <U.DialogHeader>
          <h2>Настройки</h2>
          <U.IconButton
            label="Закрыть"
            icon="close"
            variant="ghost"
            onClick={() => alert()}
          />
        </U.DialogHeader>
      );
      break;
    case "DialogBody":
      demo = (
        <U.DialogBody>
          <U.Field label="Имя пользователя">
            <U.TextField value={text} onValueChange={setText} />
          </U.Field>
        </U.DialogBody>
      );
      break;
    case "DialogActions":
      demo = (
        <U.DialogActions>
          <U.Button onClick={() => alert("Отмена")}>Отмена</U.Button>
          <U.Button variant="primary" onClick={() => alert("Сохранено")}>
            Сохранить
          </U.Button>
        </U.DialogActions>
      );
      break;
    case "PageHeader":
      demo = (
        <U.PageHeader
          eyebrow="Результат исполнения"
          title="Анализ исполнения"
          description="Общие шапки, материалы и действия"
          icon="wave"
          actions={
            <U.Button icon="close" onClick={() => alert()}>
              Закрыть
            </U.Button>
          }
        />
      );
      break;
    case "SectionHeader":
      demo = (
        <U.SectionHeader
          title="Аудиоустройства"
          description="Параметры ввода и вывода"
          icon="audio"
        />
      );
      break;
    case "Toolbar":
      demo = (
        <U.Toolbar>
          <U.ButtonGroup>
            <U.ToggleButton icon="cursor" label="Выделение" defaultChecked />
            <U.IconButton icon="pencil" label="Карандаш" />
            <U.IconButton icon="eraser" label="Ластик" />
          </U.ButtonGroup>
          <U.Divider vertical />
          <U.Select options={["C#4", "D4", "E4"]} label="Тональность" />
          <U.Button
            icon="save"
            variant="primary"
            onClick={() => alert("Сохранено")}
          >
            Сохранить
          </U.Button>
        </U.Toolbar>
      );
      break;
    case "ScrollArea":
      demo = (
        <U.ScrollArea height={170} label="Пример прокрутки">
          {Array.from({ length: 12 }, (_, i) => (
            <div className="scroll-row" key={i}>
              <span>Запись {i + 1}</span>
              <U.Badge tone="success">Готово</U.Badge>
            </div>
          ))}
        </U.ScrollArea>
      );
      break;
    case "Divider":
      demo = (
        <>
          <U.Text>Горизонтальный</U.Text>
          <U.Divider />
          {row(
            <>
              <U.Text>Слева</U.Text>
              <U.Divider vertical />
              <U.Text>Справа</U.Text>
            </>,
          )}
        </>
      );
      break;
    case "Text":
      demo = (
        <div className="typography-sample">
          <U.Text as="h2" variant="title">
            Заголовок
          </U.Text>
          <U.Text>Основной текст интерфейса</U.Text>
          <U.Text variant="muted">Описание и вспомогательные подписи</U.Text>
          <U.Text variant="eyebrow">A&D VOICE</U.Text>
        </div>
      );
      break;
    case "Button":
      demo = row(
        <>
          <U.Button
            variant="primary"
            icon="save"
            onClick={() => alert("Сохранено")}
          >
            Сохранить
          </U.Button>
          <U.Button>Отмена</U.Button>
          <U.Button variant="ghost">Подробнее</U.Button>
          <U.Button variant="danger">Удалить</U.Button>
          <U.Button disabled>Недоступно</U.Button>
          <U.Button loading>Загрузка</U.Button>
        </>,
      );
      break;
    case "IconButton":
      demo = row(
        <>
          {["folder", "trash", "sliders", "more"].map((icon) => (
            <U.IconButton
              key={icon}
              icon={icon}
              label={icon}
              onClick={() => alert(icon)}
            />
          ))}
          <U.IconButton
            icon="play"
            label="Воспроизвести"
            round
            variant="primary"
          />
        </>,
      );
      break;
    case "ToggleButton":
      demo = row(
        <>
          <U.ToggleButton
            checked={checked}
            onValueChange={setChecked}
            icon="volume"
            label="Выключить звук"
          />
          <U.ToggleButton icon="wave">Прослушивание</U.ToggleButton>
          <U.Text variant="muted">Выбрано: {String(checked)}</U.Text>
        </>,
      );
      break;
    case "ButtonGroup":
      demo = (
        <U.ButtonGroup>
          <U.Button icon="copy">Копировать</U.Button>
          <U.Button icon="download">Экспорт</U.Button>
          <U.IconButton icon="refresh" label="Обновить" />
        </U.ButtonGroup>
      );
      break;
    case "SplitButton":
      demo = (
        <U.SplitButton
          icon="save"
          items={items}
          onClick={() => alert("Сохранено")}
        >
          Сохранить
        </U.SplitButton>
      );
      break;
    case "Tabs":
      demo = (
        <>
          <U.Tabs
            value={choice}
            onValueChange={setChoice}
            items={[
              {
                value: "one",
                label: "Внешний вид",
                icon: "palette",
                id: "demo-tab-one",
                panelId: "demo-panel",
              },
              {
                value: "two",
                label: "Аудио",
                icon: "audio",
                id: "demo-tab-two",
                panelId: "demo-panel",
              },
              {
                value: "three",
                label: "Ключи ENV",
                icon: "key",
                id: "demo-tab-three",
                panelId: "demo-panel",
              },
            ]}
          />
          <U.TabPanel id="demo-panel" labelledBy={`demo-tab-${choice}`}>
            Выбрана вкладка: {choice}
          </U.TabPanel>
        </>
      );
      break;
    case "Tab":
      demo = (
        <div role="tablist" style={{ maxWidth: 260 }}>
          <U.Tab selected icon="audio">
            Аудио
          </U.Tab>
        </div>
      );
      break;
    case "TabPanel":
      demo = (
        <U.TabPanel>
          <U.Text>Содержимое выбранной вкладки</U.Text>
        </U.TabPanel>
      );
      break;
    case "SegmentedControl":
      demo = <U.SegmentedControl />;
      break;
    case "Popover":
      demo = (
        <>
          <U.Button
            ref={anchor}
            icon="sliders"
            onClick={() => setOpen((v) => !v)}
          >
            Открыть параметры
          </U.Button>
          <U.Popover
            open={open}
            onOpenChange={setOpen}
            anchorRef={anchor}
            label="Громкость"
          >
            <U.VolumeControl value={value} onValueChange={setValue} />
          </U.Popover>
        </>
      );
      break;
    case "Menu":
      demo = (
        <>
          <U.Button
            ref={anchor}
            icon="more"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Открыть меню
          </U.Button>
          <U.Menu
            open={open}
            onOpenChange={setOpen}
            anchorRef={anchor}
            items={items}
          />
        </>
      );
      break;
    case "MenuItem":
      demo = (
        <div role="menu">
          <U.MenuItem
            label="Переименовать"
            icon="pencil"
            onSelect={() => alert("Переименовать")}
          />
          <U.MenuItem
            label="Удалить"
            icon="trash"
            danger
            onSelect={() => alert("Удалить")}
          />
        </div>
      );
      break;
    case "Field":
      demo = (
        <U.Field
          label="Имя в комнате"
          required
          description="Его увидят другие участники."
          info="Имя отображается в списке участников"
        >
          <U.TextField value={text} onValueChange={setText} />
        </U.Field>
      );
      break;
    case "TextField":
      demo = (
        <>
          <U.TextField
            value={text}
            onValueChange={setText}
            clearable
            icon="user"
            label="Имя"
          />
          <U.TextField placeholder="Пустое поле" />
          <U.Field label="Ошибка" error="Проверьте введённое значение">
            <U.TextField defaultValue="Неверный код" />
          </U.Field>
        </>
      );
      break;
    case "NumberField":
      demo = (
        <U.NumberField label="Порт" defaultValue={8081} min={1} max={65535} />
      );
      break;
    case "Select":
      demo = (
        <U.Select
          label="Драйвер"
          options={["WASAPI Shared", "WASAPI Exclusive", "ASIO"]}
        />
      );
      break;
    case "Switch":
      demo = row(
        <>
          <U.Switch
            checked={checked}
            onValueChange={setChecked}
            label="Мониторинг входа"
          />
          <U.Switch label="Недоступно" disabled />
        </>,
      );
      break;
    case "Checkbox":
      demo = row(
        <>
          <U.Checkbox
            checked={checked}
            onValueChange={setChecked}
            label="Включить параметр"
          />
          <U.Checkbox label="Выключенный" />
        </>,
      );
      break;
    case "Slider":
      demo = (
        <>
          <U.Slider value={value} onValueChange={setValue} label="Громкость" />
          <U.Text>{value}%</U.Text>
        </>
      );
      break;
    case "PathField":
      demo = (
        <U.PathField defaultValue="Папка данных приложения" label="Файл" />
      );
      break;
    case "CopyableField":
      demo = (
        <U.CopyableField defaultValue="AD-DEMO-ROOM-2026" label="Код комнаты" />
      );
      break;
    case "FilePicker":
      demo = (
        <U.FilePicker
          label="Добавить запись"
          accept="audio/*"
          multiple
          onFiles={(files) => alert(`Выбрано файлов: ${files.length}`)}
        />
      );
      break;
    case "Badge":
      demo = row(
        <>
          <U.Badge>GPU</U.Badge>
          <U.Badge>Вы</U.Badge>
          <U.Badge tone="success">Готово</U.Badge>
          <U.Badge tone="error">Ошибка</U.Badge>
        </>,
      );
      break;
    case "StatusIndicator":
      demo = row(
        <>
          {(
            ["success", "processing", "pending", "error", "offline"] as const
          ).map((status) => (
            <U.StatusIndicator key={status} status={status} />
          ))}
        </>,
      );
      break;
    case "ProgressBar":
      demo = (
        <>
          <U.ProgressBar value={value} />
          <U.Slider
            value={value}
            onValueChange={setValue}
            label="Значение прогресса"
          />
          <U.Text>{value}%</U.Text>
        </>
      );
      break;
    case "Steps":
      demo = <U.Steps current={3} />;
      break;
    case "MessageBar":
      demo = (
        <>
          <U.MessageBar tone="error">
            Недостаточно свободного места
          </U.MessageBar>
          <U.MessageBar tone="success">Все параметры сохранены</U.MessageBar>
        </>
      );
      break;
    case "Toast":
      demo = (
        <>
          <U.Toast message="Настройки сохранены" />
          <U.Button onClick={() => alert("Всплывающее уведомление")}>
            Показать уведомление
          </U.Button>
        </>
      );
      break;
    case "EmptyState":
      demo = (
        <U.EmptyState
          action={
            <U.Button variant="primary" icon="plus" onClick={() => alert()}>
              Добавить запись
            </U.Button>
          }
        />
      );
      break;
    case "MetricCard":
      demo = <U.MetricCard value={49} title="Высота" />;
      break;
    case "KeyValueList":
      demo = <U.KeyValueList />;
      break;
    case "DataTable":
      demo = <U.DataTable />;
      break;
    case "CollapsibleSection":
      demo = (
        <U.CollapsibleSection>
          <U.CodeViewer />
        </U.CollapsibleSection>
      );
      break;
    case "CodeViewer":
      demo = <U.CodeViewer />;
      break;
    case "AnimatedBorder":
      demo = (
        <U.AnimatedBorder>
          <U.Text>Та же неоновая обводка, что в экранах</U.Text>
        </U.AnimatedBorder>
      );
      break;
    case "WaveDecoration":
      demo = <U.WaveDecoration style={{ height: 150 }} />;
      break;
    case "ParticleLayer":
      demo = <U.ParticleLayer style={{ height: 150 }} />;
      break;
    case "SceneIllustration":
      demo = row(
        <>
          {(["planet", "mountains", "server", "database"] as const).map(
            (variant) => (
              <U.SceneIllustration key={variant} variant={variant} />
            ),
          )}
        </>,
      );
      break;
    case "ArtworkFrame":
      demo = row(
        <>
          <U.ArtworkFrame variant="planet" />
          <U.ArtworkFrame variant="city" />
          <U.ArtworkFrame variant="silk" />
        </>,
      );
      break;
    case "BrandMark":
      demo = <U.BrandMark />;
      break;
    case "Waveform":
      demo = <U.Waveform position={value} duration={231} onSeek={setValue} />;
      break;
    case "AudioPlayer":
      demo = (
        <>
          <U.AudioPlayer duration={51} />
          <span className="sample-note">
            Без src проигрывается только демонстрационная шкала времени.
          </span>
        </>
      );
      break;
    case "TransportBar":
      demo = <U.TransportBar />;
      break;
    case "VolumeControl":
      demo = <U.VolumeControl value={value} onValueChange={setValue} />;
      break;
    case "LevelMeter":
      demo = (
        <>
          <U.LevelMeter value={value} />
          <U.Slider
            value={value}
            onValueChange={setValue}
            label="Уровень сигнала"
          />
        </>
      );
      break;
    case "CircularGauge":
      demo = row(
        <>
          <U.CircularGauge value={72} label="Микрофон" icon="mic" />
          <U.CircularGauge value={0} label="Шум" icon="wave" />
        </>,
      );
      break;
    case "RotaryKnob":
      demo = (
        <>
          <div className="sample-row sample-knob-row">
            <U.RotaryKnob
              diameter={180}
              value={value}
              onValueChange={setValue}
              onValueCommit={(v) => setNotice(`Громкость: ${v}%`)}
              label="Громкость"
              icon="volume"
            />
          </div>
          <span className="sample-note">
            RotaryKnob использует тот же визуальный язык, что CircularGauge, но
            является интерактивным: drag по кругу, колесо, клавиатура и двойной
            клик для сброса.
          </span>
        </>
      );
      break;
    case "Sparkline":
      demo = <U.Sparkline />;
      break;
    case "LatencyIndicator":
      demo = <U.LatencyIndicator value={68} />;
      break;
    case "PianoKeyboard":
      demo = <U.PianoKeyboard onNote={(n) => alert(`MIDI ${n}`)} />;
      break;
    case "TimeRuler":
      demo = <U.TimeRuler onSeek={(beat) => alert(`Позиция: ${beat}`)} />;
      break;
    case "PianoRollGrid":
      demo = <U.PianoRollGrid />;
      break;
    case "NoteBlock":
      demo = (
        <>
          <div className="sample-note-world">
            <U.NoteBlock value={note} onChange={setNote} />
          </div>
          <span className="sample-note">
            Перетаскивайте ноту и её правый край. Стрелки тоже работают.
          </span>
        </>
      );
      break;
    case "LyricsLane":
      demo = <U.LyricsLane />;
      break;
    case "Playhead":
      demo = (
        <div className="sample-note-world">
          <U.Playhead x={85} />
        </div>
      );
      break;
    case "SelectionOverlay":
      demo = (
        <div className="sample-note-world">
          <U.SelectionOverlay />
        </div>
      );
      break;
    case "ZoomControl":
      demo = <U.ZoomControl />;
      break;
    case "UndoRedoControls":
      demo = row(
        <>
          <U.Button
            onClick={() => {
              setHistory([
                ...history.slice(0, cursor + 1),
                history[cursor] + 1,
              ]);
              setCursor(cursor + 1);
            }}
          >
            Изменить
          </U.Button>
          <strong>{history[cursor]}</strong>
          <U.UndoRedoControls
            canUndo={cursor > 0}
            canRedo={cursor < history.length - 1}
            onUndo={() => setCursor((c) => c - 1)}
            onRedo={() => setCursor((c) => c + 1)}
          />
        </>,
      );
      break;
    case "RecordingCard":
      demo = <U.RecordingCard />;
      break;
    case "ProcessingTaskCard":
      demo = <U.ProcessingTaskCard />;
      break;
    case "ParticipantCard":
      demo = <U.ParticipantCard />;
      break;
    case "RoleEmblem":
      demo = row(
        <>
          <U.RoleEmblem />
          <U.RoleEmblem role="guest" />
        </>,
      );
      break;
    case "ProfileCard":
      demo = <U.ProfileCard />;
      break;
    case "ThemePicker":
      demo = <U.ThemePicker />;
      break;
    case "RoomConnectionForm":
      demo = (
        <U.RoomConnectionForm
          onSubmit={() => alert("Форма готова. Сервер не подключён.")}
        />
      );
      break;
    case "ModelStatusCard":
      demo = <U.ModelStatusCard />;
      break;
    case "StorageSummary":
      demo = (
        <U.StorageSummary
          onTemporaryFiles={() => alert("Временных файлов нет")}
        />
      );
      break;
    case "DiagnosticsPanel":
      demo = (
        <U.DiagnosticsPanel
          onRefresh={() => alert("Демо-состояния обновлены")}
        />
      );
      break;
    case "PerformanceSummary":
      demo = <U.PerformanceSummary />;
      break;
    default:
      throw new Error(`Отсутствует пример ${name}`);
  }
  return (
    <>
      {demo}
      <U.Toast
        floating
        open={!!notice}
        message={notice}
        onClose={() => setNotice("")}
      />
    </>
  );
}
