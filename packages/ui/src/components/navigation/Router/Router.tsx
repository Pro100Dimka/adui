import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
export interface RouteAccessContext {
  pathname: string;
  params: Record<string, string>;
  context?: unknown;
}
export interface RouteDefinition {
  path: string;
  element?: ReactNode | ((match: RouteMatch) => ReactNode);
  redirectTo?: string;
  access?: (value: RouteAccessContext) => boolean;
  denied?: ReactNode | ((match: RouteMatch) => ReactNode);
}
export interface RouteMatch {
  route: RouteDefinition;
  pathname: string;
  params: Record<string, string>;
}
export interface RouterValue extends RouteMatch {
  navigate: (to: string, replace?: boolean) => void;
}
export interface RouterProps {
  routes: readonly RouteDefinition[];
  fallback?: ReactNode;
  context?: unknown;
  mode?: "hash" | "history";
}
const Context = createContext<RouterValue | null>(null),
  clean = (v: string) => {
    const x = `/${v.replace(/^#?\/?/, "").replace(/\/+$/g, "")}`;
    return x === "/" ? x : x.replace(/\/$/, "");
  },
  current = (m: "hash" | "history") =>
    clean(m === "hash" ? location.hash.slice(1) || "/" : location.pathname);
function matchPath(pattern: string, pathname: string) {
  const p = clean(pattern).split("/").filter(Boolean),
    v = clean(pathname).split("/").filter(Boolean),
    params: Record<string, string> = {};
  for (let i = 0, j = 0; i < p.length; i++, j++) {
    const token = p[i];
    if (token === "*") {
      params["*"] = decodeURIComponent(v.slice(j).join("/"));
      return params;
    }
    if (j >= v.length) return null;
    if (token.startsWith(":"))
      params[token.slice(1)] = decodeURIComponent(v[j]);
    else if (token !== v[j]) return null;
  }
  return p.at(-1) === "*" || p.length === v.length ? params : null;
}
export function matchRoute(
  routes: readonly RouteDefinition[],
  pathname: string,
): RouteMatch | null {
  for (const route of routes) {
    const params = matchPath(route.path, pathname);
    if (params) return { route, pathname: clean(pathname), params };
  }
  return null;
}
export function Router({
  routes,
  fallback = null,
  context,
  mode = "hash",
}: RouterProps) {
  const [pathname, setPathname] = useState(() => current(mode));
  useEffect(() => {
    const event = mode === "hash" ? "hashchange" : "popstate",
      sync = () => setPathname(current(mode));
    window.addEventListener(event, sync);
    return () => window.removeEventListener(event, sync);
  }, [mode]);
  const match = useMemo(() => matchRoute(routes, pathname), [routes, pathname]);
  const navigate = (to: string, replace = false) => {
    const path = clean(to);
    if (mode === "hash") {
      const hash = `#${path}`;
      if (replace) {
        history.replaceState(null, "", hash);
        setPathname(path);
      } else location.hash = path;
    } else {
      history[replace ? "replaceState" : "pushState"](null, "", path);
      setPathname(path);
    }
  };
  useEffect(() => {
    if (match?.route.redirectTo) navigate(match.route.redirectTo, true);
  }, [match?.route.redirectTo]);
  if (!match) return <>{fallback}</>;
  if (match.route.redirectTo) return null;
  const value = { ...match, navigate },
    allowed =
      match.route.access?.({
        pathname: match.pathname,
        params: match.params,
        context,
      }) ?? true,
    content = allowed ? match.route.element : match.route.denied;
  return (
    <Context.Provider value={value}>
      {typeof content === "function" ? content(match) : (content ?? fallback)}
    </Context.Provider>
  );
}
export function useRouter() {
  const value = useContext(Context);
  if (!value) throw new Error("useRouter must be used inside <Router>");
  return value;
}
