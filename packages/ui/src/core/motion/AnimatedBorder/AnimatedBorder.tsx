import React, { useRef } from "react";
import { define, mark, type CommonProps } from "../../base";
import { useBorder } from "../hooks";

export interface AnimatedBorderProps extends CommonProps {
  shell?: boolean;
  round?: boolean;
  enabled?: boolean;
}

export const AnimatedBorder = define<AnimatedBorderProps>("AnimatedBorder", p => {
  const ref = useRef<HTMLDivElement>(null);
  useBorder(ref, p.enabled ?? true, p.shell, p.round);

  return (
    <div
      {...mark("AnimatedBorder", p, "card", "ad-surface")}
      ref={ref}
      style={{ padding: 28, position: "relative", ...p.style }}
    >
      {p.children ?? "Свет движется по контуру"}
    </div>
  );
});
