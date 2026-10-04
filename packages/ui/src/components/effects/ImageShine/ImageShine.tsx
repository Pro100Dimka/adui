import { useSvgId } from "../../../core/artwork";
import { mark, type CommonProps } from "../../../core/base";

export interface ImageShineProps extends CommonProps {
  /** A picture with transparency (an icon, a logo): the light runs over its visible pixels only. */
  src: string;
  /** Breathe and glow around the picture as well. */
  glow?: boolean;
  label?: string;
}

const SIZE = 500;

/** A band of light sweeps across a picture's shape, as on a polished badge; the picture breathes. */
export function ImageShine({ src, glow = true, label, ...p }: ImageShineProps) {
  const id = useSvgId();
  return (
    <svg
      {...mark("ImageShine", p)}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      data-glow={glow || undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={SIZE} height={SIZE} style={{ maskType: "alpha" }}>
          <image href={src} width={SIZE} height={SIZE} />
        </mask>
        <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--ad-primary)" stopOpacity="0" />
          <stop offset="0.42" stopColor="var(--ad-primary)" stopOpacity="0.58" />
          <stop offset="0.5" stopColor="var(--ad-secondary-100)" stopOpacity="0.92" />
          <stop offset="0.58" stopColor="var(--ad-primary)" stopOpacity="0.58" />
          <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <image className="ad-image-shine-picture" href={src} width={SIZE} height={SIZE} />
      <g mask={`url(#${id}-mask)`}>
        <rect className="ad-image-shine-sweep" x={-SIZE / 2} y="0" width={SIZE / 2} height={SIZE} fill={`url(#${id}-sweep)`} />
      </g>
    </svg>
  );
}
