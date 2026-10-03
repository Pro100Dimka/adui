import { useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  ThemePicker,
  Typography,
  themes,
} from "@ad-voice/ui";
import {
  fonts,
  resolveToken,
  tokenGroups,
  type ColorMode,
  type SiteSettings,
} from "./siteSettings";

/** A colour swatch that opens the system colour picker. */
function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="site-swatch">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <Typography variant="caption">{label}</Typography>
    </label>
  );
}

/**
 * The site's own look, set by each reader for themselves: a ready theme, two colours the
 * whole palette is built from (or every token by hand), the typeface and the text scale.
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
  const scope = useRef<HTMLDivElement>(null);
  // Current colour of every token, read from the live palette so the swatches show it.
  const [resolved, setResolved] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const node = scope.current;
    if (!open || !node) return;
    const frame = requestAnimationFrame(() =>
      setResolved(
        Object.fromEntries(
          tokenGroups.flatMap(([, tokens]) =>
            tokens.map(([token]) => [token, resolveToken(node, token)]),
          ),
        ),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, settings]);

  const pair = {
    primary: settings.primary ?? themes[settings.theme][0],
    secondary: settings.secondary ?? themes[settings.theme][1],
  };

  return (
    <Dialog
      className="site-settings"
      open={open}
      onOpenChange={onOpenChange}
      title="Тема и настройки"
      description="Меняется только у вас, в этом браузере."
      cancelLabel={false}
      confirmLabel="Готово"
    >
      <Stack ref={scope} gap={5}>
        <Stack gap={2}>
          <Typography variant="eyebrow" tone="muted">
            Тема
          </Typography>
          <ThemePicker
            value={settings.theme}
            onValueChange={(theme) =>
              update({
                theme,
                primary: undefined,
                secondary: undefined,
                tokens: {},
              })
            }
          />
        </Stack>

        <Stack gap={3}>
          <Stack direction="row" justify="between" align="center" gap={3} wrap>
            <Typography variant="eyebrow" tone="muted">
              Цвета
            </Typography>
            <SegmentedControl
              size="xs"
              value={settings.mode}
              onValueChange={(mode) => update({ mode: mode as ColorMode })}
              items={[
                { value: "pair", label: "Два цвета", icon: "palette" },
                { value: "all", label: "Все цвета", icon: "sliders" },
              ]}
            />
          </Stack>
          {settings.mode === "pair" ? (
            <Stack gap={3}>
              <Stack direction="row" gap={4} wrap>
                <ColorSwatch
                  label="Primary"
                  value={pair.primary}
                  onChange={(primary) => update({ primary })}
                />
                <ColorSwatch
                  label="Secondary"
                  value={pair.secondary}
                  onChange={(secondary) => update({ secondary })}
                />
              </Stack>
              <Typography variant="caption" tone="muted">
                Палитра, построенная из этих двух цветов:
              </Typography>
              <div className="site-palette">
                {tokenGroups
                  .slice(0, 4)
                  .flatMap(([, tokens]) => tokens)
                  .map(([token]) => (
                    <i
                      key={token}
                      title={token}
                      style={{ background: `var(--ad-${token})` }}
                    />
                  ))}
              </div>
            </Stack>
          ) : (
            <Stack gap={3}>
              {tokenGroups.map(([group, tokens]) => (
                <Stack key={group} gap={2}>
                  <Typography variant="caption" tone="muted">
                    {group}
                  </Typography>
                  <Stack direction="row" gap={3} wrap>
                    {tokens.map(([token, label]) => (
                      <ColorSwatch
                        key={token}
                        label={label}
                        value={
                          settings.tokens[token] ?? resolved[token] ?? "#000000"
                        }
                        onChange={(color) =>
                          update({
                            tokens: { ...settings.tokens, [token]: color },
                          })
                        }
                      />
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack gap={3}>
          <Typography variant="eyebrow" tone="muted">
            Типографика
          </Typography>
          <Select
            label="Шрифт"
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
