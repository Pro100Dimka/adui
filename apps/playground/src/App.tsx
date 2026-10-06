import { LocaleProvider, addMessages, translate } from "@ad-voice/ui";
import { docsMessages } from "./app/docsMessages";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Icon,
  Link,
  Router,
  SegmentedControl,
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
import { componentCount } from "./catalog/componentRegistry";
import { SettingsPanel } from "./app/SettingsPanel";
import { SiteThemeContext } from "../../../packages/ui/src/dev/exampleHelpers";
import {
  siteAppearanceTokens,
  siteThemeProps,
  useSiteSettings,
  type SiteSettings,
} from "./app/siteSettings";

const routes: RouteDefinition[] = [
  {
    path: "/components/:id",
    element: (match) => <CatalogPage routeId={match.params.id} />,
  },
  { path: "*", redirectTo: "/components/overview" },
];
const CatalogRouter = memo(Router);
const StableSettingsPanel = memo(SettingsPanel);

// The docs' own texts join the library's translations.
for (const [locale, messages] of Object.entries(docsMessages)) addMessages(locale, messages);

export default function App() {
  const reduced = useReducedMotion();
  const [explicit, setExplicit] = useState<boolean>();
  const motion = explicit ?? !reduced;
  const [settings, update, reset] = useSiteSettings();
  const tr = (text: string) => translate(settings.locale, text);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const themed = useMemo(
    () => siteThemeProps(settings),
    [settings.themeConfig, settings.appearance, settings.font, settings.headingFont],
  );
  // Theme examples in the docs drive the site theme through this.
  const setSiteTheme = useCallback(({
      theme,
      ...colors
    }: {
      theme?: typeof themed.theme;
      primary?: string;
      secondary?: string;
    }) =>
      update((current) => ({
        themeConfig: theme
          ? { version: 1, mode: "simple", theme, ...colors }
          : { ...current.themeConfig, autoSecondary: false, ...colors },
      })), [update]);
  const siteTheme = useMemo(() => ({
    theme: themed.theme,
    primary: themed.primary,
    secondary: themed.secondary,
    set: setSiteTheme,
  }), [themed.theme, themed.primary, themed.secondary, setSiteTheme]);

  useEffect(() => {
    document.documentElement.dataset.adMotion = motion ? "on" : "off";
  }, [motion]);

  // The page background sits outside ThemeProvider; it takes the same colours.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--ad-primary", siteTheme.primary);
    root.setProperty("--ad-secondary", siteTheme.secondary);
    document.documentElement.dataset.adColorMode = settings.appearance;
    const lightTokens = siteAppearanceTokens("light");
    const activeTokens = siteAppearanceTokens(settings.appearance);
    for (const token of Object.keys(lightTokens)) {
      const value = activeTokens[token as keyof typeof activeTokens];
      if (value) root.setProperty(`--ad-${token}`, value);
      else root.removeProperty(`--ad-${token}`);
    }
  }, [settings.appearance, siteTheme.primary, siteTheme.secondary]);

  return (
    <LocaleProvider locale={settings.locale}>
    <ThemeProvider {...themed} colorScheme={settings.appearance}>
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
              <Badge>{componentCount} {tr("компонентов")}</Badge>
              <SegmentedControl<SiteSettings["appearance"]>
                className="site-appearance"
                label={tr("Оформление")}
                value={settings.appearance}
                onValueChange={(appearance) => update({ appearance })}
                items={[
                  { value: "light", label: tr("Светлая") },
                  { value: "dark", label: tr("Тёмная") },
                ]}
              />
              <SegmentedControl<SiteSettings["locale"]>
                className="site-locale"
                label={tr("Язык")}
                value={settings.locale}
                onValueChange={(locale) => update({ locale })}
                items={[
                  { value: "ru", label: "RU" },
                  { value: "en", label: "EN" },
                  { value: "uk", label: "UA" },
                ]}
              />
              <Button
                size="sm"
                variant="secondary"
                icon="palette"
                onClick={() => setSettingsOpen(true)}
              >
                {tr("Тема")}
              </Button>
              <Switch
                label={tr("Анимации")}
                checked={motion}
                onValueChange={setExplicit}
              />
            </Stack>
          </Toolbar>
          <CatalogRouter key={settings.locale} routes={routes} />
        </Stack>
        {settingsOpen && <StableSettingsPanel
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          update={update}
          reset={reset}
        />}
      </SiteThemeContext.Provider>
    </ThemeProvider>
    </LocaleProvider>
  );
}
