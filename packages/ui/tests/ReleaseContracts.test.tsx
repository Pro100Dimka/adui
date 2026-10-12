import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { ripple, useControllable } from "../src/core/base";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { ThemeProvider } from "../src/components/foundation/ThemeProvider/ThemeProvider";
import { ProgressBar } from "../src/components/feedback/ProgressBar/ProgressBar";
import { catalog, componentCount, getCatalogItemBySlug, getExample, getImportPath, installCommand } from "../../../apps/playground/src/catalog/componentRegistry";
import { toModule } from "../../../apps/playground/src/catalog/liveCode";

describe("trusted npm publishing", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/release.yml", import.meta.url), "utf8");

  it("limits OIDC and release write permissions to the protected publishing job", () => {
    const [validation, publication] = workflow.split(/\r?\n  publish:\r?\n/);
    expect(validation).toContain("permissions:\n  contents: read");
    expect(validation).not.toContain("id-token: write");
    expect(publication).toContain("needs: verify");
    expect(publication).toContain("environment: npm-publication");
    expect(publication).toContain("id-token: write");
    expect(publication).toContain("contents: write");
    expect(publication).toContain("runs-on: ubuntu-latest");
    expect(workflow).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
  });

  it("builds and tests before packing and passes the exact smoke-tested artifact to publication", () => {
    expect(workflow).toContain('tags: ["v*"]');
    expect(workflow).toContain('test "v$VERSION" = "$GITHUB_REF_NAME"');
    expect(workflow.indexOf("npm run check")).toBeGreaterThan(workflow.indexOf("npm ci"));
    expect(workflow.indexOf("npm pack ./packages/ui")).toBeGreaterThan(workflow.indexOf("npm run check"));
    expect(workflow.indexOf("Smoke-test packed consumer")).toBeGreaterThan(workflow.indexOf("npm pack ./packages/ui"));
    expect(workflow.indexOf("actions/upload-artifact@")).toBeGreaterThan(workflow.indexOf("Smoke-test packed consumer"));
    expect(workflow).toContain("actions/download-artifact@");
    expect(workflow).toContain('npm publish "./$ARCHIVE" --access public --provenance --ignore-scripts --registry https://registry.npmjs.org');
    expect(workflow).toContain('node-version: "24"');
    expect(workflow).toContain("npm install --global npm@11.15.0");
    expect(workflow).toContain("package-manager-cache: false");
  });

  it("passes the archive to npm as a local file instead of a GitHub repository", () => {
    const npmExecPath = process.env.npm_execpath;
    if (!npmExecPath) throw new Error("Run this npm CLI contract through npm test.");
    const parsePackage = createRequire(npmExecPath)("npm-package-arg");
    const argument = workflow.match(/run: npm publish "([^"]+)"/)?.[1]
      ?.replace("$ARCHIVE", "release/neo-ui-kit-react-1.0.1.tgz");
    expect(argument).toBeDefined();
    expect(parsePackage(argument)).toMatchObject({ type: "file" });
  });

  it.each([
    [404, undefined],
    [200, "already published"],
    [500, "HTTP 500"],
  ])("checks registry HTTP %s without treating registry errors as an unpublished version", async (status, error) => {
    const guard = workflow.match(/node --input-type=module <<'NODE'\r?\n([\s\S]*?)\r?\n          NODE/)?.[1];
    expect(guard, "The workflow must reject already published versions before packing").toBeDefined();
    const fetch = vi.fn().mockResolvedValue({ status, ok: status === 200 });
    const result = runInNewContext(`(async () => {${guard}})()`, {
      fetch, process: { env: { VERSION: "1.0.0" } }, AbortSignal, encodeURIComponent,
    });
    if (error) await expect(result).rejects.toThrow(error);
    else await expect(result).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://registry.npmjs.org/%40neo-ui-kit%2Freact/1.0.0", expect.objectContaining({ cache: "no-store" }));
  });
});

