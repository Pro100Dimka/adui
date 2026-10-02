import { Children, Fragment } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { classes } from "../../../core/base";
import {
  responsiveVars,
  spacing,
  type Breakpoint,
  type Responsive,
  type Spacing,
} from "../../../core/responsive";

export type StackDirection =
  "row" | "column" | "row-reverse" | "column-reverse";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";
export type StackBreakpoint = Breakpoint;
export type StackResponsive<T> = Responsive<T>;
export type StackSpacing = Spacing;

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

const flex = (value: string) =>
  value === "start" || value === "end"
    ? `flex-${value}`
    : value === "between" || value === "around" || value === "evenly"
      ? `space-${value}`
      : value;
const wrapValue = (value: StackWrap | boolean) =>
  value === true ? "wrap" : value === false ? "nowrap" : value;

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
  const content =
    divider == null
      ? children
      : Children.toArray(children).map((child, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span className="ad-stack__divider" aria-hidden="true">
                {divider}
              </span>
            )}
            {child}
          </Fragment>
        ));

  return (
    <Component
      {...props}
      className={classes("ad-stack", inline && "ad-stack--inline", className)}
      style={{
        ...responsiveVars("stack-direction", direction),
        ...responsiveVars("stack-gap", gap, spacing),
        ...responsiveVars("stack-align", align, flex),
        ...responsiveVars("stack-justify", justify, flex),
        ...responsiveVars("stack-wrap", wrap, wrapValue),
        ...style,
      }}
    >
      {content}
    </Component>
  );
}
