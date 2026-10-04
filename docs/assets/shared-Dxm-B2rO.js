const r=`import type { ElementType, ReactNode } from "react";\r
import {\r
  type CommonProps,\r
  type Material,\r
  type VectorNode,\r
} from "../../core/base";\r
import iconData from "../../artwork/icons.json";\r
import artworkData from "../../artwork/illustrations.json";\r
\r
export type IconName = keyof typeof iconData;\r
export const icons = iconData as unknown as Record<string, VectorNode>;\r
export const illustrations = artworkData as unknown as Record<\r
  string,\r
  VectorNode\r
>;\r
\r
export interface IconProps extends Omit<CommonProps, "size"> {\r
  name?: IconName | string;\r
  size?: number | string;\r
  label?: string;\r
  surface?: "none" | "tile";\r
}\r
export interface TextProps extends CommonProps {\r
  as?: ElementType;\r
  variant?: "muted" | "eyebrow" | "body" | "title";\r
  text?: string;\r
}\r
export interface HeaderProps extends CommonProps {\r
  as?: "header" | "div";\r
  level?: 1 | 2 | 3 | 4;\r
  title?: ReactNode;\r
  description?: ReactNode;\r
  eyebrow?: ReactNode;\r
  icon?: IconName | string;\r
  actions?: ReactNode;\r
  compact?: boolean;\r
}\r
export interface CardProps extends CommonProps, Omit<HeaderProps, "as"> {\r
  as?: "section" | "div" | "article";\r
  border?: boolean;\r
  shell?: boolean;\r
  padding?: "none" | "sm" | "md" | "lg";\r
  material?: Material;\r
}\r
export interface AvatarProps extends CommonProps {\r
  name?: string;\r
  /** Initials in a turning ring, or the animated host seal with a crown. */\r
  variant?: "initials" | "host";\r
  /** Photo shown in place of the initials, or inside the host seal instead of its crown. */\r
  src?: string;\r
  /** Short tag on the lower edge of the ring, e.g. "ГОСТЬ". */\r
  badge?: string;\r
  /** A dot on the ring: online, busy (e.g. singing in a room) or offline. */\r
  presence?: "online" | "busy" | "offline";\r
}\r
export interface TabPanelProps extends CommonProps {\r
  labelledBy?: string;\r
  hidden?: boolean;\r
}\r
export interface ScrollAreaProps extends CommonProps {\r
  height?: number | string;\r
  label?: string;\r
}\r
export interface DividerProps extends CommonProps {\r
  vertical?: boolean;\r
}\r
export interface IllustrationProps extends CommonProps {\r
  variant?: keyof typeof artworkData;\r
  label?: string;\r
  framed?: boolean;\r
  fit?: "contain" | "cover";\r
}\r
`;export{r as default};
