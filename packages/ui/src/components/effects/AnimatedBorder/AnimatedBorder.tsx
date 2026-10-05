import { createElement, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useBorder, usePauseOffscreen } from "../../../core/motion/hooks";

export interface AnimatedBorderProps extends CommonProps {
  as?: ElementType;
  children?: ReactNode;
  shell?: boolean;
  round?: boolean;
}

export function AnimatedBorder({
  as = "div",
  shell = false,
  round = false,
  children,
  ...props
}: AnimatedBorderProps) {
  const ref = useRef<HTMLElement>(null);
  useBorder(ref, true, shell, round);
  usePauseOffscreen(ref);

  return createElement(
    as,
    {
      ...mark("AnimatedBorder", props),
      ref,
    },
    children,
  );
}
