import type { CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface SparklesProps extends CommonProps {
  /** Number of sparks. */
  count?: number;
  /** Spark colour; defaults to a warm white. */
  color?: string;
}

/** Twinkling four-point stars scattered around the content. */
export function Sparkles({
  count = 10,
  color,
  style,
  children,
  ...p
}: SparklesProps) {
  return (
    <span
      {...mark("Sparkles", p)}
      style={{ ...style, "--ad-sparkle": color } as CSSProperties}
    >
      {children}
      {Array.from({ length: count }, (_, i) => {
        // Golden-angle spread gives an even but irregular scatter without randomness.
        const angle = i * 137.5;
        const reach = 55 + ((i * 29) % 40);
        return (
          <svg
            key={i}
            className="ad-sparkle"
            viewBox="0 0 10 10"
            aria-hidden
            style={{
              left: `${50 + Math.cos((angle * Math.PI) / 180) * reach}%`,
              top: `${50 + Math.sin((angle * Math.PI) / 180) * reach * 0.8}%`,
              width: `${0.45 + ((i * 7) % 5) / 10}em`,
              animationDelay: `${((i * 0.37) % 2.4).toFixed(2)}s`,
            }}
          >
            <path d="M5 0C5.6 3.6 6.4 4.4 10 5C6.4 5.6 5.6 6.4 5 10C4.4 6.4 3.6 5.6 0 5C3.6 4.4 4.4 3.6 5 0Z" />
          </svg>
        );
      })}
    </span>
  );
}
