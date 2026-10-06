import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { copyText } from "../src/core/base";
import { attachBorder } from "../src/core/motion-engine.js";
import { defaultSettings, fonts, siteThemeProps } from "../../../apps/playground/src/app/siteSettings";

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
