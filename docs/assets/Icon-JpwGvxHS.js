const n=`import React from "react";\r
import { mark } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { icons, type IconProps } from "../shared";\r
/** Without \`size\` the icon takes --ad-icon-size from CSS, so buttons and fields can size it. */\r
export const Icon = ({\r
  name = "music",\r
  size,\r
  surface = "none",\r
  className,\r
  style,\r
  label,\r
  ...p\r
}: IconProps) => (\r
  <span\r
    {...mark("Icon", { ...p, className, style })}\r
    data-ad-surface={surface}\r
    style={\r
      {\r
        "--ad-icon-size":\r
          typeof size === "number" ? \`\${size / 16}rem\` : size || undefined,\r
        ...style,\r
      } as React.CSSProperties\r
    }\r
  >\r
    <SvgAsset\r
      node={icons[name] ?? icons.info}\r
      component="IconAsset"\r
      label={label}\r
    />\r
  </span>\r
);\r
`;export{n as default};
