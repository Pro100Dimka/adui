import { lazy, type ComponentType } from "react";
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
/** Public components sharing a source folder still have independent documentation pages. */
export const additionalDocumentation: Record<string, CatalogMeta & { source: string; example: string; load: () => Promise<{ default: ComponentType }> }> = {
  LocaleProvider: {
    name: "LocaleProvider", category: "typography",
    description: "Язык встроенных текстов и собственные переводы внутри дерева React. Поддерживает ru, en, uk и вложенные провайдеры; пользовательский контент переводится отдельно.",
    source: "/core/i18n.tsx", example: "/dev/localeExample.tsx",
    load: () => import("../../../../packages/ui/src/dev/localeExample"),
  },
  SvgAsset: {
    name: "SvgAsset", category: "typography",
    description: "Доверенное SVG-дерево из React-ready JSON: независимые ID и ссылки для каждого экземпляра, доступное имя через label. Геометрия задаётся в node.props, размер — в style; компонент не очищает недоверенные данные.",
    source: "/core/artwork.tsx", example: "/dev/svgExample.tsx",
    load: () => import("../../../../packages/ui/src/dev/svgExample"),
  },
  BooleanControl: {
    name: "BooleanControl", category: "fields", description: "Общий логический контрол: Checkbox или Switch с управляемым и автономным состоянием.",
    source: "/controls/shared.tsx", example: "/controls/Checkbox/booleanExample.tsx",
    load: () => import("../../../../packages/ui/src/components/controls/Checkbox/booleanExample"),
  },
  QuantumBackground: {
    name: "QuantumBackground", category: "motion", wide: true,
    description: "Полный аудиовизуализатор Quantum Fields (MIT) в изолированном iframe. Все настройки сцены — пропсы, звук и снимки управляются через ref; панель настроек собирается рядом из компонентов кита.",
    source: "/artwork/QuantumField/QuantumFieldExperience.tsx", example: "/artwork/QuantumField/example.tsx",
    load: () => import("../../../../packages/ui/src/components/artwork/QuantumField/example"),
  },
};
const examples = byComponent(
  Object.fromEntries(Object.entries(import.meta.glob<{ default: ComponentType }>(
    "../../../../packages/ui/src/components/*/*/example.tsx",
  )).map(([path, load]) => [path, lazy(load)])),
);
for (const item of Object.values(additionalDocumentation)) examples.set(item.name, lazy(item.load));
const documentationParent: Record<string, string> = {
  Tab: "Tabs",
  TabPanel: "Tabs",
  MenuItem: "Menu",
  Form: "FormFields",
  Text: "Typography",
  DialogBody: "Dialog",
  DialogActions: "Dialog",
};
const legacyQuantumSlugs: Record<string, string> = {
  "quantum-field": "quantum-background",
  "quantum-field-experience": "quantum-background",
};
const allComponents = [...Object.values(metas).filter(item => item.name !== "QuantumField"), ...Object.values(additionalDocumentation)].sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const componentCount = allComponents.length;
export const catalog = allComponents;
const componentSlug = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const componentHref = (name: string) =>
  `#/components/${componentSlug(name)}`;
export const getCatalogItemBySlug = (slug?: string) => {
  return allComponents.find((item) => componentSlug(item.name) === (legacyQuantumSlugs[slug ?? ""] ?? slug));
};
export const getDocumentationParts = (name: string) =>
  allComponents.filter((item) => documentationParent[item.name] === name);
export const getExample = (name: string) => examples.get(name);
/** Raw sources for the code dialogs live in their own chunk, fetched after the page shows. */
export const loadSources = () => import("./sources");

export const installCommand = "npm install @neo-ui-kit/react";
export const packageVersion = version;

export const getImportPath = (item: CatalogMeta) =>
  item.category === "editor" ? "@neo-ui-kit/react/editor" : "@neo-ui-kit/react";
