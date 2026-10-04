import { createElement } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "subtitle"
  | "body"
  | "body-sm"
  | "label"
  | "caption"
  | "eyebrow"
  | "mono";

export type TypographyTone =
  "default" | "muted" | "accent" | "success" | "warning" | "danger";
export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";

export interface TypographyProps extends Omit<CommonProps, "tone"> {
  as?: ElementType;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  weight?: TypographyWeight;
  align?: CSSProperties["textAlign"];
  truncate?: boolean;
  text?: ReactNode;
  /** Hover text; a truncated plain string shows itself in full by default. */
  title?: string;
}

const defaultElement: Record<TypographyVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  title: "h4",
  subtitle: "p",
  body: "p",
  "body-sm": "p",
  label: "span",
  caption: "span",
  eyebrow: "span",
  mono: "code",
};

export function Typography({
  as,
  variant = "body",
  tone = "default",
  weight,
  align,
  truncate = false,
  text,
  title,
  children,
  style,
  ...props
}: TypographyProps) {
  const content = children ?? text;
  return createElement(
    as ?? defaultElement[variant],
    {
      ...mark("Typography", props),
      "data-ad-variant": variant,
      "data-ad-tone": tone,
      "data-ad-weight": weight,
      "data-ad-truncate": truncate || undefined,
      title: title ?? (truncate && typeof content === "string" ? content : undefined),
      style: { ...style, textAlign: align },
    },
    content,
  );
}
