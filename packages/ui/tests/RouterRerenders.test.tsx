import { afterEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Router, useRouter, type RouterValue } from "../src/components/navigation/Router/Router";
import RouterExample from "../src/components/navigation/Router/example";
import { LocaleProvider } from "@ad-voice/ui";
import { useMotion, useReducedMotion } from "../src/core/providers/context";

afterEach(() => vi.unstubAllGlobals());

it("translates the Router example with the selected documentation locale", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("location", { hash: "#/", pathname: "/" });
  vi.stubGlobal("window", { addEventListener: () => {}, removeEventListener: () => {} });
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<LocaleProvider locale="en"><RouterExample /></LocaleProvider>); });
  expect(JSON.stringify(tree.toJSON())).toContain("Home");
  expect(JSON.stringify(tree.toJSON())).toContain("You are on the home page.");
  act(() => tree.unmount());
});

it("documents a usable Router with interactive home and dynamic room routes", () => {
  let hashChange = () => {};
  const location = { hash: "#/", pathname: "/" };
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("location", location);
  vi.stubGlobal("window", {
    addEventListener: (_event: string, listener: () => void) => { hashChange = listener; },
    removeEventListener: () => {},
  });
  vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "off" } } });

  let tree!: ReactTestRenderer;
  act(() => { tree = create(<RouterExample />); });
  expect(tree.root.findAllByType("p").some((node) => node.children.join("") === "Вы на главной странице.")).toBe(true);
  const roomButton = tree.root.findAllByType("button").find((button) =>
    button.findAllByType("span").some((label) => label.children.includes("Комнаты")));
  expect(roomButton).toBeDefined();
  act(() => { roomButton!.props.onClick(); location.hash = "#/rooms/42"; hashChange(); });
  expect(tree.root.findAllByType("p").some((node) => node.children.join("") === "Комната 42")).toBe(true);
  act(() => tree.unmount());
});

describe("Router render stability", () => {
  it.each(["hash", "history"] as const)("updates %s routes immediately without native snapshots by default", (mode) => {
    const updates: Array<() => void> = [];
    const location = { hash: "#/", pathname: "/" };
    let locationChange = () => {};
    const transition = vi.fn((update: () => void) => { updates.push(update); });
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("location", location);
    vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "on" } }, startViewTransition: transition });
    vi.stubGlobal("window", {
      addEventListener: (_event: string, listener: () => void) => { locationChange = listener; },
      removeEventListener() {},
    });
    vi.stubGlobal("history", {
      pushState: (_state: unknown, _title: string, path: string) => { location.pathname = path; },
    });
    let router: RouterValue | undefined;
    function Page() { router = useRouter(); return <span>{router.pathname}</span>; }
    const routes = ["/", "/a", "/b"].map((path) => ({ path, element: <Page /> }));
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Router mode={mode} routes={routes} />); });
    try {
      for (const path of ["/a", "/b"]) {
        act(() => {
          router?.navigate(path);
          if (mode === "hash") { location.hash = `#${path}`; locationChange(); }
        });
        expect(tree.root.findByType("span").children).toEqual([path]);
      }
      expect(transition).not.toHaveBeenCalled();
      expect(updates).toHaveLength(0);
    } finally { act(() => tree.unmount()); }
  });

  it("applies a changed transition preference to the location subscription", () => {
    const location = { hash: "#/", pathname: "/" };
    let hashChange = () => {};
    const transition = vi.fn((update: () => void) => update());
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("location", location);
    vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "on" } }, startViewTransition: transition });
    vi.stubGlobal("window", {
      addEventListener: (_event: string, listener: () => void) => { hashChange = listener; },
      removeEventListener() {},
    });
    const routes = ["/", "/a", "/b"].map((path) => ({ path, element: <span>{path}</span> }));
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Router transition routes={routes} />); });
    try {
      act(() => { location.hash = "#/a"; hashChange(); });
      expect(transition).toHaveBeenCalledTimes(1);
      act(() => tree.update(<Router transition={false} routes={routes} />));
      act(() => { location.hash = "#/b"; hashChange(); });
      expect(tree.root.findByType("span").children).toEqual(["/b"]);
      expect(transition).toHaveBeenCalledTimes(1);
    } finally { act(() => tree.unmount()); }
  });

  it("does not restore an older history route after a deferred transition completes", () => {
    const updates: Array<() => void> = [];
    const location = { hash: "#/", pathname: "/" };
    const documentElement = { dataset: { adMotion: "on" } };
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("location", location);
    vi.stubGlobal("document", { documentElement, startViewTransition: (update: () => void) => { updates.push(update); } });
    vi.stubGlobal("window", { addEventListener() {}, removeEventListener() {} });
    vi.stubGlobal("history", {
      pushState: (_state: unknown, _title: string, path: string) => { location.pathname = path; },
    });
    let router: RouterValue | undefined;
    function Page() { router = useRouter(); return <span>{router.pathname}</span>; }
    const routes = ["/", "/a", "/b"].map((path) => ({ path, element: <Page /> }));
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Router mode="history" transition routes={routes} />); });
    try {
      act(() => router?.navigate("/a"));
      expect(updates).toHaveLength(1);
      act(() => { documentElement.dataset.adMotion = "off"; router?.navigate("/b"); });
      expect(tree.root.findByType("span").children).toEqual(["/b"]);
      act(() => updates[0]());
      expect(location.pathname).toBe("/b");
      expect(tree.root.findByType("span").children).toEqual(["/b"]);
    } finally { act(() => tree.unmount()); }
  });

  it("uses the latest hash when several transition callbacks are deferred", () => {
    const updates: Array<() => void> = [];
    const location = { hash: "#/", pathname: "/" };
    let hashChange = () => {};
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("location", location);
    vi.stubGlobal("document", {
      documentElement: { dataset: { adMotion: "on" } },
      startViewTransition: (update: () => void) => { updates.push(update); },
    });
    vi.stubGlobal("window", {
      addEventListener: (_event: string, listener: () => void) => { hashChange = listener; },
      removeEventListener() {},
    });
    const routes = ["/", "/a", "/b"].map((path) => ({ path, element: <span>{path}</span> }));
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Router transition routes={routes} />); });
    try {
      act(() => { location.hash = "#/a"; hashChange(); location.hash = "#/b"; hashChange(); });
      expect(updates).toHaveLength(2);
      expect(tree.root.findByType("span").children).toEqual(["/"]);
      act(() => updates[1]());
      act(() => updates[0]());
      expect(tree.root.findByType("span").children).toEqual(["/b"]);
    } finally { act(() => tree.unmount()); }
  });

  it("does not rerender the current page when only the motion preference changes", () => {
    let notifyMotion = () => {};
    let hashChange = () => {};
    let subscriptions = 0;
    const documentElement = { dataset: { adMotion: "on" } };
    const location = { hash: "#/probe", pathname: "/probe" };
    const transition = vi.fn((update: () => void) => update());
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("location", location);
    vi.stubGlobal("document", { documentElement, startViewTransition: transition });
    vi.stubGlobal("window", { addEventListener: (_: string, listener: () => void) => { subscriptions++; hashChange = listener; }, removeEventListener: () => {} });
    vi.stubGlobal("MutationObserver", class {
      constructor(callback: () => void) { notifyMotion = callback; }
      observe() {}
      disconnect() {}
    });

    let renders = 0;
    const routes = [
      { path: "/probe", element: () => { renders++; return <span>page</span>; } },
      { path: "/other", element: () => { renders++; return <span>other</span>; } },
    ];
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Router transition routes={routes} />); });
    const initial = renders;

    act(() => { documentElement.dataset.adMotion = "off"; notifyMotion(); });
    expect(renders).toBe(initial);
    expect(subscriptions).toBe(1);

    act(() => { location.hash = "#/other"; hashChange(); });
    expect(transition).not.toHaveBeenCalled();
    act(() => { documentElement.dataset.adMotion = "on"; location.hash = "#/probe"; hashChange(); });
    expect(transition).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
  });
});

