import type React from "react";
export type CatalogMeta = {
  name: string;
  description: string;
  category: string;
  wide?: boolean;
};
type EM = { default: React.ComponentType };
type MM = { default: CatalogMeta };
const e = import.meta.glob("../../../../packages/ui/src/**/example.tsx", {
  eager: true,
}) as Record<string, EM>;
const m = import.meta.glob("../../../../packages/ui/src/**/meta.ts", {
  eager: true,
}) as Record<string, MM>;
const r = import.meta.glob("../../../../packages/ui/src/**/example.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const n = (p: string) => p.split("/").at(-2) ?? p;
const examples = new Map(Object.entries(e).map(([p, v]) => [n(p), v.default]));
const sources = new Map(Object.entries(r).map(([p, v]) => [n(p), v]));
export const catalog = Object.values(m).map((x) => x.default);
export const getExample = (name: string) => examples.get(name);
export const getExampleSource = (name: string) =>
  sources.get(name) ?? `// Нет example.tsx для ${name}`;
