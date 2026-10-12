import { useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import { useMotion } from "../../../core/providers/context";
import { refreshMotion } from "../../../core/motion-engine.js";
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
  const motion = useMotion();
  usePauseOffscreen(pauseRef);
  const updatePause = () => {
    const node = pauseRef.current;
    if (!node) return;
    node.toggleAttribute("data-ad-paused", node.matches(":hover, :focus-within"));
    refreshMotion();
  };
  return (
    <div
      {...mark("Marquee", p)}
      ref={pauseRef}
      style={{ ...style, "--ad-marquee-time": `${duration}s` } as CSSProperties}
      data-reverse={reverse || undefined}
      data-static={!motion || undefined}
      onPointerEnter={updatePause}
      onPointerLeave={updatePause}
      onFocus={updatePause}
      onBlur={updatePause}
    >
      {/* Two copies make the loop seamless; the second one is hidden from assistive tech. */}
      <div className="ad-marquee-track">
        <div className="ad-marquee-group">{children}</div>
        <div className="ad-marquee-group" aria-hidden ref={(node) => { if (node) node.inert = true; }}>
          {children}
        </div>
      </div>
    </div>
  );
}
