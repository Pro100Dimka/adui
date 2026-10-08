import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { copyText } from "../src/core/base";
import { attachBorder } from "../src/core/motion-engine.js";
import { Slider } from "../src/components/controls/Slider/Slider";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { Avatar } from "../src/components/layout/Avatar/Avatar";
import { RotaryKnob } from "../src/components/media/RotaryKnob/RotaryKnob";
import { DataTable, FilterEditor, dataTableCsv } from "../src/components/feedback/DataTable/DataTable";
import { Form } from "../src/components/forms/Form/Form";
import { FormFields, defaultFieldRegistry } from "../src/components/forms/FormFields/FormFields";
import { Autocomplete } from "../src/components/controls/Autocomplete/Autocomplete";
import type { DataTableFilter } from "../src/components/feedback/shared";
import { defaultSettings, fonts, siteThemeProps, useSiteSettings } from "../../../apps/playground/src/app/siteSettings";
import { catalog, componentCount, getCatalogItemBySlug, getDocumentationParts, getExample } from "../../../apps/playground/src/catalog/componentRegistry";
import { compile, toModule } from "../../../apps/playground/src/catalog/liveCode";
import { LocaleProvider, getLocale, setLocale, translate } from "../src/core/i18n";
import { Toast } from "../src/components/feedback/Toast/Toast";
import { Dialog } from "../src/components/feedback/Dialog/Dialog";

it("composes the documentation UI and visual examples from kit primitives", () => {
  const surfaces = [
    "../../apps/playground/src/catalog/CatalogOverview.tsx",
    "../../apps/playground/src/catalog/ComponentDocsPage.tsx",
    "../../apps/playground/src/catalog/CodeEditor.tsx",
    "../../apps/playground/src/catalog/LiveEditor.tsx",
    "src/components/navigation/Router/example.tsx",
    "src/components/media/PianoKeyboard/example.tsx",
    "src/components/media/MediaCard/example.tsx",
    "src/components/media/MelodyRoll/example.tsx",
    "src/components/controls/DatePicker/example.tsx",
    "src/components/controls/ColorPicker/example.tsx",
    "src/components/controls/Chip/example.tsx",
    "src/components/effects/ImageShine/example.tsx",
    "src/components/effects/MelodixText/example.tsx",
    "src/components/layout/FloatingPanel/example.tsx",
    "src/components/layout/StatTile/example.tsx",
    "src/components/controls/Tab/example.tsx",
  ];
  for (const path of surfaces) {
    // A DOM host with a ref is still needed for visibility or preview APIs.
    const source = readFileSync(path, "utf8")
      .replace(/<div\b[^>]*\bref=\{[^}]+\}[^>]*>/g, "")
      .replace('<div id="root"></div>', "");
    expect(source, path).not.toMatch(/<(?:div|span|a|nav)\b/);
  }
});

it("locks the Linux Rollup binary needed by the release runner", () => {
  const lock = JSON.parse(readFileSync(new URL("../../../package-lock.json", import.meta.url), "utf8"));
  expect(lock.packages["node_modules/@rollup/rollup-linux-x64-gnu"]?.version).toBe(lock.packages["node_modules/rollup"].version);
});

it("builds the package before CI tests import its dist entry", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/release.yml", import.meta.url), "utf8");
  expect(workflow.indexOf("- run: npm run build --workspace @ad-voice/ui")).toBeLessThan(workflow.indexOf("- run: npm test --workspace @ad-voice/ui"));
});

describe("closed dialog work", () => {
  it("does not mount a dialog or its expensive children while closed", () => {
    expect(renderToStaticMarkup(createElement(Dialog, { open: false }, createElement("span", null, "Heavy editor")))).toBe("");
  });
});

describe("locale isolation", () => {
  it.each([
    ["Подробности строки {number}", "Row {number} details", "Подробиці рядка {number}"],
    ["Номер строки", "Row number", "Номер рядка"],
    ["Подробности", "Details", "Подробиці"],
    ["Действия", "Actions", "Дії"],
    ["Компактные строки", "Compact rows", "Компактні рядки"],
    ["Переместить влево: {title}", "Move left: {title}", "Перемістити ліворуч: {title}"],
    ["Переместить вправо: {title}", "Move right: {title}", "Перемістити праворуч: {title}"],
    ["Закрепить слева: {title}", "Pin left: {title}", "Закріпити ліворуч: {title}"],
    ["Закрепить справа: {title}", "Pin right: {title}", "Закріпити праворуч: {title}"],
    ["{from}–{to}", "{from}–{to}", "{from}–{to}"],
  ])("translates table control %s in both built-in alternate locales", (key, en, uk) => {
    const vars = { number: 7, title: "Name", from: 1, to: 25 };
    const filled = (text: string) => text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name as keyof typeof vars]));
    expect(translate("en", key, vars)).toBe(filled(en));
    expect(translate("uk", key, vars)).toBe(filled(uk));
  });

  it("preserves the imperative locale for components without a provider", () => {
    setLocale("en");
    expect(renderToStaticMarkup(createElement(Toast, { duration: 0 }))).toContain("Settings saved");
    setLocale("ru");
  });

  it("does not change the imperative default locale during provider rendering", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("ru");
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(createElement(LocaleProvider, { locale: "en" }, createElement(Toast, { duration: 0 }))); });
    expect(getLocale()).toBe("ru");
    act(() => tree.unmount());
  });

  it("keeps per-provider custom messages out of other roots", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let first!: ReturnType<typeof create>;
    let second!: ReturnType<typeof create>;
    let refresh!: () => void;
    function Probe() {
      const [version, setVersion] = useState(0);
      refresh = () => setVersion((value) => value + 1);
      return createElement(Toast, { duration: 0, className: String(version) });
    }
    act(() => { first = create(createElement(LocaleProvider, { locale: "en", messages: { "Настройки сохранены": "Saved A" } }, createElement(Probe))); });
    act(() => { second = create(createElement(LocaleProvider, { locale: "en", messages: { "Настройки сохранены": "Saved B" } }, createElement(Toast, { duration: 0 }))); });
    act(() => refresh());
    expect(first.root.findAllByType("span").at(-1)?.children).toEqual(["Saved A"]);
    act(() => { first.unmount(); second.unmount(); });
  });

  it("keeps translated components bound to their own provider after another root renders", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("ru");
    let english!: ReturnType<typeof create>;
    let ukrainian!: ReturnType<typeof create>;
    let refresh!: () => void;
    function Probe() {
      const [version, setVersion] = useState(0);
      refresh = () => setVersion((value) => value + 1);
      return createElement(Toast, { duration: 0, className: String(version) });
    }
    act(() => { english = create(createElement(LocaleProvider, { locale: "en" }, createElement(Probe))); });
    act(() => { ukrainian = create(createElement(LocaleProvider, { locale: "uk" }, createElement(Toast, { duration: 0 }))); });
    act(() => refresh());
    expect(english.root.findAllByType("span").at(-1)?.children).toEqual(["Settings saved"]);
    act(() => { english.unmount(); ukrainian.unmount(); });
    setLocale("ru");
  });
});

