const e=`import { tr as defaultTr, translate, type Locale } from "../../../core/i18n";
import { themes, type ThemeName } from "../ThemeProvider/ThemeProvider";

/**
 * A whole theme as data, ready to save, share and load back. "simple": two colours, the rest is
 * calculated. "advanced": the same plus any token set by hand.
 */
export interface ThemeConfig {
  version: 1;
  mode: "simple" | "advanced";
  /** The built-in theme it starts from. */
  theme: ThemeName;
  primary?: string;
  /** Without it (or with \`autoSecondary\`) the secondary colour is calculated from the primary. */
  secondary?: string;
  autoSecondary?: boolean;
  /** Token overrides by name without the \`--ad-\` prefix, e.g. \`{ "radius": "0.5rem" }\`; advanced mode only. */
  tokens?: Record<string, string>;
}

export type ThemeTokenKind = "color" | "length" | "font" | "number" | "time" | "easing";
export interface ThemeTokenGroup {
  title: string;
  tokens: Array<{ name: string; label: string; kind: ThemeTokenKind }>;
}

const color = (name: string, label: string) => ({ name, label, kind: "color" as const });
const sized = (name: string, label: string, kind: ThemeTokenKind = "length") => ({ name, label, kind });

/** Every token the advanced mode can change, in groups. */
export const themeTokenGroups: ThemeTokenGroup[] = [
  { title: "Основные цвета", tokens: [color("primary", "Primary"), color("secondary", "Secondary")] },
  {
    title: "Шкала primary",
    tokens: [color("primary-600", "600"), color("primary-700", "700"), color("primary-800", "800"), color("primary-900", "900")],
  },
  { title: "Шкала secondary", tokens: [color("secondary-50", "50"), color("secondary-100", "100"), color("secondary-200", "200")] },
  {
    title: "Нейтральные",
    tokens: ["200", "300", "400", "500", "600", "700", "800", "850", "900", "950"].map((step) => color(\`neutral-\${step}\`, step)),
  },
  {
    title: "Текст и статусы",
    tokens: [
      color("text", "Текст"),
      color("muted", "Приглушённый"),
      color("pink", "Акцент"),
      color("success", "Успех"),
      color("warning", "Внимание"),
      color("info", "Инфо"),
      color("focus", "Фокус"),
    ],
  },
  {
    title: "Форма и размеры",
    tokens: [
      sized("radius", "Скругление"),
      sized("radius-sm", "Скругление малое"),
      sized("radius-lg", "Скругление большое"),
      sized("control-height", "Высота контролов"),
      sized("space-unit", "Шаг отступов"),
      sized("fluid-unit", "Единица геометрии"),
    ],
  },
  {
    title: "Шрифты",
    tokens: [sized("font-family-sans", "Основной", "font"), sized("font-family-mono", "Моноширинный", "font")],
  },
  {
    title: "Кегль",
    tokens: ["display", "h1", "h2", "h3", "title", "subtitle", "body", "body-sm", "label", "caption"].map((step) =>
      sized(\`font-size-\${step}\`, step),
    ),
  },
  {
    title: "Начертание и интерлиньяж",
    tokens: [
      sized("font-weight-regular", "Обычный", "number"),
      sized("font-weight-medium", "Средний", "number"),
      sized("font-weight-semibold", "Полужирный", "number"),
      sized("font-weight-bold", "Жирный", "number"),
      sized("line-height-display", "Интерлиньяж: дисплей", "number"),
      sized("line-height-heading", "Интерлиньяж: заголовки", "number"),
      sized("line-height-body", "Интерлиньяж: текст", "number"),
      sized("letter-spacing-heading", "Трекинг заголовков"),
      sized("letter-spacing-eyebrow", "Трекинг надзаголовков"),
    ],
  },
  {
    title: "Анимация",
    tokens: [
      sized("duration-fast", "Быстро", "time"),
      sized("duration-normal", "Обычно", "time"),
      sized("duration-slow", "Медленно", "time"),
      sized("ease-standard", "Кривая", "easing"),
      sized("ease-spring", "Пружина", "easing"),
    ],
  },
];

const knownTokens = new Set(themeTokenGroups.flatMap((group) => group.tokens.map((token) => token.name)));

/** A light companion for a primary colour: brighter, a little warmer — for highlights and glints. */
export function deriveSecondary(primary: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(primary.trim());
  if (!match) return themes.ruby[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1]!.slice(i, i + 2), 16));
  return \`#\${[r!, g!, b!].map((v) => Math.round(v + (255 - v) * 0.45).toString(16).padStart(2, "0")).join("")}\`;
}

export const defaultThemeConfig: ThemeConfig = { version: 1, mode: "simple", theme: "ruby", autoSecondary: true };

/** What to hand to ThemeProvider for a config: \`<ThemeProvider {...themeProps(config)}>\`. */
export function themeProps(config: ThemeConfig) {
  const primary = config.primary ?? themes[config.theme][0];
  const secondary =
    config.autoSecondary && config.primary ? deriveSecondary(primary) : (config.secondary ?? themes[config.theme][1]);
  return {
    theme: config.theme,
    primary,
    secondary,
    tokens: config.mode === "advanced" ? { ...config.tokens } : {},
  };
}

/** The config as a JSON file's text, stamped so it can be recognised on import. */
export function exportTheme(config: ThemeConfig): string {
  return JSON.stringify({ $type: "neo-ui-theme", ...config }, null, 2);
}

const hex = /^#[0-9a-f]{6}$/i;

/** Reads a theme back from JSON; throws an Error with a readable message when it is not one. */
export function parseTheme(text: string, locale?: Locale): ThemeConfig {
  const tr = (value: string, vars?: Record<string, string | number>) => locale ? translate(locale, value, vars) : defaultTr(value, vars);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(tr("Это не JSON: проверьте файл или вставленный текст."));
  }
  if (!data || typeof data !== "object") throw new Error(tr("В файле нет настроек темы."));
  const raw = data as Record<string, unknown>;
  if (raw.$type !== undefined && raw.$type !== "neo-ui-theme") throw new Error(tr("Это файл не темы NEO UI."));
  if (raw.version !== undefined && raw.version !== 1) throw new Error(tr("Версия темы {version} не поддерживается.", { version: String(raw.version) }));
  const theme = typeof raw.theme === "string" && Object.hasOwn(themes, raw.theme) ? (raw.theme as ThemeName) : "ruby";
  const pick = (value: unknown) => (typeof value === "string" && hex.test(value) ? value.toLowerCase() : undefined);
  const tokens: Record<string, string> = {};
  if (raw.tokens && typeof raw.tokens === "object")
    for (const [name, value] of Object.entries(raw.tokens as Record<string, unknown>)) {
      const key = name.replace(/^--ad-/, "");
      // Only known tokens with plain values: nothing that could break out of a CSS declaration.
      if (knownTokens.has(key) && typeof value === "string" && value.length < 200 && !/[;{}<>]/.test(value)) tokens[key] = value;
    }
  return {
    version: 1,
    mode: raw.mode === "advanced" ? "advanced" : "simple",
    theme,
    primary: pick(raw.primary),
    secondary: pick(raw.secondary),
    autoSecondary: raw.autoSecondary === true,
    tokens,
  };
}

let colorContext: CanvasRenderingContext2D | null | undefined;

/** Any colour the browser computed (rgb, oklch, color-mix…) as #rrggbb, through one shared 1×1 canvas. */
function toHex(value: string): string {
  if (colorContext === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    colorContext = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!colorContext) return "#000000";
  colorContext.clearRect(0, 0, 1, 1);
  colorContext.fillStyle = "#000000";
  colorContext.fillStyle = value;
  colorContext.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorContext.getImageData(0, 0, 1, 1).data;
  return \`#\${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, "0")).join("")}\`;
}

/**
 * Current values of several tokens inside \`scope\`: colours as #rrggbb, everything else as written.
 * All colour probes are inserted together, so the page's styles are recalculated once instead of
 * once per token — on a large page that is the difference between one frame and a visible freeze.
 */
export function resolveTokens(
  scope: Element,
  tokens: readonly (string | { name: string; kind?: ThemeTokenKind })[],
): Record<string, string> {
  const list = tokens.map((token) => typeof token === "string" ? { name: token, kind: "color" as ThemeTokenKind } : { name: token.name, kind: token.kind ?? "color" });
  const result: Record<string, string> = {};
  const colors = list.filter(({ kind }) => kind === "color");
  if (colors.length) {
    // Hidden probes still compute their colour but cannot change the layout around them.
    const host = document.createElement("span");
    host.hidden = true;
    const probes = colors.map(({ name }) => {
      const probe = document.createElement("span");
      probe.style.color = \`var(--ad-\${name})\`;
      host.append(probe);
      return probe;
    });
    scope.append(host);
    const values = probes.map((probe) => getComputedStyle(probe).color);
    host.remove();
    colors.forEach(({ name }, index) => { result[name] = toHex(values[index]!); });
  }
  const others = list.filter(({ kind }) => kind !== "color");
  if (others.length) {
    const style = getComputedStyle(scope);
    for (const { name } of others) result[name] = style.getPropertyValue(\`--ad-\${name}\`).trim();
  }
  return result;
}

/** Current value of a token inside \`scope\`: colours as #rrggbb, everything else as written. Use \`resolveTokens\` for several. */
export function resolveToken(scope: Element, name: string, kind: ThemeTokenKind = "color"): string {
  return resolveTokens(scope, [{ name, kind }])[name]!;
}
`;export{e as default};
