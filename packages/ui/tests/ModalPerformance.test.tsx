import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolveToken, resolveTokens } from "../src/components/foundation/ThemeEditor/themeConfig";

const css = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

afterEach(() => vi.unstubAllGlobals());

/** A tiny DOM: elements remember their children; computed colour comes from the inline `var()` name. */
function fakeDom(colors: Record<string, string>) {
  const appended: unknown[] = [];
  const element = () => {
    const children: ReturnType<typeof element>[] = [];
    return {
      style: { color: "" } as Record<string, string>,
      hidden: false,
      children,
      append(...nodes: ReturnType<typeof element>[]) { children.push(...nodes); },
      remove: vi.fn(),
    };
  };
  const canvas = { width: 0, height: 0, getContext: vi.fn() };
  let fill = "";
  canvas.getContext.mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    set fillStyle(value: string) { fill = value; },
    get fillStyle() { return fill; },
    getImageData: () => ({ data: fill.match(/\d+/g)!.map(Number) }),
  });
  const createElement = vi.fn((tag: string) => tag === "canvas" ? canvas : element());
  const getComputedStyle = vi.fn((node: { style?: Record<string, string> }) => ({
    color: colors[/--ad-([\w-]+)/.exec(node.style?.color ?? "")?.[1] ?? ""] ?? "rgb(0, 0, 0)",
    getPropertyValue: (name: string) => ` ${colors[name.replace("--ad-", "")] ?? ""} `,
  }));
  vi.stubGlobal("document", { createElement });
  vi.stubGlobal("getComputedStyle", getComputedStyle);
  const scope = { append: (...nodes: unknown[]) => appended.push(...nodes) } as unknown as Element;
  return { scope, appended, createElement, canvas };
}

it("resolves many colour tokens with one insertion into the page and one shared canvas", () => {
  const { scope, appended, createElement } = fakeDom({ primary: "rgb(255, 36, 76)", secondary: "rgb(255, 124, 151)", "neutral-900": "rgb(20, 10, 12)", radius: "1rem" });
  const values = resolveTokens(scope, ["primary", "secondary", "neutral-900", { name: "radius", kind: "length" }]);
  expect(values).toEqual({ primary: "#ff244c", secondary: "#ff7c97", "neutral-900": "#140a0c", radius: "1rem" });
  // All probes travel in one hidden host: the page's styles are recalculated once, not per token.
  expect(appended).toHaveLength(1);
  expect(appended[0]).toMatchObject({ hidden: true });
  expect((appended[0] as { children: unknown[] }).children).toHaveLength(3);
  expect(resolveToken(scope, "secondary")).toBe("#ff7c97");
  expect(createElement.mock.calls.filter(([tag]) => tag === "canvas").length).toBeLessThanOrEqual(1);
});

it("keeps the pointer light from restyling everything inside a dialog, card or spotlight", () => {
  const base = css("theme/base.css");
  for (const name of ["--ad-spot-x", "--ad-spot-y"])
    expect(base).toMatch(new RegExp(`@property ${name}\\s*\\{[^}]*syntax:\\s*"\\*";[^}]*inherits:\\s*false`, "s"));
  // The dialog paints the light in its own background, not in the inherited material variable.
  const dialog = css("components/feedback/Dialog/styles.css");
  expect(dialog).toMatch(/\.ad\.ad-dialog\[data-ad-material\]\s*\{\s*background:\s*radial-gradient\(26rem circle at var\(--ad-spot-x/);
  expect(dialog).not.toMatch(/--ad-material-bg:[^;]*--ad-spot-x/s);
  // Pseudo-element lights read the position from their own surface explicitly.
  expect(css("components/layout/Card/styles.css")).toMatch(/\.ad-card::after\s*\{[^}]*--ad-spot-x:\s*inherit;[^}]*--ad-spot-y:\s*inherit;/s);
  expect(css("components/effects/Spotlight/styles.css")).toMatch(/\.ad-spotlight::after\s*\{[^}]*--ad-spot-x:\s*inherit;[^}]*--ad-spot-y:\s*inherit;/s);
});

it("creates the code editor after the dialog has opened and preloads it from the button", () => {
  const editor = readFileSync(new URL("../../../apps/playground/src/catalog/CodeEditor.tsx", import.meta.url), "utf8");
  expect(editor).toContain("resolveTokens(scope, [");
  expect(editor).not.toMatch(/resolveToken\(scope/);
  expect(editor).toMatch(/Promise\.all\(\[loadMonaco\(\), host\.current \? settled\(host\.current\)/);
  expect(editor).toContain('node.closest("dialog")?.getAnimations?.()');
  const page = readFileSync(new URL("../../../apps/playground/src/catalog/ComponentDocsPage.tsx", import.meta.url), "utf8");
  expect(page).toMatch(/onPointerEnter=\{warmLiveEditor\}\s*onFocus=\{warmLiveEditor\}\s*onClick=\{\(\) => setModal\("example"\)\}/);
});
