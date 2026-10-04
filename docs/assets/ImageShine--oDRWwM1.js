const e=`import type { CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface ImageShineProps extends CommonProps {
  /** A picture with transparency (an icon, a logo): the light runs over its visible pixels only. */
  src: string;
  /** Breathe and glow around the picture as well. */
  glow?: boolean;
  label?: string;
}

/**
 * A band of light sweeps across a picture's shape, as on a polished badge; the picture breathes.
 * Built from stacked layers that only move and fade, so the browser composites it on the GPU.
 */
export function ImageShine({ src, glow = true, label, style, ...p }: ImageShineProps) {
  return (
    <span
      {...mark("ImageShine", p)}
      style={{ ...style, "--ad-shine-src": \`url("\${src}")\` } as CSSProperties}
      data-glow={glow || undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {glow && <img className="ad-image-shine-glow" src={src} alt="" draggable={false} />}
      <img className="ad-image-shine-picture" src={src} alt="" draggable={false} />
      <span className="ad-image-shine-sweep">
        <i />
      </span>
    </span>
  );
}
`;export{e as default};