describe("theme and feedback contracts", () => {
  it("removes a ripple when its animation is cancelled", () => {
    const events = new Map<string, () => void>();
    const ring = { style: {}, addEventListener: (name: string, handler: () => void) => events.set(name, handler), remove: vi.fn() };
    const host = { getBoundingClientRect: () => ({ left: 0, top: 0 }), append: vi.fn() };
    vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "on" } }, createElement: () => ring });
    try {
      ripple(host as unknown as HTMLElement, 10, 10);
      events.get("animationcancel")?.();
      expect(ring.remove).toHaveBeenCalledOnce();
    } finally { vi.unstubAllGlobals(); }
  });

  it("does not accumulate invisible ripple nodes when motion is disabled", () => {
    const ring = { style: {}, addEventListener: vi.fn(), remove: vi.fn() };
    const createElement = vi.fn(() => ring);
    const host = { getBoundingClientRect: () => ({ left: 0, top: 0 }), append: vi.fn() };
    vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "off" } }, createElement });
    try {
      for (let i = 0; i < 30; i++) ripple(host as unknown as HTMLElement, 10, 10);
      expect(createElement).not.toHaveBeenCalled();
      expect(host.append).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });

  it("keeps rejected controlled requests based on the actual prop while accumulating uncontrolled updates", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const change = vi.fn();
    let controlled!: ReturnType<typeof useControllable<number>>;
    let uncontrolled!: ReturnType<typeof useControllable<number>>;
    function Probe() {
      controlled = useControllable(0, 0, change);
      uncontrolled = useControllable(undefined, 0);
      return null;
    }
    let tree!: ReturnType<typeof create>;
    try {
      act(() => { tree = create(<Probe />); });
      act(() => { controlled[1](1); controlled[1](1); });
      expect(change.mock.calls).toEqual([[1], [1]]);
      act(() => { controlled[1]((value) => value + 1); });
      expect(change).toHaveBeenLastCalledWith(1);
      act(() => { uncontrolled[1]((value) => value + 1); uncontrolled[1]((value) => value + 1); });
      expect(uncontrolled[0]).toBe(2);
    } finally {
      act(() => tree?.unmount());
      vi.unstubAllGlobals();
    }
  });

  it("forwards the ThemeProvider root accessibility and data attributes", () => {
    const html = renderToStaticMarkup(<ThemeProvider role="region" aria-label="Preview" data-testid="theme" />);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Preview"');
    expect(html).toContain('data-testid="theme"');
  });

  it("applies the light border halo rule to the attribute emitted by ThemeProvider", () => {
    const html = renderToStaticMarkup(<ThemeProvider colorScheme="light" />);
    const attribute = html.match(/data-ad-color-[\w-]+="light"/)?.[0];
    const css = readFileSync(new URL("../src/theme/base.css", import.meta.url), "utf8");
    expect(attribute).toBeDefined();
    expect(css).toContain(`[${attribute}] .ad-border .ad-border-aura`);
  });

  it.each([NaN, Infinity, -Infinity])("renders finite progress geometry and semantics for max=%s", (max) => {
    const html = renderToStaticMarkup(<ProgressBar max={max} value={50} label="Upload" />);
    expect(html).not.toMatch(/NaN|Infinity/);
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="50"');
  });

  it("preserves an explicit accessible name on ProgressBar", () => {
    expect(renderToStaticMarkup(<ProgressBar aria-label="Upload progress" />)).toContain('aria-label="Upload progress"');
  });
});

