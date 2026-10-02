import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const css = read("apps/playground/src/app/app.css");
const docs = read("apps/playground/src/catalog/ComponentDocsPage.tsx");
const sidebar = read("apps/playground/src/catalog/CatalogSidebar.tsx");
const navigation = read("apps/playground/src/catalog/catalogNavigation.ts");
const registry = read("apps/playground/src/catalog/componentRegistry.ts");
const failures = [];

for (const token of [
  "A&D UI DOCUMENTATION PORTAL",
  ".docs-primary-grid",
  ".docs-secondary-grid",
  ".docs-mobile-nav",
  ".docs-category-list",
  "@media(max-width:58rem)",
])
  if (!css.includes(token)) failures.push(`docs CSS missing ${token}`);

for (const token of [
  "docs-primary-grid",
  "docs-live-stage",
  "docs-section--api",
  "docs-secondary-grid",
  "docs-prev-next",
])
  if (!docs.includes(token))
    failures.push(`ComponentDocsPage missing ${token}`);
for (const token of [
  "docs-mobile-nav",
  "docs-nav-category",
  "componentSlug(item.name)",
])
  if (!sidebar.includes(token))
    failures.push(`CatalogSidebar missing ${token}`);
if (
  !registry.includes(
    'import.meta.glob("../../../../packages/ui/src/**/meta.ts"',
  )
)
  failures.push(
    "catalog registry must discover component metadata automatically",
  );
if (!navigation.includes("catalogCategories"))
  failures.push("catalog categories missing");

const metaFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name === "meta.ts") metaFiles.push(target);
  }
}
walk(path.join(root, "packages/ui/src/components"));
if (metaFiles.length < 50)
  failures.push(
    `unexpectedly low documented component count: ${metaFiles.length}`,
  );

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Docs release contracts OK: ${metaFiles.length} component pages, compact desktop + mobile navigation.`,
);
