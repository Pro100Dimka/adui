import React, { Children, Fragment } from "react";
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

export type StackDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";
export type StackBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type StackResponsive<T> = T | Partial<Record<StackBreakpoint, T>>;
export type StackSpacing = number | string;

export interface StackProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  direction?: StackResponsive<StackDirection>;
  gap?: StackResponsive<StackSpacing>;
  align?: StackResponsive<StackAlign>;
  justify?: StackResponsive<StackJustify>;
  wrap?: StackResponsive<StackWrap | boolean>;
  divider?: ReactNode;
  inline?: boolean;
}

const BREAKPOINTS: StackBreakpoint[] = ["base", "sm", "md", "lg", "xl"];
const alignMap: Record<StackAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline"
};
const justifyMap: Record<StackJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly"
};

function responsive<T>(value: StackResponsive<T> | undefined): Partial<Record<StackBreakpoint, T>> {
  if (value == null) return {};
  return typeof value === "object" && !Array.isArray(value)
    ? value as Partial<Record<StackBreakpoint, T>>
    : { base: value as T };
}

function spacing(value: StackSpacing): string {
  if (typeof value !== "number") return value;
  if (value === 0) return "0";
  return `var(--ad-space-${value}, calc(var(--ad-space-unit, 0.25rem) * ${value}))`;
}

function vars<T>(
  prefix: string,
  value: StackResponsive<T> | undefined,
  format: (item: T) => string = String
): CSSProperties {
  const result: Record<string, string> = {};
  const values = responsive(value);
  for (const bp of BREAKPOINTS) {
    const item = values[bp];
    if (item != null) result[`--ad-stack-${prefix}${bp === "base" ? "" : `-${bp}`}`] = format(item);
  }
  return result as CSSProperties;
}

const wrapValue = (value: StackWrap | boolean) => value === true ? "wrap" : value === false ? "nowrap" : value;

export function Stack({
  as: Component = "div",
  direction = "column",
  gap = 0,
  align = "stretch",
  justify = "start",
  wrap = "nowrap",
  divider,
  inline = false,
  children,
  className,
  style,
  ...props
}: StackProps) {
  const items = Children.toArray(children);
  const content = divider == null
    ? children
    : items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="ad-stack__divider" aria-hidden="true">{divider}</span>}
          {child}
        </Fragment>
      ));

  const layoutStyle: CSSProperties = {
    ...vars("direction", direction),
    ...vars("gap", gap, spacing),
    ...vars("align", align, value => alignMap[value]),
    ...vars("justify", justify, value => justifyMap[value]),
    ...vars("wrap", wrap, wrapValue),
    ...style
  };

  return (
    <Component
      {...props}
      className={["ad-stack", inline && "ad-stack--inline", className].filter(Boolean).join(" ")}
      style={layoutStyle}
    >
      {content}
    </Component>
  );
}
