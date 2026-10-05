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
  usePauseOffscreen,
  useTick,
  useDecoration,
  useSmoothWheel,
  useTabShape,
} from "./core/motion/hooks";
export { getMotionStats, setMotionFrameRate, subscribeTick } from "./core/motion-engine.js";
