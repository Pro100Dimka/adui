import { useEffect, useState } from "react";
import type { ThemeName } from "@ad-voice/ui";

/** How the reader colours the site: from two colours, or token by token. */
export type ColorMode = "pair" | "all";

export interface SiteSettings {
  theme: ThemeName;
  mode: ColorMode;
  primary?: string;
  secondary?: string;
  /** Per-token overrides, used in the "all" mode. */
  tokens: Record<string, string>;
  font: keyof typeof fonts;
  /** Text and spacing scale, 1 = 100 %. */
  scale: number;
}

export const fonts = {
  default: { label: "Segoe UI (по умолчанию)", stack: "" },
  system: { label: "Системный", stack: "system-ui, sans-serif" },
  humanist: {
    label: "Гуманистический",
    stack: '"Trebuchet MS", "Segoe UI", sans-serif',
  },
  serif: { label: "С засечками", stack: 'Georgia, "Times New Roman", serif' },
  mono: { label: "Моноширинный", stack: "var(--ad-font-family-mono)" },
};

/** Every palette token the "all colours" mode lets the reader change, grouped. */
export const tokenGroups: Array<[string, Array<[string, string]>]> = [
  [
    "Основные",
    [
      ["primary", "Primary"],
      ["secondary", "Secondary"],
    ],
  ],
  [
    "Шкала primary",
    [
      ["primary-600", "600"],
      ["primary-700", "700"],
      ["primary-800", "800"],
      ["primary-900", "900"],
    ],
  ],
  [
    "Шкала secondary",
    [
      ["secondary-200", "200"],
      ["secondary-100", "100"],
      ["secondary-50", "50"],
    ],
  ],
  [
    "Нейтральные",
    [
      ["neutral-200", "200"],
      ["neutral-300", "300"],
      ["neutral-400", "400"],
      ["neutral-500", "500"],
      ["neutral-600", "600"],
      ["neutral-700", "700"],
      ["neutral-800", "800"],
      ["neutral-850", "850"],
      ["neutral-900", "900"],
      ["neutral-950", "950"],
    ],
  ],
  [
    "Текст и статусы",
    [
      ["text", "Текст"],
      ["muted", "Приглушённый"],
      ["success", "Успех"],
      ["warning", "Внимание"],
      ["info", "Инфо"],
    ],
  ],
];

const KEY = "neo-ui-site-settings";
export const defaultSettings: SiteSettings = {
  theme: "ruby",
  mode: "pair",
  tokens: {},
  font: "default",
  scale: 1,
};

function load(): SiteSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return saved ? { ...defaultSettings, ...saved } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

/** The reader's own site settings: they live in this browser only. */
export function useSiteSettings() {
  const [settings, setSettings] = useState(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // Private mode or blocked storage: the settings still apply for this visit.
    }
    document.documentElement.style.fontSize =
      settings.scale === 1 ? "" : `${settings.scale * 100}%`;
  }, [settings]);
  const update = (patch: Partial<SiteSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));
  return [settings, update, () => setSettings(defaultSettings)] as const;
}

/** Tokens to hand to ThemeProvider for the current settings. */
export function themeTokens(settings: SiteSettings) {
  const stack = fonts[settings.font].stack;
  return {
    ...(settings.mode === "all" ? settings.tokens : {}),
    ...(stack ? { "font-family-sans": stack } : {}),
  };
}

/** The colour a token resolves to inside `scope`, as #rrggbb for a colour input. */
export function resolveToken(scope: Element, token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(--ad-${token})`;
  scope.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "#000000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
