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
import { defaultSettings, fonts, siteThemeProps, useSiteSettings } from "../../../apps/playground/src/app/siteSettings";
import { catalog, componentCount, getCatalogItemBySlug, getDocumentationParts, getExample } from "../../../apps/playground/src/catalog/componentRegistry";
import { compile, toModule } from "../../../apps/playground/src/catalog/liveCode";
import { LocaleProvider, getLocale, setLocale } from "../src/core/i18n";
import { Toast } from "../src/components/feedback/Toast/Toast";
import { Dialog } from "../src/components/feedback/Dialog/Dialog";

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

    expect(css).toMatch(/\.docs-showcase-tile\s*\{[^}]*block-size:\s*15rem;[^}]*content-visibility:\s*auto;[^}]*contain-intrinsic-size:\s*auto 15rem/s);
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
    const source = readFileSync("src/components/feedback/DataTable/DataTable.tsx", "utf8");

    expect(html).toContain('role="combobox"');
    expect(html).toContain("Аура");
    expect(html).toContain("Мия");
    expect(html).toContain("Убрать");
    expect(source).toMatch(/options=\{distinct\(column as AnyColumn, rows\)\}/);
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
    expect(css).toMatch(/@media \(max-width: 48rem\)[\s\S]*\.ad-data-table tbody tr:not\(\.ad-data-table-group\)/);
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

describe("AnimatedBorder", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders smooth gradient strokes that can glow beyond the card edge", () => {
    const node = (tag: string) => ({
      tagName: tag,
      children: [] as any[],
      attributes: {} as Record<string, string>,
      style: { setProperty: vi.fn() } as Record<string, any>,
      dataset: {} as Record<string, string>,
      append(...children: any[]) { this.children.push(...children); },
      setAttribute(name: string, value: string) { this.attributes[name] = value; },
      getTotalLength: () => 400,
      getPointAtLength: (distance: number) => ({ x: distance, y: 0 }),
      remove: vi.fn(),
    });
    const host = Object.assign(node("section"), {
      offsetWidth: 200,
      offsetHeight: 100,
    });
    vi.stubGlobal("document", {
      createElement: node,
      createElementNS: (_namespace: string, tag: string) => node(tag),
    });
    vi.stubGlobal("getComputedStyle", () => ({ position: "relative", borderTopLeftRadius: "18px" }));
    const unsubscribe = vi.fn();
    const add = vi.fn(() => unsubscribe);

    const border = attachBorder(host as any, { scope: { add } as any });
    const overlay = host.children[0];
    expect(overlay.tagName).toBe("svg");
    expect(overlay.style.overflow).toBe("visible");
    expect(overlay.children[0].children.filter((child: any) => child.tagName === "radialGradient")).toHaveLength(2);
    expect(overlay.children[0].children.filter((child: any) => child.tagName === "filter")).toHaveLength(1);
    expect(overlay.children.filter((child: any) => child.tagName === "path")).toHaveLength(3);
    expect(overlay.children[0].children.find((child: any) => child.tagName === "filter")?.children[0].tagName).toBe("feGaussianBlur");
    expect(add).toHaveBeenCalledOnce();
    const gradient = overlay.children[0].children[0];
    expect(gradient.children[0].attributes["stop-color"]).toBe("var(--ad-on-accent)");
    const initialTransform = gradient.attributes.gradientTransform;
    add.mock.calls[0][1](1);
    expect(gradient.attributes.gradientTransform).toMatch(/^translate\([\d.]+ [\d.]+\)$/);
    expect(gradient.attributes.gradientTransform).not.toBe(initialTransform);
    border.destroy();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe("documentation motion", () => {
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
