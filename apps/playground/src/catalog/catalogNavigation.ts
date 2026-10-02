import type { CatalogMeta } from "./componentRegistry";

export interface CatalogCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  matches: (item: CatalogMeta) => boolean;
}

const names = (...values: string[]) => new Set(values);
const buttons = names(
  "Button",
  "IconButton",
  "ToggleButton",
  "SplitButton",
  "ButtonGroup",
);
const nav = names(
  "Router",
  "Link",
  "Tabs",
  "Tab",
  "TabPanel",
  "SegmentedControl",
  "Menu",
  "MenuItem",
  "Popover",
);
const typography = names(
  "Typography",
  "Text",
  "Icon",
  "Avatar",
  "BrandMark",
  "ThemeProvider",
);

export const catalogCategories: CatalogCategory[] = [
  {
    id: "fields",
    label: "Поля и ввод",
    description: "InputBase, текстовые поля, выбор, файлы и контролы значений.",
    icon: "edit",
    matches: (item) => item.category === "forms",
  },
  {
    id: "buttons",
    label: "Кнопки и действия",
    description: "Действия, toggle, split и grouped controls.",
    icon: "cursor",
    matches: (item) => buttons.has(item.name),
  },
  {
    id: "navigation",
    label: "Навигация",
    description: "Tabs, segmented controls, menu и popover.",
    icon: "menu",
    matches: (item) => nav.has(item.name),
  },
  {
    id: "layout",
    label: "Layout и поверхности",
    description: "Раскладка, поверхности, заголовки, диалоги и прокрутка.",
    icon: "grid",
    matches: (item) =>
      item.category === "layout" &&
      !typography.has(item.name) &&
      !nav.has(item.name),
  },
  {
    id: "typography",
    label: "Типографика и тема",
    description: "Текст, иконки, идентика и ThemeProvider.",
    icon: "text",
    matches: (item) =>
      typography.has(item.name) ||
      item.category === "typography" ||
      item.category === "foundation",
  },
  {
    id: "feedback",
    label: "Состояния и feedback",
    description: "Статусы, сообщения, прогресс, таблицы и empty states.",
    icon: "info",
    matches: (item) => item.category === "data",
  },
  {
    id: "audio",
    label: "Audio и media",
    description: "Аудио-контролы и визуализация сигнала.",
    icon: "audio",
    matches: (item) => item.category === "audio",
  },
  {
    id: "editor",
    label: "Редактор мелодии",
    description: "Интегрированные компоненты piano-roll редактора.",
    icon: "pencil",
    matches: (item) => item.category === "editor",
  },
  {
    id: "composites",
    label: "Композиции",
    description: "Редкие reusable-композиции с собственной логикой.",
    icon: "layers",
    matches: (item) => item.category === "patterns",
  },
  {
    id: "motion",
    label: "Эффекты и motion",
    description: "AnimatedBorder и независимые визуальные эффекты.",
    icon: "sparkles",
    matches: (item) => item.category === "effects",
  },
];

export const getCategoryForItem = (item: CatalogMeta) =>
  catalogCategories.find((category) => category.matches(item));
export const getCategoryById = (id?: string) =>
  catalogCategories.find((category) => category.id === id);
