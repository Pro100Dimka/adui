import type React from "react";

export type CatalogMeta = {
  name: string;
  description: string;
  category: string;
  wide?: boolean;
};

const byComponent = <T>(modules: Record<string, T>) =>
  new Map(
    Object.entries(modules).map(([path, value]) => [
      path.split("/").at(-2)!,
      value,
    ]),
  );

const metas = import.meta.glob<CatalogMeta>(
  "../../../../packages/ui/src/components/*/*/meta.ts",
  { eager: true, import: "default" },
);
const examples = byComponent(
  import.meta.glob<React.ComponentType>(
    "../../../../packages/ui/src/components/*/*/example.tsx",
    { eager: true, import: "default" },
  ),
);
const exampleSources = byComponent(
  import.meta.glob<string>(
    "../../../../packages/ui/src/components/*/*/example.tsx",
    { eager: true, query: "?raw", import: "default" },
  ),
);
const sources = Object.entries(
  import.meta.glob<string>("../../../../packages/ui/src/**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
);

export const catalog = Object.values(metas).sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const componentSlug = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const componentHref = (name: string) =>
  `#/components/${componentSlug(name)}`;
export const getCatalogItemBySlug = (slug?: string) =>
  catalog.find((item) => componentSlug(item.name) === slug);
export const getExample = (name: string) => examples.get(name);
export const getExampleSource = (name: string) =>
  exampleSources.get(name) ?? `// Нет example.tsx для ${name}`;

const sourceEntry = (name: string) =>
  sources.find(([path]) => path.endsWith(`/${name}/${name}.tsx`));
export const getComponentSource = (name: string) =>
  sourceEntry(name)?.[1] ?? "";
export const getComponentSourcePath = (name: string) =>
  sourceEntry(name)?.[0].replace(/^.*packages\/ui\/src\//, "src/") ?? "";

/** Text of the declaration starting at `marker`, up to its matching closing brace. */
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
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0)
      return source.slice(start, index + 1).trim();
  }
  return source.slice(start).trim();
}

export const getComponentApiSource = (name: string) => {
  for (const [, source] of sources) {
    const value =
      extractBlock(source, `export interface ${name}Props`) ||
      extractBlock(source, `export type ${name}Props`);
    if (value) return value;
  }
  return `// ${name} не объявляет отдельный Props-интерфейс.\n// Компонент использует общие props или композицию дочерних компонентов.`;
};

export const getImportPath = (item: CatalogMeta) =>
  item.category === "editor" ? "@ad-voice/ui/editor" : "@ad-voice/ui";
