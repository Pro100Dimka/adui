import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { copyText } from "../src/core/base";
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

    expect(dialog).toMatch(/\.ad-dialog\s*{[^}]*overflow:\s*hidden/s);
    expect(dialog).toMatch(/html:has\(\.ad-dialog\[open\]\)\s*{[^}]*overflow:\s*hidden/s);
    expect(dialog).toMatch(/grid-template-rows:\s*auto\s+auto\s+auto/);
    expect(body).toMatch(/\.ad-dialog-body\s*{[^}]*overflow:\s*auto/s);
    expect(body).toMatch(/max-height:\s*calc\(100dvh\s*-\s*10rem\)/);
    expect(generator).toMatch(/scrollbar-color:\s*var\(--ad-primary\)\s+transparent/);
    expect(editor).not.toContain("ad-theme-editor-preview");
    expect(editor).not.toContain("<ThemePicker");
    expect(settings).toContain('<Grid className="site-typography-grid" columns={3}');
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
    expect(fonts.melodix.stack).toBe("var(--ad-font-family-melodix)");
    expect(tokens).toContain("--ad-on-accent: #fff");
    expect(controls).toMatch(/data-ad-variant="primary"[^}]*color:\s*var\(--ad-on-accent\)/s);
    expect(icon).toMatch(/data-ad-surface="tile"[^}]*color:\s*var\(--ad-on-accent\)/s);
    expect(surfaces).toMatch(/data-ad-material="ruby"[^}]*--ad-text:\s*var\(--ad-on-accent\)/s);
    expect(docsCss).toMatch(/data-ad-color-mode="light"[^}]*\.docs-hero-backdrop[^}]*opacity:\s*0\.2/s);
  });
});