describe("release checks", () => {
  it("runs the package tests before creating a release archive", () => {
    const workflow = readFileSync("../../.github/workflows/release.yml", "utf8");
    expect(workflow).toMatch(/npm test --workspace @ad-voice\/ui/);
    expect(workflow.indexOf("npm test --workspace @ad-voice/ui")).toBeLessThan(workflow.indexOf("npm pack ./packages/ui"));
  });
  it("installs the packed release in a clean consumer before publishing", () => {
    const workflow = readFileSync("../../.github/workflows/release.yml", "utf8");
    expect(workflow).toContain("Smoke-test packed consumer");
    expect(workflow).toContain("npm install ../release/ad-voice-ui-${VERSION}.tgz");
    expect(workflow.indexOf("Smoke-test packed consumer")).toBeGreaterThan(workflow.indexOf("npm run package"));
  });
});

describe("documentation groups", () => {
  it("transforms edited code without executing it in the documentation page", async () => {
    const result = await compile('export default function Example() { return null; }');
    expect(result).toEqual(expect.any(String));
    expect(result).toContain("exports.default");
  });

  it("loads example components on demand instead of placing every example in the entry chunk", () => {
    expect(getExample("Button")).toHaveProperty("$$typeof", Symbol.for("react.lazy"));
  });
  it("does not load the executable code editor before its dialog opens", () => {
    const page = readFileSync("../../apps/playground/src/catalog/ComponentDocsPage.tsx", "utf8");
    expect(page).toContain('lazy(() => import("./LiveEditor"))');
  });
  it("does not fetch modal source code before a documentation dialog opens", () => {
    const page = readFileSync("../../apps/playground/src/catalog/ComponentDocsPage.tsx", "utf8");
    expect(page).toMatch(/useEffect\(\(\) => \{\s*if \(!modal \|\| sources\) return;/);
  });
  it("waits for a real example before mounting the live editor", () => {
    const page = readFileSync("../../apps/playground/src/catalog/ComponentDocsPage.tsx", "utf8");
    expect(page).toMatch(/modal === "example" \? \(\s*sources \?/);
  });

  it("puts compositional parts on one discoverable page while keeping old links working", () => {
    const groups = [
      ["tab", "Tab", "Tabs"], ["tab-panel", "TabPanel", "Tabs"],
      ["menu-item", "MenuItem", "Menu"], ["form", "Form", "FormFields"],
      ["text", "Text", "Typography"], ["dialog-body", "DialogBody", "Dialog"],
      ["dialog-actions", "DialogActions", "Dialog"],
    ];
    for (const [slug, part, parent] of groups) {
      expect(getCatalogItemBySlug(slug)?.name).toBe(parent);
      expect(catalog.some((item) => item.name === part)).toBe(false);
    }
    expect(catalog.some((item) => item.name === "Tabs")).toBe(true);
    expect(getDocumentationParts("Tabs").map((item) => item.name)).toEqual(["Tab", "TabPanel"]);
    expect(componentCount).toBeGreaterThan(catalog.length);
  });

  it("uses complete, copyable examples for the composed navigation and table pages", () => {
    for (const path of ["controls/Tabs", "feedback/DataTable"]) {
      const source = readFileSync(`src/components/${path}/example.tsx`, "utf8");
      expect(source).toContain("export default function");
      expect(source).toContain('from "@ad-voice/ui"');
      expect(source).not.toContain("dev/exampleHelpers");
    }
  });
  it("shows the compact Text component beside the full Typography scale", () => {
    const source = readFileSync("src/components/foundation/Typography/example.tsx", "utf8");
    expect(source).toContain("<Text ");
  });

  it("wraps live specimens in a self-contained component with its state import", () => {
    const code = toModule('import { Slider } from "@ad-voice/ui";\n<Slider value={volume} onValueChange={setVolume} />');

    expect(code).toContain('import * as React from "react"');
    expect(code).toContain("export default function Example()");
    expect(code).toContain("const [volume, setVolume] = React.useState()");
  });
  it("copies the real initial state into a generated interactive example", () => {
    const code = toModule(
      'import { Slider } from "@ad-voice/ui";\n<Slider value={volume} onValueChange={setVolume} />',
      'const [volume, setVolume] = useState(65);',
    );
    expect(code).toContain("const [volume, setVolume] = React.useState(65)");
  });
});

describe("documentation layout stability", () => {
  it("does not change scroll geometry as animated previews enter the viewport", () => {
    const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");
    const page = readFileSync("../../apps/playground/src/catalog/CatalogPage.tsx", "utf8");
    const overview = readFileSync("../../apps/playground/src/catalog/CatalogOverview.tsx", "utf8");

    expect(css).toMatch(/\.docs-showcase-tile\s*\{[^}]*block-size:\s*15rem;/s);
    expect(overview).not.toContain("ResizeObserver");
    expect(overview).not.toContain("style.gridColumn");
    expect(overview).not.toContain("specimen.style.zoom");
    expect(css).not.toContain("animation-timeline: view()");
    expect(css).not.toContain("animation-timeline: scroll(nearest)");
    for (const keyframes of css.match(/@keyframes docs-(?:page-in|page-out|section-in)\s*\{[\s\S]*?\n\}/g) ?? [])
      expect(keyframes).not.toContain("transform:");
    expect(css).toMatch(/\.docs-main\s*\{[^}]*scrollbar-gutter:\s*stable/s);
    expect(page).not.toContain('behavior: "smooth"');
  });
});

describe("site settings updates", () => {
  it("ignores a patch that does not change any setting", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {} });
    vi.stubGlobal("document", { documentElement: { style: { fontSize: "" } } });
    let renders = 0;
    let update!: ReturnType<typeof useSiteSettings>[1];
    const Probe = () => {
      const [, change] = useSiteSettings();
      update = change;
      renders++;
      return null;
    };
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(createElement(Probe)); });
    const initial = renders;

    act(() => update({ font: defaultSettings.font }));
    expect(renders).toBe(initial);
    act(() => update({ font: "melodix" }));
    expect(renders).toBe(initial + 1);

    act(() => tree.unmount());
    vi.unstubAllGlobals();
  });
});

