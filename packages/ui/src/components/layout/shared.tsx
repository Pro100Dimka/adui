import React, { createElement } from "react";
import type { ElementType, ReactNode } from "react";
import { define, mark, type CommonProps, type Material, type VectorNode } from "../../core/base";
import iconData from "../../artwork/icons.json";
import artworkData from "../../artwork/illustrations.json";

export type IconName = keyof typeof iconData;
export const icons = iconData as unknown as Record<string, VectorNode>;
export const illustrations = artworkData as unknown as Record<string, VectorNode>;

export interface IconProps extends Omit<CommonProps, "size"> {
  name?: IconName | string;
  size?: number | string;
  label?: string;
  surface?: "none" | "tile";
}
export interface TextProps extends CommonProps { as?: ElementType; variant?: "muted" | "eyebrow" | "body" | "title"; text?: string }
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
export interface AvatarProps extends CommonProps { name?: string }
export interface TabPanelProps extends CommonProps { labelledBy?: string; hidden?: boolean }
export interface ScrollAreaProps extends CommonProps { height?: number | string; label?: string }
export interface DividerProps extends CommonProps { vertical?: boolean }
export interface IllustrationProps extends CommonProps {
  variant?: keyof typeof artworkData;
  label?: string;
  framed?: boolean;
  fit?: "contain" | "cover";
}

/** Tiny DOM helper for structural parts; not a public component family. */
export function part(name:string,tag:"header"|"div"|"footer"){return define<CommonProps>(name,p=>createElement(tag,mark(name,p),p.children));}
/** Compatibility helper for older internal files. New code uses Header directly. */
export function HeaderView({kind,...p}:HeaderProps&{kind:string}){const level=kind==="PageHeader"?1:3;return <header {...mark("Header",p)}>{p.icon&&<span data-ad-header-icon>{p.icon}</span>}<div className="ad-header-copy">{p.eyebrow&&<span>{p.eyebrow}</span>}{createElement(`h${level}`,{},p.title??"Название раздела")}{p.description&&<p>{p.description}</p>}</div>{p.actions&&<div className="ad-header-actions">{p.actions}</div>}</header>}
