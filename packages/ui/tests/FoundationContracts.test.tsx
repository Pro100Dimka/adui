import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Typography } from "../src/components/foundation/Typography/Typography";
import { ThemeEditor } from "../src/components/foundation/ThemeEditor/ThemeEditor";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { TextField } from "../src/components/controls/TextField/TextField";
import { MessageBar } from "../src/components/feedback/MessageBar/MessageBar";
import { additionalDocumentation, catalog, getCatalogItemBySlug, getExample } from "../../../apps/playground/src/catalog/componentRegistry";
import { getComponentApiSource, getComponentSourcePath, getExampleSource } from "../../../apps/playground/src/catalog/sources";
import QuantumFieldExample from "../src/components/artwork/QuantumField/example";
import { parseTheme, themeProps } from "../src/components/foundation/ThemeEditor/themeConfig";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { addMessages, translate } from "../src/core/i18n";
import { Icon } from "../src/components/layout/Icon/Icon";
import { useForm } from "../src/components/forms/Form/Form";
import { SegmentedControl } from "../src/components/controls/SegmentedControl/SegmentedControl";
import { Switch } from "../src/components/controls/Switch/Switch";
import { docsMessages } from "../../../apps/playground/src/app/docsMessages";
import { Playground, ExampleCodeContext } from "../src/dev/exampleHelpers";
import { NumberField } from "../src/components/controls/NumberField/NumberField";
import { Loader } from "../src/components/foundation/Loader/Loader";
import IconExample from "../src/components/layout/Icon/example";
import LoaderExample from "../src/components/foundation/Loader/example";
import SvgAssetExample from "../src/dev/svgExample";
import MelodixTextExample from "../src/components/effects/MelodixText/example";

let tree: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.unstubAllGlobals(); });

it("preserves a caller's typography alignment when the align prop is omitted", () => {
  expect(renderToStaticMarkup(<Typography style={{ textAlign: "right" }}>Text</Typography>)).toContain("text-align:right");
  expect(renderToStaticMarkup(<Typography align="left" style={{ textAlign: "right" }}>Text</Typography>)).toContain("text-align:left");
});

describe("documentation sizing controls", () => {
  it.each([["Icon", IconExample], ["Loader", LoaderExample], ["SvgAsset", SvgAssetExample]] as const)("uses the four named size choices on %s", (_name, Example) => {
    act(() => { tree = create(<Example />); });
    const picker = tree!.root.findAllByType(SegmentedControl).find(control => control.props.label === "Размер");
    expect(picker?.props.items.map((item: { value: string }) => item.value)).toEqual(["xs", "sm", "md", "lg"]);
  });

  it.each([
    ["xs", "1rem", "2rem"], ["sm", "1.25rem", "3rem"],
    ["md", "1.5rem", "4rem"], ["lg", "2rem", "6rem"],
  ])("resolves %s to valid Icon and Loader geometry", (size, icon, loader) => {
    expect(renderToStaticMarkup(<Icon size={size} />)).toContain(`--ad-icon-size:${icon}`);
    expect(renderToStaticMarkup(<Loader size={size} />)).toContain(`--ad-loader-size:${loader}`);
  });

  it("preserves explicit CSS and numeric sizing", () => {
    expect(renderToStaticMarkup(<Icon size={28} />)).toContain("--ad-icon-size:1.75rem");
    expect(renderToStaticMarkup(<Icon size="2em" />)).toContain("--ad-icon-size:2em");
    expect(renderToStaticMarkup(<Loader size="2em" />)).toContain("--ad-loader-size:2em");
    expect(renderToStaticMarkup(<Loader size={32} />)).toContain("--ad-loader-size:2rem");
  });

  it("uses a bounded NumberField for genuine numeric parameters while allowing an empty input draft", () => {
    const code = vi.fn();
    act(() => { tree = create(<ExampleCodeContext.Provider value={code}>
      <Playground knobs={{ amount: { value: 3, min: 1, max: 8, step: 1 } }} code={values => String(values.amount)}>
        {values => <output>{values.amount}</output>}
      </Playground>
    </ExampleCodeContext.Provider>); });
    const field = () => tree!.root.findByType(NumberField);
    expect(field().props).toMatchObject({ min: 1, max: 8, step: 1, value: 3 });
    act(() => field().props.onValueChange(6));
    expect(tree!.root.findByType("output").children).toEqual(["6"]);
    expect(code).toHaveBeenLastCalledWith("6");
    act(() => field().props.onValueChange(""));
    expect(field().props.value).toBe("");
    expect(tree!.root.findByType("output").children).toEqual(["3"]);
    act(() => field().props.onValueChange(20));
    expect(tree!.root.findByType("output").children).toEqual(["8"]);
    act(() => field().props.onBlur());
    expect(field().props.value).toBe(8);
  });

  it("keeps Loader generated code consistent with its selected size and built-in picture", () => {
    const code = vi.fn();
    act(() => { tree = create(<ExampleCodeContext.Provider value={code}><LoaderExample /></ExampleCodeContext.Provider>); });
    expect(code).toHaveBeenLastCalledWith(expect.stringContaining('size="md"'));
    expect(code.mock.lastCall?.[0]).not.toContain('/logo.png');
    const picker = tree!.root.findAllByType(SegmentedControl).find(control => control.props.label === "Размер");
    act(() => picker!.props.onValueChange("lg"));
    expect(tree!.root.findByType(Loader).props.size).toBe("lg");
    expect(code).toHaveBeenLastCalledWith(expect.stringContaining('size="lg"'));
  });

  it("includes the selected numeric font weight in the MelodixText example code", () => {
    const code = vi.fn();
    act(() => { tree = create(<ExampleCodeContext.Provider value={code}><MelodixTextExample /></ExampleCodeContext.Provider>); });
    const field = tree!.root.findByType(NumberField);
    act(() => field.props.onValueChange(700));
    expect(code).toHaveBeenLastCalledWith(expect.stringContaining('"fontWeight":700'));
  });
});

