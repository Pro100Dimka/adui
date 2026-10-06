import { afterEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import App from "../../../apps/playground/src/App";
import { ThemeProvider } from "../src/components/foundation/ThemeProvider/ThemeProvider";

const counts = vi.hoisted(() => ({
  route: 0,
  settings: 0,
  theme: null as null | { set: (patch: { theme: string }) => void },
  update: null as null | ((patch: object) => void),
}));

vi.mock("@ad-voice/ui", async () => {
  const React = await import("react");
  const { SiteThemeContext } = await import("../src/dev/exampleHelpers");
  const Frame = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    LocaleProvider: Frame, ThemeProvider: Frame, Stack: Frame, Toolbar: Frame,
    Typography: Frame, Badge: Frame, Link: Frame,
    Icon: () => null,
    Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
    Switch: ({ label, checked, onValueChange }: { label: string; checked: boolean; onValueChange: (value: boolean) => void }) =>
      <button onClick={() => onValueChange(!checked)}>{label}</button>,
    SegmentedControl: () => null,
    Router: () => {
      counts.route++;
      counts.theme = React.useContext(SiteThemeContext);
      return <div>catalogue</div>;
    },
    themes: { ruby: ["#ff244c", "#ff7c97"], green: ["#10c99a", "#7cf3d0"] },
    useReducedMotion: () => false,
    tr: (text: string) => text, translate: (_locale: string, text: string) => text, setLocale: () => {}, addMessages: () => {},
  };
});

vi.mock("../../../apps/playground/src/app/siteSettings", async () => {
  const React = await import("react");
  const defaults = { locale: "ru", appearance: "dark", themeConfig: { theme: "ruby" }, font: "default", headingFont: "default", scale: 1 };
  return {
    useSiteSettings: () => {
      const [settings, setSettings] = React.useState(defaults);
      const update = React.useCallback((patch: object | ((current: typeof defaults) => object)) =>
        setSettings((current) => ({ ...current, ...(typeof patch === "function" ? patch(current) : patch) })), []);
      const reset = React.useCallback(() => setSettings(defaults), []);
      counts.update = update;
      return [settings, update, reset] as const;
    },
    siteThemeProps: (settings: typeof defaults) => ({ theme: settings.themeConfig.theme, primary: settings.themeConfig.theme === "green" ? "#10c99a" : "#ff244c", secondary: settings.themeConfig.theme === "green" ? "#7cf3d0" : "#ff7c97", tokens: {} }),
    siteAppearanceTokens: () => ({}),
  };
});

vi.mock("../../../apps/playground/src/app/SettingsPanel", () => ({ SettingsPanel: () => { counts.settings++; return <div>settings</div>; } }));
vi.mock("../../../apps/playground/src/catalog/CatalogPage", () => ({ CatalogPage: () => null }));
vi.mock("../../../apps/playground/src/catalog/componentRegistry", () => ({ componentCount: 1 }));

afterEach(() => { counts.route = 0; counts.settings = 0; counts.theme = null; counts.update = null; });

describe("documentation theme rendering", () => {
  it("does not rerender the catalogue when only the settings dialog opens, but does for a theme change", () => {
    const rootStyle = { setProperty: () => {}, removeProperty: () => {} };
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("document", { documentElement: { dataset: {}, style: rootStyle } });
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<App />); });
    const initial = counts.route;
    expect(counts.settings).toBe(0);

    act(() => { tree.root.findAllByType("button").find((node) => node.props.children === "Тема")?.props.onClick(); });
    expect(counts.route).toBe(initial);
    expect(counts.settings).toBe(1);

    act(() => { tree.root.findAllByType("button").find((node) => node.props.children === "Анимации")?.props.onClick(); });
    expect(counts.settings).toBe(1);

    act(() => { counts.update?.({ font: "melodix" }); });
    expect(counts.route).toBe(initial);

    act(() => { counts.update?.({ themeConfig: { theme: "ruby", tokens: { "primary-700": "#991122" } } }); });
    expect(counts.route).toBe(initial);

    act(() => { counts.theme?.set({ theme: "green" }); });
    expect(counts.route).toBe(initial + 1);

    act(() => { counts.update?.({ locale: "en" }); });
    expect(counts.route).toBe(initial + 2);

    act(() => tree.unmount());
    vi.unstubAllGlobals();
  });
});

describe("ThemeProvider render stability", () => {
  it("reuses its token style when a parent rerenders without changing the theme", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<ThemeProvider theme="ruby"><span>child</span></ThemeProvider>); });
    const first = tree.root.findByProps({ "data-ad-component": "ThemeProvider" }).props.style;

    act(() => { tree.update(<ThemeProvider theme="ruby"><span>child</span></ThemeProvider>); });
    expect(tree.root.findByProps({ "data-ad-component": "ThemeProvider" }).props.style).toBe(first);

    act(() => { tree.update(<ThemeProvider theme="green"><span>child</span></ThemeProvider>); });
    const changed = tree.root.findByProps({ "data-ad-component": "ThemeProvider" }).props.style;
    expect(changed).not.toBe(first);
    expect(changed["--ad-primary"]).toBe("#10c99a");

    act(() => tree.unmount());
    vi.unstubAllGlobals();
  });
});
