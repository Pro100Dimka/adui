import { useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import type { CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface BeaconProps extends CommonProps {
  /** Rings run only while active. */
  active?: boolean;
  /** Ring colour; defaults to the theme accent. */
  color?: string;
}

/** Radar rings spreading from behind the content, to draw attention to it. */
export function Beacon({
  active = true,
  color,
  style,
  children,
  ...p
}: BeaconProps) {
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  usePauseOffscreen(pauseRef);
  return (
    <span
      {...mark("Beacon", p)}
      ref={pauseRef}
      style={{ ...style, "--ad-beacon": color } as CSSProperties}
      data-active={active || undefined}
    >
      <i aria-hidden />
      <i aria-hidden />
      <i aria-hidden />
      {children}
    </span>
  );
}
