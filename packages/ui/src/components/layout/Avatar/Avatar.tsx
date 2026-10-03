import { mark } from "../../../core/base";
import { type AvatarProps } from "../shared";
import { HostSeal } from "./HostSeal";

export const Avatar = ({ variant = "initials", ...p }: AvatarProps) => (
  <div
    {...mark("Avatar", p, "tile")}
    data-variant={variant}
    role="img"
    aria-label={p.name ?? "Пользователь"}
  >
    {variant === "host" ? (
      <HostSeal />
    ) : (
      (p.name ?? "Дмитрий").trim().slice(0, 1).toUpperCase()
    )}
  </div>
);
