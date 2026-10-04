const n=`import { createElement } from "react";\r
import type { CSSProperties, ElementType, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export type TypographyVariant =\r
  | "display"\r
  | "h1"\r
  | "h2"\r
  | "h3"\r
  | "title"\r
  | "subtitle"\r
  | "body"\r
  | "body-sm"\r
  | "label"\r
  | "caption"\r
  | "eyebrow"\r
  | "mono";\r
\r
export type TypographyTone =\r
  "default" | "muted" | "accent" | "success" | "warning" | "danger";\r
export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";\r
\r
export interface TypographyProps extends Omit<CommonProps, "tone"> {\r
  as?: ElementType;\r
  variant?: TypographyVariant;\r
  tone?: TypographyTone;\r
  weight?: TypographyWeight;\r
  align?: CSSProperties["textAlign"];\r
  truncate?: boolean;\r
  text?: ReactNode;\r
  /** Hover text; a truncated plain string shows itself in full by default. */\r
  title?: string;\r
}\r
\r
const defaultElement: Record<TypographyVariant, ElementType> = {\r
  display: "h1",\r
  h1: "h1",\r
  h2: "h2",\r
  h3: "h3",\r
  title: "h4",\r
  subtitle: "p",\r
  body: "p",\r
  "body-sm": "p",\r
  label: "span",\r
  caption: "span",\r
  eyebrow: "span",\r
  mono: "code",\r
};\r
\r
export function Typography({\r
  as,\r
  variant = "body",\r
  tone = "default",\r
  weight,\r
  align,\r
  truncate = false,\r
  text,\r
  title,\r
  children,\r
  style,\r
  ...props\r
}: TypographyProps) {\r
  const content = children ?? text;\r
  return createElement(\r
    as ?? defaultElement[variant],\r
    {\r
      ...mark("Typography", props),\r
      "data-ad-variant": variant,\r
      "data-ad-tone": tone,\r
      "data-ad-weight": weight,\r
      "data-ad-truncate": truncate || undefined,\r
      title: title ?? (truncate && typeof content === "string" ? content : undefined),\r
      style: { ...style, textAlign: align },\r
    },\r
    content,\r
  );\r
}\r
`;export{n as default};
