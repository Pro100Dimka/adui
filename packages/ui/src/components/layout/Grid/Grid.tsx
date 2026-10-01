import React from "react";
import type { CSSProperties, ElementType, HTMLAttributes } from "react";

export type GridBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type GridResponsive<T> = T | Partial<Record<GridBreakpoint, T>>;
export type GridSpacing = number | string;
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type GridJustify = "start" | "center" | "end" | "stretch" | "between" | "around" | "evenly";

export interface GridProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  columns?: GridResponsive<number | string>;
  gap?: GridResponsive<GridSpacing>;
  rowGap?: GridResponsive<GridSpacing>;
  columnGap?: GridResponsive<GridSpacing>;
  minChildWidth?: string;
  dense?: boolean;
  align?: GridResponsive<GridAlign>;
  justify?: GridResponsive<GridJustify>;
  span?: GridResponsive<number | "full">;
  rowSpan?: GridResponsive<number>;
  columnStart?: GridResponsive<number>;
  rowStart?: GridResponsive<number>;
}

const BREAKPOINTS: GridBreakpoint[] = ["base", "sm", "md", "lg", "xl"];
const alignMap: Record<GridAlign, string> = {
  start: "start",
  center: "center",
  end: "end",
  stretch: "stretch",
  baseline: "baseline"
};
const justifyMap: Record<GridJustify, string> = {
  start: "start",
  center: "center",
  end: "end",
  stretch: "stretch",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly"
};

function responsive<T>(value: GridResponsive<T> | undefined): Partial<Record<GridBreakpoint, T>> {
  if (value == null) return {};
  return typeof value === "object" && !Array.isArray(value)
    ? value as Partial<Record<GridBreakpoint, T>>
    : { base: value as T };
}

function spacing(value: GridSpacing): string {
  if (typeof value !== "number") return value;
  if (value === 0) return "0";
  return `var(--ad-space-${value}, calc(var(--ad-space-unit, 0.25rem) * ${value}))`;
}

function vars<T>(
  prefix: string,
  value: GridResponsive<T> | undefined,
  format: (item: T) => string = String
): CSSProperties {
  const result: Record<string, string> = {};
  const values = responsive(value);
  for (const bp of BREAKPOINTS) {
    const item = values[bp];
    if (item != null) result[`--ad-grid-${prefix}${bp === "base" ? "" : `-${bp}`}`] = format(item);
  }
  return result as CSSProperties;
}

const columnsValue = (value: number | string) =>
  typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;

function gridSpanVars(value: GridResponsive<number | "full"> | undefined): CSSProperties {
  const result: Record<string, string> = {};
  const values = responsive(value);
  for (const bp of BREAKPOINTS) {
    const item = values[bp];
    if (item == null) continue;
    const suffix = bp === "base" ? "" : `-${bp}`;
    result[`--ad-grid-column-start${suffix}`] = item === "full" ? "1" : "auto";
    result[`--ad-grid-column-end${suffix}`] = item === "full" ? "-1" : `span ${item}`;
  }
  return result as CSSProperties;
}

export function Grid({
  as: Component = "div",
  columns,
  gap,
  rowGap,
  columnGap,
  minChildWidth,
  dense = false,
  align,
  justify,
  span,
  rowSpan,
  columnStart,
  rowStart,
  className,
  style,
  ...props
}: GridProps) {
  const hasPlacement = span != null || rowSpan != null || columnStart != null || rowStart != null;
  const isItem = hasPlacement && columns == null && minChildWidth == null;
  const effectiveColumns = isItem ? undefined : columns ?? 12;

  const layoutStyle: CSSProperties = {
    ...(effectiveColumns != null ? vars("columns", effectiveColumns, columnsValue) : {}),
    ...(!isItem ? vars("gap", gap ?? 0, spacing) : {}),
    ...(!isItem ? vars("row-gap", rowGap, spacing) : {}),
    ...(!isItem ? vars("column-gap", columnGap, spacing) : {}),
    ...(!isItem ? vars("align", align ?? "stretch", value => alignMap[value]) : {}),
    ...(!isItem ? vars("justify", justify ?? "stretch", value => justifyMap[value]) : {}),
    ...gridSpanVars(span),
    ...vars("row-end", rowSpan, value => `span ${value}`),
    ...vars("column-start", columnStart),
    ...vars("row-start", rowStart),
    ...(minChildWidth ? { "--ad-grid-min-child-width": minChildWidth } as CSSProperties : {}),
    ...style
  };

  return (
    <Component
      {...props}
      className={[
        isItem ? "ad-grid-item" : "ad-grid",
        !isItem && minChildWidth && "ad-grid--auto-fit",
        !isItem && dense && "ad-grid--dense",
        className
      ].filter(Boolean).join(" ")}
      style={layoutStyle}
    />
  );
}
