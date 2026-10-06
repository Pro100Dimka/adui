const e=`export {
  ThemeProvider,
  themes,
} from "./components/foundation/ThemeProvider/ThemeProvider";
export type {
  ThemeName,
  ThemeProviderProps,
} from "./components/foundation/ThemeProvider/ThemeProvider";
export { useReducedMotion, useMotion } from "./core/providers/context";
export {
  useBorder,
  usePauseOffscreen,
  useTick,
  useDecoration,
  useSmoothWheel,
  useTabShape,
} from "./core/motion/hooks";
export { getMotionStats, setMotionFrameRate, subscribeTick } from "./core/motion-engine.js";

export { LocaleProvider, addMessages, getLocale, plural, setLocale, tr, translate, useLocale, useTr } from "./core/i18n";
export type { Locale, Messages } from "./core/i18n";
export { messages as builtInMessages } from "./core/messages";
`;export{e as default};
