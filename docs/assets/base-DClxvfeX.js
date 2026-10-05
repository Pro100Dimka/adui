const n=`import { createElement, useCallback, useRef, useState } from "react";
import type { AriaRole, CSSProperties, ReactNode, Ref } from "react";

export type Material =
  | "shell"
  | "card"
  | "glass"
  | "ruby"
  | "tile"
  | "input"
  | "dialog"
  | "ghost"
  | "danger";
export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type ControlSize = "xs" | "sm" | "md" | "lg";
export type LegacySize = "small" | "medium" | "large";
export type Size = ControlSize | LegacySize;
export type Tone =
  | "success"
  | "warning"
  | "error"
  | "processing"
  | "pending"
  | "offline"
  | "info";
export type TokenStyle = CSSProperties & {
  [key: \`--\${string}\`]: string | number | undefined;
};
export interface CommonProps {
  children?: ReactNode;
  className?: string;
  style?: TokenStyle;
  id?: string;
  material?: Material;
  size?: Size;
  tone?: Tone;
  /** Accessibility and test hooks reach the root element of every component. */
  role?: AriaRole;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-live"?: "off" | "polite" | "assertive";
  [data: \`data-\${string}\`]: string | number | boolean | undefined;
}
export interface VectorNode {
  tag: string;
  props?: Record<string, unknown>;
  children?: Array<VectorNode | string>;
}

export function classes(...values: (string | undefined | false)[]): string {
  return values.filter(Boolean).join(" ");
}
export function normalizeSize(size?: Size): ControlSize | undefined {
  if (!size) return undefined;
  return (
    ({ small: "sm", medium: "md", large: "lg" } as const)[size as LegacySize] ??
    (size as ControlSize)
  );
}

/** Root attributes shared by every component: \`ad ad-<kebab-name>\` class and data-ad-* hooks for CSS. */
export function mark(
  name: string,
  p: CommonProps,
  material?: Material,
  extra?: string,
) {
  const passed: Record<string, unknown> = {};
  for (const key in p)
    if (key === "role" || key.startsWith("aria-") || key.startsWith("data-"))
      passed[key] = p[key as keyof CommonProps];
  return {
    ...passed,
    id: p.id,
    className: classes(
      "ad",
      "ad-" +
        name.replace(/[A-Z]/g, (v, i) => (i ? "-" : "") + v.toLowerCase()),
      extra,
      p.className,
    ),
    style: p.style,
    "data-ad-component": name,
    "data-ad-material": p.material ?? material,
    "data-ad-size": normalizeSize(p.size),
    "data-ad-tone": p.tone,
  };
}

/** Plain structural element with the standard component marks. */
export function part(name: string, tag: "header" | "div" | "footer") {
  const Part = (p: CommonProps) =>
    createElement(tag, mark(name, p), p.children);
  Part.displayName = name;
  return Part;
}

export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(initial);
  const current = value === undefined ? internal : value;
  const latest = useRef({ current, value, onChange });
  latest.current = { current, value, onChange };
  const update = useCallback((next: T | ((value: T) => T)) => {
    const old = latest.current;
    const resolved =
      typeof next === "function"
        ? (next as (value: T) => T)(old.current)
        : next;
    if (old.value === undefined) setInternal(resolved);
    if (!Object.is(resolved, old.current)) old.onChange?.(resolved);
    latest.current.current = resolved;
  }, []);
  return [current, update] as const;
}
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}
export const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
export const cssRem = (value: number) =>
  \`\${value / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)}rem\`;
export const timeText = (value: number) =>
  \`\${Math.floor(Math.max(0, value) / 60)}:\${String(Math.floor(Math.max(0, value)) % 60).padStart(2, "0")}\`;
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none";
    const focus = document.activeElement as HTMLElement | null;
    document.body.append(field);
    field.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
      focus?.focus();
    }
  }
}
export function downloadFile(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Spreads a ring of light from the pointer inside \`host\` (which should clip its overflow). */
export function ripple(host: HTMLElement, clientX: number, clientY: number) {
  const rect = host.getBoundingClientRect();
  const ring = document.createElement("span");
  ring.className = "ad-ripple";
  ring.style.left = \`\${clientX - rect.left}px\`;
  ring.style.top = \`\${clientY - rect.top}px\`;
  ring.addEventListener("animationend", () => ring.remove());
  host.append(ring);
}
`;export{n as default};
