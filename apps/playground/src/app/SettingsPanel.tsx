import { tr } from "@ad-voice/ui";
import {
  Button,
  SegmentedControl,
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
      title={tr("Тема и настройки")}
      description={tr("Меняется только у вас, в этом браузере.")}
      cancelLabel={false}
      confirmLabel={tr("Готово")}
    >
      <Stack gap={5}>
        <SegmentedControl
          aria-label={tr("Язык")}
          value={settings.locale}
          onValueChange={(locale) => update({ locale: locale as SiteSettings["locale"] })}
          items={[
            { value: "ru", label: "Русский" },
            { value: "en", label: "English" },
            { value: "uk", label: "Українська" },
          ]}
        />
        <ThemeEditor value={settings.themeConfig} onValueChange={(themeConfig) => update({ themeConfig })} />

        <Stack gap={3}>
          <Typography variant="eyebrow" tone="muted">
            {tr("Типографика")}
          </Typography>
          <Select
            label={tr("Шрифт заголовков")}
            value={settings.headingFont}
            onValueChange={(headingFont) => update({ headingFont: headingFont as SiteSettings["headingFont"] })}
            options={Object.entries(headingFonts).map(([value, font]) => ({ value, label: tr(font.label) }))}
          />
          <Select
            label={tr("Шрифт текста")}
            value={settings.font}
            onValueChange={(font) =>
              update({ font: font as SiteSettings["font"] })
            }
            options={Object.entries(fonts).map(([value, font]) => ({
              value,
              label: tr(font.label),
            }))}
          />
          <Stack gap={2}>
            <Stack direction="row" justify="between" align="center">
              <Typography variant="label">{tr("Масштаб текста")}</Typography>
              <Typography variant="mono" tone="muted">
                {Math.round(settings.scale * 100)}%
              </Typography>
            </Stack>
            <Slider
              label={tr("Масштаб текста")}
              min={85}
              max={125}
              step={5}
              value={settings.scale * 100}
              onValueChange={(value) => update({ scale: value / 100 })}
            />
          </Stack>
        </Stack>

        <Button variant="ghost" icon="reset" onClick={reset}>
          {tr("Вернуть всё как было")}
        </Button>
      </Stack>
    </Dialog>
  );
}
