const e=`import React, { createElement, useRef } from "react";
import { mark } from "../../../core/base";
import { useBorder, usePauseOffscreen } from "../../../core/motion/hooks";
import { Header } from "../Header/Header";
import type { CardProps } from "../shared";
export const Card = ({
  as = "section",
  border = false,
  shell = false,
  padding = "md",
  title,
  description,
  eyebrow,
  icon,
  actions,
  level = 3,
  children,
  ...p
}: CardProps) => {
  const ref = useRef<HTMLElement>(null);
  useBorder(ref, border, shell);
  usePauseOffscreen(ref);
  return createElement(
    as,
    {
      ...mark(
        "Card",
        p,
        p.material ?? (shell ? "shell" : "card"),
        "ad-surface",
      ),
      ref,
      "data-ad-padding": padding,
      // A soft light follows the pointer across the surface.
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
    title && (
      <Header
        level={level as 1 | 2 | 3 | 4}
        title={title}
        description={description}
        eyebrow={eyebrow}
        icon={icon}
        actions={actions}
        compact={level > 2}
      />
    ),
    children,
  );
};
`;export{e as default};
