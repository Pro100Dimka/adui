import React, { createElement, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { define, mark, type CommonProps, type VectorNode } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useBorder } from "../../../core/motion/hooks";
import iconData from "../../../artwork/icons.json";
import artworkData from "../../../artwork/illustrations.json";
import { icons, illustrations, HeaderView, part, type IconName, type IconProps, type TextProps, type SurfaceProps, type HeaderProps, type CardProps, type IconTileProps, type AvatarProps, type TabPanelProps, type ScrollAreaProps, type DividerProps, type IllustrationProps } from "../shared";
import { Icon } from "../Icon/Icon";
import { Text } from "../Text/Text";
import { Surface } from "../Surface/Surface";
import { PageHeader } from "../PageHeader/PageHeader";
import { SectionHeader } from "../SectionHeader/SectionHeader";
import { Card } from "../Card/Card";
import { IconTile } from "../IconTile/IconTile";
import { Avatar } from "../Avatar/Avatar";
import { DialogHeader } from "../DialogHeader/DialogHeader";
import { DialogBody } from "../DialogBody/DialogBody";
import { DialogActions } from "../DialogActions/DialogActions";
import { Toolbar } from "../Toolbar/Toolbar";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { TabPanel } from "../TabPanel/TabPanel";
import { Divider } from "../Divider/Divider";
import { SceneIllustration } from "../SceneIllustration/SceneIllustration";
import { ArtworkFrame } from "../ArtworkFrame/ArtworkFrame";
import { BrandMark } from "../BrandMark/BrandMark";

const scrollHeight = (height: number | string | undefined) =>
  typeof height === "number" ? `calc(var(--ad-fluid-unit) * ${height})` : height ?? "clamp(10rem, 32dvh, 18rem)";

export const ScrollArea = define<ScrollAreaProps>("ScrollArea", p => <div {...mark("ScrollArea", p)} tabIndex={0} aria-label={p.label} style={{ maxHeight: scrollHeight(p.height), ...p.style }}>{p.children}</div>);
