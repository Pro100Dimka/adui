import { createElement, type ElementType } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface GlowTextProps extends CommonProps {
  as?: ElementType;
  /** Flicker now and then like a neon sign. */
  flicker?: boolean;
}

/** Neon text: a gradient flows through the letters under a soft halo. */
export function GlowText({
  as = "span",
  flicker = false,
  children,
  ...p
}: GlowTextProps) {
  return createElement(
    as,
    {
      ...mark("GlowText", p),
      "data-flicker": flicker || undefined,
      // Plain text gets its halo from a still copy behind it, so the flowing gradient never re-filters.
      "data-text": typeof children === "string" ? children : undefined,
    },
    children,
  );
}
