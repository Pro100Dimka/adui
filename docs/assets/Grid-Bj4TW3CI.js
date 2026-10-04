const n=`import type { ElementType, HTMLAttributes } from "react";
import { classes } from "../../../core/base";
import {
  responsiveVars,
  spacing,
  type Breakpoint,
  type Responsive,
  type Spacing,
} from "../../../core/responsive";

export type GridBreakpoint = Breakpoint;
export type GridResponsive<T> = Responsive<T>;
export type GridSpacing = Spacing;
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type GridJustify =
  "start" | "center" | "end" | "stretch" | "between" | "around" | "evenly";

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

const justifyValue = (value: GridJustify) =>
  value === "between" || value === "around" || value === "evenly"
    ? \`space-\${value}\`
    : value;
const columnsValue = (value: number | string) =>
  typeof value === "number" ? \`repeat(\${value}, minmax(0, 1fr))\` : value;

/** Grid placement; anything not given is \`auto\`. */
const place = <T,>(
  name: string,
  value: GridResponsive<T> | undefined,
  format: (item: T) => string,
) =>
  responsiveVars<T | "auto">(
    name,
    value,
    (v) => (v === "auto" ? "auto" : format(v as T)),
    "auto",
  );

/** A Grid with placement props and no columns renders as a grid item, not a container. */
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
  const isItem =
    (span != null ||
      rowSpan != null ||
      columnStart != null ||
      rowStart != null) &&
    columns == null &&
    minChildWidth == null;

  const container = isItem
    ? {}
    : {
        ...responsiveVars("grid-columns", columns, columnsValue, 12),
        ...responsiveVars("grid-row-gap", rowGap ?? gap, spacing, 0),
        ...responsiveVars("grid-column-gap", columnGap ?? gap, spacing, 0),
        ...responsiveVars("grid-align", align, String, "stretch"),
        ...responsiveVars("grid-justify", justify, justifyValue, "stretch"),
      };
  const item = isItem
    ? {
        ...(columnStart != null
          ? place("grid-column-start", columnStart, String)
          : place("grid-column-start", span, (v) =>
              v === "full" ? "1" : "auto",
            )),
        ...place("grid-column-end", span, (v) =>
          v === "full" ? "-1" : \`span \${v}\`,
        ),
        ...place("grid-row-start", rowStart, String),
        ...place("grid-row-end", rowSpan, (v) => \`span \${v}\`),
      }
    : {};

  return (
    <Component
      {...props}
      className={classes(
        isItem ? "ad-grid-item" : "ad-grid",
        !isItem && !!minChildWidth && "ad-grid--auto-fit",
        !isItem && dense && "ad-grid--dense",
        className,
      )}
      style={{
        ...container,
        ...item,
        ...(minChildWidth && { "--ad-grid-min-child-width": minChildWidth }),
        ...style,
      }}
    />
  );
}
`;export{n as default};
