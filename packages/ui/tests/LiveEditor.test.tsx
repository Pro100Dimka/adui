import { afterEach, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { LiveEditor } from "../../../apps/playground/src/catalog/LiveEditor";
import { readFileSync } from "node:fs";

const state = vi.hoisted(() => ({ compile: vi.fn() }));
vi.mock("../../../apps/playground/src/catalog/liveCode", () => ({ compile: state.compile }));
vi.mock("../../../apps/playground/src/catalog/CodeEditor", () => ({
  CodeEditor: ({ onChange }: { onChange: (code: string) => void }) => <button onClick={() => onChange("broken")}>edit</button>,
}));
vi.mock("../../../apps/playground/src/catalog/CopyButton", () => ({ CopyButton: () => null }));
vi.mock("../../../apps/playground/src/catalog/DocsExampleBoundary", () => ({
  DocsExampleBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@ad-voice/ui", () => ({
  tr: (text: string) => text,
  useTr: () => (text: string) => text,
  useLocale: () => "en",
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  MessageBar: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <button onClick={onClick}>{children}</button>,
}));

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); state.compile.mockReset(); });

it("removes an old preview when the edited source fails to compile", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  state.compile.mockResolvedValueOnce("compiled JS").mockRejectedValueOnce(new Error("syntax error"));
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(<LiveEditor name="Probe" original="valid" />); });
  await act(async () => { await vi.advanceTimersByTimeAsync(260); });
  const frames = tree.root.findAllByType("iframe");
  expect(frames).toHaveLength(1);
  expect(frames[0].props.sandbox).toBe("allow-scripts");
  expect(frames[0].props.srcDoc).toContain('<script src="/sandbox-runtime.js"');
  expect(frames[0].props.srcDoc).not.toContain('type="module"');
  expect(frames[0].props.srcDoc).toContain('addEventListener("error"');
  await act(async () => { tree.root.findAllByType("button").find((node) => node.props.children === "edit")?.props.onClick(); });
  await act(async () => { await vi.advanceTimersByTimeAsync(260); });
  expect(tree.root.findAll((node) => node.type === "span" && node.props.children === "syntax error")).toHaveLength(1);
  expect(tree.root.findAllByType("iframe")).toHaveLength(0);
  act(() => tree.unmount());
});

it("serves a self-contained classic dev runtime without opening CORS to opaque origins", async () => {
  const config = await import("../../../apps/playground/vite.config");
  const buildRuntime = (config as unknown as { buildSandboxRuntime?: () => Promise<string> }).buildSandboxRuntime;
  expect(buildRuntime).toBeTypeOf("function");
  const code = await buildRuntime!();
  expect(code).toContain("ad-preview-render");
  expect(code).not.toMatch(/^\s*import\s/m);
  expect(readFileSync("../../apps/playground/vite.config.ts", "utf8")).not.toContain('cors: { origin: "null" }');
});

it("passes the documentation locale into the isolated preview", () => {
  const runtime = readFileSync("../../apps/playground/src/catalog/sandboxRuntime.tsx", "utf8");
  expect(runtime).toContain('<UI.LocaleProvider locale={locale ?? "ru"}>');
});
