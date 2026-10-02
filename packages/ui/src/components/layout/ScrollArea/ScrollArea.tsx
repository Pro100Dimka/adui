import { mark } from "../../../core/base";
import { type ScrollAreaProps } from "../shared";

const scrollHeight = (height: number | string | undefined) =>
  typeof height === "number"
    ? `calc(var(--ad-fluid-unit) * ${height})`
    : (height ?? "clamp(10rem, 32dvh, 18rem)");

export const ScrollArea = (p: ScrollAreaProps) => (
  <div
    {...mark("ScrollArea", p)}
    tabIndex={0}
    aria-label={p.label}
    style={{ maxHeight: scrollHeight(p.height), ...p.style }}
  >
    {p.children}
  </div>
);
