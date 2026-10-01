import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { define, type CommonProps, type TokenStyle } from "./base";

export interface ThemeProviderProps extends CommonProps { theme?: "ruby" | "green" | "violet" | "light"; tokens?: Record<string, string> }
export const ThemeProvider = define<ThemeProviderProps>("ThemeProvider", ({ theme = "ruby", tokens = {}, style, children, ...rest }) => {
  const vars: TokenStyle = { ...style };
  for (const [key, value] of Object.entries(tokens)) vars[key.startsWith("--") ? key as `--${string}` : `--ad-${key}`] = value;
  return <div {...rest} style={vars} data-ad-component="ThemeProvider" data-ad-theme={theme}>{children}</div>;
});
const MotionContext = createContext<boolean | null>(null);
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update); update();
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
export function useMotion() { const explicit = useContext(MotionContext); const reduced = useReducedMotion(); return explicit ?? !reduced; }
export interface MotionProviderProps extends CommonProps { enabled?: boolean; active?: boolean }
export const MotionProvider = define<MotionProviderProps>("MotionProvider", ({ enabled, active = true, children, ...rest }) => {
  const parent = useMotion();
  const value = (enabled ?? parent) && active;
  return <MotionContext.Provider value={value}><div {...rest} data-ad-component="MotionProvider" data-ad-motion={value ? "on" : "off"}>{children}</div></MotionContext.Provider>;
});
