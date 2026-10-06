const e=`import { type CommonProps, type TokenStyle } from "../../../core/base";
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
  /** Main colour; overrides the theme's. The whole palette is built from it and \`secondary\`. */
  primary?: string;
  /** Light accent colour for highlights and glints; overrides the theme's. */
  secondary?: string;
  /** Older name for \`primary\`. */
  accent?: string;
  /** Any token by name (\`primary-700\`, \`neutral-900\`, \`--ad-text\`…), for full control. */
  tokens?: Record<string, string>;
}

const ThemeColorSchemeContext = createContext<"light" | "dark">("dark");
const emptyTokens: Record<string, string> = {};

/** HSL hue of a #rrggbb colour, in degrees. */
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  const h =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

/**
 * Applies a theme: the primary/secondary pair sets the palette, painted artwork (canvas and
 * vector illustrations, drawn in ruby) is turned to the primary's hue.
 */
export const ThemeProvider = ({
  theme = "ruby",
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
  const scheme = colorScheme ?? inheritedScheme;
  const main = primary ?? accent ?? themes[theme][0];
  const vars = useMemo(() => {
    const next: TokenStyle = {
      ...style,
      "--ad-primary": main,
      "--ad-secondary": secondary ?? themes[theme][1],
    };
    if (/^#[0-9a-f]{6}$/i.test(main))
      next["--ad-hue-shift"] =
        \`\${Math.round(hue(main) - hue(themes.ruby[0]))}deg\`;
    for (const [key, value] of Object.entries(tokens))
      next[(key.startsWith("--") ? key : \`--ad-\${key}\`) as \`--\${string}\`] = value;
    return next;
  }, [style, main, secondary, theme, tokens]);
  return (
    <ThemeColorSchemeContext.Provider value={scheme}>
      <div
        id={id}
        className={\`ad-theme \${className ?? ""}\`}
        style={vars}
        data-ad-component="ThemeProvider"
        data-ad-theme={theme}
        data-ad-color-scheme={scheme}
      >
        {children}
      </div>
    </ThemeColorSchemeContext.Provider>
  );
};
`;export{e as default};