describe("public translation utilities", () => {
  it.each(["toString", "constructor", "__proto__"])("treats unknown message %s as text instead of an inherited dictionary member", (key) => {
    expect(translate("en", key)).toBe(key);
    expect(translate("en", key, {})).toBe(key);
  });

  it.each(["toString", "constructor", "__proto__"])("treats unknown locale %s as a missing dictionary", (locale) => {
    expect(translate(locale, "name")).toBe("name");
    expect(translate(locale, "constructor", {})).toBe("constructor");
  });

  it("leaves missing inherited-looking placeholders intact and supports explicit own keys", () => {
    expect(translate("en", "Missing {constructor} / {toString}", {})).toBe("Missing {constructor} / {toString}");
    expect(translate("en", "Own {constructor}", JSON.parse('{"constructor":"value"}'))).toBe("Own value");
    expect(translate("en", "constructor", {}, JSON.parse('{"constructor":"Translated"}'))).toBe("Translated");
  });

  it("uses only own message keys and permits custom dictionaries named like prototype members", () => {
    expect(translate("en", "Unregistered text", {}, Object.create({ "Unregistered text": "Wrong" }))).toBe("Unregistered text");
    addMessages("__proto__", JSON.parse('{"Own locale text":"Registered","constructor":"Owned constructor"}'));
    expect(translate("__proto__", "Own locale text")).toBe("Registered");
    expect(translate("__proto__", "constructor")).toBe("Owned constructor");
    expect(translate("unregistered-locale", "Own locale text")).toBe("Own locale text");
  });
});

it.each(["constructor", "toString", "__proto__"])("uses the unknown-icon fallback for the valid string name %s", (name) => {
  expect(renderToStaticMarkup(<Icon name={name} />)).toBe(renderToStaticMarkup(<Icon name="info" />));
});

it.each(["constructor", "toString", "__proto__"])("keeps field %s untouched until an explicit user action", (name) => {
  let form!: ReturnType<typeof useForm<Record<string, unknown>>>;
  function Probe() { form = useForm({ initialValues: { [name]: "value" }, validateOnBlur: false }); return null; }
  act(() => { tree = create(<Probe />); });
  expect(form.field(name).touched).toBe(false);
  act(() => form.setTouched(name));
  expect(Object.hasOwn(form.touched, name)).toBe(true);
  expect(form.field(name).touched).toBe(true);
  act(() => form.reset());
  expect(form.field(name).touched).toBe(false);
});

