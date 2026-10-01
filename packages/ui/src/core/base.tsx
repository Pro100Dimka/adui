import React, { createElement, useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode, Ref, ComponentType } from "react";

export type Material = "shell" | "card" | "glass" | "ruby" | "tile" | "input" | "dialog" | "ghost" | "danger";
export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "small" | "medium" | "large";
export type Tone = "success" | "warning" | "error" | "processing" | "pending" | "offline" | "info";
export type TokenStyle = CSSProperties & { [key: `--${string}`]: string | number | undefined };
export interface CommonProps {
  children?: ReactNode;
  className?: string;
  style?: TokenStyle;
  id?: string;
  material?: Material;
  size?: Size;
  tone?: Tone;
}
export interface VectorNode { tag: string; props?: Record<string, unknown>; children?: Array<VectorNode | string> }
export interface ReferenceOptions { tag: string; attrs: Record<string, unknown>; material?: string | null; children?: ReactNode }
/** Internal migration slot. Native consumers use the ordinary JSX props, not this property. */
export interface ReferenceProps { __reference?: ReferenceOptions }

export function classes(...values: (string | undefined | false)[]): string { return values.filter(Boolean).join(" "); }
export function mark(name: string, p: CommonProps, material?: Material, extra?: string) {
  return {
    id: p.id,
    className: classes("ad", "ad-" + name.replace(/[A-Z]/g, (v, i) => (i ? "-" : "") + v.toLowerCase()), extra, p.className),
    style: p.style,
    "data-ad-component": name,
    "data-ad-material": p.material ?? material,
    "data-ad-size": p.size,
    "data-ad-tone": p.tone
  };
}

const names: Record<string, string> = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength", minlength: "minLength",
  autofocus: "autoFocus", colspan: "colSpan", rowspan: "rowSpan", cellspacing: "cellSpacing", cellpadding: "cellPadding", spellcheck: "spellCheck",
  viewbox: "viewBox", preserveaspectratio: "preserveAspectRatio", pathlength: "pathLength", gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform", filterunits: "filterUnits", stddeviation: "stdDeviation", basefrequency: "baseFrequency",
  numoctaves: "numOctaves", stitchtiles: "stitchTiles", clippathunits: "clipPathUnits", patternunits: "patternUnits", textlength: "textLength", lengthadjust: "lengthAdjust"
};
export function styleObject(raw: unknown): TokenStyle {
  if (typeof raw !== "string") return (raw ?? {}) as TokenStyle;
  const result: Record<string, string> = {};
  for (const item of raw.split(";")) {
    const at = item.indexOf(":");
    if (at < 0) continue;
    const name = item.slice(0, at).trim();
    const key = name.startsWith("--") ? name : name.replace(/^-ms-/, "ms-").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    if (key) result[key] = item.slice(at + 1).trim().replace(/\s*!important$/, "");
  }
  return result as TokenStyle;
}
export function domProps(raw: Record<string, unknown> = {}, namespace = "", svg = false, tag = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, original] of Object.entries(raw)) {
    if (name === "xmlns" || name.startsWith("xmlns:") || name === "selected" || /^on[a-z]+$/.test(name)) continue;
    let key = names[name] ?? name;
    if (svg && !key.startsWith("data-") && !key.startsWith("aria-")) {
      key = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      if (key === "xlink:href") key = "href";
    }
    let value = original;
    if (namespace && typeof value === "string") {
      if (name === "id") value = namespace + value;
      else if ((name === "href" || name === "xlink:href") && value.startsWith("#")) value = "#" + namespace + value.slice(1);
      else value = value.replace(/url\(#([^)]*)\)/g, (_, id: string) => `url(#${namespace}${id})`);
    }
    if (key === "style") value = styleObject(value);
    if (["disabled", "hidden", "required", "readOnly", "multiple", "open", "autoFocus", "controls", "loop", "muted"].includes(key)) value = value !== false && value != null;
    if (key === "checked") { key = "defaultChecked"; value = value !== false && value != null; }
    if (key === "value" && ["input", "select", "textarea"].includes(tag)) key = "defaultValue";
    out[key] = value;
  }
  return out;
}
export function ReferenceElement({ name, options }: { name: string; options: ReferenceOptions }) {
  const attrs = domProps(options.attrs, "", false, options.tag);
  const properties = { ...attrs, "data-ad-component": name, "data-ad-reference": "", "data-ad-material": options.material ?? undefined };
  return ["input", "img", "br", "hr", "meta", "link", "source", "col", "wbr", "area", "embed", "param", "track"].includes(options.tag)
    ? createElement(options.tag, properties) : createElement(options.tag, properties, options.children);
}
/** Keeps legacy geometry separate from the native, stateful React component. */
export function define<P extends object>(name: string, View: ComponentType<P>) {
  function Component(props: P & ReferenceProps): ReactElement {
    return props.__reference ? <ReferenceElement name={name} options={props.__reference} /> : <View {...props} />;
  }
  Component.displayName = name;
  return Component;
}
export function useControllable<T>(value: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = useState(initial);
  const current = value === undefined ? internal : value;
  const latest = useRef({ current, value, onChange });
  latest.current = { current, value, onChange };
  const update = useCallback((next: T | ((value: T) => T)) => {
    const old = latest.current;
    const resolved = typeof next === "function" ? (next as (value: T) => T)(old.current) : next;
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
export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
export const timeText = (value: number) => `${Math.floor(Math.max(0, value) / 60)}:${String(Math.floor(Math.max(0, value)) % 60).padStart(2, "0")}`;
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const field = document.createElement("textarea"); field.value = text;
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    const focus = document.activeElement as HTMLElement | null;
    document.body.append(field); field.select();
    try { return document.execCommand("copy"); } catch { return false; }
    finally { field.remove(); focus?.focus(); }
  }
}
export function downloadFile(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.download = name; link.href = url;
  link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
