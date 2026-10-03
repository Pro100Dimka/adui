import type React from "react";
import { version } from "../../../../packages/ui/package.json";

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
export const catalog = Object.values(metas).sort((a, b) =>
  a.name.localeCompare(b.name),
);
const componentSlug = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const componentHref = (name: string) =>
  `#/components/${componentSlug(name)}`;
export const getCatalogItemBySlug = (slug?: string) =>
  catalog.find((item) => componentSlug(item.name) === slug);
export const getExample = (name: string) => examples.get(name);
/** Raw sources for the code dialogs live in their own chunk, fetched after the page shows. */
export const loadSources = () => import("./sources");

/** The package installs straight from its GitHub release, no registry account needed. */
export const installCommand = `npm install https://github.com/Pro100Dimka/adui/releases/download/v${version}/ad-voice-ui-${version}.tgz`;
export const packageVersion = version;

export const getImportPath = (item: CatalogMeta) =>
  item.category === "editor" ? "@ad-voice/ui/editor" : "@ad-voice/ui";
