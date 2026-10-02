import { catalog, type CatalogMeta } from "./componentRegistry";

/** `id` matches the `category` field of each component's meta.ts. */
export const catalogCategories = [
  {
    id: "fields",
    label: "Поля и ввод",
    description: "InputBase, текстовые поля, выбор, файлы и контролы значений.",
    icon: "sliders",
  },
  {
    id: "buttons",
    label: "Кнопки и действия",
    description: "Действия, toggle, split и grouped controls.",
    icon: "cursor",
  },
  {
    id: "navigation",
    label: "Навигация",
    description: "Tabs, segmented controls, menu и popover.",
    icon: "list",
  },
  {
    id: "layout",
    label: "Layout и поверхности",
    description: "Раскладка, поверхности, заголовки, диалоги и прокрутка.",
    icon: "grid",
  },
  {
    id: "typography",
    label: "Типографика и тема",
    description: "Текст, иконки, идентика и ThemeProvider.",
    icon: "document",
  },
  {
    id: "feedback",
    label: "Состояния и feedback",
    description: "Статусы, сообщения, прогресс, таблицы и empty states.",
    icon: "info",
  },
  {
    id: "audio",
    label: "Audio и media",
    description: "Аудио-контролы и визуализация сигнала.",
    icon: "audio",
  },
  {
    id: "editor",
    label: "Редактор мелодии",
    description: "Интегрированные компоненты piano-roll редактора.",
    icon: "pencil",
  },
  {
    id: "composites",
    label: "Композиции",
    description: "Редкие reusable-композиции с собственной логикой.",
    icon: "cube",
  },
  {
    id: "motion",
    label: "Эффекты и motion",
    description: "AnimatedBorder и независимые визуальные эффекты.",
    icon: "sparkle",
  },
].map((category) => ({
  ...category,
  items: catalog.filter((item) => item.category === category.id),
}));

export type CatalogCategory = (typeof catalogCategories)[number];

export const getCategoryForItem = (item: CatalogMeta) =>
  catalogCategories.find((category) => category.id === item.category);