describe("motion preference", () => {
  it("shares one media listener and one DOM observer across all motion consumers", () => {
    let mediaListeners = 0;
    let observers = 0;
    let mediaRemovals = 0;
    let disconnects = 0;
    const media = { matches: false, addEventListener: () => { mediaListeners++; }, removeEventListener: () => { mediaRemovals++; } };
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("document", { documentElement: { dataset: { adMotion: "on" } } });
    vi.stubGlobal("matchMedia", () => media);
    vi.stubGlobal("MutationObserver", class {
      constructor(_: () => void) { observers++; }
      observe() {}
      disconnect() { disconnects++; }
    });

    const Probe = () => <span>{String(useMotion())} {String(useReducedMotion())}</span>;
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<><Probe /><Probe /></>); });
    expect(mediaListeners).toBe(1);
    expect(observers).toBe(1);
    act(() => tree.unmount());
    expect(mediaRemovals).toBe(1);
    expect(disconnects).toBe(1);
  });

  it("updates subscribers only when the effective setting changes", () => {
    let notifyMotion = () => {};
    let notifyMedia = () => {};
    const dataset: { adMotion?: string } = { adMotion: "on" };
    const media = { matches: false, addEventListener: (_: string, listener: () => void) => { notifyMedia = listener; }, removeEventListener: () => {} };
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("document", { documentElement: { dataset } });
    vi.stubGlobal("matchMedia", () => media);
    vi.stubGlobal("MutationObserver", class {
      constructor(callback: () => void) { notifyMotion = callback; }
      observe() {}
      disconnect() {}
    });

    let renders = 0;
    const Probe = () => { renders++; return <span>{String(useMotion())}</span>; };
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    expect(tree.root.findByType("span").props.children).toBe("true");
    const initial = renders;

    act(() => { media.matches = true; notifyMedia(); });
    expect(renders).toBe(initial);
    act(() => { dataset.adMotion = "off"; notifyMotion(); });
    expect(tree.root.findByType("span").props.children).toBe("false");
    act(() => { dataset.adMotion = undefined; notifyMotion(); });
    expect(renders).toBe(initial + 1);
    act(() => { media.matches = false; notifyMedia(); });
    expect(tree.root.findByType("span").props.children).toBe("true");

    act(() => tree.unmount());
  });
});