describe("theme editing", () => {
  it.each(["constructor", "toString", "__proto__"])("rejects inherited property %s as a theme name", (theme) => {
    const config = parseTheme(JSON.stringify({ theme }));
    expect(config.theme).toBe("ruby");
    expect(themeProps(config).primary).toBe("#ff244c");
  });
  it("keeps the most recently selected theme import when file reads resolve out of order", async () => {
    const onValueChange = vi.fn();
    act(() => { tree = create(<ThemeEditor onValueChange={onValueChange} />); });
    const reads: Array<(value: string) => void> = [];
    const file = () => ({ text: () => new Promise<string>(done => reads.push(done)) });
    const importFiles = tree!.root.findByType(FilePicker).props.onFiles;
    let first!: Promise<unknown>, second!: Promise<unknown>;
    act(() => { first = importFiles([file()]); second = importFiles([file()]); });
    await act(async () => { reads[1](JSON.stringify({ theme: "green" })); await second; });
    await act(async () => { reads[0](JSON.stringify({ theme: "violet" })); await first; });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ theme: "green" }));
  });

  it("reports unreadable imported files inside the editor", async () => {
    act(() => { tree = create(<ThemeEditor />); });
    await act(async () => {
      await expect(tree!.root.findByType(FilePicker).props.onFiles([{ text: async () => { throw new Error("Unreadable theme"); } }])).resolves.toBeUndefined();
    });
    expect(tree!.root.findByType(MessageBar).props.tone).toBe("error");
    expect(tree!.root.findByType(MessageBar).props.children).toBe("Unreadable theme");
  });

  it("opens a previously collapsed group when token search matches it", () => {
    act(() => { tree = create(<ThemeEditor defaultValue={{ version: 1, mode: "advanced", theme: "ruby" }} />); });
    const search = tree!.root.findAllByType(TextField).find(field => field.props["aria-label"] === "Найти токен")!;
    act(() => search.props.onValueChange("secondary-50"));
    expect(tree!.root.findByType("details").props.open).toBe(true);
  });
});

describe("public component documentation", () => {
  it.each(["en", "uk"] as const)("translates every catalog description in %s", (locale) => {
    const missing = catalog.filter(({ description }) => !Object.hasOwn(docsMessages[locale], description) || !docsMessages[locale][description].trim());
    expect(missing.map(({ name, description }) => ({ name, description }))).toEqual([]);
  });

  it("keeps documentation examples and their playground helpers out of package declarations", () => {
    const root = fileURLToPath(new URL("../", import.meta.url));
    const config = ts.readConfigFile(`${root}/tsconfig.build.json`, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    expect(program.getSourceFiles().filter(file => /[\\/]src[\\/]dev[\\/]/.test(file.fileName)).map(file => file.fileName)).toEqual([]);
  });
  it.each([
    ["boolean-control", "BooleanControl", "src/components/controls/shared.tsx"],
    ["quantum-background", "QuantumBackground", "src/components/artwork/QuantumField/QuantumFieldExperience.tsx"],
    ["locale-provider", "LocaleProvider", "src/core/i18n.tsx"],
    ["svg-asset", "SvgAsset", "src/core/artwork.tsx"],
  ])("provides %s with a page, executable example and its own public API", (slug, name, path) => {
    expect(getCatalogItemBySlug(slug)?.name).toBe(name);
    expect(getExample(name)).toBeDefined();
    expect(getComponentSourcePath(name)).toBe(path);
    expect(getExampleSource(name)).toContain(name);
    expect(getComponentApiSource(name)).toContain(`${name}Props`);
  });

  it("demonstrates provider-local language changes and custom messages on the LocaleProvider page", async () => {
    expect(additionalDocumentation.LocaleProvider).toBeDefined();
    const { default: Example } = await additionalDocumentation.LocaleProvider.load();
    act(() => { tree = create(<Example />); });
    expect(tree!.root.findByType("h3").children.join("")).toBe("Nothing here yet");
    act(() => tree!.root.findByType(SegmentedControl).props.onValueChange("uk"));
    expect(tree!.root.findByType("h3").children.join("")).toBe("Поки немає записів");
    act(() => tree!.root.findByType(Switch).props.onValueChange(true));
    expect(tree!.root.findByType("h3").children.join("")).toBe("Your collection is empty");
  });

  it("demonstrates two labelled SVG assets with independent gradient references", async () => {
    expect(additionalDocumentation.SvgAsset).toBeDefined();
    const { default: Example } = await additionalDocumentation.SvgAsset.load();
    const html = renderToStaticMarkup(<Example />);
    const ids = [...html.matchAll(/id="([^"]*-signal)"/g)].map(match => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toContain(`url(#${id})`);
    expect(html).toContain('aria-label="Neon signal"');
    expect(html).toContain('aria-label="Second signal"');
  });

  it.each(["quantum-field", "quantum-field-experience"])("keeps the old %s link pointing to the renamed full scene", (slug) => {
    expect(getCatalogItemBySlug(slug)).toBe(getCatalogItemBySlug("quantum-background"));
    expect(getCatalogItemBySlug(slug)?.name).toBe("QuantumBackground");
  });

  it("restores the full scene on the original example instead of substituting the reduced field", () => {
    const html = renderToStaticMarkup(<QuantumFieldExample />);
    expect(html).not.toContain('data-ad-component="QuantumField"');
    expect(html).toContain("<iframe");
    expect(html).toContain("qb-panel");
    expect(html).toContain("Quantum Background visualizer");
  });
});
