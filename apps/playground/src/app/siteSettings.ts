import { useEffect, useState } from "react";
import { defaultThemeConfig, themeProps, type ThemeConfig, type ThemeName } from "@ad-voice/ui";

export interface SiteSettings {
  /** The site's theme, edited with the library's ThemeEditor. */
  themeConfig: ThemeConfig;
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

const KEY = "neo-ui-site-settings";
export const defaultSettings: SiteSettings = {
  themeConfig: defaultThemeConfig,
  font: "default",
  scale: 1,
};

/** Settings saved before the theme editor (theme, mode, colours, tokens) become a theme config. */
function migrate(saved: Record<string, unknown>): SiteSettings {
  if (saved.themeConfig) return { ...defaultSettings, ...(saved as Partial<SiteSettings>) };
  const themeConfig: ThemeConfig = {
    version: 1,
    mode: saved.mode === "all" ? "advanced" : "simple",
    theme: (saved.theme as ThemeName) ?? "ruby",
    primary: saved.primary as string | undefined,
    secondary: saved.secondary as string | undefined,
    tokens: (saved.tokens as Record<string, string>) ?? {},
  };
  return { ...defaultSettings, font: (saved.font as SiteSettings["font"]) ?? "default", scale: (saved.scale as number) ?? 1, themeConfig };
}

function load(): SiteSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return saved ? migrate(saved) : defaultSettings;
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

/** Everything ThemeProvider needs for the current settings: the theme plus the chosen typeface. */
export function siteThemeProps(settings: SiteSettings) {
  const props = themeProps(settings.themeConfig);
  const stack = fonts[settings.font].stack;
  return { ...props, tokens: { ...props.tokens, ...(stack ? { "font-family-sans": stack } : {}) } };
}
