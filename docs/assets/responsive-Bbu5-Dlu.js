const e=`import type { CSSProperties } from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
export type Spacing = number | string;

const BREAKPOINTS: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

/** Numbers are steps of the spacing scale; strings are raw CSS lengths. */
export function spacing(value: Spacing): string {
  if (typeof value !== "number") return value;
  if (value === 0) return "0";
  return \`var(--ad-space-\${value}, calc(var(--ad-space-unit, 0.25rem) * \${value}))\`;
}

/**
 * \`--ad-<name>\` plus \`--ad-<name>-<bp>\` for every breakpoint, each carrying the nearest
 * smaller value forward (starting from \`fallback\`). Every layout sets all of its own
 * variables, so nested layouts never inherit a parent's and CSS reads one variable per
 * breakpoint without fallback chains.
 */
export function responsiveVars<T>(
  name: string,
  value: Responsive<T> | undefined,
  format: (item: T) => string = String,
  fallback?: T,
): CSSProperties {
  const values: Partial<Record<Breakpoint, T>> =
    value != null && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<Record<Breakpoint, T>>)
      : { base: (value ?? fallback) as T };
  const result: Record<string, string> = {};
  let current = values.base ?? fallback;
  for (const bp of BREAKPOINTS) {
    current = values[bp] ?? current;
    if (current != null)
      result[\`--ad-\${name}\${bp === "base" ? "" : \`-\${bp}\`}\`] = format(current);
  }
  return result as CSSProperties;
}
`;export{e as default};
