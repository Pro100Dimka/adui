import type { CatalogMeta } from "./componentRegistry";

export interface CatalogGroupDefinition {
  id: string;
  label: string;
  description?: string;
  matches: (item: CatalogMeta) => boolean;
}

export interface CatalogPageDefinition {
  id: string;
  label: string;
  description: string;
  matches: (item: CatalogMeta) => boolean;
  groups?: CatalogGroupDefinition[];
}

const names = (...values: string[]) => new Set(values);
const matchNames = (...values: string[]) => {
  const set = names(...values);
  return (item: CatalogMeta) => set.has(item.name);
};

const buttons = names("Button", "IconButton", "ToggleButton", "SplitButton", "ButtonGroup");
const nav = names("Tabs", "Tab", "TabPanel", "SegmentedControl", "Menu", "MenuItem", "Popover");
const typography = names("Typography", "Text", "Icon", "Avatar", "BrandMark", "ThemeProvider");

export const catalogPages: CatalogPageDefinition[] = [
  {
    id: "fields",
    label: "Поля и ввод",
    description: "Базовые поля собраны семьями: текст, выбор, файлы, переключатели и диапазоны.",
    matches: item => item.category === "forms",
    groups: [
      { id: "text", label: "Текст и значения", description: "Основные поля ввода рядом, без отдельной строки на каждый пример.", matches: matchNames("Field", "TextField", "NumberField", "TextArea", "Autocomplete") },
      { id: "choice", label: "Выбор и файлы", matches: matchNames("Select", "FilePicker", "ThemePicker") },
      { id: "boolean", label: "Переключатели и диапазоны", matches: matchNames("Switch", "Checkbox", "Slider") }
    ]
  },
  {
    id: "buttons",
    label: "Кнопки и действия",
    description: "Одна система действий: обычные, иконки, toggle, split и группировка.",
    matches: item => buttons.has(item.name),
    groups: [
      { id: "actions", label: "Основные действия", matches: matchNames("Button", "IconButton", "ToggleButton", "SplitButton") },
      { id: "groups", label: "Группировка", matches: matchNames("ButtonGroup") }
    ]
  },
  {
    id: "navigation",
    label: "Навигация",
    description: "Tabs, segmented controls, menu и popover.",
    matches: item => nav.has(item.name),
    groups: [
      { id: "tabs", label: "Переключение разделов", matches: matchNames("Tabs", "Tab", "TabPanel", "SegmentedControl") },
      { id: "menus", label: "Меню и всплывающие элементы", matches: matchNames("Menu", "MenuItem", "Popover") }
    ]
  },
  {
    id: "layout",
    label: "Layout и поверхности",
    description: "Структура страниц, поверхности, заголовки, диалоги и прокрутка.",
    matches: item => item.category === "layout" && !typography.has(item.name) && !nav.has(item.name),
    groups: [
      { id: "layout", label: "Раскладка", matches: matchNames("Stack", "Grid", "Divider", "ScrollArea") },
      { id: "surfaces", label: "Поверхности и структура", matches: matchNames("Card", "Header", "Toolbar") },
      { id: "dialogs", label: "Диалоги", matches: matchNames("Dialog", "DialogBody", "DialogActions") },
      { id: "visual", label: "Визуальные контейнеры", matches: matchNames("Illustration") }
    ]
  },
  {
    id: "typography",
    label: "Типографика, иконки и тема",
    description: "Текстовая система, иконки, avatar, brand и интерактивная настройка темы.",
    matches: item => typography.has(item.name) || item.category === "typography" || item.category === "foundation",
    groups: [
      { id: "text", label: "Текст", matches: matchNames("Typography", "Text") },
      { id: "visual", label: "Иконки и идентика", matches: matchNames("Icon", "Avatar", "BrandMark") },
      { id: "theme", label: "Тема", matches: matchNames("ThemeProvider") }
    ]
  },
  {
    id: "feedback",
    label: "Состояния и feedback",
    description: "Статусы, прогресс, сообщения, toast, таблицы и пустые состояния.",
    matches: item => item.category === "data",
    groups: [
      { id: "status", label: "Статусы и прогресс", matches: matchNames("Badge", "StatusIndicator", "ProgressBar", "Steps") },
      { id: "messages", label: "Сообщения", matches: matchNames("MessageBar", "Toast", "EmptyState") },
      { id: "data", label: "Данные", matches: matchNames("KeyValueList", "DataTable", "CollapsibleSection") }
    ]
  },
  {
    id: "audio",
    label: "Audio и media",
    description: "Аудио-контролы и визуализация сигнала.",
    matches: item => item.category === "audio",
    groups: [
      { id: "controls", label: "Управление", matches: matchNames("RotaryKnob", "AudioPlayer") },
      { id: "visual", label: "Визуализация", matches: matchNames("Waveform", "LevelMeter", "Sparkline") }
    ]
  },
  {
    id: "editor",
    label: "Редактор мелодии",
    description: "Один интегрированный PianoRollGrid вместо набора внутренних деталей.",
    matches: item => item.category === "editor"
  },
  {
    id: "composites",
    label: "Редкие композиции",
    description: "Только действительно специфичные reusable-композиции.",
    matches: item => item.category === "patterns"
  },
  {
    id: "motion",
    label: "Эффекты и motion",
    description: "Декоративные эффекты, которые можно применять независимо от Card и других поверхностей.",
    matches: item => item.category === "effects",
    groups: [
      { id: "border", label: "Обводки", matches: matchNames("AnimatedBorder") },
      { id: "decor", label: "Декоративные эффекты", matches: matchNames("WaveDecoration") }
    ]
  }
];

export const getCatalogPage = (id?: string) => catalogPages.find(page => page.id === id);
