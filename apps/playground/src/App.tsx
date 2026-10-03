import { useEffect, useState } from "react";
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
} from "@ad-voice/ui";
import { CatalogPage } from "./catalog/CatalogPage";
import { catalog } from "./catalog/componentRegistry";

const routes: RouteDefinition[] = [
  {
    path: "/components/:id",
    element: (match) => <CatalogPage routeId={match.params.id} />,
  },
  { path: "*", redirectTo: "/components/overview" },
];

export default function App() {
  const reduced = useReducedMotion();
  const [explicit, setExplicit] = useState<boolean>();
  const motion = explicit ?? !reduced;

  useEffect(() => {
    document.documentElement.dataset.adMotion = motion ? "on" : "off";
  }, [motion]);

  return (
    <ThemeProvider>
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
                Neo UI
              </Typography>
              <Typography variant="eyebrow" tone="muted">
                React component system
              </Typography>
            </Stack>
          </Link>
          <Stack className="site-tools" direction="row" align="center" gap={3}>
            <Badge>{catalog.length} компонентов</Badge>
            <Switch
              label="Анимации"
              checked={motion}
              onValueChange={setExplicit}
            />
          </Stack>
        </Toolbar>
        <Router routes={routes} />
      </Stack>
    </ThemeProvider>
  );
}
