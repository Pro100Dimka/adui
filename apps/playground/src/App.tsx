import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  Icon,
  Link,
  Router,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  useReducedMotion,
  type RouteDefinition,
  type RouteMatch,
} from "@ad-voice/ui";
import { CatalogPage } from "./catalog/CatalogPage";
import { ScreensPage } from "./app/ScreensPage";
import { catalog, getCatalogItemBySlug } from "./catalog/componentRegistry";
export default function App() {
  const [explicit, setExplicit] = useState<boolean>(),
    reduced = useReducedMotion(),
    motion = explicit ?? !reduced;
  const shell =
    (
      page: "components" | "screens",
      content: (match: RouteMatch) => ReactNode,
    ) =>
    (match: RouteMatch) => (
      <AppShell
        page={page}
        pathname={match.pathname}
        motion={motion}
        setMotion={setExplicit}
      >
        {content(match)}
      </AppShell>
    );
  const routes = useMemo<RouteDefinition[]>(
    () => [
      { path: "/", redirectTo: "/components/overview" },
      { path: "/components", redirectTo: "/components/overview" },
      {
        path: "/components/:id",
        element: shell("components", (m) => (
          <CatalogPage routeId={m.params.id ?? "overview"} />
        )),
      },
      { path: "/screens", redirectTo: "/screens/advanced" },
      {
        path: "/screens/:id",
        element: shell("screens", (m) => (
          <ScreensPage routeId={m.params.id ?? "advanced"} motion={motion} />
        )),
      },
      { path: "*", redirectTo: "/components/overview" },
    ],
    [motion],
  );
  return (
    <ThemeProvider>
      <Router routes={routes} />
    </ThemeProvider>
  );
}
function AppShell({
  page,
  pathname,
  motion,
  setMotion,
  children,
}: {
  page: "components" | "screens";
  pathname: string;
  motion: boolean;
  setMotion: (value: boolean) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const component =
      page === "components"
        ? getCatalogItemBySlug(pathname.split("/")[2])
        : undefined;
    document.title = component
      ? `${component.name} · A&D UI`
      : `A&D UI · React — ${page === "screens" ? "Экраны" : "Компоненты"}`;
    document.documentElement.dataset.ready = "true";
    document.documentElement.dataset.adMotion = motion ? "on" : "off";
  }, [page, motion, pathname]);
  return (
    <Stack id="app" gap={0}>
      <Toolbar className="site-top">
        <Link
          className="site-brand"
          href="#/components/overview"
          underline="none"
        >
          <Icon name="wave" size="1.55rem" surface="tile" />
          <Stack gap={0}>
            <Typography variant="title" weight="bold">
              A&D UI
            </Typography>
            <Typography variant="eyebrow" tone="muted">
              React component system
            </Typography>
          </Stack>
        </Link>
        <Stack
          as="nav"
          className="site-pages"
          direction="row"
          gap={2}
          aria-label="Страницы"
        >
          <Link
            className={page === "components" ? "active" : ""}
            href="#/components/overview"
            underline="none"
          >
            <Typography variant="label">Компоненты</Typography>
            <Badge>{catalog.length}</Badge>
          </Link>
          <Link
            className={page === "screens" ? "active" : ""}
            href="#/screens/advanced"
            underline="none"
          >
            <Typography variant="label">Экраны</Typography>
            <Badge>12</Badge>
          </Link>
        </Stack>
        <Stack className="site-tools" direction="row" align="center" gap={3}>
          <Badge className="site-version">React + TypeScript · 1.2.0</Badge>
          <Switch label="Анимации" checked={motion} onValueChange={setMotion} />
        </Stack>
      </Toolbar>
      {children}
    </Stack>
  );
}
