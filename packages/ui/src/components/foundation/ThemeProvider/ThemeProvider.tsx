import { type CommonProps, type TokenStyle } from "../../../core/base";
export interface ThemeProviderProps extends CommonProps {
  theme?: "ruby" | "green" | "violet" | "light";
  accent?: string;
  tokens?: Record<string, string>;
}
export const ThemeProvider = ({
  theme = "ruby",
  accent,
  tokens = {},
  style,
  children,
  id,
  className,
}: ThemeProviderProps) => {
  const vars: TokenStyle = { ...style };
  for (const [key, value] of Object.entries(tokens))
    vars[(key.startsWith("--") ? key : `--ad-${key}`) as `--${string}`] = value;
  if (accent) {
    vars["--ad-red"] = accent;
    vars["--ad-pink"] = accent;
  }
  return (
    <div
      id={id}
      className={`ad-theme ${className ?? ""}`}
      style={vars}
      data-ad-component="ThemeProvider"
      data-ad-theme={theme}
    >
      {children}
    </div>
  );
};
