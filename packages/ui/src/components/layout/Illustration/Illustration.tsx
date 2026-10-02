import React from "react";
import { define, mark } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { illustrations } from "../shared";
import type { IllustrationProps } from "../shared";
export const Illustration = define<IllustrationProps>("Illustration", ({ variant="planet", label, framed=false, fit="contain", ...p }) => (
  <div {...mark("Illustration", p)} data-ad-framed={framed || undefined} data-ad-fit={fit}>
    <SvgAsset node={illustrations[variant] ?? illustrations.planet} component="IllustrationAsset" label={label} />
  </div>
));
