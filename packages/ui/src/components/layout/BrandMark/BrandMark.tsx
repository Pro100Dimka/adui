import { mark, type CommonProps } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { illustrations } from "../shared";

export const BrandMark = (p: CommonProps) => (
  <div {...mark("BrandMark", p)}>
    <SvgAsset node={illustrations.brand} />
    <small>KARAOKE STUDIO</small>
  </div>
);
