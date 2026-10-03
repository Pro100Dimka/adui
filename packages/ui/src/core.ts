export {
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
  useDecoration,
  useSmoothWheel,
  useTabShape,
} from "./core/motion/hooks";
export { getMotionStats } from "./core/motion-engine.js";
