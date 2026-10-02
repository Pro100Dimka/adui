import { createElement } from "react";
import { mark } from "../../../core/base";
import { type TextProps } from "../shared";

export const Text = ({ as = "span", ...p }: TextProps) =>
  createElement(
    as,
    { ...mark("Text", p), "data-ad-variant": p.variant },
    p.children ?? p.text,
  );
