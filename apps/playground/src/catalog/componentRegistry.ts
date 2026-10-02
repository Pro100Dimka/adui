import type React from "react";

export type CatalogMeta = {
  name: string;
  description: string;
  category: string;
  wide?: boolean;
};
type ExampleModule = { default: React.ComponentType };
type MetaModule = { default: CatalogMeta };

const examplesRaw = import.meta.glob(
  "../../../../packages/ui/src/**/example.tsx",
  { eager: true },
) as Record<string, ExampleModule>;
const metaRaw = import.meta.glob("../../../../packages/ui/src/**/meta.ts", {
  eager: true,
}) as Record<string, MetaModule>;
const exampleSourcesRaw = import.meta.glob(
  "../../../../packages/ui/src/**/example.tsx",
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;
const componentSourcesRaw = import.meta.glob(
  "../../../../packages/ui/src/**/*.{ts,tsx}",
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const componentNameFromPath = (path: string) => path.split("/").at(-2) ?? path;
const examples = new Map(
  Object.entries(examplesRaw).map(([path, value]) => [
    componentNameFromPath(path),
    value.default,
  ]),
);
const exampleSources = new Map(
  Object.entries(exampleSourcesRaw).map(([path, value]) => [
    componentNameFromPath(path),
    value,
  ]),
);

export const catalog = Object.values(metaRaw)
  .map((value) => value.default)
  .sort((a, b) => a.name.localeCompare(b.name));
export const componentSlug = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
export const getCatalogItemBySlug = (slug?: string) =>
  catalog.find((item) => componentSlug(item.name) === slug);
export const getExample = (name: string) => examples.get(name);
export const getExampleSource = (name: string) =>
  exampleSources.get(name) ?? `// Нет example.tsx для ${name}`;

const sourceEntries = Object.entries(componentSourcesRaw);
export const getComponentSource = (name: string) => {
  const suffix = `/${name}/${name}.tsx`;
  return sourceEntries.find(([path]) => path.endsWith(suffix))?.[1] ?? "";
};
export const getComponentSourcePath = (name: string) => {
  const suffix = `/${name}/${name}.tsx`;
  const path = sourceEntries.find(([candidate]) =>
    candidate.endsWith(suffix),
  )?.[0];
  return path?.replace(/^.*packages\/ui\/src\//, "src/") ?? "";
};

function extractBlock(source: string, marker: string) {
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const brace = source.indexOf("{", start);
  if (brace < 0) {
    const end = source.indexOf(";", start);
    return source.slice(start, end < 0 ? source.length : end + 1).trim();
  }
  let depth = 0;
  for (let index = brace; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1).trim();
    }
  }
  return source.slice(start).trim();
}

export const getComponentApiSource = (name: string) => {
  const interfaceMarker = `export interface ${name}Props`;
  const typeMarker = `export type ${name}Props`;
  for (const [, source] of sourceEntries) {
    const value =
      extractBlock(source, interfaceMarker) || extractBlock(source, typeMarker);
    if (value) return value;
  }
  return `// ${name} не объявляет отдельный Props-интерфейс.\n// Компонент использует общие props или композицию дочерних компонентов.`;
};

export const getImportPath = (item: CatalogMeta) =>
  item.category === "editor"
    ? "@ad-voice/ui/editor"
    : item.category === "patterns"
      ? "@ad-voice/ui/composites"
      : "@ad-voice/ui";
