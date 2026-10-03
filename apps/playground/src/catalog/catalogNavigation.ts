import { catalog, type CatalogMeta } from "./componentRegistry";

/**
 * `id` matches the `category` field of each component's meta.ts. Ordered from the base up:
 * theme and type first, then layout, controls, feedback, and the specialised parts last.
 */
export const catalogCategories = [
  {
    id: "typography",
    label: "Основы и тема",
    description:
      "Тема и палитра, типографика, иконки и идентика — то, на чём стоит всё остальное.",
    icon: "palette",
  },
  {
    id: "layout",
    label: "Раскладка и поверхности",
    description: "Раскладка, поверхности, заголовки, диалоги и прокрутка.",
    icon: "grid",
  },
  {
    id: "buttons",
    label: "Кнопки и действия",
    description: "Действия, toggle, split и grouped controls.",
    icon: "cursor",
  },
  {
    id: "fields",
    label: "Поля и ввод",
    description: "InputBase, текстовые поля, выбор, файлы и контролы значений.",
    icon: "sliders",
  },
  {
    id: "navigation",
    label: "Навигация",
    description: "Tabs, segmented controls, menu и popover.",
    icon: "list",
  },
  {
    id: "feedback",
    label: "Состояния и обратная связь",
    description: "Статусы, сообщения, прогресс, таблицы и empty states.",
    icon: "info",
  },
  {
    id: "audio",
    label: "Аудио и медиа",
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
    id: "motion",
    label: "Эффекты и арт",
    description:
      "Анимации, свет, неон, процедурные пейзажи, планеты, спектры и иллюстрации.",
    icon: "sparkle",
  },
].map((category) => ({
  ...category,
  items: catalog.filter((item) => item.category === category.id),
}));

export type CatalogCategory = (typeof catalogCategories)[number];

export const getCategoryForItem = (item: CatalogMeta) =>
  catalogCategories.find((category) => category.id === item.category);
