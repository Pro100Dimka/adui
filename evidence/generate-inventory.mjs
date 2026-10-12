import ts from "typescript";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "packages/ui/src");
const entries = ["index", "core", "editor", "forms", "router"];
const config = ts.readConfigFile(resolve(root, "packages/ui/tsconfig.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, resolve(root, "packages/ui"));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const path = (file) => relative(root, file).replaceAll("\\", "/");
function descriptions(file) {
  const module = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const result = new Map();
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = new Map(node.properties.filter(ts.isPropertyAssignment).map(property => [property.name.getText(module), property.initializer]));
      const name = fields.get("name"), description = fields.get("description");
      if (name && description && ts.isStringLiteralLike(name) && ts.isStringLiteralLike(description)) result.set(name.text, description.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(module);
  return result;
}
const additionalDescriptions = descriptions(resolve(root, "apps/playground/src/catalog/componentRegistry.ts"));
const testFiles = readdirSync(resolve(root, "packages/ui/tests")).filter((file) => /\.test\./.test(file));
const tests = testFiles.map((file) => ({ file: `packages/ui/tests/${file}`, text: readFileSync(resolve(root, "packages/ui/tests", file), "utf8") }));
const audits = ["controls-audit", "layers-audit", "foundation-artwork-audit", "effects-media-audit", "feedback-root-review"]
  .flatMap((name) => {
    const file = `evidence/${name}.json`;
    if (!existsSync(resolve(root, file))) return [];
    const audit = JSON.parse(readFileSync(resolve(root, file), "utf8"));
    return [...(audit.registry ?? []), ...(audit.matrix ?? []), ...(audit.secondaryFeedback ?? [])]
      .map((entry) => ({ file, label: entry.name ?? entry.component, entry }));
  });
const sweepPath = resolve(root, "evidence/docs-sweep.json");
const browserCases = existsSync(sweepPath) ? JSON.parse(readFileSync(sweepPath, "utf8")).pages : [];
const utilityGroups = JSON.parse(readFileSync(resolve(root, "evidence/foundation-artwork-audit.json"), "utf8")).publicUtilities?.groups ?? [];
const exports = {};
const components = new Map();
for (const entry of entries) {
  const module = program.getSourceFile(resolve(source, `${entry}.ts`));
  exports[entry] = checker.getExportsOfModule(checker.getSymbolAtLocation(module)).map((alias) => {
    const symbol = alias.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(alias) : alias;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    const file = declaration?.getSourceFile().fileName;
    const type = declaration && checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const signature = type?.getCallSignatures()[0];
    if (file && /^[A-Z]/.test(alias.name) && signature) {
      const parameter = signature.parameters[0];
      const props = parameter && checker.getTypeOfSymbolAtLocation(parameter, declaration);
      const folder = dirname(file);
      const meta = resolve(folder, "meta.ts");
      const reviews = audits.filter((audit) => new RegExp(`\\b${alias.name}\\b`).test(audit.label));
      const browser = browserCases.filter((entry) => entry.name === alias.name);
      components.set(alias.name, {
        name: alias.name, source: path(file),
        purpose: additionalDescriptions.get(alias.name) ?? (existsSync(meta) ? descriptions(meta).get(alias.name) : null) ?? reviews[0]?.entry.contract ?? reviews[0]?.entry.purpose,
        entryPoints: [...(components.get(alias.name)?.entryPoints ?? []), entry],
        props: props ? checker.getPropertiesOfType(props).map((prop) => ({ name: prop.name, optional: !!(prop.flags & ts.SymbolFlags.Optional), type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, declaration)), description: ts.displayPartsToString(prop.getDocumentationComment(checker)) })) : [],
        dependencies: [...readFileSync(file, "utf8").matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]),
        documentation: { meta: existsSync(meta), canonicalExampleFile: existsSync(resolve(folder, "example.tsx")), ownPageRendered: browser.length > 0 },
        familyReviews: reviews,
        existingTests: tests.filter((test) => new RegExp(`\\b${alias.name}\\b`).test(test.text)).map((test) => test.file),
        matrix: [
          { scenario: "public props, dependencies, documentation and existing tests", expected: "discoverable contract", verification: "TypeScript compiler and source inventory", actual: "enumerated", fix: null, recheck: "regenerated from final source" },
          { scenario: "default documentation state at six viewport widths", expected: "real example renders without page/stage overflow or clipped actions", verification: "evidence/check-docs.mjs --sweep", actual: browser, fix: "see linked family defect matrices", recheck: browser.length === 6 && browser.every((row) => !row.exampleError && !row.pageOverflow && !row.clipped.length && row.stageOverflow.x <= 1 && row.stageOverflow.y <= 1) ? "passed" : "incomplete or failed" },
          { scenario: "component-specific states, interactions, themes and lifecycle", expected: "contracts reviewed and high-risk states exercised", verification: reviews.map((review) => review.file), actual: "see familyReviews for exact executed cases, source-only checks and limitations; not an exhaustive Cartesian test", fix: "recorded in each linked defect matrix", recheck: reviews.length ? "family audit linked" : "not reviewed" },
        ],
      });
    }
    return { name: alias.name, kind: symbol.flags & ts.SymbolFlags.Value ? "runtime" : "type", source: file ? path(file) : null };
  });
}
const css = readFileSync(resolve(source, "theme/tokens.css"), "utf8");
writeFileSync(resolve(root, "evidence/library-inventory.json"), JSON.stringify({
  baselineCommit: "12387d42ad37d53ea1aa5f4db2c76b4d678aec43",
  package: JSON.parse(readFileSync(resolve(root, "packages/ui/package.json"), "utf8")),
  exports, components: [...components.values()].sort((a, b) => a.name.localeCompare(b.name)),
  utilitiesAndData: exports.index.filter((entry) => entry.kind === "runtime" && !components.has(entry.name)).map((entry) => ({ ...entry, referencedByTests: tests.filter((test) => new RegExp(`\\b${entry.name}\\b`).test(test.text)).map((test) => test.file), review: utilityGroups.find((group) => group.exports.includes(entry.name)) })),
  tokens: [...new Set([...css.matchAll(/(--ad-[\w-]+)\s*:/g)].map((match) => match[1]))].sort(),
  themes: ["ruby", "light", "green", "violet"], colorSchemes: ["dark", "light"],
  baseline: { unit: "27 files, 322 tests passed", node: "22.18.0", npm: "10.9.3", os: "Windows", cpu: "Intel Core Ultra 7 265KF (20 logical processors)", performance: "Browser baseline captured separately; this is not a weak PC." },
}, null, 2) + "\n");
console.log(`Inventoried ${components.size} components and ${exports.index.length} root exports.`);
