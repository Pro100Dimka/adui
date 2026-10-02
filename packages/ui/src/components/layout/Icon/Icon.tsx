import React from "react";
import { mark } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { icons, type IconProps } from "../shared";
export const Icon = ({
  name = "music",
  size = "1.5rem",
  surface = "none",
  className,
  style,
  label,
  ...p
}: IconProps) => (
  <span
    {...mark("Icon", { ...p, className, style })}
    data-ad-surface={surface}
    style={
      {
        "--ad-icon-size": typeof size === "number" ? `${size / 16}rem` : size,
        ...style,
      } as React.CSSProperties
    }
  >
    <SvgAsset
      node={icons[name] ?? icons.info}
      component="IconAsset"
      label={label}
    />
  </span>
);
