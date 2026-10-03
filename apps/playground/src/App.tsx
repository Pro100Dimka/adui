import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Icon,
  Link,
  Router,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  themes,
  Typography,
  useReducedMotion,
  type RouteDefinition,
} from "@ad-voice/ui";
import { CatalogPage } from "./catalog/CatalogPage";
import { catalog } from "./catalog/componentRegistry";
import { SettingsPanel } from "./app/SettingsPanel";
import { SiteThemeContext } from "../../../packages/ui/src/dev/exampleHelpers";
import { themeTokens, useSiteSettings } from "./app/siteSettings";

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
  const [settings, update, reset] = useSiteSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Theme examples in the docs drive the site theme through this.
  const siteTheme = {
    theme: settings.theme,
    primary: settings.primary ?? themes[settings.theme][0],
    secondary: settings.secondary ?? themes[settings.theme][1],
    set: ({
      theme,
      ...colors
    }: {
      theme?: typeof settings.theme;
      primary?: string;
      secondary?: string;
    }) =>
      update(
        theme
          ? {
              theme,
              primary: undefined,
              secondary: undefined,
              tokens: {},
              ...colors,
            }
          : colors,
      ),
  };

  useEffect(() => {
    document.documentElement.dataset.adMotion = motion ? "on" : "off";
  }, [motion]);

  // The page background sits outside ThemeProvider; it takes the same colours.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--ad-primary", siteTheme.primary);
    root.setProperty("--ad-secondary", siteTheme.secondary);
  }, [siteTheme.primary, siteTheme.secondary]);

  return (
    <ThemeProvider
      theme={settings.theme}
      primary={settings.primary}
      secondary={settings.secondary}
      tokens={themeTokens(settings)}
    >
      <SiteThemeContext.Provider value={siteTheme}>
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
            <Stack
              className="site-tools"
              direction="row"
              align="center"
              gap={3}
            >
              <Badge>{catalog.length} компонентов</Badge>
              <Button
                size="sm"
                variant="secondary"
                icon="palette"
                onClick={() => setSettingsOpen(true)}
              >
                Тема
              </Button>
              <Switch
                label="Анимации"
                checked={motion}
                onValueChange={setExplicit}
              />
            </Stack>
          </Toolbar>
          <Router routes={routes} />
        </Stack>
        <SettingsPanel
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          update={update}
          reset={reset}
        />
      </SiteThemeContext.Provider>
    </ThemeProvider>
  );
}
