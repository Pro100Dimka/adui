import type { ElementType, ReactNode } from "react";
import {
  type CommonProps,
  type Material,
  type VectorNode,
} from "../../core/base";
import iconData from "../../artwork/icons.json";
import artworkData from "../../artwork/illustrations.json";

export type IconName = keyof typeof iconData;
export const icons = iconData as unknown as Record<string, VectorNode>;
export const illustrations = artworkData as unknown as Record<
  string,
  VectorNode
>;

export interface IconProps extends Omit<CommonProps, "size"> {
  name?: IconName | string;
  size?: number | string;
  label?: string;
  surface?: "none" | "tile";
}
export interface TextProps extends CommonProps {
  as?: ElementType;
  variant?: "muted" | "eyebrow" | "body" | "title";
  text?: string;
}
export interface HeaderProps extends CommonProps {
  as?: "header" | "div";
  level?: 1 | 2 | 3 | 4;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: IconName | string;
  actions?: ReactNode;
  compact?: boolean;
}
export interface CardProps extends CommonProps, Omit<HeaderProps, "as"> {
  as?: "section" | "div" | "article";
  border?: boolean;
  shell?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  material?: Material;
}
export interface AvatarProps extends CommonProps {
  name?: string;
  /** Initials in a turning ring, or the animated host seal with a crown. */
  variant?: "initials" | "host";
  /** Photo shown in place of the initials, or inside the host seal instead of its crown. */
  src?: string;
  /** Short tag on the lower edge of the ring, e.g. "ГОСТЬ". */
  badge?: string;
  /** A dot on the ring: online, busy (e.g. singing in a room) or offline. */
  presence?: "online" | "busy" | "offline";
}
export interface TabPanelProps extends CommonProps {
  labelledBy?: string;
  hidden?: boolean;
}
export interface ScrollAreaProps extends CommonProps {
  height?: number | string;
  label?: string;
}
export interface DividerProps extends CommonProps {
  vertical?: boolean;
}
export interface IllustrationProps extends CommonProps {
  variant?: keyof typeof artworkData;
  label?: string;
  framed?: boolean;
  fit?: "contain" | "cover";
}
