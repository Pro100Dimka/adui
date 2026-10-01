import React from "react";
import { define, type CommonProps, type TokenStyle } from "../../base";

export interface ThemeProviderProps extends CommonProps {
  theme?: "ruby" | "green" | "violet" | "light";
  tokens?: Record<string, string>;
}

export const ThemeProvider = define<ThemeProviderProps>(
  "ThemeProvider",
  ({ theme = "ruby", tokens = {}, style, children, ...rest }) => {
    const vars: TokenStyle = { ...style };

    for (const [key, value] of Object.entries(tokens)) {
      vars[key.startsWith("--") ? (key as `--${string}`) : `--ad-${key}`] = value;
    }

    return (
      <div
        {...rest}
        style={vars}
        data-ad-component="ThemeProvider"
        data-ad-theme={theme}
      >
        {children}
      </div>
    );
  }
);
