import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const inventory = JSON.parse(readFileSync(new URL("./library-inventory.json", import.meta.url), "utf8"));
const expected = {
  Icon: 'Иконка; surface="tile" добавляет контейнер вместо отдельного IconTile.',
  QuantumBackground: "Полный аудиовизуализатор Quantum Fields (MIT) в изолированном iframe; интерактивная сцена с управлением звуком и режимами.",
  QuantumFieldExperience: "Полный аудиовизуализатор Quantum Fields (MIT) в изолированном iframe; интерактивная сцена с управлением звуком и режимами.",
};
const results = [
  ...Object.entries(expected).map(([name, purpose]) => ({ name: `${name} exact purpose`, actual: inventory.components.find(component => component.name === name)?.purpose, expected: purpose })),
  { name: "QuantumFieldExperience compatibility alias", actual: inventory.components.find(component => component.name === "QuantumFieldExperience")?.aliasOf, expected: "QuantumBackground" },
  { name: "QuantumField remains a distinct native component", actual: inventory.components.find(component => component.name === "QuantumField")?.source, expected: "packages/ui/src/components/artwork/QuantumField/QuantumField.tsx" },
  { name: "public component count", actual: inventory.components.length, expected: 101 },
  { name: "non-component runtime export count", actual: inventory.utilitiesAndData.length, expected: 69 },
].map(check => {
  try { assert.deepEqual(check.actual, check.expected); return { ...check, passed: true }; }
  catch (error) { return { ...check, passed: false, error: error.message }; }
});
const report = { passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length, results };
const stage = process.argv[2] ?? "green";
writeFileSync(new URL(`./inventory-contracts-${stage}.json`, import.meta.url), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report));
if (report.failed) process.exitCode = 1;
