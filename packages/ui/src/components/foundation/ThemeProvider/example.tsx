import { useEffect } from "react";
import { Playground, U, jsx, useSiteTheme } from "../../../dev/exampleHelpers";

const names = ["ruby", "light", "green", "violet"] as const;

/** The chosen theme also becomes the theme of the docs site. */
function FollowSite({ theme }: { theme: (typeof names)[number] }) {
  const site = useSiteTheme();
  useEffect(() => {
    if (theme !== site.theme) site.set({ theme });
  }, [theme]);
  return null;
}

export default function ThemeProviderExample() {
  const site = useSiteTheme();
  return (
    <Playground
      key={site.theme}
      stretch
      knobs={{ theme: { options: names, value: site.theme } }}
      code={(v) =>
        jsx(
          "ThemeProvider",
          { theme: v.theme },
          '<Button variant="primary">Применить</Button>',
        )
      }
    >
      {(v) => (
        <U.ThemeProvider theme={v.theme} primary={site.primary} secondary={site.secondary}>
          <FollowSite theme={v.theme} />
          <U.Card material="glass" title="Предпросмотр темы">
            <U.Stack gap={3}>
              <U.Stack direction={{ base: "column", sm: "row" }} gap={2}>
                <U.TextField placeholder="Поле ввода" />
                <U.Button variant="primary">Применить</U.Button>
              </U.Stack>
              <U.Slider defaultValue={60} label="Уровень" />
              <U.Typography variant="caption" tone="muted">
                Свои цвета — в «Тема» в верхней панели сайта.
              </U.Typography>
            </U.Stack>
          </U.Card>
        </U.ThemeProvider>
      )}
    </Playground>
  );
}