describe("shipped documentation", () => {
  it("uses the approved package identity in the manifest and playground dependency", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    const playground = JSON.parse(readFileSync(new URL("../../../apps/playground/package.json", import.meta.url), "utf8"));
    expect(manifest.name).toBe("@neo-ui-kit/react");
    expect(playground.dependencies[manifest.name]).toBe("file:../../packages/ui");
  });

  it("generates catalog imports from the renamed public package", () => {
    for (const item of catalog) {
      expect(getImportPath(item)).toBe(item.category === "editor" ? "@neo-ui-kit/react/editor" : "@neo-ui-kit/react");
    }
  });

  it("adds the renamed package when a live example omits its component import", () => {
    expect(toModule('<Button>Preview</Button>')).toContain('from "@neo-ui-kit/react"');
  });

  it("declares a self-contained SVG favicon instead of requesting a missing favicon.ico", () => {
    const html = readFileSync(new URL("../../../apps/playground/index.html", import.meta.url), "utf8");
    const icon = html.match(/<link\b[^>]*rel="icon"[^>]*href="([^"]+)"/)?.[1] ?? "";
    expect(icon).toMatch(/^data:image\/svg\+xml,/);
    expect(decodeURIComponent(icon.split(",").slice(1).join(","))).toContain("<svg");
  });

  it("copies a registry installation command without requiring the repository or a local archive", () => {
    expect(installCommand).toBe("npm install @neo-ui-kit/react");
    const overview = readFileSync(new URL("../../../apps/playground/src/catalog/CatalogOverview.tsx", import.meta.url), "utf8");
    expect(overview).not.toContain("npm run package");
    expect(overview).toContain("Установите пакет в приложении и подключите стили один раз в точке входа.");
    expect(overview).toContain('import "@neo-ui-kit/react/styles.css";');
  });

  it("links the package homepage to the public documentation overview", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    expect(manifest.homepage).toBe("https://pro100dimka.github.io/adui/#/components/overview");
  });

  it("documents registry installation first while retaining current local packaging instructions", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    for (const file of ["../../../README.md", "../README.md"]) {
      const readme = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(readme).toContain("npm install @neo-ui-kit/react");
      expect(readme.indexOf("npm install @neo-ui-kit/react")).toBeLessThan(readme.indexOf("npm run package"));
      expect(readme).toContain(`neo-ui-kit-react-${manifest.version}.tgz`);
      expect(readme).not.toMatch(/releases\/download\/v\d+\.\d+\.\d+\//);
      expect(readme).not.toContain("not yet published");
    }
  });

  it("includes automated tests in the root verification and publish gates", () => {
    const workspace = JSON.parse(readFileSync(new URL("../../../package.json", import.meta.url), "utf8"));
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    expect(workspace.scripts.check).toContain("test");
    expect(manifest.scripts.prepublishOnly).toContain("test");
    expect(manifest.scripts.prepublishOnly.indexOf("build")).toBeLessThan(manifest.scripts.prepublishOnly.indexOf("test"));
  });

  it("exports form component props beside their root component exports", () => {
    const program = ts.createProgram([fileURLToPath(new URL("../src/index.ts", import.meta.url))], { allowJs: true, jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler });
    const source = program.getSourceFiles().find((file) => file.fileName.endsWith("/src/index.ts"))!;
    const checker = program.getTypeChecker();
    const names = checker.getExportsOfModule(checker.getSymbolAtLocation(source)!).map((symbol) => symbol.name);
    expect(names).toEqual(expect.arrayContaining(["FormProps", "FormFieldsProps"]));
  });

  it("ships declarations that typecheck without skipLibCheck or resolveJsonModule", () => {
    const program = ts.createProgram([fileURLToPath(new URL("../dist/index.d.ts", import.meta.url))], {
      noEmit: true, strict: true, jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    expect(ts.getPreEmitDiagnostics(program).map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))).toEqual([]);
  });

  it("ships the renamed QuantumBackground export and props with the compatible full-scene alias", async () => {
    const ui = await import("../dist/index.js");
    expect(ui).toHaveProperty("QuantumBackground", ui.QuantumFieldExperience);
    expect(ui.QuantumField).not.toBe(ui.QuantumFieldExperience);
    const declarations = readFileSync(new URL("../dist/components/artwork/QuantumField/QuantumFieldExperience.d.ts", import.meta.url), "utf8");
    expect(declarations).toContain("export type QuantumBackgroundProps");
    expect(declarations).toContain("QuantumFieldExperienceProps = QuantumBackgroundProps");
  });

  it("gives every documented public component its own working page and example", () => {
    expect(catalog).toHaveLength(componentCount);
    for (const name of ["Tab", "TabPanel", "MenuItem", "Form", "Text", "DialogBody", "DialogActions"]) {
      const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      expect(getCatalogItemBySlug(slug)?.name).toBe(name);
      expect(getExample(name)).toBeDefined();
    }
  });

  it("keeps font generation source scripts out of the shipped package", () => {
    const shipped = (path: string) => existsSync(new URL(`../dist/${path}`, import.meta.url));
    expect(shipped("fonts/melodix/OFL-PlayfairDisplay.txt")).toBe(true);
    expect(shipped("components/artwork/QuantumField/UPSTREAM-LICENSE.txt")).toBe(true);
    expect(shipped("fonts/melodix/build-weights.py.txt")).toBe(false);
    expect(shipped("fonts/melodix/trace-sheet.py.txt")).toBe(false);
  });

  it.each([
    ["../../../README.md", "packages/ui/LICENSE"],
    ["../README.md", "./LICENSE"],
  ])("links the approved MIT license in %s while preserving third-party notices", (file, licensePath) => {
    const readme = readFileSync(new URL(file, import.meta.url), "utf8");
    expect(readme).toContain(`[MIT](${licensePath})`);
    expect(readme).not.toContain("UNLICENSED");
    expect(readme).toContain("OFL-PlayfairDisplay.txt");
    expect(readme).toContain("UPSTREAM-LICENSE.txt");
  });

  it("only documents exports present in each package entry", async () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
    const entries = Object.fromEntries(await Promise.all(["index", "core", "editor", "router", "forms"].map(async (name) => [name, await import(`../dist/${name}.js`)])));
    for (const match of readme.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@neo-ui-kit\/react(?:\/(\w+))?["']/g)) {
      for (const name of match[1].split(",").map((value) => value.trim()).filter((value) => value && !value.startsWith("type "))) {
        expect(entries[match[2] ?? "index"], `Missing ${name} in ${match[2] ?? "index"}`).toHaveProperty(name);
      }
    }
  });
});
