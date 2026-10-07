import { afterEach, expect, it, vi } from "vitest";
import { createElement, memo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { ThemeProvider, themes, useThemePalette } from "../src/components/foundation/ThemeProvider/ThemeProvider";
import { ThemeEditor } from "../src/components/foundation/ThemeEditor/ThemeEditor";
import { Loader, loaderDefaultImage } from "../src/components/foundation/Loader/Loader";
import { LoaderGenerator } from "../src/components/foundation/LoaderGenerator/LoaderGenerator";
import { ColorPicker } from "../src/components/controls/ColorPicker/ColorPicker";
import { SiteThemeContext } from "../src/dev/exampleHelpers";
import ThemeEditorExample from "../src/components/foundation/ThemeEditor/example";
import ThemeProviderExample from "../src/components/foundation/ThemeProvider/example";

afterEach(() => vi.unstubAllGlobals());

it("uses the effective token palette without rerendering consumers for unrelated styles", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const observe = vi.fn();
  const Probe = memo(() => { observe(useThemePalette()); return null; });
  const child = createElement(Probe);
  let tree: ReturnType<typeof create>;
  const render = (padding: number) => createElement(ThemeProvider, {
    theme: "green", tokens: { primary: "#123456", "--ad-secondary": "#654321" }, style: { padding },
  }, createElement(ThemeProvider, null, child));
  act(() => { tree = create(render(1)); });
  expect(observe).toHaveBeenLastCalledWith({ theme: "green", primary: "#123456", secondary: "#654321" });
  observe.mockClear();
  act(() => tree.update(render(2)));
  expect(observe).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("lets a nested provider inherit changing colours unless it explicitly selects a theme", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let tree!: ReturnType<typeof create>;
  const render = (theme: "green" | "violet") =>
    createElement(ThemeProvider, { theme }, createElement(ThemeProvider, null, createElement("span", null, "child")));
  act(() => { tree = create(render("green")); });
  const nested = () => tree.root.findAllByProps({ "data-ad-component": "ThemeProvider" })[1]!;
  expect(nested().props.style["--ad-primary"]).toBeUndefined();
  expect(nested().props["data-ad-theme"]).toBe("green");
  act(() => tree.update(render("violet")));
  expect(nested().props["data-ad-theme"]).toBe("violet");
  act(() => tree.unmount());
});

it("colours only the built-in Loader picture from theme tokens and preserves supplied images", () => {
  const builtIn = renderToStaticMarkup(createElement(Loader));
  const custom = renderToStaticMarkup(createElement(Loader, { src: "/portrait.png" }));
  expect(builtIn).toContain('class="ad-loader-img ad-loader-default-image"');
  expect(builtIn).not.toContain(`<img class="ad-loader-img" src="${loaderDefaultImage}`);
  expect(custom).toContain('src="/portrait.png"');
  expect(custom).not.toContain("ad-loader-default-image");
  expect(renderToStaticMarkup(createElement(Loader, { animation: "fill" })).match(/ad-loader-default-image/g)).toHaveLength(2);
});

it("follows theme changes in LoaderGenerator until its colour is edited", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let tree!: ReturnType<typeof create>;
  const render = (theme: "green" | "violet") => createElement(ThemeProvider, { theme }, createElement(LoaderGenerator));
  act(() => { tree = create(render("green")); });
  const loader = () => tree.root.findAllByType(Loader)[0]!;
  expect(loader().props.color).toBe(themes.green[0]);
  act(() => tree.update(render("violet")));
  expect(loader().props.color).toBe(themes.violet[0]);
  act(() => tree.root.findByType(ColorPicker).props.onValueChange("#123456"));
  act(() => tree.update(render("green")));
  expect(loader().props.color).toBe("#123456");
  act(() => tree.unmount());
});

it("keeps theme examples in sync with the site until the editor is changed locally", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let tree!: ReturnType<typeof create>;
  const render = (theme: "green" | "violet") => createElement(SiteThemeContext.Provider, {
    value: { theme, primary: themes[theme][0], secondary: themes[theme][1], set: vi.fn() },
  }, createElement(ThemeEditorExample), createElement(ThemeProviderExample));
  act(() => { tree = create(render("green")); });
  const editor = () => tree.root.findByType(ThemeEditor);
  const preview = () => tree.root.findAllByType(ThemeProvider).at(-1)!;
  expect(editor().props.value.theme).toBe("green");
  expect(preview().props.theme).toBe("green");
  act(() => tree.update(render("violet")));
  expect(editor().props.value.theme).toBe("violet");
  expect(preview().props.theme).toBe("violet");
  act(() => editor().props.onValueChange({ ...editor().props.value, primary: "#123456" }));
  act(() => tree.update(render("green")));
  expect(editor().props.value.primary).toBe("#123456");
  act(() => tree.unmount());
});
