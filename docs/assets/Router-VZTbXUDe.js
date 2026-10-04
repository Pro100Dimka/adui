const n=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useMemo,\r
  useState,\r
  type ReactNode,\r
} from "react";\r
import { flushSync } from "react-dom";\r
import { useMotion } from "../../../core/providers/context";\r
export interface RouteAccessContext {\r
  pathname: string;\r
  params: Record<string, string>;\r
  context?: unknown;\r
}\r
export interface RouteDefinition {\r
  path: string;\r
  element?: ReactNode | ((match: RouteMatch) => ReactNode);\r
  redirectTo?: string;\r
  access?: (value: RouteAccessContext) => boolean;\r
  denied?: ReactNode | ((match: RouteMatch) => ReactNode);\r
}\r
export interface RouteMatch {\r
  route: RouteDefinition;\r
  pathname: string;\r
  params: Record<string, string>;\r
}\r
export interface RouterValue extends RouteMatch {\r
  navigate: (to: string, replace?: boolean) => void;\r
}\r
export interface RouterProps {\r
  routes: readonly RouteDefinition[];\r
  fallback?: ReactNode;\r
  context?: unknown;\r
  mode?: "hash" | "history";\r
}\r
const Context = createContext<RouterValue | null>(null),\r
  clean = (v: string) => {\r
    const x = \`/\${v.replace(/^#?\\/?/, "").replace(/\\/+$/g, "")}\`;\r
    return x === "/" ? x : x.replace(/\\/$/, "");\r
  },\r
  current = (m: "hash" | "history") =>\r
    clean(m === "hash" ? location.hash.slice(1) || "/" : location.pathname);\r
/** With motion on, the page change morphs through a view transition where the browser has one. */\r
const morph = (motion: boolean, update: () => void) =>\r
  motion && "startViewTransition" in document\r
    ? void document.startViewTransition(() => flushSync(update))\r
    : update();\r
function matchPath(pattern: string, pathname: string) {\r
  const p = clean(pattern).split("/").filter(Boolean),\r
    v = clean(pathname).split("/").filter(Boolean),\r
    params: Record<string, string> = {};\r
  for (let i = 0, j = 0; i < p.length; i++, j++) {\r
    const token = p[i];\r
    if (token === "*") {\r
      params["*"] = decodeURIComponent(v.slice(j).join("/"));\r
      return params;\r
    }\r
    if (j >= v.length) return null;\r
    if (token.startsWith(":"))\r
      params[token.slice(1)] = decodeURIComponent(v[j]);\r
    else if (token !== v[j]) return null;\r
  }\r
  return p.at(-1) === "*" || p.length === v.length ? params : null;\r
}\r
export function matchRoute(\r
  routes: readonly RouteDefinition[],\r
  pathname: string,\r
): RouteMatch | null {\r
  for (const route of routes) {\r
    const params = matchPath(route.path, pathname);\r
    if (params) return { route, pathname: clean(pathname), params };\r
  }\r
  return null;\r
}\r
export function Router({\r
  routes,\r
  fallback = null,\r
  context,\r
  mode = "hash",\r
}: RouterProps) {\r
  const [pathname, setPathname] = useState(() => current(mode));\r
  const motion = useMotion();\r
  useEffect(() => {\r
    const event = mode === "hash" ? "hashchange" : "popstate",\r
      sync = () => morph(motion, () => setPathname(current(mode)));\r
    window.addEventListener(event, sync);\r
    return () => window.removeEventListener(event, sync);\r
  }, [mode, motion]);\r
  const match = useMemo(() => matchRoute(routes, pathname), [routes, pathname]);\r
  const navigate = (to: string, replace = false) => {\r
    const path = clean(to);\r
    if (mode === "hash") {\r
      const hash = \`#\${path}\`;\r
      if (replace) {\r
        history.replaceState(null, "", hash);\r
        setPathname(path);\r
      } else location.hash = path;\r
    } else {\r
      history[replace ? "replaceState" : "pushState"](null, "", path);\r
      morph(motion, () => setPathname(path));\r
    }\r
  };\r
  useEffect(() => {\r
    if (match?.route.redirectTo) navigate(match.route.redirectTo, true);\r
  }, [match?.route.redirectTo]);\r
  if (!match) return <>{fallback}</>;\r
  if (match.route.redirectTo) return null;\r
  const value = { ...match, navigate },\r
    allowed =\r
      match.route.access?.({\r
        pathname: match.pathname,\r
        params: match.params,\r
        context,\r
      }) ?? true,\r
    content = allowed ? match.route.element : match.route.denied;\r
  return (\r
    <Context.Provider value={value}>\r
      {typeof content === "function" ? content(match) : (content ?? fallback)}\r
    </Context.Provider>\r
  );\r
}\r
export function useRouter() {\r
  const value = useContext(Context);\r
  if (!value) throw new Error("useRouter must be used inside <Router>");\r
  return value;\r
}\r
`;export{n as default};
