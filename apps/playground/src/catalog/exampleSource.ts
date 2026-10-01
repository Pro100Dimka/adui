const editorComponents = new Set([
  "PianoKeyboard",
  "TimeRuler",
  "PianoRollGrid",
  "NoteBlock",
  "LyricsLane",
  "Playhead",
  "SelectionOverlay",
  "ZoomControl",
  "UndoRedoControls"
]);

const statePrelude: Record<string, string> = {
  value: 'const [value, setValue] = useState(35);',
  checked: 'const [checked, setChecked] = useState(true);',
  open: 'const [open, setOpen] = useState(false);',
  text: 'const [text, setText] = useState("Дмитрий");',
  choice: 'const [choice, setChoice] = useState("one");',
  note: 'const [note, setNote] = useState<NoteGeometry>({ x: 25, y: 54, width: 95 });',
  history: 'const [history, setHistory] = useState([0]);\nconst [cursor, setCursor] = useState(0);',
  anchor: 'const anchor = useRef<HTMLButtonElement>(null);'
};

function extractExpression(source: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`case\\s+"${escaped}"\\s*:\\s*demo\\s*=\\s*([\\s\\S]*?);\\s*break;`);
  return source.match(re)?.[1]?.trim() ?? null;
}

function referencedComponents(expression: string) {
  const names = new Set<string>();
  for (const match of expression.matchAll(/<U\.([A-Z][A-Za-z0-9]*)\b/g)) names.add(match[1]);
  for (const match of expression.matchAll(/\bU\.([a-zA-Z][A-Za-z0-9]*)\b/g)) {
    if (/^[A-Z]/.test(match[1])) names.add(match[1]);
  }
  return names;
}

function usesWord(source: string, word: string) {
  return new RegExp(`\\b${word}\\b`).test(source);
}

function indentJsx(source: string) {
  let text = source
    .replace(/\bU\./g, "")
    .replace(/></g, ">\n<")
    .replace(/}\s*</g, "}\n<")
    .replace(/>\s*{/g, ">\n{")
    .replace(/\)\s*;?$/g, ")")
    .trim();

  const lines = text.split("\n");
  let level = 0;
  return lines.map(raw => {
    const line = raw.trim();
    const closing = /^<\//.test(line) || /^<>?\s*<\//.test(line) || /^<\/?>$/.test(line) && line.startsWith("</");
    if (closing) level = Math.max(0, level - 1);
    const formatted = `${"  ".repeat(level)}${line}`;
    const opens = /^<([A-Z][A-Za-z0-9]*|div|span|strong|small|h\d|p|section|header|footer|nav)\b[^>]*>$/.test(line) || line === "<>";
    const selfClosing = /\/>$/.test(line);
    const sameLineClose = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>.*<\/\1>$/.test(line);
    if (opens && !selfClosing && !sameLineClose) level += 1;
    return formatted;
  }).join("\n");
}

function importLine(names: string[], path: string) {
  if (!names.length) return "";
  return `import { ${names.sort().join(", ")} } from "${path}";`;
}

export interface ExampleSourceResult {
  code: string;
  expression: string;
  found: boolean;
}

/**
 * Build the code panel directly from the exact JSX used by <Example />.
 * This intentionally reads examples.tsx as raw source so the docs cannot drift
 * away from the live specimen after someone edits the playground example.
 */
export function buildExampleSource(name: string, examplesSource: string): ExampleSourceResult {
  const rawExpression = extractExpression(examplesSource, name);
  if (!rawExpression) {
    return {
      found: false,
      expression: "",
      code: `// Не удалось извлечь живой пример ${name}.\n// Проверьте case \"${name}\" в catalog/examples.tsx.`
    };
  }

  const components = referencedComponents(rawExpression);
  const mainImports = [...components].filter(component => !editorComponents.has(component));
  const editorImports = [...components].filter(component => editorComponents.has(component));

  // items uses copyText directly after U. is removed.
  const needsItems = usesWord(rawExpression, "items");
  if (needsItems) mainImports.push("copyText");

  // Every live example appends the floating toast when it uses alert().
  const needsNotice = /\balert\s*\(/.test(rawExpression) || needsItems;
  if (needsNotice) mainImports.push("Toast");

  const imports = [...new Set(mainImports)];
  const editor = [...new Set(editorImports)];
  const hooks = new Set<string>();
  const prelude: string[] = [];

  for (const [key, code] of Object.entries(statePrelude)) {
    const relevant = key === "history"
      ? usesWord(rawExpression, "history") || usesWord(rawExpression, "cursor")
      : usesWord(rawExpression, key) || usesWord(rawExpression, `set${key[0].toUpperCase()}${key.slice(1)}`);
    if (!relevant) continue;
    prelude.push(code);
    if (key === "anchor") hooks.add("useRef"); else hooks.add("useState");
  }

  if (usesWord(rawExpression, "note")) editor.push("NoteGeometry");

  if (needsNotice) {
    hooks.add("useState");
    prelude.push('const [notice, setNotice] = useState("");');
    prelude.push('const alert = (message = "Действие выполнено в примере") => setNotice(message);');
  }

  if (needsItems) {
    prelude.push(`const items = [
  { label: "Переименовать", icon: "pencil", onSelect: () => alert("Переименование выбрано") },
  { label: "Копировать", icon: "copy", onSelect: () => { void copyText("A&D UI"); alert("Скопировано"); } },
  { separator: true },
  { label: "Удалить", icon: "trash", danger: true, onSelect: () => alert("Удаление выбрано. Файлы не затрагиваются.") }
];`);
  }

  const usesRow = /\brow\s*\(/.test(rawExpression);
  if (usesRow) {
    prelude.push('const row = (children: React.ReactNode) => <div className="sample-row">{children}</div>;');
  }

  const importParts: string[] = [];
  if (hooks.size || usesRow) {
    const values = [...hooks].sort();
    const valueImport = values.length ? `{ ${values.join(", ")} }` : "";
    const typeImport = usesRow ? 'type { ReactNode }' : "";
    if (valueImport) importParts.push(`import ${valueImport} from "react";`);
    if (typeImport) importParts.push('import type { ReactNode } from "react";');
  }

  // Avoid a playground-only React namespace in the displayed helper.
  for (let i = 0; i < prelude.length; i++) prelude[i] = prelude[i].replace("React.ReactNode", "ReactNode");

  if (imports.length) importParts.push(importLine(imports, "@ad-voice/ui"));
  if (editor.length) {
    const values = editor.filter(x => x !== "NoteGeometry");
    if (values.length) importParts.push(importLine(values, "@ad-voice/ui/editor"));
    if (editor.includes("NoteGeometry")) importParts.push('import type { NoteGeometry } from "@ad-voice/ui/editor";');
  }

  let expression = indentJsx(rawExpression);
  if (needsNotice) {
    expression = `<>
${expression.split("\n").map(line => `  ${line}`).join("\n")}
  <Toast floating open={!!notice} message={notice} onClose={() => setNotice("")} />
</>`;
  }

  const body = prelude.length ? `${prelude.join("\n")}\n\n` : "";
  const code = `${importParts.filter(Boolean).join("\n")}\n\nexport function ${name}Example() {\n${body.split("\n").filter((_, i, arr) => !(i === arr.length - 1 && arr[i] === "")).map(line => line ? `  ${line}` : "").join("\n")}${body ? "\n" : ""}  return (\n${expression.split("\n").map(line => `    ${line}`).join("\n")}\n  );\n}`;

  return { found: true, expression, code };
}
