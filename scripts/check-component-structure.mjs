import fs from "node:fs";
import path from "node:path";
const root=path.resolve("packages/ui/src/components");
const categories=fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
let count=0; const errors=[];
for(const category of categories){
  const dir=path.join(root,category);
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    if(!item.isDirectory()||item.name.startsWith("_")) continue;
    const component=path.join(dir,item.name,`${item.name}.tsx`);
    if(!fs.existsSync(component)){errors.push(`${category}/${item.name}: missing ${item.name}.tsx`);continue;}
    if(fs.existsSync(path.join(dir,item.name,"index.ts"))||fs.existsSync(path.join(dir,item.name,"index.tsx"))) errors.push(`${category}/${item.name}: redundant index file`);
    count++;
  }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log(`Component structure OK: ${count} components, no redundant component indexes.`);
