import { useRef } from "react";
import { mark } from "../../../core/base";
import { useSmoothWheel } from "../../../core/motion/hooks";
import { type ScrollAreaProps } from "../shared";

const scrollHeight = (height: number | string | undefined) =>
  typeof height === "number"
    ? `calc(var(--ad-fluid-unit) * ${height})`
    : (height ?? "clamp(10rem, 32dvh, 18rem)");

export function ScrollArea(p: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  useSmoothWheel(ref);
  return (
    <div
      {...mark("ScrollArea", p)}
      ref={ref}
      tabIndex={0}
      aria-label={p.label}
      style={{ maxHeight: scrollHeight(p.height), ...p.style }}
    >
      {p.children}
    </div>
  );
}
