import React from "react";
import { mark } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { icons, type IconProps } from "../shared";
/** Without `size` the icon takes --ad-icon-size from CSS, so buttons and fields can size it. */
export const Icon = ({
  name = "music",
  size,
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
        "--ad-icon-size":
          typeof size === "number" ? `${size / 16}rem` : size || undefined,
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
