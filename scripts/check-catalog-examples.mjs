import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manifest = JSON.parse(await readFile(resolve(root, "apps/playground/component-manifest.json"), "utf8"));
const source = await readFile(resolve(root, "apps/playground/src/catalog/examples.tsx"), "utf8");

const failures = [];
for (const item of manifest) {
  const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`case\\s+"${escaped}"\\s*:\\s*demo\\s*=\\s*([\\s\\S]*?);\\s*break;`));
  if (!match) {
    failures.push(`${item.name}: отсутствует case в examples.tsx`);
    continue;
  }
  if (!match[1].includes(`U.${item.name}`)) failures.push(`${item.name}: живой пример не использует U.${item.name}`);
}

if (failures.length) {
  console.error("Проверка каталога не пройдена:\n" + failures.map(x => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log(`OK: ${manifest.length} компонентов имеют живой JSX-пример, из которого автоматически строится показанный код.`);
