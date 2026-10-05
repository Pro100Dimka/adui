import {
  Button,
  Dialog,
  Select,
  Slider,
  Stack,
  ThemeEditor,
  Typography,
} from "@ad-voice/ui";
import { fonts, headingFonts, type SiteSettings } from "./siteSettings";

/**
 * The site's own look, set by each reader for themselves with the library's ThemeEditor
 * (two colours, or every token by hand; export and import), plus the typeface and text scale.
 */
export function SettingsPanel({
  open,
  onOpenChange,
  settings,
  update,
  reset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
}) {
  return (
    <Dialog
      className="site-settings"
      width="large"
      open={open}
      onOpenChange={onOpenChange}
      title="Тема и настройки"
      description="Меняется только у вас, в этом браузере."
      cancelLabel={false}
      confirmLabel="Готово"
    >
      <Stack gap={5}>
        <ThemeEditor value={settings.themeConfig} onValueChange={(themeConfig) => update({ themeConfig })} />

        <Stack gap={3}>
          <Typography variant="eyebrow" tone="muted">
            Типографика
          </Typography>
          <Select
            label="Шрифт заголовков"
            value={settings.headingFont}
            onValueChange={(headingFont) => update({ headingFont: headingFont as SiteSettings["headingFont"] })}
            options={Object.entries(headingFonts).map(([value, font]) => ({ value, label: font.label }))}
          />
          <Select
            label="Шрифт текста"
            value={settings.font}
            onValueChange={(font) =>
              update({ font: font as SiteSettings["font"] })
            }
            options={Object.entries(fonts).map(([value, font]) => ({
              value,
              label: font.label,
            }))}
          />
          <Stack gap={2}>
            <Stack direction="row" justify="between" align="center">
              <Typography variant="label">Масштаб текста</Typography>
              <Typography variant="mono" tone="muted">
                {Math.round(settings.scale * 100)}%
              </Typography>
            </Stack>
            <Slider
              label="Масштаб текста"
              min={85}
              max={125}
              step={5}
              value={settings.scale * 100}
              onValueChange={(value) => update({ scale: value / 100 })}
            />
          </Stack>
        </Stack>

        <Button variant="ghost" icon="reset" onClick={reset}>
          Вернуть всё как было
        </Button>
      </Stack>
    </Dialog>
  );
}
