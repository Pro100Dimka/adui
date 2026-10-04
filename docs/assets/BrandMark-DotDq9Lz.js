const r=`import { mark, type CommonProps } from "../../../core/base";\r
import { SvgAsset } from "../../../core/artwork";\r
import { illustrations } from "../shared";\r
\r
export const BrandMark = (p: CommonProps) => (\r
  <div {...mark("BrandMark", p)}>\r
    <SvgAsset node={illustrations.brand} />\r
    <small>KARAOKE STUDIO</small>\r
  </div>\r
);\r
`;export{r as default};
