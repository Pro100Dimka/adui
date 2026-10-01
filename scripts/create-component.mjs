import fs from "node:fs";
import path from "node:path";
const [category,name,...descriptionParts]=process.argv.slice(2);
const description=descriptionParts.join(" ")||`${name} component`;
const categories=new Set(["layout","controls","feedback","media","editor","compositions"]);
if(!category||!name||!categories.has(category)||!/^[A-Z][A-Za-z0-9]+$/.test(name)){
  console.error('Usage: npm run create:component -- <category> <PascalName> "Описание"'); process.exit(1);
}
const dir=path.resolve("packages/ui/src/components",category,name); if(fs.existsSync(dir)){console.error(`Already exists: ${dir}`);process.exit(1)}
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,`${name}.tsx`),`import React from "react";\nimport { define, mark, type CommonProps } from "../../../core/base";\n\nexport interface ${name}Props extends CommonProps {}\n\nexport const ${name}=define<${name}Props>("${name}",p=><div {...mark("${name}",p)}>{p.children}</div>);\n`);
fs.writeFileSync(path.join(dir,"styles.css"),`/* Styles owned by ${name}. */\n.ad-${name.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()} {}\n`);
fs.writeFileSync(path.join(dir,"example.tsx"),`import React from "react";\nimport { U } from "../../../dev/exampleHelpers";\nexport default function ${name}Example(){return <U.${name} />;}\n`);
fs.writeFileSync(path.join(dir,"meta.ts"),`export default ${JSON.stringify({name,description,category},null,2)} as const;\n`);
fs.writeFileSync(path.join(dir,"index.ts"),`export { ${name} } from "./${name}";\nexport type { ${name}Props } from "./${name}";\n`);
const barrel=path.resolve("packages/ui/src/components",category,"index.ts"); let source=fs.readFileSync(barrel,"utf8"); if(!source.includes(`./${name}`)) source+=`\nexport * from "./${name}";\n`; fs.writeFileSync(barrel,source);
console.log(`Created ${category}/${name}. Edit one folder: implementation, styles, example, meta, export.`);
