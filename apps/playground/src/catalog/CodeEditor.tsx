import { useEffect, useRef, useState } from "react";
import { Grid, resolveToken } from "@ad-voice/ui";
import type * as Monaco from "monaco-editor";

/**
 * The library's own sources and React's types, handed to the editor's TypeScript service so it
 * knows every component, prop, value and doc comment. Loaded only when an editor opens.
 */
const librarySources = import.meta.glob<string>(
  [
    "../../../../packages/ui/src/**/*.{ts,tsx}",
    "!../../../../packages/ui/src/**/example.tsx",
    "!../../../../packages/ui/src/**/meta.ts",
    "!../../../../packages/ui/src/dev/**",
  ],
  { query: "?raw", import: "default" },
);
const reactTypes = import.meta.glob<string>(
  [
    "../../../../node_modules/@types/react/index.d.ts",
    "../../../../node_modules/@types/react/global.d.ts",
    "../../../../node_modules/@types/react/jsx-runtime.d.ts",
    "../../../../node_modules/csstype/index.d.ts",
  ],
  { query: "?raw", import: "default" },
);

/** Diagnostics that only mean "this snippet leans on names the full example declares". */
const snippetNoise = [2304, 2552, 2582, 2307, 7016, 6133, 6192, 1208, 2686, 2792, 7006, 7031];

let ready: Promise<typeof Monaco> | null = null;

/** Monaco with workers, the TypeScript setup and a theme taken from the page's own colours. */
function loadMonaco(): Promise<typeof Monaco> {
  ready ??= (async () => {
    const [monaco, editorWorker, tsWorker] = await Promise.all([
      import("monaco-editor"),
      import("monaco-editor/editor/editor.worker?worker"),
      import("monaco-editor/languages/features/typescript/ts.worker?worker"),
    ]);
    (self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
      getWorker: (_: string, label: string) =>
        label === "typescript" || label === "javascript" ? new tsWorker.default() : new editorWorker.default(),
    };
    const ts = monaco.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      jsx: ts.JsxEmit.ReactJSX,
      allowNonTsExtensions: true,
      allowJs: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      baseUrl: "file:///",
      paths: {
        "@ad-voice/ui": ["file:///ad-ui/src/index.ts"],
        "@ad-voice/ui/*": ["file:///ad-ui/src/*"],
      },
    });
    ts.typescriptDefaults.setDiagnosticsOptions({ diagnosticCodesToIgnore: snippetNoise });
    ts.typescriptDefaults.setEagerModelSync(true);

    const [library, react] = await Promise.all([
      Promise.all(Object.entries(librarySources).map(async ([path, load]) => [path, await load()] as const)),
      Promise.all(Object.entries(reactTypes).map(async ([path, load]) => [path, await load()] as const)),
    ]);
    for (const [path, text] of library)
      ts.typescriptDefaults.addExtraLib(text, path.replace(/^.*packages\/ui\//, "file:///ad-ui/"));
    for (const [path, text] of react)
      ts.typescriptDefaults.addExtraLib(text, path.replace(/^.*node_modules\//, "file:///node_modules/"));
    return monaco;
  })();
  return ready;
}

/** The page's theme colours as Monaco colours, so the editor looks like the rest of the docs. */
function defineTheme(monaco: typeof Monaco, scope: Element) {
  const c = (token: string) => resolveToken(scope, token).slice(1);
  monaco.editor.defineTheme("neo", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: c("pink") },
      { token: "string", foreground: c("secondary-100") },
      { token: "number", foreground: c("warning") },
      { token: "comment", foreground: c("neutral-500"), fontStyle: "italic" },
      { token: "type", foreground: c("info") },
      { token: "tag", foreground: c("secondary") },
      { token: "attribute.name", foreground: c("secondary-200") },
    ],
    colors: {
      "editor.background": "#00000000",
      "editor.lineHighlightBackground": `#${c("primary-900")}55`,
      "editorLineNumber.foreground": `#${c("neutral-600")}`,
      "editorLineNumber.activeForeground": `#${c("secondary-100")}`,
      "editorCursor.foreground": `#${c("secondary")}`,
      "editor.selectionBackground": `#${c("primary-700")}88`,
      "editorSuggestWidget.background": `#${c("neutral-900")}`,
      "editorSuggestWidget.border": `#${c("primary-700")}`,
      "editorSuggestWidget.selectedBackground": `#${c("primary-800")}`,
      "editorHoverWidget.background": `#${c("neutral-900")}`,
      "editorHoverWidget.border": `#${c("primary-700")}`,
      "editorWidget.background": `#${c("neutral-900")}`,
    },
  });
}

let modelCount = 0;

/**
 * A code editor with real IntelliSense for the library: component and prop completion with their
 * docs, union values, hover info and type errors. Until it loads, a plain text area stands in.
 */
export function CodeEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let disposed = false;
    let model: Monaco.editor.ITextModel | undefined;
    void loadMonaco().then((monaco) => {
      const node = host.current;
      if (disposed || !node) return;
      defineTheme(monaco, node);
      model = monaco.editor.createModel(
        latest.current.value,
        "typescript",
        monaco.Uri.parse(`file:///example-${++modelCount}.tsx`),
      );
      editor.current = monaco.editor.create(node, {
        model,
        theme: "neo",
        automaticLayout: true,
        minimap: { enabled: false },
        fontFamily: getComputedStyle(node).getPropertyValue("--ad-font-family-mono") || "Consolas, monospace",
        fontSize: 13,
        lineHeight: 20,
        tabSize: 2,
        scrollBeyondLastLine: false,
        renderLineHighlight: "line",
        quickSuggestions: { other: true, strings: true, comments: false },
        suggestOnTriggerCharacters: true,
        fixedOverflowWidgets: false,
        padding: { top: 12, bottom: 12 },
        ariaLabel: label,
      });
      editor.current.onDidChangeModelContent(() => {
        const text = editor.current?.getValue() ?? "";
        if (text !== latest.current.value) latest.current.onChange(text);
      });
      // Dev only: lets browser automation drive the editor.
      if (import.meta.env.DEV) (window as unknown as { __neoCodeEditor?: unknown }).__neoCodeEditor = editor.current;
      setLoaded(true);
    });
    return () => {
      disposed = true;
      editor.current?.dispose();
      editor.current = null;
      model?.dispose();
    };
  }, [label]);

  // Outside changes (reset to the original) flow into the editor without losing the cursor otherwise.
  useEffect(() => {
    const current = editor.current;
    if (current && current.getValue() !== value) current.setValue(value);
  }, [value]);

  return (
    <Grid className="docs-code-editor" columns={1}>
      <div ref={host} className="docs-code-editor-host" data-loaded={loaded || undefined} />
      {!loaded && (
        <textarea
          className="docs-live-code"
          value={value}
          spellCheck={false}
          aria-label={label}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    </Grid>
  );
}