describe("DataTable tools", () => {
  it("offers column visibility and exports the visible data as a safe CSV", () => {
    const columns = [{ key: "title", title: "Трек" }, { key: "artist", title: "Исполнитель" }];
    const rows = [{ title: 'Ночь, "неон"', artist: "Аура" }];
    const html = renderToStaticMarkup(createElement(DataTable, { columns, rows }));

    expect(html).toContain('aria-label="Столбцы"');
    expect(html).toContain('aria-label="Экспорт CSV"');
    expect(dataTableCsv(columns.slice(0, 1), rows)).toBe('"Трек"\r\n"Ночь, ""неон"""');
    expect(dataTableCsv(columns.slice(0, 1), [{ title: "=1+1", artist: "Аура" }]))
      .toBe('"Трек"\r\n"\'=1+1"');
  });

  it("keeps table geometry stable and gives the scroll surface a themed finish", () => {
    const css = readFileSync("src/components/feedback/DataTable/styles.css", "utf8");

    expect(css).not.toContain("animation: ad-table-row");
    expect(css).toMatch(/\.ad-data-table table\s*\{[^}]*table-layout:\s*fixed/s);
    expect(css).toMatch(/\.ad-data-table-scroll\s*\{[^}]*border:[^;]*var\(--ad-primary/s);
    expect(css).toMatch(/\.ad-data-table-tools\s*\{/);
  });

  it("renders each group as one coherent full-width summary instead of empty cells", () => {
    const columns = [
      { key: "artist", title: "Исполнитель" },
      { key: "plays", title: "Прослушивания", aggregate: (rows: Array<{ plays: number }>) => rows.reduce((sum, row) => sum + row.plays, 0) },
    ];
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns, rows: [{ artist: "Аура", plays: 12 }], defaultGroupBy: "artist", groupable: true,
    }));

    expect(html).toMatch(/class="ad-data-table-group"[^>]*><td colSpan="2">/);
    expect(html).toContain('class="ad-data-table-group-summary"');
    expect(html).toContain("Прослушивания");
  });
  it("separates grouped totals from the group name and anchors them on the far side", () => {
    const css = readFileSync("src/components/feedback/DataTable/styles.css", "utf8");
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [
        { key: "artist", title: "Исполнитель" },
        { key: "plays", title: "Прослушивания", aggregate: (rows: Array<{ plays: number }>) => rows.reduce((sum, row) => sum + row.plays, 0) },
      ],
      rows: [{ artist: "Аура", plays: 12 }], defaultGroupBy: "artist",
    }));

    expect(html).toMatch(/ad-data-table-group-toggle[\s\S]*?<\/button><div class="ad-data-table-group-summaries"/);
    expect(css).toMatch(/\.ad-data-table-group-summaries\s*\{[^}]*margin-inline-start:\s*auto/s);
  });
  it("uses an autocomplete with the column's distinct values and keeps multiple selections visible", () => {
    const html = renderToStaticMarkup(createElement(FilterEditor, {
      kind: "values", options: ["Аура", "Кай", "Мия"],
      filter: { kind: "values", values: ["Аура", "Мия"] }, onChange: vi.fn(),
    }));
    expect(html).toContain('role="combobox"');
    expect(html).toContain("Аура");
    expect(html).toContain("Мия");
    expect(html).toContain("Убрать");
  });
  it.each(["text", "values"] as const)("bounds %s filter suggestions after searching the entire column", (kind) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const options = Array.from({ length: 10_000 }, (_, index) => `Value${String(index).padStart(5, "0")}`);
    const original = [...options];
    const changed = vi.fn();
    function Probe() {
      const [filter, setFilter] = useState<DataTableFilter | undefined>(kind === "values"
        ? { kind: "values", values: [options[0]] }
        : undefined);
      return createElement(FilterEditor, { kind, options, filter, onChange: (next) => {
        changed(next);
        setFilter(next);
      } });
    }
    let tree!: ReturnType<typeof create>;
    try {
      act(() => { tree = create(createElement(Probe)); });
      const autocomplete = () => tree.root.findByType(Autocomplete);
      expect(autocomplete().props.options).toHaveLength(100);
      if (kind === "values") expect(autocomplete().props.options).not.toContain(options[0]);

      act(() => autocomplete().props.onValueChange("value09999"));
      expect(autocomplete().props.options).toEqual([options[9_999]]);
      if (kind === "values") {
        act(() => autocomplete().props.onOptionSelect(options[9_999]));
        expect(changed).toHaveBeenLastCalledWith({ kind: "values", values: [options[0], options[9_999]] });
        expect(autocomplete().props.options).not.toContain(options[9_999]);
        expect(autocomplete().props.value).toBe("");
      } else {
        expect(changed).toHaveBeenLastCalledWith({ kind: "text", text: "value09999" });
        act(() => autocomplete().props.onValueChange("Not listed"));
        expect(changed).toHaveBeenLastCalledWith({ kind: "text", text: "Not listed" });
        expect(autocomplete().props.options).toEqual([]);
      }
      expect(options).toEqual(original);
    } finally {
      if (tree) act(() => tree.unmount());
      vi.unstubAllGlobals();
    }
  });
  it("offers a way to clear selected rows without changing the current filters", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "artist", title: "Исполнитель" }],
      rows: [{ artist: "Аура" }], selectable: true, defaultSelected: ["0"],
    }));

    expect(html).toContain("Снять выделение");
  });
  it("provides an accessible column resize handle with a visible interaction target", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "artist", title: "Исполнитель" }, { key: "plays", title: "Прослушивания", resizable: false }],
      rows: [{ artist: "Аура", plays: 12 }],
    }));
    const css = readFileSync("src/components/feedback/DataTable/styles.css", "utf8");

    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-label="Изменить ширину: Исполнитель"');
    expect(html).not.toContain('aria-label="Изменить ширину: Прослушивания"');
    expect(css).toMatch(/\.ad-data-table-resize\s*\{[^}]*touch-action:\s*none/s);
  });
  it("lets readers change page size and shows the actual visible result range", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "title", title: "Трек" }],
      rows: Array.from({ length: 8 }, (_, index) => ({ title: `Трек ${index}` })),
      pageSize: 6, pageSizeOptions: [6, 12],
    }));

    expect(html).toContain("Строк на странице");
    expect(html).toContain("aria-labelledby=");
    expect(html).toContain("1–6 из 8");
  });
  it("keeps the initial page size selectable even when custom choices omit it", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "title", title: "Трек" }], rows: [{ title: "Неон" }],
      pageSize: 6, pageSizeOptions: [12, 24],
    }));

    expect(html).toContain('ad-select-value-text">6</span>');
  });
  it("offers a single reset for sorting, filters, grouping, search and hidden columns", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "artist", title: "Исполнитель" }],
      rows: [{ artist: "Аура" }], defaultSort: { key: "artist", direction: "asc" },
    }));
    const source = readFileSync("src/components/feedback/DataTable/DataTable.tsx", "utf8");

    expect(html).toContain('aria-label="Сбросить вид"');
    expect(source).toMatch(/setHiddenColumns\(\[\]\)/);
    expect(source).toMatch(/setCollapsed\(new Set\(\)\)/);
  });
  it("labels cells for a readable mobile card layout", () => {
    const html = renderToStaticMarkup(createElement(DataTable, {
      columns: [{ key: "title", title: "Трек" }, { key: "artist", title: "Исполнитель" }],
      rows: [{ title: "Неон", artist: "Кай" }],
    }));
    const css = readFileSync("src/components/feedback/DataTable/styles.css", "utf8");

    expect(html).toContain('data-label="Исполнитель"');
    expect(css).toMatch(/@media \(max-width: 48rem\)[\s\S]*\.ad-data-table(?::not\(\[data-(?:virtual|pinned)\]\))* tbody tr:not\(\.ad-data-table-group\)/);
    expect(css).toContain("content: attr(data-label)");
  });
});

