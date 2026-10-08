import { createElement, type ElementType, useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
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
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  usePauseOffscreen(pauseRef);
  return createElement(
    as,
    {
      ...mark("GlowText", p),
      ref: pauseRef,
      "data-flicker": flicker || undefined,
    },
    // The halo is a still copy of the text on a layer of its own, painted once: the flowing
    // gradient repaints only the letters and never re-blurs the glow.
    <span className="ad-glow-text-halo" aria-hidden="true">{children}</span>,
    children,
  );
}
