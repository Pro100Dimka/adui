const e=`import { createElement, type ElementType, useRef } from "react";\r
import { usePauseOffscreen } from "../../../core/motion/hooks";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface GlowTextProps extends CommonProps {\r
  as?: ElementType;\r
  /** Flicker now and then like a neon sign. */\r
  flicker?: boolean;\r
}\r
\r
/** Neon text: a gradient flows through the letters under a soft halo. */\r
export function GlowText({\r
  as = "span",\r
  flicker = false,\r
  children,\r
  ...p\r
}: GlowTextProps) {\r
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);\r
  usePauseOffscreen(pauseRef);\r
  return createElement(\r
    as,\r
    {\r
      ...mark("GlowText", p),\r
      ref: pauseRef,\r
      "data-flicker": flicker || undefined,\r
    },\r
    // The halo is a still copy of the text on a layer of its own, painted once: the flowing\r
    // gradient repaints only the letters and never re-blurs the glow.\r
    <span className="ad-glow-text-halo" aria-hidden="true">{children}</span>,\r
    children,\r
  );\r
}\r
`;export{e as default};
