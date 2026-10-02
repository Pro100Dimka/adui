import { mark } from "../../../core/base";
import { type AvatarProps } from "../shared";

export const Avatar = (p: AvatarProps) => (
  <div {...mark("Avatar", p, "tile")} aria-label={p.name ?? "Пользователь"}>
    {(p.name ?? "Дмитрий").trim().slice(0, 1).toUpperCase()}
  </div>
);
