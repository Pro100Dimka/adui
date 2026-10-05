import { useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import type { CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface MarqueeProps extends CommonProps {
  /** Seconds for one full loop. */
  duration?: number;
  /** Scroll to the right instead of the left. */
  reverse?: boolean;
}

/** Endless ticker with faded edges; pauses while hovered so it can be read. */
export function Marquee({
  duration = 20,
  reverse = false,
  style,
  children,
  ...p
}: MarqueeProps) {
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  usePauseOffscreen(pauseRef);
  return (
    <div
      {...mark("Marquee", p)}
      ref={pauseRef}
      style={{ ...style, "--ad-marquee-time": `${duration}s` } as CSSProperties}
      data-reverse={reverse || undefined}
    >
      {/* Two copies make the loop seamless; the second one is hidden from assistive tech. */}
      <div className="ad-marquee-track">
        <div className="ad-marquee-group">{children}</div>
        <div className="ad-marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
