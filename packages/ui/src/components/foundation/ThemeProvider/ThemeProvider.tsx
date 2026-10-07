import { classes, type CommonProps, type TokenStyle } from "../../../core/base";
import { createContext, useContext, useMemo } from "react";

/** Ready colour pairs: [primary, secondary]. Everything else is derived from the pair. */
export const themes = {
  ruby: ["#ff244c", "#ff7c97"],
  light: ["#e0a43a", "#f3d38f"],
  green: ["#10c99a", "#7cf3d0"],
  violet: ["#9b5cff", "#d3a8ff"],
} as const;
export type ThemeName = keyof typeof themes;

export interface ThemeProviderProps extends CommonProps {
  theme?: ThemeName;
  /** Colour scheme; nested providers inherit it unless they explicitly override it. */
  colorScheme?: "light" | "dark";
  /** Main colour; overrides the theme's. The whole palette is built from it and `secondary`. */
  primary?: string;
  /** Light accent colour for highlights and glints; overrides the theme's. */
  secondary?: string;
  /** Older name for `primary`. */
  accent?: string;
  /** Any token by name (`primary-700`, `neutral-900`, `--ad-text`…), for full control. */
  tokens?: Record<string, string>;
}

const ThemeColorSchemeContext = createContext<"light" | "dark">("dark");
const ThemePaletteContext = createContext<{ theme: ThemeName; primary: string; secondary: string }>({
  theme: "ruby", primary: themes.ruby[0], secondary: themes.ruby[1],
});
export const useThemePalette = () => useContext(ThemePaletteContext);
const emptyTokens: Record<string, string> = {};

/** HSL hue of a #rrggbb colour, in degrees. */
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  let h = (r - g) / delta + 4;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  return (h * 60 + 360) % 360;
}

/**
 * Applies a theme: the primary/secondary pair sets the palette, painted artwork (canvas and
 * vector illustrations, drawn in ruby) is turned to the primary's hue.
 */
export const ThemeProvider = ({
  theme,
  colorScheme,
  primary,
  secondary,
  accent,
  tokens = emptyTokens,
  style,
  children,
  id,
  className,
}: ThemeProviderProps) => {
  const inheritedScheme = useContext(ThemeColorSchemeContext);
  const inheritedPalette = useThemePalette();
  const scheme = colorScheme ?? inheritedScheme;
  const selected = theme ?? inheritedPalette.theme;
  const main = primary ?? accent ?? (theme ? themes[theme][0] : inheritedPalette.primary);
  const light = secondary ?? (theme ? themes[theme][1] : inheritedPalette.secondary);
  const vars = useMemo(() => {
    const next: TokenStyle = { ...style };
    if (theme !== undefined || primary !== undefined || accent !== undefined) next["--ad-primary"] = main;
    if (theme !== undefined || secondary !== undefined) next["--ad-secondary"] = light;
    for (const [key, value] of Object.entries(tokens))
      next[(key.startsWith("--") ? key : `--ad-${key}`) as `--${string}`] = value;
    const effectivePrimary = next["--ad-primary"];
    if (typeof effectivePrimary === "string" && /^#[0-9a-f]{6}$/i.test(effectivePrimary) && next["--ad-hue-shift"] === undefined)
      next["--ad-hue-shift"] =
        `${Math.round(hue(effectivePrimary) - hue(themes.ruby[0]))}deg`;
    return next;
  }, [style, main, light, primary, secondary, accent, theme, tokens]);
  const effectivePrimary = String(vars["--ad-primary"] ?? main);
  const effectiveSecondary = String(vars["--ad-secondary"] ?? light);
  const palette = useMemo(() => ({ theme: selected, primary: effectivePrimary, secondary: effectiveSecondary }), [selected, effectivePrimary, effectiveSecondary]);
  return (
    <ThemeColorSchemeContext.Provider value={scheme}>
      <ThemePaletteContext.Provider value={palette}>
        <div
          id={id}
          className={classes("ad-theme", className)}
          style={vars}
          data-ad-component="ThemeProvider"
          data-ad-theme={selected}
          data-ad-color-scheme={scheme}
        >
          {children}
        </div>
      </ThemePaletteContext.Provider>
    </ThemeColorSchemeContext.Provider>
  );
};
