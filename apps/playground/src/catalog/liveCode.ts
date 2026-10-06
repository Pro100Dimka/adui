import * as React from "react";
import * as UI from "@ad-voice/ui";
import * as Core from "@ad-voice/ui/core";
import * as Editor from "@ad-voice/ui/editor";
import * as Forms from "@ad-voice/ui/forms";
import * as RouterModule from "@ad-voice/ui/router";

/** What `import … from "…"` resolves to inside edited examples. */
const modules: Record<string, unknown> = {
  react: React,
  "@ad-voice/ui": UI,
  "@ad-voice/ui/core": Core,
  "@ad-voice/ui/editor": Editor,
  "@ad-voice/ui/forms": Forms,
  "@ad-voice/ui/router": RouterModule,
};

/**
 * Turns an example into a module with a default component. Full examples pass as they are;
 * a bare snippet (imports, a few declarations, then JSX) is wrapped into one. Values the
 * snippet only refers to get stand-ins: `value={x}` + `setX` becomes state, anything else
 * is left undefined, so the component falls back to its defaults.
 */
export function toModule(code: string, exampleSource = "") {
  code = withMissingImports(code);
  if (/export\s+default/.test(code)) return code;
  const lines = code.split("\n");
  const imports = lines.filter((line) => /^\s*import\s/.test(line));
  const rest = lines.filter((line) => !/^\s*import\s/.test(line));
  const start = rest.findIndex((line) => /^\s*</.test(line));
  const statements = start < 0 ? rest : rest.slice(0, start);
  const markup = start < 0 ? [] : rest.slice(start);
  const body = rest.join("\n");
  const declared = new Set(
    [
      ...body.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g),
    ].map((m) => m[1]),
  );
  const imported = new Set(
    imports.flatMap((line) =>
      (line.match(/\{([^}]*)\}/)?.[1] ?? "")
        .split(",")
        .map((name) => name.trim()),
    ),
  );
  const used = new Set(
    [...markup.join("\n").matchAll(/=\{\s*([A-Za-z_$][\w$]*)\s*\}/g)].map(
      (m) => m[1],
    ),
  );
  const initialState = new Map(
    [...exampleSource.matchAll(/\bconst\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*[A-Za-z_$][\w$]*\s*\]\s*=\s*(?:React\.)?useState(?:<[^>]+>)?\(\s*([^\n)]*)\s*\)/g)]
      .map((match) => [match[1], match[2]]),
  );
  const stand = [...used]
    .filter(
      (name) =>
        !declared.has(name) && !imported.has(name) && name !== "undefined",
    )
    .filter(
      (name) => !/^set[A-Z]/.test(name) || !used.has(lowerFirst(name.slice(3))),
    )
    .map((name) => {
      const setter = `set${name[0].toUpperCase()}${name.slice(1)}`;
      return used.has(setter)
        ? `const [${name}, ${setter}] = React.useState(${initialState.get(name) ?? ""});`
        : /^set[A-Z]/.test(name)
          ? `const ${name} = () => {};`
          : `const ${name} = undefined;`;
    });
  return [
    ...(stand.length && !imports.some((line) => /import\s+(?:\*\s+as\s+)?React\b/.test(line))
      ? ['import * as React from "react";'] : []),
    ...imports,
    ...statements,
    "export default function Example() {",
    ...stand.map((line) => `  ${line}`),
    "  return (",
    "    <>",
    ...markup.map((line) => `      ${line}`),
    "    </>",
    "  );",
    "}",
  ].join("\n");
}

const lowerFirst = (s: string) => s[0].toLowerCase() + s.slice(1);

/** Library components used in the markup but not imported are imported automatically. */
function withMissingImports(code: string) {
  const known = (name: string) =>
    name in UI ? "@ad-voice/ui" : name in Editor ? "@ad-voice/ui/editor" : null;
  const imported = new Set(
    [...code.matchAll(/import\s*\{([^}]*)\}/g)].flatMap((m) =>
      m[1].split(",").map((name) => name.trim()),
    ),
  );
  const declared = new Set(
    [...code.matchAll(/(?:const|let|function|class)\s+([A-Z][\w$]*)/g)].map(
      (m) => m[1],
    ),
  );
  const missing = [
    ...new Set([...code.matchAll(/<([A-Z][\w$]*)/g)].map((m) => m[1])),
  ].filter((name) => !imported.has(name) && !declared.has(name) && known(name));
  if (!missing.length) return code;
  const from = (path: string) => missing.filter((name) => known(name) === path);
  const lines = ["@ad-voice/ui", "@ad-voice/ui/editor"]
    .filter((path) => from(path).length)
    .map((path) => `import { ${from(path).join(", ")} } from "${path}";`);
  return [...lines, code].join("\n");
}

/** Transform TSX without executing it; the sandboxed preview frame evaluates the result. */
export async function compile(code: string): Promise<string> {
  const { transform } = await import("sucrase");
  return transform(toModule(code), {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "classic",
    production: true,
  }).code;
}