describe("Slider", () => {
  it("shows its label next to the range control instead of using it only as an accessible name", () => {
    const html = renderToStaticMarkup(createElement(Slider, { label: "Громкость", value: 35 }));

    expect(html).toMatch(/<label[^>]*>.*Громкость.*<input[^>]*type="range"/);
  });

  it("visually mutes the disabled track and thumb", () => {
    const css = readFileSync("src/components/controls/Slider/styles.css", "utf8");

    expect(css).toMatch(/\.ad-slider:disabled\s*\{[^}]*opacity:\s*0\.42[^}]*filter:\s*saturate\(0\.2\)/s);
  });
});

describe("FilePicker avatar", () => {
  it("describes the avatar chooser in the localized documentation", () => {
    const meta = readFileSync("src/components/controls/FilePicker/meta.ts", "utf8");
    const messages = readFileSync("../../apps/playground/src/app/docsMessages.ts", "utf8");
    expect(meta).toContain("аватар");
    expect(messages).toContain("анімована печатка з ім’ям і фото");
  });
  it("uses the animated avatar as the image chooser and shows a supplied photo", () => {
    const html = renderToStaticMarkup(createElement(FilePicker, {
      variant: "avatar", name: "Дмитрий", src: "/portrait.png", label: "Изменить фото",
    }));

    expect(html).toContain('data-variant="avatar"');
    expect(html).toContain('aria-label="Изменить фото"');
    expect(html).toContain('class="ad-host-seal"');
    expect(html).toContain('href="/portrait.png"');
    expect(html).toContain('>Дмитрий</text>');
    expect(html).not.toContain('class="host-emblem__crown"');
    expect(html).toContain('type="file"');
  });

  it("reveals an edit icon on hover and keyboard focus", () => {
    const css = readFileSync("src/components/controls/FilePicker/styles.css", "utf8");

    expect(css).toMatch(/\.ad-file-picker-avatar-button:is\(:hover, :focus-visible\)\s+\.ad-file-picker-avatar-edit,/);
    expect(css).toMatch(/\.ad-file-picker\[data-variant="avatar"\]\[data-over\]\s+\.ad-file-picker-avatar-edit\s*\{[^}]*opacity:\s*1/s);
    expect(css).toMatch(/\.ad-file-picker-avatar-edit\s*\{[^}]*z-index:\s*1/s);
    expect(css).toMatch(/\.ad-file-picker-avatar-edit\s*\{[^}]*background:\s*var\(--ad-primary-800\);[^}]*color:\s*var\(--ad-on-accent\)/s);
  });
});

