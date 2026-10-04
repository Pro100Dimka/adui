const r=`import { mark } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { illustrations } from "../shared";\r
import type { IllustrationProps } from "../shared";\r
export const Illustration = ({\r
  variant = "planet",\r
  label,\r
  framed = false,\r
  fit = "contain",\r
  ...p\r
}: IllustrationProps) => (\r
  <div\r
    {...mark("Illustration", p)}\r
    data-ad-framed={framed || undefined}\r
    data-ad-fit={fit}\r
  >\r
    <SvgAsset\r
      node={illustrations[variant] ?? illustrations.planet}\r
      component="IllustrationAsset"\r
      label={label}\r
    />\r
  </div>\r
);\r
`;export{r as default};
