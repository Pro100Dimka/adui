import React, { createElement, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { define, mark, type CommonProps, type VectorNode } from "../../core/base";
import { SvgAsset } from "../../core/artwork";
import { useBorder } from "../../core/motion/hooks";
import iconData from "../../artwork/icons.json";
import artworkData from "../../artwork/illustrations.json";

import { Icon } from "./Icon/Icon";
import { Text } from "./Text/Text";
import { Surface } from "./Surface/Surface";
import { PageHeader } from "./PageHeader/PageHeader";
import { SectionHeader } from "./SectionHeader/SectionHeader";
import { Card } from "./Card/Card";
import { IconTile } from "./IconTile/IconTile";
import { Avatar } from "./Avatar/Avatar";
import { DialogHeader } from "./DialogHeader/DialogHeader";
import { DialogBody } from "./DialogBody/DialogBody";
import { DialogActions } from "./DialogActions/DialogActions";
import { Toolbar } from "./Toolbar/Toolbar";
import { ButtonGroup } from "./ButtonGroup/ButtonGroup";
import { TabPanel } from "./TabPanel/TabPanel";
import { ScrollArea } from "./ScrollArea/ScrollArea";
import { Divider } from "./Divider/Divider";
import { SceneIllustration } from "./SceneIllustration/SceneIllustration";
import { ArtworkFrame } from "./ArtworkFrame/ArtworkFrame";
import { BrandMark } from "./BrandMark/BrandMark";

export type IconName = keyof typeof iconData;

export const icons = iconData as unknown as Record<string, VectorNode>;

export const illustrations = artworkData as unknown as Record<string, VectorNode>;

export interface IconProps extends Omit<CommonProps, "size"> { name?: IconName | string; size?: number; label?: string }

export interface TextProps extends CommonProps { as?: ElementType; variant?: "muted" | "eyebrow" | "body" | "title"; text?: string }

export interface SurfaceProps extends CommonProps { as?: "section" | "div" | "article"; border?: boolean; shell?: boolean }

export interface HeaderProps extends CommonProps { title?: ReactNode; description?: ReactNode; eyebrow?: ReactNode; icon?: IconName | string; actions?: ReactNode }

export function HeaderView({ kind, ...p }: HeaderProps & { kind: "PageHeader" | "SectionHeader" }) {
  return <header {...mark(kind, p)}>
    {p.icon && <IconTile icon={p.icon} />}
    <div className="ad-header-copy">
      {p.eyebrow && <Text variant="eyebrow">{p.eyebrow}</Text>}
      {kind === "PageHeader" ? <h1>{p.title ?? "Название раздела"}</h1> : <h3>{p.title ?? "Название раздела"}</h3>}
      {p.description && <p>{p.description}</p>}
    </div>
    {p.actions && <div className="ad-header-actions">{p.actions}</div>}
  </header>;
}

export interface CardProps extends SurfaceProps, HeaderProps {}

export interface IconTileProps extends CommonProps { icon?: string; iconSize?: number }

export interface AvatarProps extends CommonProps { name?: string }

export function part(name: string, tag: "header" | "div" | "footer") {
  return define<CommonProps>(name, p => createElement(tag, mark(name, p), p.children));
}

export interface TabPanelProps extends CommonProps { labelledBy?: string; hidden?: boolean }

export interface ScrollAreaProps extends CommonProps { height?: number | string; label?: string }

export interface DividerProps extends CommonProps { vertical?: boolean }

export interface IllustrationProps extends CommonProps { variant?: keyof typeof artworkData; label?: string }