describe("Avatar host", () => {
  it("shows the person's initial and name instead of the HOST crown when named", () => {
    const html = renderToStaticMarkup(createElement(Avatar, { variant: "host", name: "Дмитрий" }));

    expect(html).toContain('class="host-emblem__initial"');
    expect(html).toContain('>Д</text>');
    expect(html).toContain('>Дмитрий</text>');
    expect(html).not.toContain('class="host-emblem__crown"');
    expect(html).not.toContain('>HOST</text>');
  });

  it("keeps the branded crown only when no person is named", () => {
    const html = renderToStaticMarkup(createElement(Avatar, { variant: "host" }));

    expect(html).toContain('class="host-emblem__crown"');
    expect(html).toContain('>HOST</text>');
  });
});

describe("FormFields", () => {
  it("registers RotaryKnob as a declarative form field", () => {
    expect(defaultFieldRegistry.rotary).toBe(RotaryKnob);
    const form = {
      values: { gain: 42 },
      field: () => ({ value: 42, onValueChange: vi.fn() }),
    } as any;
    const html = renderToStaticMarkup(createElement(Form, { form },
      createElement(FormFields, { fields: [{ name: "gain", kind: "rotary", label: "Усиление" }] })));

    expect(html).toContain('data-ad-component="RotaryKnob"');
    expect(html).toContain("Усиление");
  });

  it("registers every standalone field control", () => {
    expect(Object.keys(defaultFieldRegistry).sort()).toEqual([
      "autocomplete", "checkbox", "color", "date", "file", "number", "people",
      "rotary", "select", "slider", "switch", "tags", "text", "textarea",
    ]);
  });

  it("centers controls of different heights within each grid row", () => {
    const form = {
      values: { enabled: true },
      field: () => ({ value: true, onValueChange: vi.fn() }),
    } as any;
    const html = renderToStaticMarkup(createElement(Form, { form },
      createElement(FormFields, { fields: [{ name: "enabled", kind: "switch", label: "Включено" }] })));

    expect(html).toContain("--ad-grid-align:center");
  });

  it("aligns the control row independently of labels and helper messages", () => {
    const form = {
      values: { people: [], confirmed: false, monitor: true },
      field: (name: string) => ({ value: name === "people" ? [] : false, onValueChange: vi.fn() }),
    } as any;
    const html = renderToStaticMarkup(createElement(Form, { form },
      createElement(FormFields, { fields: [
        { name: "people", kind: "people", label: "Участники с длинным многострочным названием", span: 6,
          props: { description: "Сообщение под полем не должно смещать соседний переключатель" } },
        { name: "confirmed", kind: "checkbox", label: "Настройки проверены", span: 3 },
        { name: "monitor", kind: "switch", label: "Мониторинг", span: 3 },
      ] })));
    const css = readFileSync(new URL("../src/components/forms/FormFields/styles.css", import.meta.url), "utf8");

    expect(html).toContain('class="ad-grid ad-form-fields"');
    expect(html.match(/class="ad-grid-item ad-form-field"/g)).toHaveLength(3);
    // One shared auto-sized label/control/message layout per responsive row: no guessed label height.
    expect(css).toMatch(/\.ad-form-fields\.ad-grid\s*\{[^}]*grid-auto-rows:\s*auto auto auto minmax\(/);
    expect(css).toMatch(/\.ad-form-field\s*\{[^}]*grid-row-end:\s*span 4;[^}]*grid-template-rows:\s*subgrid;/);
    expect(css).toMatch(/\.ad-form-field > \*\s*\{[^}]*grid-row:\s*2;[^}]*align-self:\s*center;/);
    expect(css).toMatch(/\.ad-form-field \.ad-field > \.ad-field-label\s*\{[^}]*grid-row:\s*1;/);
    expect(css).toMatch(/\.ad-form-field \.ad-field > \.ad-field-message\s*\{[^}]*grid-row:\s*3;/);
  });

  it("binds a file field to its file list and shows selected names", () => {
    const form = {
      values: { upload: [{ name: "demo.wav" }] },
      field: () => ({ value: [{ name: "demo.wav" }], onValueChange: vi.fn() }),
    } as any;
    const html = renderToStaticMarkup(createElement(Form, { form },
      createElement(FormFields, { fields: [{ name: "upload", kind: "file", label: "Запись" }] })));

    expect(html).toContain('type="file"');
    expect(html).toContain("demo.wav");
  });
});

describe("copyText", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the fallback field inside the viewport so copying cannot flash a horizontal scrollbar", async () => {
    let overflowed = false;
    const field = {
      value: "",
      style: { cssText: "" },
      select: vi.fn(),
      remove: vi.fn(),
    };
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard unavailable")) },
    });
    vi.stubGlobal("document", {
      activeElement: null,
      createElement: vi.fn(() => field),
      body: {
        append: vi.fn(() => {
          overflowed = /left:\s*-/.test(field.style.cssText);
        }),
      },
      execCommand: vi.fn(() => true),
    });

    expect(await copyText("loader code")).toBe(true);
    expect(overflowed).toBe(false);
  });
});

const borderNode = (tag: string, length: () => number = () => 400) => ({
  tagName: tag,
  className: "",
  children: [] as any[],
  attributes: {} as Record<string, string>,
  style: {} as Record<string, any>,
  append(...children: any[]) { this.children.push(...children); },
  setAttribute(name: string, value: string) { this.attributes[name] = value; },
  getTotalLength: vi.fn(length),
  getPointAtLength: vi.fn(() => ({ x: -100, y: -100 })),
  remove: vi.fn(),
});
const stubBorderDocument = (length?: () => number) =>
  vi.stubGlobal("document", {
    createElement: (tag: string) => borderNode(tag, length),
    createElementNS: (_namespace: string, tag: string) => borderNode(tag, length),
  });
