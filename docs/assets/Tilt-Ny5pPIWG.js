const e=`import { createElement, type ElementType, useRef } from "react";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import { mark, type CommonProps } from "../../../core/base";

export interface TiltProps extends CommonProps {
  as?: ElementType;
  /** Largest tilt in degrees. */
  max?: number;
  /** Show a glare that follows the pointer. */
  glare?: boolean;
}

/** Leans toward the pointer in 3D, with a glossy glare, and springs back when left. */
export function Tilt({
  as = "div",
  max = 14,
  glare = true,
  children,
  ...p
}: TiltProps) {
  const pauseRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  usePauseOffscreen(pauseRef);
  const set = (el: HTMLElement, x: number, y: number) => {
    el.style.setProperty("--ad-tilt-x", \`\${(-y * max).toFixed(2)}deg\`);
    el.style.setProperty("--ad-tilt-y", \`\${(x * max).toFixed(2)}deg\`);
    el.style.setProperty("--ad-glare-x", \`\${(x + 0.5) * 100}%\`);
    el.style.setProperty("--ad-glare-y", \`\${(y + 0.5) * 100}%\`);
  };
  return createElement(
    as,
    {
      ...mark("Tilt", p),
      ref: pauseRef,
      "data-glare": glare || undefined,
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        set(
          event.currentTarget,
          (event.clientX - box.left) / box.width - 0.5,
          (event.clientY - box.top) / box.height - 0.5,
        );
      },
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) =>
        set(event.currentTarget, 0, 0),
    },
    children,
  );
}
`;export{e as default};
