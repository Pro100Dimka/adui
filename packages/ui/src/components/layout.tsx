import React, { createElement, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { define, mark, type CommonProps, type VectorNode } from "../core/base";
import { SvgAsset } from "../core/artwork";
import { useBorder } from "../core/motion";
import iconData from "../artwork/icons.json";
import artworkData from "../artwork/illustrations.json";

export type IconName = keyof typeof iconData;
const icons = iconData as unknown as Record<string, VectorNode>;
export const illustrations = artworkData as unknown as Record<string, VectorNode>;
export interface IconProps extends Omit<CommonProps, "size"> { name?: IconName | string; size?: number; label?: string }
export const Icon = define<IconProps>("Icon", ({ name = "music", size = 24, className, style, label }) => (
  <SvgAsset node={icons[name] ?? icons.info} component="Icon" className={`ad-icon ${className ?? ""}`} style={{ width: size, height: size, ...style }} label={label} />
));
export interface TextProps extends CommonProps { as?: ElementType; variant?: "muted" | "eyebrow" | "body" | "title"; text?: string }
export const Text = define<TextProps>("Text", ({ as = "span", ...p }) => createElement(as, { ...mark("Text", p), "data-ad-variant": p.variant }, p.children ?? p.text));
export interface SurfaceProps extends CommonProps { as?: "section" | "div" | "article"; border?: boolean; shell?: boolean }
export const Surface = define<SurfaceProps>("Surface", ({ as = "section", border = false, shell = false, ...p }) => {
  const ref = useRef<HTMLElement>(null); useBorder(ref, border, shell);
  return createElement(as, { ...mark("Surface", p, shell ? "shell" : "card"), ref }, <>{p.children}</>);
});
export interface HeaderProps extends CommonProps { title?: ReactNode; description?: ReactNode; eyebrow?: ReactNode; icon?: IconName | string; actions?: ReactNode }
function HeaderView({ kind, ...p }: HeaderProps & { kind: "PageHeader" | "SectionHeader" }) {
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
export const PageHeader = define<HeaderProps>("PageHeader", p => <HeaderView {...p} kind="PageHeader" />);
export const SectionHeader = define<HeaderProps>("SectionHeader", p => <HeaderView {...p} kind="SectionHeader" />);
export interface CardProps extends SurfaceProps, HeaderProps {}
export const Card = define<CardProps>("Card", p => {
  const ref = useRef<HTMLElement>(null); useBorder(ref, p.border ?? false);
  return <section {...mark("Card", p, "card", "ad-surface")} ref={ref}>
    {p.title && <SectionHeader title={p.title} description={p.description} icon={p.icon} actions={p.actions} />}{p.children}
  </section>;
});
export interface IconTileProps extends CommonProps { icon?: string; iconSize?: number }
export const IconTile = define<IconTileProps>("IconTile", p => <div {...mark("IconTile", p, "tile")}><Icon name={p.icon ?? "chip"} size={p.iconSize ?? 28} /></div>);
export interface AvatarProps extends CommonProps { name?: string }
export const Avatar = define<AvatarProps>("Avatar", p => <div {...mark("Avatar", p, "tile")} aria-label={p.name ?? "Пользователь"}>{(p.name ?? "Дмитрий").trim().slice(0, 1).toUpperCase()}</div>);
function part(name: string, tag: "header" | "div" | "footer") {
  return define<CommonProps>(name, p => createElement(tag, mark(name, p), p.children));
}
export const DialogHeader = part("DialogHeader", "header");
export const DialogBody = part("DialogBody", "div");
export const DialogActions = part("DialogActions", "footer");
export const Toolbar = part("Toolbar", "div");
export const ButtonGroup = part("ButtonGroup", "div");
export interface TabPanelProps extends CommonProps { labelledBy?: string; hidden?: boolean }
export const TabPanel = define<TabPanelProps>("TabPanel", p => <div {...mark("TabPanel", p)} role="tabpanel" aria-labelledby={p.labelledBy} hidden={p.hidden} tabIndex={0}>{p.children}</div>);
export interface ScrollAreaProps extends CommonProps { height?: number | string; label?: string }
export const ScrollArea = define<ScrollAreaProps>("ScrollArea", p => <div {...mark("ScrollArea", p)} tabIndex={0} aria-label={p.label} style={{ maxHeight: p.height ?? 180, ...p.style }}>{p.children}</div>);
export interface DividerProps extends CommonProps { vertical?: boolean }
export const Divider = define<DividerProps>("Divider", p => <div {...mark("Divider", p)} role="separator" aria-orientation={p.vertical ? "vertical" : "horizontal"} />);
export interface IllustrationProps extends CommonProps { variant?: keyof typeof artworkData; label?: string }
export const SceneIllustration = define<IllustrationProps>("SceneIllustration", p => <SvgAsset node={illustrations[p.variant ?? "planet"] ?? illustrations.planet} component="SceneIllustration" className={`ad ad-scene-illustration ${p.className ?? ""}`} style={p.style} label={p.label} />);
export const ArtworkFrame = define<IllustrationProps>("ArtworkFrame", p => <div {...mark("ArtworkFrame", p)}>{p.children ?? <SceneIllustration variant={p.variant} label={p.label} />}</div>);
export const BrandMark = define<CommonProps>("BrandMark", p => <div {...mark("BrandMark", p)}><SvgAsset node={illustrations.brand} /><small>KARAOKE STUDIO</small></div>);
