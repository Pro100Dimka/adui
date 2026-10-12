import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Autocomplete } from "../src/components/controls/Autocomplete/Autocomplete";
import { TextArea } from "../src/components/controls/TextArea/TextArea";
import { TextField } from "../src/components/controls/TextField/TextField";
import { TagInput } from "../src/components/controls/TagInput/TagInput";
import { PeoplePicker } from "../src/components/controls/PeoplePicker/PeoplePicker";
import { ColorPicker } from "../src/components/controls/ColorPicker/ColorPicker";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { Select } from "../src/components/controls/Select/Select";
import { DatePicker } from "../src/components/controls/DatePicker/DatePicker";
import { Checkbox } from "../src/components/controls/Checkbox/Checkbox";
import { Switch } from "../src/components/controls/Switch/Switch";
import { NumberField } from "../src/components/controls/NumberField/NumberField";
import { LocaleProvider } from "../src/core/i18n";
import { IconButton } from "../src/components/controls/IconButton/IconButton";
import { ThemePicker } from "../src/components/controls/ThemePicker/ThemePicker";
import { Button } from "../src/components/controls/Button/Button";
import { ToggleButton } from "../src/components/controls/ToggleButton/ToggleButton";
import { Slider } from "../src/components/controls/Slider/Slider";
import { Chip } from "../src/components/controls/Chip/Chip";
import { Link } from "../src/components/controls/Link/Link";
import { SplitButton } from "../src/components/controls/SplitButton/SplitButton";
import { useForm } from "../src/components/forms/Form/Form";
import type { CommonProps } from "../src/core/base";
import ts from "typescript";
import { resolve } from "node:path";
import { build } from "esbuild";

let tree: ReactTestRenderer;
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => { act(() => tree?.unmount()); vi.unstubAllGlobals(); });
const mount = (element: React.ReactElement) => act(() => { tree = create(element); });
const key = (value: string, extra = {}) => ({ key: value, preventDefault: vi.fn(), defaultPrevented: false, nativeEvent: {}, ...extra });

describe("control and form type boundaries", () => {
  it("tree shakes unrelated artwork and media from the built public Button export", async () => {
    const bundle = await build({ stdin: { contents: 'export { Button } from "./dist/index.js";', resolveDir: process.cwd() },
      bundle: true, write: false, format: "esm", minify: true, treeShaking: true,
      external: ["react", "react-dom", "react/jsx-runtime"], target: "es2022" });
    const code = bundle.outputFiles[0].text;
    expect(code).toContain("ad-button-fx");
    expect(code).not.toMatch(/hostv2-|pf-art-1|ad-player-play/);
  });

  it("rejects malformed SplitButton menu items and keeps path helper inputs checked", () => {
    const entry = resolve("tests/controls-contract-types.tsx");
    const source = `import { SplitButton, type MenuProps, type SplitButtonProps } from '../src/index';
      const items: SplitButtonProps['items'] = [{ label: 'Save', onSelect: () => {} }, { separator: true }];
      const menuItems: MenuProps['items'] = items;
      <SplitButton items={menuItems} />;
      // @ts-expect-error labels must match Menu's string labels
      <SplitButton items={[{ label: 3 }]} />;
      // @ts-expect-error actions must be callable
      <SplitButton items={[{ onSelect: 'invalid' }]} />;`;
    const config = ts.readConfigFile("tsconfig.build.json", ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
    const options = { ...parsed.options, noEmit: true, rootDir: undefined };
    const host = ts.createCompilerHost(options), original = host.getSourceFile;
    host.getSourceFile = (name, ...args) => resolve(name) === entry ? ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) : original(name, ...args);
    const program = ts.createProgram([...parsed.fileNames, entry], options, host);
    expect.soft(ts.getPreEmitDiagnostics(program).map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))).toEqual([]);
    const checker = program.getTypeChecker();
    const form = program.getSourceFile(resolve("src/components/forms/Form/Form.tsx"));
    expect(form).toBeDefined();
    const checked: string[] = [];
    form?.forEachChild(function visit(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && ["getPath", "setPath"].includes(node.name.text)) {
        const signature = checker.getTypeAtLocation(node).getCallSignatures()[0];
        expect.soft(signature.parameters.some(parameter => checker.getTypeOfSymbolAtLocation(parameter, node).flags & ts.TypeFlags.Any)).toBe(false);
        checked.push(node.name.text);
      }
      ts.forEachChild(node, visit);
    });
    expect(checked).toEqual(["getPath", "setPath"]);
  });

  it("updates array paths without mutating initial values or replacing siblings", () => {
    const sibling = { enabled: true }, initialValues = { rows: [{ name: "Old" }], sibling };
    let form!: ReturnType<typeof useForm<typeof initialValues>>;
    function Probe() { form = useForm({ initialValues, validateOnBlur: false }); return null; }
    mount(<Probe />);
    act(() => form.setValue("rows.0.name", "New"));
    expect(Array.isArray(form.values.rows)).toBe(true);
    expect(form.field("rows.0.name").value).toBe("New");
    expect(initialValues.rows[0].name).toBe("Old");
    expect(form.values.sibling).toBe(sibling);
    expect(form.field("missing.path").value).toBeUndefined();
  });
});

