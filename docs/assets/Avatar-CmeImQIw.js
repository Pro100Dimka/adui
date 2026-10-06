const a=`import { tr, useTr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { type AvatarProps } from "../shared";
import { HostSeal } from "./HostSeal";

const initialOf = (name?: string) => (name ?? "Дмитрий").trim().slice(0, 1).toUpperCase();

export const Avatar = ({ variant = "initials", src, badge, presence, ...p }: AvatarProps) => { const tr = useTr(); return ((
  <div
    {...mark("Avatar", p, "tile")}
    data-variant={variant}
    data-photo={src ? "" : undefined}
    role="img"
    aria-label={p.name ?? tr("Пользователь")}
  >
    {variant === "host" && <HostSeal photo={src} name={p.name} />}
    {variant !== "host" &&
      (src ? <img className="ad-avatar-photo" src={src} alt="" draggable={false} /> : initialOf(p.name))}
    {badge && variant !== "host" && <span className="ad-avatar-badge">{badge}</span>}
    {presence && <span className="ad-avatar-presence" data-presence={presence} />}
  </div>
)); };
`;export{a as default};
