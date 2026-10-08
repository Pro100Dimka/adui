import { createElement, useMemo } from "react";
import { mark, type VectorNode } from "../../../core/base";
import { useSvgId, vectorElement } from "../../../core/artwork";
import { illustrations } from "../shared";
import type { IllustrationProps } from "../shared";

/**
 * A glow that follows the artwork's silhouette, drawn once: the artwork's shape blurred and
 * filled with the accent, without the artwork itself. The pulse only fades these layers.
 */
const glow = (id: string, deviation: number, alpha: number) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation={deviation} result="shape" />
    <feFlood style={{ floodColor: `rgb(from var(--ad-primary) r g b / ${alpha})` }} />
    <feComposite in2="shape" operator="in" />
  </filter>
);

export const Illustration = ({
  variant = "planet",
  label,
  framed = false,
  fit = "contain",
  ...p
}: IllustrationProps) => {
  const prefix = `svg-${useSvgId()}-`;
  const art = illustrations[variant] ?? illustrations.planet;
  const { root, drawing } = useMemo(() => {
    // The artwork's parts are gathered under one id, so the glows can reuse them by reference.
    const children = art.children ?? [];
    const node: VectorNode = {
      ...art,
      children: [
        ...children.filter((c) => typeof c !== "string" && c.tag === "defs"),
        { tag: "g", props: { id: "art" }, children: children.filter((c) => typeof c === "string" || c.tag !== "defs") },
      ],
    };
    const drawing = vectorElement(node, prefix) as React.ReactElement<Record<string, unknown>>;
    const { children: _children, ...root } = drawing.props;
    return { root, drawing };
  }, [art, prefix]);
  const shadow = (kind: "rest" | "pulse", deviation: number, alpha: number) =>
    createElement(
      "svg",
      { ...root, className: `ad-illustration-glow`, "data-glow": kind, "aria-hidden": "true", role: undefined, "aria-label": undefined },
      <defs>{glow(`${prefix}${kind}`, deviation, alpha)}</defs>,
      <use href={`#${prefix}art`} filter={`url(#${prefix}${kind})`} />,
    );
  return (
    <div
      {...mark("Illustration", p)}
      data-ad-framed={framed || undefined}
      data-ad-fit={fit}
    >
      {/* Drop-shadow blur radii of 0.4rem and 1.2rem are deviations of 3.2px and 9.6px. */}
      <span className="ad-illustration-art">
        {shadow("rest", 3.2, 0.2)}
        {shadow("pulse", 9.6, 0.47)}
        {createElement("svg", {
          ...root,
          "data-ad-component": "IllustrationAsset",
          ...(label ? { role: "img", "aria-label": label, "aria-hidden": undefined } : {}),
        }, drawing.props.children as React.ReactNode)}
      </span>
      {framed && <span className="ad-illustration-edge" aria-hidden="true" />}
    </div>
  );
};
