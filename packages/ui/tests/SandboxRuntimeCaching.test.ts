import { afterEach, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import config from "../../../apps/playground/vite.config";

const { build } = vi.hoisted(() => ({ build: vi.fn() }));
vi.mock("esbuild", () => ({ build }));
let server: ViteDevServer | undefined;
afterEach(async () => { await server?.close(); build.mockReset(); });

it("shares concurrent runtime builds, invalidates changed files and retries failures", async () => {
  server = await createServer({ configFile: false, plugins: config.plugins, optimizeDeps: { noDiscovery: true, include: [] }, server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const url = `${server.resolvedUrls!.local[0]}sandbox-runtime.js`;
  const request = () => fetch(url).then(response => response.text());
  let finish!: (value: { outputFiles: { text: string }[] }) => void;
  const pending = new Promise(resolve => { finish = resolve; });
  build.mockImplementation(() => pending);
  const first = request();
  await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(1));
  const second = request();
  await new Promise(resolve => setTimeout(resolve, 50));
  finish({ outputFiles: [{ text: "runtime one" }] });
  expect(await Promise.all([first, second])).toEqual(["runtime one", "runtime one"]);
  expect(build).toHaveBeenCalledTimes(1);
  expect(await request()).toBe("runtime one");
  expect(build).toHaveBeenCalledTimes(1);

  server.watcher.emit("all", "change", "/example.tsx");
  build.mockRejectedValueOnce(new Error("broken source"));
  expect((await fetch(url)).status).toBe(500);
  build.mockResolvedValueOnce({ outputFiles: [{ text: "runtime two" }] });
  expect(await request()).toBe("runtime two");
  expect(build).toHaveBeenCalledTimes(3);

  server.watcher.emit("all", "unlink", "/example.tsx");
  build.mockResolvedValueOnce({ outputFiles: [{ text: "runtime three" }] });
  expect(await request()).toBe("runtime three");
  expect(build).toHaveBeenCalledTimes(4);
});
