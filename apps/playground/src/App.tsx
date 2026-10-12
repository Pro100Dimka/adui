import { LocaleProvider, addMessages, translate } from "@neo-ui-kit/react";
import { docsMessages } from "./app/docsMessages";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Icon,
  IconButton,
  Link,
  Menu,
  Router,
  Stack,
  ThemeProvider,
  Tooltip,
  Toolbar,
  Typography,
  useReducedMotion,
  type RouteDefinition,
} from "@neo-ui-kit/react";
import { CatalogPage } from "./catalog/CatalogPage";
import { componentCount } from "./catalog/componentRegistry";
import { SettingsPanel } from "./app/SettingsPanel";
import { SiteThemeContext } from "../../../packages/ui/src/dev/exampleHelpers";
import {
  siteAppearanceTokens,
  siteThemeProps,
  useSiteSettings,
} from "./app/siteSettings";

const languages = {
  ru: { label: "RU", name: "Русский" },
  en: { label: "EN", name: "English" },
  uk: { label: "UA", name: "Українська" },
} as const;

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
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageAnchor = useRef<HTMLButtonElement>(null);
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
                  NEO UI
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
              gap={2}
            >
              <Badge>{componentCount} {tr("компонентов")}</Badge>
              {[
                {
                  className: "site-appearance", icon: "bulb", label: tr("Светлая"),
                  hint: tr(settings.appearance === "dark" ? "Включить светлую тему" : "Включить тёмную тему"),
                  "aria-pressed": settings.appearance === "light",
                  onClick: () => update({ appearance: settings.appearance === "dark" ? "light" : "dark" }),
                },
                {
                  className: "site-settings-trigger", icon: "palette", label: tr("Тема и настройки"),
                  onClick: () => setSettingsOpen(true),
                },
                {
                  className: "site-motion", icon: "motion", label: tr("Анимации"),
                  "aria-pressed": motion, onClick: () => setExplicit(!motion),
                },
              ].map(({ hint, ...action }) => (
                <Tooltip key={action.className} content={hint ?? action.label} placement="bottom">
                  <IconButton {...action} size="sm" variant="ghost" title="" />
                </Tooltip>
              ))}
              <Button
                ref={languageAnchor}
                className="site-locale"
                size="sm"
                variant="ghost"
                aria-label={`${tr("Язык")}: ${languages[settings.locale].label}`}
                aria-haspopup="menu"
                aria-expanded={languageOpen}
                onClick={() => setLanguageOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setLanguageOpen(true);
                  }
                }}
              >
                {languages[settings.locale].label}
              </Button>
              <Menu
                className="site-language-menu"
                open={languageOpen}
                onOpenChange={setLanguageOpen}
                anchorRef={languageAnchor}
                label={`${tr("Язык")}: ${languages[settings.locale].name}`}
                items={Object.entries(languages).map(([locale, language]) => ({
                  id: locale,
                  label: language.name,
                  endIcon: locale === settings.locale ? "check" : undefined,
                  onSelect: () => update({ locale: locale as keyof typeof languages }),
                }))}
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
