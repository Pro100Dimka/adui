const t=`import { createElement, type ElementType } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface SpotlightProps extends CommonProps {
  as?: ElementType;
  /** Light colour; defaults to the theme accent. */
  color?: string;
  /** Radius of the light circle, any CSS length. */
  radius?: string;
}

/** A light that follows the pointer across the surface and lights the edge nearest to it. */
export function Spotlight({
  as = "div",
  color,
  radius,
  style,
  children,
  ...p
}: SpotlightProps) {
  return createElement(
    as,
    {
      ...mark("Spotlight", p),
      style: { ...style, "--ad-spot-color": color, "--ad-spot-r": radius },
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--ad-spot-x",
          \`\${event.clientX - box.left}px\`,
        );
        event.currentTarget.style.setProperty(
          "--ad-spot-y",
          \`\${event.clientY - box.top}px\`,
        );
      },
    },
    children,
  );
}
`;export{t as default};
