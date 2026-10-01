import fs from "node:fs";
import path from "node:path";

const componentRoot = path.resolve("packages/ui/src/components");
const errors = [];
let componentCount = 0;

const groups = fs.readdirSync(componentRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

function checkComponentFolder(folder, component) {
  const componentFile = path.join(folder, `${component}.tsx`);
  const indexFile = path.join(folder, "index.ts");

  if (!fs.existsSync(componentFile)) {
    errors.push(`${folder}: отсутствует ${component}.tsx`);
    return;
  }

  if (!fs.existsSync(indexFile)) {
    errors.push(`${folder}: отсутствует index.ts`);
  }

  const source = fs.readFileSync(componentFile, "utf8");
  const definitions = [
    ...source.matchAll(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:define|part)\b/g)
  ].map(match => match[1]);

  if (definitions.length !== 1 || definitions[0] !== component) {
    errors.push(
      `${componentFile}: ожидался ровно один компонент ${component}, найдено: ${definitions.join(", ") || "0"}`
    );
  }

  componentCount += 1;
}

for (const group of groups) {
  const groupPath = path.join(componentRoot, group);

  if (!fs.existsSync(path.join(groupPath, "index.ts"))) {
    errors.push(`${group}: отсутствует index.ts`);
  }

  for (const entry of fs.readdirSync(groupPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    checkComponentFolder(path.join(groupPath, entry.name), entry.name);
  }
}

const coreComponents = [
  ["packages/ui/src/core/providers/ThemeProvider", "ThemeProvider"],
  ["packages/ui/src/core/providers/MotionProvider", "MotionProvider"],
  ["packages/ui/src/core/motion/AnimatedBorder", "AnimatedBorder"]
];

for (const [folder, component] of coreComponents) {
  checkComponentFolder(path.resolve(folder), component);
}

if (errors.length) {
  console.error("\nComponent structure check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Component structure OK: ${componentCount} компонентов, один компонент на файл.`);
