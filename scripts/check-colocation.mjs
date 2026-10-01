import fs from "node:fs";
import path from "node:path";
const root=path.resolve("packages/ui/src/components");
const required=["styles.css","example.tsx","meta.ts"];
const errors=[];let count=0;
for(const category of fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory())){
 const dir=path.join(root,category.name);
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  if(!item.isDirectory()||item.name.startsWith("_")) continue;
  const base=path.join(dir,item.name); const component=path.join(base,`${item.name}.tsx`);
  if(!fs.existsSync(component)) continue; count++;
  for(const name of required) if(!fs.existsSync(path.join(base,name))) errors.push(`${category.name}/${item.name}: missing ${name}`);
  for(const redundant of ["index.ts","index.tsx"]) if(fs.existsSync(path.join(base,redundant))) errors.push(`${category.name}/${item.name}: redundant ${redundant}`);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`Colocation OK: ${count} components; implementation, styles, example and meta stay together; no local barrel indexes.`);
