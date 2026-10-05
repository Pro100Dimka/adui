import { useEffect, useState } from "react";
import { defaultThemeConfig, themeProps, type ThemeConfig, type ThemeName } from "@ad-voice/ui";

export interface SiteSettings {
  /** The site's theme, edited with the library's ThemeEditor. */
  themeConfig: ThemeConfig;
  font: keyof typeof fonts;
  /** Language of the site and of the library's texts. */
  locale: "ru" | "en" | "uk";
  /** Colour scheme of the entire documentation site. */
  appearance: "light" | "dark";
  /** Face of the titles. */
  headingFont: keyof typeof headingFonts;
  /** Text and spacing scale, 1 = 100 %. */
  scale: number;
}

/** Faces available for titles. */
export const headingFonts = {
  default: { label: "Как основной текст", stack: "" },
  melodix: { label: "Melodix — музыкальный", stack: "var(--ad-font-family-melodix)" },
  serif: { label: "С засечками", stack: 'Georgia, "Times New Roman", serif' },
};

export const fonts = {
  default: { label: "Segoe UI (по умолчанию)", stack: "" },
  melodix: { label: "Melodix — музыкальный", stack: "var(--ad-font-family-melodix)" },
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
  headingFont: "default",
  locale: "uk",
  appearance: "dark",
  scale: 1,
};

const lightAppearanceTokens = {
  "neutral-950": "oklch(from var(--ad-primary) 0.98 0.006 h)",
  "neutral-900": "oklch(from var(--ad-primary) 0.965 0.008 h)",
  "neutral-850": "oklch(from var(--ad-primary) 0.94 0.01 h)",
  "neutral-800": "oklch(from var(--ad-primary) 0.9 0.012 h)",
  "neutral-700": "oklch(from var(--ad-primary) 0.82 0.014 h)",
  "neutral-600": "oklch(from var(--ad-primary) 0.7 0.016 h)",
  "neutral-500": "oklch(from var(--ad-primary) 0.58 0.018 h)",
  "neutral-400": "oklch(from var(--ad-primary) 0.46 0.02 h)",
  "neutral-300": "oklch(from var(--ad-primary) 0.34 0.018 h)",
  "neutral-200": "oklch(from var(--ad-primary) 0.22 0.014 h)",
  text: "#211b1f",
  muted: "#6f6269",
};

export function siteAppearanceTokens(appearance: SiteSettings["appearance"]) {
  return appearance === "light" ? lightAppearanceTokens : {};
}

/** Settings saved before the theme editor (theme, mode, colours, tokens) become a theme config. */
function migrate(saved: Record<string, unknown>): SiteSettings {
  if (saved.themeConfig) {
    const next = { ...defaultSettings, ...(saved as Partial<SiteSettings>) };
    if (!(next.font in fonts)) next.font = "default";
    if (!(next.headingFont in headingFonts)) next.headingFont = "default";
    return next;
  }
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
  const heading = headingFonts[settings.headingFont].stack;
  return {
    ...props,
    tokens: {
      ...props.tokens,
      ...siteAppearanceTokens(settings.appearance),
      ...(stack ? { "font-family-sans": stack } : {}),
      ...(heading ? { "font-family-heading": heading } : {}),
    },
  };
}