describe("field public host attributes", () => {
  it.each([
    { name: "Select", render: () => <Select aria-label="Group by" options={["Artist"]} />, value: "Artist" },
    { name: "ColorPicker", render: () => <ColorPicker aria-label="Color intent" />, value: "#FF244C" },
  ])("$name keeps its rendered value connected to an explicit accessible name", ({ render, value }) => {
    mount(render());
    const control = tree.root.findByType("button"), ids = control.props["aria-labelledby"]?.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(control.props.id);
    const renderedValue = tree.root.find((node) => typeof node.type === "string" && node.props.id === ids[1]);
    expect(renderedValue.findAll((node) => node.children.includes(value)).length).toBeGreaterThan(0);
  });

  const fields = [
    { name: "Select", render: (p: CommonProps) => <Select label="Choice" {...p} />, control: "button", host: "button" },
    { name: "TextField", render: (p: CommonProps) => <TextField label="Text" {...p} />, control: "input", host: "input" },
    { name: "TextArea", render: (p: CommonProps) => <TextArea label="Text" {...p} />, control: "textarea", host: "textarea" },
    { name: "Autocomplete", render: (p: CommonProps) => <Autocomplete label="Choice" {...p} />, control: "input", host: "input" },
    { name: "NumberField", render: (p: CommonProps) => <NumberField label="Number" {...p} />, control: "input", host: "input" },
    { name: "Slider", render: (p: CommonProps) => <Slider label="Level" {...p} />, control: "input", host: "input" },
    { name: "DatePicker", render: (p: CommonProps) => <DatePicker label="Date" {...p} />, control: "input", host: "div" },
    { name: "ColorPicker", render: (p: CommonProps) => <ColorPicker label="Color" {...p} />, control: "button", host: "div" },
    { name: "TagInput", render: (p: CommonProps) => <TagInput label="Tags" {...p} />, control: "input", host: "div" },
    { name: "PeoplePicker", render: (p: CommonProps) => <PeoplePicker label="People" {...p} />, control: "input", host: "div" },
  ];
  it.each(fields)("$name preserves layout style, a unique public id and data hooks", ({ render, host }) => {
    mount(render({ style: { width: 170 }, id: "public-field", "data-testid": "public-hook" }));
    const hosts = tree.root.findAll((node) => typeof node.type === "string" && node.props.id === "public-field");
    expect(hosts).toHaveLength(1);
    expect(hosts[0].type).toBe(host);
    expect(hosts[0].props["data-testid"]).toBe("public-hook");
    expect(tree.root.findAll((node) => typeof node.type === "string" && node.props.style?.width === 170)).toHaveLength(1);
  });
  it.each(fields)("$name applies an explicit accessible label to the actual control", ({ name, render, control }) => {
    mount(render({ "aria-label": "External name" }));
    const node = tree.root.findByType(control);
    expect(node.props["aria-label"]).toBe("External name");
    if (["Select", "ColorPicker"].includes(name)) expect(node.props["aria-labelledby"].split(" ")[0]).toBe(node.props.id);
    else expect(node.props["aria-labelledby"]).toBeUndefined();
  });
  it.each(fields)("$name honors external label and description references", ({ render, control }) => {
    mount(render({ "aria-labelledby": "external-label", "aria-describedby": "external-description" }));
    const node = tree.root.findByType(control);
    expect(node.props["aria-labelledby"].split(" ")[0]).toBe("external-label");
    expect(node.props["aria-describedby"]).toBe("external-description");
  });
});

