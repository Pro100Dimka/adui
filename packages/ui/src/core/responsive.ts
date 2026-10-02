import type { CSSProperties } from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
export type Spacing = number | string;

const BREAKPOINTS: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

/** Numbers are steps of the spacing scale; strings are raw CSS lengths. */
export function spacing(value: Spacing): string {
  if (typeof value !== "number") return value;
  if (value === 0) return "0";
  return `var(--ad-space-${value}, calc(var(--ad-space-unit, 0.25rem) * ${value}))`;
}

/** `--ad-<name>` for base and `--ad-<name>-<bp>` for each breakpoint present in `value`. */
export function responsiveVars<T>(
  name: string,
  value: Responsive<T> | undefined,
  format: (item: T) => string = String,
): CSSProperties {
  if (value == null) return {};
  const values: Partial<Record<Breakpoint, T>> =
    typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<Record<Breakpoint, T>>)
      : { base: value as T };
  const result: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const item = values[bp];
    if (item != null)
      result[`--ad-${name}${bp === "base" ? "" : `-${bp}`}`] = format(item);
  }
  return result as CSSProperties;
}
