import React, { createElement, useId, useMemo } from "react";
import { domProps, type VectorNode } from "./base";

const svgTagNames: Record<string, string> = {
  lineargradient: "linearGradient", radialgradient: "radialGradient", clippath: "clipPath",
  fegaussianblur: "feGaussianBlur", feturbulence: "feTurbulence", fecolormatrix: "feColorMatrix"
};
export function vectorElement(node: VectorNode | string, prefix = "", key?: string | number): React.ReactNode {
  if (typeof node === "string") return node;
  const props = domProps(node.props, prefix, true);
  return createElement(svgTagNames[node.tag] ?? node.tag, { ...props, key }, node.children?.map((child, i) => vectorElement(child, prefix, i)));
}
export function SvgAsset({ node, unique = true, className, style, label, component }: {
  node: VectorNode; unique?: boolean; className?: string; style?: React.CSSProperties; label?: string; component?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const prefix = unique ? `svg-${id}-` : "";
  const element = useMemo(() => vectorElement(node, prefix) as React.ReactElement<Record<string, unknown>>, [node, prefix]);
  return React.cloneElement(element, {
    ...(className ? { className } : {}), ...(style ? { style } : {}),
    ...(label ? { role: "img", "aria-label": label, "aria-hidden": undefined } : {}),
    ...(component ? { "data-ad-component": component } : {})
  });
}