describe("autocomplete interaction contract", () => {
  it("reopens all choices when the selected value differs from its label", () => {
    mount(<Autocomplete value="one" options={[{ value: "one", label: "First option" }, { value: "two", label: "Second option" }]} />);
    act(() => tree.root.findByType("input").props.onFocus());
    expect(tree.root.findAll((node) => node.type === "button" && node.props.role === "option")).toHaveLength(2);
  });

  it("gives each open list a unique id and announces the active option", () => {
    mount(<><Autocomplete options={["Alpha", "Beta"]} /><Autocomplete options={["One", "Two"]} /></>);
    const inputs = tree.root.findAllByType("input");
    act(() => inputs.forEach((input) => input.props.onFocus({ defaultPrevented: false })));
    const ids = inputs.map((input) => input.props["aria-controls"]);
    expect(new Set(ids).size).toBe(2);
    for (const input of inputs) {
      const optionId = input.props["aria-activedescendant"];
      expect(optionId).toBeTruthy();
      expect(tree.root.findByProps({ id: optionId }).props.role).toBe("option");
      expect(tree.root.findByProps({ id: input.props["aria-controls"] }).props.role).toBe("listbox");
    }
  });

  it("preserves native focus/key handlers and respects preventDefault", () => {
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    const onValueChange = vi.fn();
    mount(<Autocomplete options={["Alpha"]} onFocus={onFocus} onKeyDown={onKeyDown} onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus({ defaultPrevented: false }));
    act(() => input.props.onKeyDown(key("Enter", { defaultPrevented: true })));
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each(["disabled", "readOnly"] as const)("closes an open list when %s changes", (locked) => {
    mount(<Autocomplete options={["Alpha"]} />);
    act(() => tree.root.findByType("input").props.onFocus({ defaultPrevented: false }));
    act(() => tree.update(<Autocomplete options={["Alpha"]} {...{ [locked]: true }} />));
    expect(tree.root.findByType("input").props["aria-expanded"]).toBe(false);
    expect(tree.root.findAll((node) => typeof node.type === "string" && node.props.role === "listbox")).toHaveLength(0);
  });

  it("does not select a suggestion with Enter during IME composition", () => {
    const onValueChange = vi.fn();
    mount(<Autocomplete options={["東京"]} onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus({ defaultPrevented: false }));
    act(() => input.props.onKeyDown(key("Enter", { nativeEvent: { isComposing: true } })));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps popup options out of the tab order and closes on Tab", () => {
    mount(<Autocomplete options={["Alpha", "Beta"]} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus({ defaultPrevented: false }));
    expect(tree.root.findAllByProps({ role: "option" }).map((option) => option.props.tabIndex)).toEqual([-1, -1]);
    act(() => input.props.onKeyDown(key("Tab")));
    expect(input.props["aria-expanded"]).toBe(false);
  });

  it("recovers the active option when an externally supplied list shrinks", () => {
    const onValueChange = vi.fn();
    mount(<Autocomplete options={["Alpha", "Beta"]} onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus({ defaultPrevented: false }));
    act(() => input.props.onKeyDown(key("ArrowDown")));
    act(() => tree.update(<Autocomplete options={["Only"]} onValueChange={onValueChange} />));
    act(() => input.props.onKeyDown(key("Enter")));
    expect(onValueChange).toHaveBeenCalledWith("Only");
  });
});

describe("field semantics and native contracts", () => {
  it("includes ColorPicker's visible color value in its accessible name", () => {
    mount(<ColorPicker label="Accent" value="#ff244c" />);
    const button = tree.root.findByType("button");
    const valueId = button.props["aria-labelledby"].split(" ").at(-1);
    expect(tree.root.findByProps({ id: valueId }).children).toContain("#FF244C");
  });

  it("includes the visible avatar owner in the file chooser name", () => {
    mount(<FilePicker variant="avatar" name="Pro100Yojik" label="Change photo" />);
    expect(tree.root.findByType("button").props["aria-label"]).toContain("Pro100Yojik");
  });

  it.each([TextField, TextArea, Autocomplete].map((Component) => ({ Component, name: Component.name })))("preserves the public inline style on $name", ({ Component }) => {
    mount(<Component style={{ width: "12rem" }} />);
    expect(tree.root.findAll((node) => typeof node.type === "string" && node.props.style?.width === "12rem")).toHaveLength(1);
  });

  it.each([TextArea, Autocomplete, Select, DatePicker].map((Component) => ({ Component, name: Component.name })))("exposes the error state to assistive technology on $name", ({ Component }) => {
    mount(<Component label="Value" error="Invalid value" />);
    const control = tree.root.findAll((node) => ["input", "textarea", "button"].includes(String(node.type)) && node.props["aria-labelledby"])[0];
    expect(control.props["aria-invalid"]).toBe(true);
  });

  it.each([Checkbox, Switch].map((Component) => ({ Component, name: Component.name })))("puts an explicitly supplied accessible name on the actual control $name", ({ Component }) => {
    mount(<Component aria-label="Enable audio" />);
    expect(tree.root.findByType("input").props["aria-label"]).toBe("Enable audio");
  });

  it.each([
    { name: "TagInput", element: <TagInput defaultValue={["one"]} max={1} /> },
    { name: "PeoplePicker", element: <PeoplePicker defaultValue={[{ id: "1", name: "One" }]} max={1} /> },
  ])("prevents further input at the maximum in $name", ({ element }) => {
    mount(element);
    expect(tree.root.findByType("input").props.disabled).toBe(true);
  });

  it("does not commit a tag during IME composition", () => {
    const onValueChange = vi.fn();
    mount(<TagInput onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onChange({ currentTarget: { value: "東京" } }));
    act(() => input.props.onKeyDown(key("Enter", { nativeEvent: { isComposing: true } })));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("honours multiple=false for dropped files just as for the native picker", () => {
    const onFiles = vi.fn();
    const files = [{ name: "one.txt", type: "text/plain" }, { name: "two.txt", type: "text/plain" }];
    mount(<FilePicker variant="zone" onFiles={onFiles} />);
    act(() => tree.root.findByType("button").props.onDrop({ preventDefault: vi.fn(), dataTransfer: { files } }));
    expect(onFiles).toHaveBeenCalledWith([files[0]]);
  });

  it("makes every inline color input inert when disabled", () => {
    mount(<ColorPicker inline disabled />);
    expect(tree.root.findByType("input").props.disabled).toBe(true);
    expect(tree.root.findAllByType("button").every((button) => button.props.disabled)).toBe(true);
    expect(tree.root.findAllByProps({ role: "slider" }).every((slider) => slider.props["aria-disabled"] && slider.props.tabIndex === -1)).toBe(true);
  });

  it("selects the first enabled option by default", () => {
    mount(<Select options={[{ value: "off", label: "Off", disabled: true }, { value: "on", label: "On" }]} name="mode" />);
    expect(tree.root.findByType("input").props.value).toBe("on");
  });

  it("does not submit a disabled select's hidden value", () => {
    mount(<Select options={["One"]} name="choice" disabled />);
    expect(tree.root.findByType("input").props.disabled).toBe(true);
  });

  it("puts required validation on the visible date input", () => {
    mount(<DatePicker required />);
    const visible = tree.root.findAllByType("input").find((input) => input.props.type !== "hidden");
    expect(visible?.props.required).toBe(true);
  });
});

describe("form error paths and invalid submission", () => {
  it("reads flat dotted-path errors produced by the public FormErrors contract", async () => {
    let form!: ReturnType<typeof useForm<{ profile: { name: string } }>>;
    function Probe() { form = useForm({ initialValues: { profile: { name: "" } }, validate: () => ({ "profile.name": "Required" }) }); return null; }
    mount(<Probe />);
    await act(async () => { await form.submit(); });
    expect(form.field("profile.name").error).toBe("Required");
  });

  it("reveals invalid fields after submit without requiring a prior blur", async () => {
    let form!: ReturnType<typeof useForm<{ name: string }>>;
    function Probe() { form = useForm({ initialValues: { name: "" }, validate: () => ({ name: "Required" }) }); return null; }
    mount(<Probe />);
    await act(async () => { await form.submit(); });
    expect(form.field("name").touched).toBe(true);
  });
});

describe("dynamic control state and field associations", () => {
  it("announces a numeric saturation and textual brightness for ColorPicker's color plane", () => {
    mount(<ColorPicker inline value="#ff0000" />);
    const plane = tree.root.findAllByProps({ role: "slider" })[0];
    expect(plane.props["aria-valuenow"]).toBe(100);
    expect(plane.props["aria-valuemin"]).toBe(0);
    expect(plane.props["aria-valuemax"]).toBe(100);
    expect(plane.props["aria-valuetext"]).toContain("100%");
  });

  it("exposes calendar buttons as a labelled group instead of an incomplete ARIA grid", () => {
    mount(<DatePicker value="2024-02-15" />);
    act(() => tree.root.findAllByType("button")[0].props.onClick());
    const calendar = tree.root.findByProps({ className: "ad-calendar-grid" });
    expect(calendar.props.role).toBe("group");
    expect(calendar.props["aria-label"]).toContain("2024");
  });

  it.each([undefined, [{ value: "ruby", label: "Ruby" }, { value: "green", label: "Green" }]])("gives theme choices radio semantics and one tab stop (%s)", (options) => {
    mount(<ThemePicker options={options} />);
    const choices = tree.root.findAllByType("button");
    expect(choices.every((choice) => choice.props.role === "radio")).toBe(true);
    expect(choices.filter((choice) => choice.props["aria-checked"])).toHaveLength(1);
    expect(choices.filter((choice) => choice.props.tabIndex === 0)).toHaveLength(1);
  });

  it("includes a native validation control when Select is required", () => {
    mount(<Select required placeholder="Choose" options={["One"]} />);
    const native = tree.root.findAllByType("select");
    expect(native).toHaveLength(1);
    expect(native[0].props.required).toBe(true);
    expect(native[0].props.value).toBe("");
  });

  it.each([TextField, TextArea, Autocomplete].map((Component) => ({ Component, name: Component.name })))("associates $name's label with its control when an adornment button precedes it", ({ Component }) => {
    mount(<Component id="customer-input" label="Customer" startAdornment={<IconButton label="Help" icon="help" />} />);
    const frame = tree.root.findByType("label");
    const input = tree.root.findAll((node) => node.type === "input" || node.type === "textarea")[0];
    expect(frame.props.htmlFor).toBe(input.props.id);
    expect(frame.props.htmlFor).toBe("customer-input");
  });

  it("does not offer actionable tag suggestions after becoming disabled", () => {
    mount(<TagInput suggestions={["Alpha"]} />);
    act(() => tree.root.findByType("input").props.onChange({ currentTarget: { value: "Al" } }));
    act(() => tree.update(<TagInput suggestions={["Alpha"]} disabled />));
    expect(tree.root.findAll((node) => node.type === "button" && !node.props.disabled)).toHaveLength(0);
  });

  it("announces PeoplePicker's active option and closes the popup on Tab", () => {
    mount(<PeoplePicker people={[{ id: "1", name: "One" }, { id: "2", name: "Two" }]} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus());
    expect(input.props["aria-controls"]).toBeTruthy();
    expect(input.props["aria-activedescendant"]).toBeTruthy();
    act(() => input.props.onKeyDown(key("Tab")));
    expect(input.props["aria-expanded"]).toBe(false);
  });

  it("does not choose a person during IME composition", () => {
    const onValueChange = vi.fn();
    mount(<PeoplePicker people={[{ id: "1", name: "東京" }]} onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onFocus());
    act(() => input.props.onKeyDown(key("Enter", { nativeEvent: { isComposing: true } })));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    { name: "Select", element: (disabled: boolean) => <Select options={["One"]} disabled={disabled} /> },
    { name: "DatePicker", element: (disabled: boolean) => <DatePicker disabled={disabled} /> },
    { name: "ColorPicker", element: (disabled: boolean) => <ColorPicker disabled={disabled} /> },
    { name: "PeoplePicker", element: (disabled: boolean) => <PeoplePicker people={[{ id: "1", name: "One" }]} disabled={disabled} /> },
  ])("closes $name when it becomes disabled", ({ name, element }) => {
    mount(element(false));
    act(() => {
      if (name === "PeoplePicker") tree.root.findByType("input").props.onFocus();
      else tree.root.findAllByType("button")[0].props.onClick();
    });
    act(() => tree.update(element(true)));
    expect(tree.root.findAll((node) => node.type === "div" && ["dialog", "listbox"].includes(node.props.role))).toHaveLength(0);
  });

  it("updates Select's built-in options when its provider language changes", () => {
    mount(<LocaleProvider locale="ru"><Select /></LocaleProvider>);
    act(() => tree.update(<LocaleProvider locale="en"><Select /></LocaleProvider>));
    const shown = tree.root.findAll((node) => node.type === "span" && node.props.className === "ad-select-value-text")[0];
    expect(shown.children.join("")).toBe("First option");
  });

  it("allows DatePicker to switch from an explicit to an inherited locale without changing hook order", () => {
    const error = vi.spyOn(console, "error");
    try {
      mount(<DatePicker locale="en-GB" />);
      act(() => tree.update(<DatePicker />));
      expect(error.mock.calls.flat().join(" ")).not.toContain("change in the order of Hooks");
    } finally { error.mockRestore(); }
  });

  it("keeps NumberField step=any finite when using its step buttons", () => {
    const onValueChange = vi.fn();
    mount(<NumberField defaultValue={2.5} step="any" onValueChange={onValueChange} />);
    act(() => tree.root.findAllByType("button")[1].props.onClick());
    expect(onValueChange).toHaveBeenCalledWith(3.5);
  });
});

describe("controls family verification", () => {
  it.each([TextField, TextArea, Autocomplete].map((Component) => ({ Component, name: Component.name })))("keeps controlled and uncontrolled $name values in sync", ({ Component }) => {
    const onValueChange = vi.fn();
    mount(<Component defaultValue="Start" onValueChange={onValueChange} />);
    const control = () => tree.root.findAll((node) => node.type === "input" || node.type === "textarea")[0];
    act(() => control().props.onChange({ currentTarget: { value: "Typed" } }));
    expect(control().props.value).toBe("Typed");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("Typed");
    act(() => tree.update(<Component value="External" onValueChange={onValueChange} />));
    act(() => control().props.onChange({ currentTarget: { value: "Proposed" } }));
    expect(control().props.value).toBe("External");
    act(() => tree.update(<Component value="Accepted" onValueChange={onValueChange} />));
    expect(control().props.value).toBe("Accepted");
  });

  it.each([Checkbox, Switch].map((Component) => ({ Component, name: Component.name })))("keeps $name checked state controlled and reports one request", ({ Component }) => {
    const onValueChange = vi.fn();
    mount(<Component checked={false} onValueChange={onValueChange} />);
    act(() => tree.root.findByType("input").props.onChange({ currentTarget: { checked: true } }));
    expect(tree.root.findByType("input").props.checked).toBe(false);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(true);
    act(() => tree.update(<Component checked onValueChange={onValueChange} />));
    expect(tree.root.findByType("input").props.checked).toBe(true);
  });

  it("lets a prevented ToggleButton click cancel its state change", () => {
    const onValueChange = vi.fn();
    mount(<ToggleButton label="Toggle" onValueChange={onValueChange} />);
    act(() => tree.root.findByType("button").props.onClick({ defaultPrevented: true }));
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => tree.root.findByType("button").props.onClick({ defaultPrevented: false }));
    expect(tree.root.findByType("button").props["aria-pressed"]).toBe(true);
  });

  it("keeps loading Button disabled and announced busy", () => {
    mount(<Button loading>Save</Button>);
    const button = tree.root.findByType("button");
    expect(button.props.type).toBe("button");
    expect(button.props.disabled).toBe(true);
    expect(button.props["aria-busy"]).toBe(true);
  });

  it("clamps Slider's painted and native value to the same range", () => {
    mount(<Slider value={200} min={10} max={20} />);
    const input = tree.root.findByType("input");
    expect(input.props.value).toBe(20);
    expect(input.props.style["--ad-level"]).toBe("100%");
  });

  it("keeps chip selection and removal separate", () => {
    const onClick = vi.fn(), onRemove = vi.fn(), stopPropagation = vi.fn();
    mount(<Chip label="Mix" onClick={onClick} onRemove={onRemove} />);
    act(() => tree.root.findAllByType("button")[1].props.onClick({ stopPropagation }));
    expect(onClick).not.toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
  });

  it("preserves native external link navigation attributes", () => {
    mount(<Link external href="https://example.com">Documentation</Link>);
    expect(tree.root.findByType("a").props).toMatchObject({ href: "https://example.com", target: "_blank", rel: "noreferrer" });
  });

  it("runs a SplitButton menu action exactly once and closes the menu", () => {
    const onSelect = vi.fn();
    mount(<SplitButton label="Save" items={[{ label: "Export", onSelect }]} />);
    act(() => tree.root.findAllByType("button")[1].props.onClick());
    act(() => tree.root.findAll((node) => node.type === "button" && node.props.role === "menuitem")[0].props.onClick());
    expect(onSelect).toHaveBeenCalledOnce();
    expect(tree.root.findAll((node) => typeof node.type === "string" && node.props.role === "menu")).toHaveLength(0);
  });

  it("accepts a valid leap date inside the range and rejects an out-of-range date", () => {
    const onValueChange = vi.fn();
    mount(<DatePicker min="2024-02-01" max="2024-02-29" onValueChange={onValueChange} />);
    const input = tree.root.findByType("input");
    act(() => input.props.onChange({ currentTarget: { value: "29.02.2024" } }));
    act(() => input.props.onBlur());
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("2024-02-29");
    act(() => input.props.onChange({ currentTarget: { value: "01.03.2024" } }));
    act(() => input.props.onBlur());
    expect(onValueChange).toHaveBeenCalledOnce();
  });
});

