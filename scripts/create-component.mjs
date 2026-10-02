import fs from "node:fs";
import path from "node:path";

const [category, name, ...descriptionParts] = process.argv.slice(2);
const description = descriptionParts.join(" ") || `${name} component`;
const categories = new Set([
  "foundation",
  "layout",
  "controls",
  "feedback",
  "media",
  "editor",
  "compositions",
]);

if (
  !category ||
  !name ||
  !categories.has(category) ||
  !/^[A-Z][A-Za-z0-9]+$/.test(name)
) {
  console.error(
    'Usage: npm run create:component -- <category> <PascalName> "Описание"',
  );
  process.exit(1);
}

const dir = path.resolve("packages/ui/src/components", category, name);
if (fs.existsSync(dir)) {
  console.error(`Already exists: ${dir}`);
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, `${name}.tsx`),
  `import React from "react";\nimport { define, mark, type CommonProps } from "../../../core/base";\n\nexport interface ${name}Props extends CommonProps {}\n\nexport const ${name}=define<${name}Props>("${name}",p=><div {...mark("${name}",p)}>{p.children}</div>);\n`,
);
fs.writeFileSync(
  path.join(dir, "styles.css"),
  `/* Styles owned by ${name}. */\n.ad-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()} {}\n`,
);
fs.writeFileSync(
  path.join(dir, "example.tsx"),
  `import React from "react";\nimport { U } from "../../../dev/exampleHelpers";\nexport default function ${name}Example(){return <U.${name} />;}\n`,
);
fs.writeFileSync(
  path.join(dir, "meta.ts"),
  `export default ${JSON.stringify({ name, description, category }, null, 2)} as const;\n`,
);

const exportLine = `export { ${name} } from "./components/${category}/${name}/${name}";\nexport type { ${name}Props } from "./components/${category}/${name}/${name}";\n`;
const targets =
  category === "editor"
    ? ["packages/ui/src/editor.ts"]
    : category === "compositions"
      ? ["packages/ui/src/index.ts", "packages/ui/src/composites.ts"]
      : ["packages/ui/src/index.ts"];

for (const target of targets) {
  fs.appendFileSync(path.resolve(target), exportLine);
}

const cssEntry = path.resolve("packages/ui/src/components.css");
fs.appendFileSync(
  cssEntry,
  `@import "./components/${category}/${name}/styles.css";\n`,
);

console.log(
  `Created ${category}/${name}: implementation, styles, example and meta in one folder. No index.ts created.`,
);
