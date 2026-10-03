// Raw text of every example and library source, for the "Код", "API" and "Исходник" dialogs.
// Loaded lazily (see loadSources) so the docs start without ~400 KB of embedded text.

const sources = Object.entries(
  import.meta.glob<string>("../../../../packages/ui/src/**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
);

const sourceEntry = (name: string, file = `${name}.tsx`) =>
  sources.find(([path]) => path.endsWith(`/${name}/${file}`));
export const getExampleSource = (name: string) =>
  sourceEntry(name, "example.tsx")?.[1] ?? `// Нет example.tsx для ${name}`;
export const getComponentSource = (name: string) =>
  sourceEntry(name)?.[1] ?? "";
export const getComponentSourcePath = (name: string) =>
  sourceEntry(name)?.[0].replace(/^.*packages\/ui\/src\//, "src/") ?? "";

/** Text of the declaration starting at `marker`, up to its matching closing brace. */
function extractBlock(source: string, marker: string) {
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const brace = source.indexOf("{", start);
  if (brace < 0) {
    const end = source.indexOf(";", start);
    return source.slice(start, end < 0 ? source.length : end + 1).trim();
  }
  let depth = 0;
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0)
      return source.slice(start, index + 1).trim();
  }
  return source.slice(start).trim();
}

export const getComponentApiSource = (name: string) => {
  for (const [, source] of sources) {
    const value =
      extractBlock(source, `export interface ${name}Props`) ||
      extractBlock(source, `export type ${name}Props`);
    if (value) return value;
  }
  return `// ${name} не объявляет отдельный Props-интерфейс.\n// Компонент использует общие props или композицию дочерних компонентов.`;
};
