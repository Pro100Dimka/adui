import type { ReactNode } from "react";
export interface VectorNode {
  tag: string;
  props?: Record<string, unknown>;
  children?: Array<VectorNode | string>;
}
export type ScreenId =
  | "settings"
  | "join"
  | "room"
  | "room-full"
  | "analysis"
  | "performances"
  | "queue"
  | "editor";
export interface LayoutNode {
  tag?: string;
  component?: string | null;
  art?: string;
  props?: Record<string, unknown>;
  material?: string | null;
  children?: Array<LayoutNode | string>;
}
export interface ScreenDefinition {
  id: ScreenId;
  title: string;
  width: number;
  height: number;
  source: string;
  borderSelectors: string[];
  shellSelector: string;
  rules: Array<[string, string, string | null]>;
  tree: Array<LayoutNode | string>;
}
export interface ScreenHandle {
  host: HTMLElement;
  root: ShadowRoot;
  body: HTMLElement;
  definition: ScreenDefinition;
  errors: string[];
  active: boolean;
  disposed: boolean;
  width: number;
  height: number;
  api: Record<string, Record<string, (...args: unknown[]) => unknown>>;
  motion: {
    time: number;
    enabled: boolean;
    set: (value: boolean) => void;
    seek: (time: number) => void;
  };
  borders: Map<
    HTMLElement,
    { element: HTMLElement; overlay: SVGSVGElement; destroy: () => void }
  >;
  notify?: (message: string) => void;
  setActive: (active: boolean) => void;
  setMotion: (enabled: boolean) => void;
  resize: () => void;
  start: () => void;
  installBorders: () => void;
  dispose: () => void;
}
export interface Route {
  id: string;
  title: string;
  screen: ScreenId;
  tab?: string;
}
export const routes: Route[] = [
  {
    id: "appearance",
    title: "Внешний вид",
    screen: "settings",
    tab: "appearance",
  },
  { id: "audio", title: "Аудио", screen: "settings", tab: "audio" },
  { id: "ai", title: "AI / Обработка", screen: "settings", tab: "ai" },
  { id: "env", title: "Ключи ENV", screen: "settings", tab: "env" },
  {
    id: "advanced",
    title: "Дополнительно",
    screen: "settings",
    tab: "advanced",
  },
  { id: "join", title: "Подключение к комнате", screen: "join" },
  { id: "room", title: "Комната · компактная", screen: "room" },
  { id: "room-full", title: "Комната · полная", screen: "room-full" },
  { id: "analysis", title: "Анализ исполнения", screen: "analysis" },
  { id: "performances", title: "Выступления песни", screen: "performances" },
  { id: "queue", title: "Очередь обработки", screen: "queue" },
  { id: "editor", title: "Редактор мелодии", screen: "editor" },
];