/** Where a light's spots were moved to, back in contour coordinates. */
const spotAt = (light: any) => {
  const [x, y] = light.spots[0].style.transform.match(/-?[\d.]+(?=px)/g).map(Number);
  return { x: x + light.radius - 16, y: y + light.radius - 16 };
};

describe("AnimatedBorder", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("limits idle frames and restores full-rate motion on hover", () => {
    let hovered = false;
    stubBorderDocument();
    const host = Object.assign(borderNode("section"), { offsetWidth: 200, offsetHeight: 100, matches: () => hovered });
    vi.stubGlobal("getComputedStyle", () => ({ position: "relative", borderTopLeftRadius: "18px" }));
    const add = vi.fn(() => vi.fn());
    const border = attachBorder(host as any, { scope: { add } as any }) as any;
    const onFrame = add.mock.calls[0]![1] as (time: number) => void;
    const moves = () => border.lights[0].spots[0].style.transform;
    let frames = 0, last = moves();
    const count = () => { if (moves() !== last) { frames++; last = moves(); } };

    for (let frame = 1; frame <= 30; frame++) { onFrame(frame / 30); count(); }
    expect(frames).toBeLessThanOrEqual(12);
    expect(frames).toBeGreaterThanOrEqual(8);

    hovered = true;
    frames = 0;
    for (let frame = 31; frame <= 40; frame++) { onFrame(frame / 30); count(); }
    expect(frames).toBe(10);
    border.destroy();
  });

  it("keeps the light-mode halo restrained without dimming the precise edge", () => {
    const css = readFileSync("src/theme/base.css", "utf8");
    expect(css).toMatch(/\[data-ad-color-mode="light"\] \.ad-border \.ad-border-aura\s*\{[^}]*opacity:\s*0\.4/s);
  });

  it.each([
    { name: "rectangle", width: 200, height: 100, radius: "0px", points: [[0, 0.65, 0.65], [0.25, 149.35, 0.65], [0.5, 199.35, 99.35], [0.75, 50.65, 99.35], [1, 0.65, 0.65]] },
    { name: "square", width: 100, height: 100, radius: "0px", points: [[0.25, 99.35, 0.65], [0.5, 99.35, 99.35], [0.75, 0.65, 99.35]] },
    { name: "rounded tangents and arc", width: 100, height: 60, radius: "10.65px", points: [[78.7 / (234.8 + 20 * Math.PI), 89.35, 0.65], [(78.7 + 2.5 * Math.PI) / (234.8 + 20 * Math.PI), 89.35 + Math.SQRT1_2 * 10, 10.65 - Math.SQRT1_2 * 10], [(78.7 + 5 * Math.PI) / (234.8 + 20 * Math.PI), 99.35, 10.65], [0.5, 89.35, 59.35]] },
    { name: "percentage capsule", width: 200, height: 40, radius: "50%", points: [[0, 20, 0.65], [0.5, 180, 39.35]] },
    { name: "circle", width: 40, height: 40, radius: "50%", points: [[0, 20, 0.65], [0.25, 39.35, 20], [0.5, 20, 39.35], [0.75, 0.65, 20]] },
    { name: "clamped oversized radius", width: 120, height: 40, radius: "999px", points: [[0, 20, 0.65], [0.5, 100, 39.35]] },
    { name: "percentage radius", width: 120, height: 80, radius: "25%", points: [[0, 20, 0.65], [0.5, 100, 79.35]] },
    { name: "one-pixel rectangle", width: 1, height: 1, radius: "0px", points: [[0, 0.65, 0.65], [0.25, 0.35, 0.65], [0.5, 0.35, 0.35], [0.75, 0.65, 0.35]] },
  ])("moves the lights along $name from cached contour geometry without native SVG queries", ({ width, height, radius, points }) => {
    stubBorderDocument();
    const host = Object.assign(borderNode("section"), { offsetWidth: width, offsetHeight: height });
    vi.stubGlobal("getComputedStyle", () => ({ position: "relative", borderTopLeftRadius: radius }));
    const border = attachBorder(host as any, {}) as any;
    const native = border.path.getPointAtLength;
    native.mockClear();
    for (let frame = 1; frame <= 100; frame++) border.paint(frame / 30);
    expect(native).not.toHaveBeenCalled();
    expect(border.path.getTotalLength).toHaveBeenCalledOnce();
    border.elapsed = 0;
    border.previousTime = null;
    for (const [fraction, x, y] of points) {
      border.lights.forEach((light: any) => { light.phase = fraction; });
      border.paint(0);
      for (const light of border.lights) {
        expect(light.at.x).toBeCloseTo(x!, 1);
        expect(light.at.y).toBeCloseTo(y!, 1);
        // Both spots of a light (aura and core) sit on the same point.
        expect(spotAt(light).x).toBeCloseTo(x!, 1);
        expect(spotAt(light).y).toBeCloseTo(y!, 1);
        expect(light.spots[1].style.transform).toBe(light.spots[0].style.transform);
      }
    }
    border.destroy();
  });

  it("restores the early-release pair of broad luminous orbits as still rings lit by moving spots", () => {
    let perimeter = 400;
    stubBorderDocument(() => perimeter);
    const host = Object.assign(borderNode("section"), { offsetWidth: 200, offsetHeight: 100 });
    vi.stubGlobal("getComputedStyle", () => ({ position: "relative", borderTopLeftRadius: "18px" }));
    const unsubscribe = vi.fn();
    const add = vi.fn(() => unsubscribe);

    const border = attachBorder(host as any, { scope: { add } as any }) as any;
    const overlay = host.children[0];
    expect(overlay.className).toBe("ad-border");
    const [edge, aura, core] = overlay.children;
    expect(edge.tagName).toBe("svg");
    expect([aura.className, core.className]).toEqual(["ad-border-aura", "ad-border-core"]);
    // The rings are mask pictures of the contour: the halo's stacked strokes and the fine core.
    const strokes = (ring: any) =>
      [...decodeURIComponent(ring.style.maskImage).matchAll(/stroke-width='([\d.]+)'/g)].map((m) => Number(m[1]));
    expect(strokes(aura)).toEqual([25, 22, 19, 16, 13, 10, 7, 4]);
    expect(strokes(core)).toEqual([1.35]);
    expect(decodeURIComponent(aura.style.maskImage)).toContain(border.path.attributes.d);
    expect(aura.style.webkitMaskImage).toBe(aura.style.maskImage);
    expect(decodeURIComponent(aura.style.maskImage)).not.toMatch(/filter|Blur/);
    // Each ring carries one spot per light, in the theme colours.
    expect(aura.children).toHaveLength(2);
    expect(core.children).toHaveLength(2);
    expect(core.children[0].style.background).toMatch(
      /^radial-gradient\(circle closest-side, var\(--ad-neutral-200\) 0%, var\(--ad-neutral-200\) 4%, var\(--ad-secondary\) 16%/,
    );
    expect(aura.children[0].style.background).toMatch(/^radial-gradient\(circle closest-side, var\(--ad-primary\) 0%/);
    expect([...aura.children, ...core.children].every((spot: any) => !/on-accent/.test(spot.style.background))).toBe(true);

    expect(add).toHaveBeenCalledOnce();
    const masks = [aura.style.maskImage, core.style.maskImage];
    const initial = border.lights[0].spots[0].style.transform;
    add.mock.calls[0][1](1);
    // A frame only moves the spots: the rings and the edge stay as they were.
    expect(border.lights[0].spots[0].style.transform).not.toBe(initial);
    expect([aura.style.maskImage, core.style.maskImage]).toEqual(masks);
    expect(border.path.getPointAtLength).not.toHaveBeenCalled();
    expect(border.lights[0].spots[0].style.transform).not.toBe(border.lights[1].spots[0].style.transform);
    const moved = border.lights[0].spots[0].style.transform;
    const lap = perimeter / border.lights[0].speed;
    for (let step = 1; step <= 32; step++) add.mock.calls[0][1](1 + step * lap / 32);
    expect(border.lights[0].spots[0].style.transform).toBe(moved);
    const beforePause = border.elapsed;
    add.mock.calls[0][1](1004.7);
    expect(border.elapsed - beforePause).toBeCloseTo(0.1);
    expect(border.lights.map((light: any) => light.speed)).toEqual([125, 86]);
    for (const light of border.lights) expect(light.radius).toBeCloseTo(61.2);
    perimeter = 1200;
    border.sync();
    for (const light of border.lights) {
      expect(light.radius).toBeCloseTo(183.6);
      for (const spot of light.spots) expect(parseFloat(spot.style.width)).toBeCloseTo(367.2);
    }
    const other = Object.assign(borderNode("section"), { offsetWidth: 200, offsetHeight: 100 });
    const second = attachBorder(other as any, { scope: { add } as any }) as any;
    expect(second.lights[0].phase).not.toBe(border.lights[0].phase);
    const roundHost = Object.assign(borderNode("section"), { offsetWidth: 40, offsetHeight: 40 });
    const roundBorder = attachBorder(roundHost as any, { round: true, scope: { add } as any }) as any;
    expect(roundBorder.lights.map((light: any) => light.speed)).toEqual([36, 25]);
    expect(roundBorder.lights.map((light: any) => light.radius)).toEqual([28, 28]);
    roundBorder.destroy();
    second.destroy();
    border.destroy();
    expect(overlay.remove).toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledTimes(3);
  });

  it("shows AnimatedBorder itself, not an unrelated wave artwork, in its documentation hero", () => {
    const page = readFileSync("../../apps/playground/src/catalog/ComponentDocsPage.tsx", "utf8");
    expect(page).toMatch(/item\.name !== "AnimatedBorder"\s*&&\s*<HeroBackdrop index=\{catalog\.indexOf\(item\)\} \/>/);
  });

  it("gives the overview one leading light surface and quiet supporting install controls", () => {
    const overview = readFileSync("../../apps/playground/src/catalog/CatalogOverview.tsx", "utf8");
    const copyButton = readFileSync("../../apps/playground/src/catalog/CopyButton.tsx", "utf8");
    const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");
    expect(css).toMatch(/\.docs-component-hero\.ad-card\s*\{[^}]*box-shadow:\s*inset/s);
    expect(css).toMatch(/\.docs-overview-hero \.docs-install\.ad-card\s*\{[^}]*box-shadow:\s*inset/s);
    expect(css).toMatch(/\.docs-overview-hero \.docs-hero-backdrop\s*\{[^}]*opacity:\s*0\.56/s);
    expect(css).toMatch(/\.docs-install-line\.ad-typography\s*\{[^}]*color:\s*var\(--ad-text\)/s);
    expect(overview).toContain('<CopyButton text={line} variant="ghost" />');
    expect(copyButton).toContain('variant = "secondary"');
  });

  it("gives the install surface, copy controls and hero lines a shared optical finish", () => {
    const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");
    expect(css).toMatch(/\.docs-overview-hero \.docs-install\.ad-card::before\s*\{[^}]*linear-gradient/s);
    expect(css).toMatch(/\.docs-overview-hero \.docs-install \.ad-button\[data-ad-variant="ghost"\]\s*\{[^}]*background:\s*linear-gradient/s);
    expect(css).toMatch(/\.docs-overview-hero \.docs-hero-backdrop\s*\{[^}]*mask:\s*radial-gradient/s);
  });
});

describe("documentation motion", () => {
  it("does not mount every live showcase example before its tile enters the viewport", () => {
    const overview = readFileSync("../../apps/playground/src/catalog/CatalogOverview.tsx", "utf8");
    expect(overview).toMatch(/IntersectionObserver/);
    expect(overview).toMatch(/\{showPreview\s*&&\s*Example\s*&&\s*<Suspense/);
    expect(overview).toContain("setShowPreview(entry.isIntersecting)");
  });

  it("clips the animated component hero so its orbit cannot widen the page", () => {
    const css = readFileSync("../../apps/playground/src/app/app.css", "utf8");

    expect(css).toMatch(/\.docs-component-hero\.ad-card\s*{[^}]*overflow:\s*clip/s);
  });

  it("keeps dialog and mobile scrollbars inside their rounded surfaces", () => {
    const dialog = readFileSync("src/components/feedback/Dialog/styles.css", "utf8");
    const body = readFileSync("src/components/layout/DialogBody/styles.css", "utf8");
    const generator = readFileSync("src/components/foundation/LoaderGenerator/styles.css", "utf8");
    const editor = readFileSync("src/components/foundation/ThemeEditor/ThemeEditor.tsx", "utf8");
    const settings = readFileSync("../../apps/playground/src/app/SettingsPanel.tsx", "utf8");
    const docsCss = readFileSync("../../apps/playground/src/app/app.css", "utf8");

    expect(dialog).toMatch(/\.ad-dialog\s*{[^}]*overflow:\s*hidden/s);
    expect(dialog).toMatch(/html:has\(\.ad-dialog\[open\]\)\s*{[^}]*overflow:\s*hidden/s);
    expect(dialog).toMatch(/grid-template-rows:\s*auto\s+auto\s+auto/);
    expect(body).toMatch(/\.ad-dialog-body\s*{[^}]*overflow-y:\s*auto[^}]*overflow-x:\s*clip/s);
    expect(body).toMatch(/max-height:\s*calc\(100dvh\s*-\s*10rem\)/);
    expect(generator).toMatch(/scrollbar-color:\s*var\(--ad-primary\)\s+transparent/);
    expect(editor).not.toContain("ad-theme-editor-preview");
    expect(editor).not.toContain("<ThemePicker");
    expect(settings).toContain('<Grid className="site-typography-grid" columns={3}');
    expect(docsCss).toMatch(/body\s*{[^}]*overflow-x:\s*clip/s);
    expect(docsCss).toMatch(/\.docs-mobile-nav-panel\s*{[^}]*overflow-x:\s*clip/s);
    expect(docsCss).toMatch(/\.docs-main\s*{[^}]*overflow-x:\s*clip/s);
  });

  it("defaults to Ukrainian and provides a readable light site theme", () => {
    const app = readFileSync("../../apps/playground/src/App.tsx", "utf8");
    const docsCss = readFileSync("../../apps/playground/src/app/app.css", "utf8");
    const tokens = readFileSync("src/theme/tokens.css", "utf8");
    const controls = readFileSync("src/components/controls/shared.css", "utf8");
    const icon = readFileSync("src/components/layout/Icon/styles.css", "utf8");
    const surfaces = readFileSync("src/components/layout/shared.css", "utf8");

    expect(defaultSettings.locale).toBe("uk");
    expect(defaultSettings.appearance).toBe("dark");
    expect(app).toContain('className="site-appearance"');
    expect(app).toContain('className="site-locale"');
    expect(app).toContain('{ value: "uk", label: "UA" }');

    const light = siteThemeProps({ ...defaultSettings, appearance: "light" });
    expect(light.tokens?.text).toBe("#211b1f");
    expect(light.tokens?.["neutral-950"]).toContain("0.98");
    expect(light.tokens?.["surface-input"]).toContain("neutral-950");
    expect(light.tokens?.["shadow-input"]).not.toContain("#0005");
    expect(fonts.melodix.stack).toBe("var(--ad-font-family-melodix)");
    expect(tokens).toContain("--ad-on-accent: #fff");
    expect(controls).toMatch(/data-ad-variant="primary"[^}]*color:\s*var\(--ad-on-accent\)/s);
    expect(controls).toMatch(/data-ad-variant="ghost"\]:hover[^}]*background:\s*rgb\(from var\(--ad-primary\)[^}]*color:\s*var\(--ad-text\)/s);
    expect(docsCss).toMatch(/\.docs-overview-link:hover\s*{[^}]*color:\s*var\(--ad-text\)/s);
    expect(docsCss).toMatch(/\.docs-mobile-nav-panel \.ad-link:hover\s*{[^}]*color:\s*var\(--ad-text\)/s);
    expect(icon).toMatch(/data-ad-surface="tile"[^}]*color:\s*var\(--ad-on-accent\)/s);
    expect(surfaces).toMatch(/data-ad-material="ruby"[^}]*--ad-text:\s*var\(--ad-on-accent\)/s);
    expect(docsCss).toMatch(/data-ad-color-mode="light"[^}]*\.docs-hero-backdrop[^}]*opacity:\s*0\.2/s);

    const customised = siteThemeProps({
      ...defaultSettings,
      appearance: "light",
      themeConfig: {
        ...defaultSettings.themeConfig,
        mode: "advanced",
        tokens: { "neutral-950": "#abcdef" },
      },
    });
    expect(customised.tokens?.["neutral-950"]).toBe("#abcdef");
  });

  it("keeps nested ThemeProviders in the active colour scheme", () => {
    const provider = readFileSync("src/components/foundation/ThemeProvider/ThemeProvider.tsx", "utf8");
    const providerCss = readFileSync("src/components/foundation/ThemeProvider/styles.css", "utf8");
    const app = readFileSync("../../apps/playground/src/App.tsx", "utf8");

    expect(provider).toContain('colorScheme?: "light" | "dark"');
    expect(provider).toContain("useContext(ThemeColorSchemeContext)");
    expect(provider).toContain("data-ad-color-scheme={scheme}");
    expect(providerCss).toMatch(/\.ad-theme\[data-ad-color-scheme="light"\]\s*{[^}]*--ad-surface-input:/s);
    expect(app).toContain("colorScheme={settings.appearance}");
  });
});
