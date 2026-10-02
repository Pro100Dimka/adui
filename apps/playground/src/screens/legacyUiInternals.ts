/**
 * Playground-only bridge to low-level UI internals used by legacy screen adapters.
 * These symbols are intentionally NOT part of the public @ad-voice/ui API.
 */
export { SvgAsset } from "../../../../packages/ui/src/core/artwork";
export { domProps } from "../../../../packages/ui/src/core/base";
export type { ReferenceProps } from "../../../../packages/ui/src/core/base";
export {
  createMotion,
  attachBorder,
  attachTabShape,
} from "../../../../packages/ui/src/core/motion-engine.js";
