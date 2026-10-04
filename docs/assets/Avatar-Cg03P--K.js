const a=`import { mark } from "../../../core/base";\r
import { type AvatarProps } from "../shared";\r
import { HostSeal } from "./HostSeal";\r
\r
const initialOf = (name?: string) => (name ?? "Дмитрий").trim().slice(0, 1).toUpperCase();\r
\r
export const Avatar = ({ variant = "initials", src, badge, presence, ...p }: AvatarProps) => (\r
  <div\r
    {...mark("Avatar", p, "tile")}\r
    data-variant={variant}\r
    data-photo={src ? "" : undefined}\r
    role="img"\r
    aria-label={p.name ?? "Пользователь"}\r
  >\r
    {variant === "host" && <HostSeal photo={src} />}\r
    {variant !== "host" &&\r
      (src ? <img className="ad-avatar-photo" src={src} alt="" draggable={false} /> : initialOf(p.name))}\r
    {badge && variant !== "host" && <span className="ad-avatar-badge">{badge}</span>}\r
    {presence && <span className="ad-avatar-presence" data-presence={presence} />}\r
  </div>\r
);\r
`;export{a as default};
