const e=`import React, { createElement, useId, useMemo } from "react";

/** React's id made safe for SVG references such as \`url(#id)\`. */
export const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");
import type { VectorNode } from "./base";

/** Prefixes ids and their #references so several copies of one SVG can coexist on a page. */
function scopeIds(value: unknown, prefix: string, key: string): unknown {
  if (typeof value !== "string") return value;
  if (key === "id") return prefix + value;
  if (key === "href" && value.startsWith("#"))
    return "#" + prefix + value.slice(1);
  return value.replace(/url\\(#([^)]*)\\)/g, \`url(#\${prefix}$1)\`);
}

/** Artwork JSON already stores React-ready SVG props; only ids are rewritten. */
export function vectorElement(
  node: VectorNode | string,
  prefix: string,
  key?: string | number,
): React.ReactNode {
  if (typeof node === "string") return node;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.props ?? {}))
    props[name] = scopeIds(value, prefix, name);
  return createElement(
    node.tag,
    props,
    node.children?.map((child, i) => vectorElement(child, prefix, i)),
  );
}
export function SvgAsset({
  node,
  className,
  style,
  label,
  component,
}: {
  node: VectorNode;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  component?: string;
}) {
  const prefix = \`svg-\${useSvgId()}-\`;
  const element = useMemo(
    () =>
      vectorElement(node, prefix) as React.ReactElement<
        Record<string, unknown>
      >,
    [node, prefix],
  );
  return React.cloneElement(element, {
    ...(className ? { className } : {}),
    ...(style ? { style } : {}),
    ...(label
      ? { role: "img", "aria-label": label, "aria-hidden": undefined }
      : {}),
    ...(component ? { "data-ad-component": component } : {}),
  });
}
`;export{e as default};
