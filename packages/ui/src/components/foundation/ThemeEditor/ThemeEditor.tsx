import { useLayoutEffect, useRef, useState } from "react";
import { copyText, mark, useControllable, type CommonProps } from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { ColorPicker } from "../../controls/ColorPicker/ColorPicker";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { IconButton } from "../../controls/IconButton/IconButton";
import { SegmentedControl } from "../../controls/SegmentedControl/SegmentedControl";
import { Switch } from "../../controls/Switch/Switch";
import { TextArea } from "../../controls/TextArea/TextArea";
import { TextField } from "../../controls/TextField/TextField";
import { ThemePicker } from "../../controls/ThemePicker/ThemePicker";
import { Badge } from "../../feedback/Badge/Badge";
import { CollapsibleSection } from "../../feedback/CollapsibleSection/CollapsibleSection";
import { MessageBar } from "../../feedback/MessageBar/MessageBar";
import { Popover } from "../../feedback/Popover/Popover";
import { ProgressBar } from "../../feedback/ProgressBar/ProgressBar";
import { Icon } from "../../layout/Icon/Icon";
import { Typography } from "../Typography/Typography";
import { themes } from "../ThemeProvider/ThemeProvider";
import {
  defaultThemeConfig,
  deriveSecondary,
  exportTheme,
  parseTheme,
  resolveToken,
  themeTokenGroups,
  type ThemeConfig,
} from "./themeConfig";

export interface ThemeEditorProps extends CommonProps {
  value?: ThemeConfig;
  defaultValue?: ThemeConfig;
  onValueChange?: (config: ThemeConfig) => void;
  /** File name for the exported theme. */
  fileName?: string;
}

const paletteStrip = ["primary-900", "primary-800", "primary-700", "primary-600", "primary", "secondary", "secondary-200", "secondary-100", "secondary-50"];
const neutralStrip = ["neutral-950", "neutral-900", "neutral-850", "neutral-800", "neutral-700", "neutral-600", "neutral-500", "neutral-400", "neutral-300", "neutral-200"];

/** "1 токен", "3 токена", "7 токенов". */
const tokensWord = (n: number) =>
  `${n} ${n % 10 === 1 && n % 100 !== 11 ? "токен" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "токена" : "токенов"}`;

/** Downloads text as a file. */
const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/**
 * Editing a theme. Simple: a ready theme and two colours, everything else is calculated.
 * Advanced: every token — palette, statuses, shape, type, motion — by hand, with search and
 * per-token reset. Either way the theme exports to JSON and imports back.
 */
export function ThemeEditor({ value: controlled, defaultValue = defaultThemeConfig, onValueChange, fileName = "neo-ui-theme.json", ...p }: ThemeEditorProps) {
  const [config, setConfig] = useControllable(controlled, defaultValue, onValueChange);
  const update = (patch: Partial<ThemeConfig>) => setConfig({ ...config, ...patch });
  const root = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string }>();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const pasteAnchor = useRef<HTMLButtonElement>(null);

  // The values the theme gives every token right now, so untouched tokens show what they are.
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const frame = requestAnimationFrame(() =>
      setResolved(
        Object.fromEntries(
          themeTokenGroups.flatMap((group) => group.tokens.map((token) => [token.name, resolveToken(node, token.name, token.kind)])),
        ),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [config]);

  const primary = config.primary ?? themes[config.theme][0];
  const secondary = config.autoSecondary && config.primary ? deriveSecondary(primary) : (config.secondary ?? themes[config.theme][1]);
  const tokens = config.tokens ?? {};
  const changed = Object.keys(tokens).length;
  const setToken = (name: string, value: string | undefined) => {
    const next = { ...tokens };
    if (value === undefined || value === "") delete next[name];
    else next[name] = value;
    update({ tokens: next });
  };
  const load = (text: string) => {
    try {
      setConfig(parseTheme(text));
      setNotice({ tone: "success", text: "Тема загружена." });
      return true;
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Не удалось прочитать тему." });
      return false;
    }
  };
  const needle = search.trim().toLowerCase();

  return (
    <div {...mark("ThemeEditor", p)} ref={root}>
      <div className="ad-theme-editor-bar">
        <SegmentedControl
          size="sm"
          value={config.mode}
          onValueChange={(mode) => update({ mode: mode as ThemeConfig["mode"] })}
          items={[
            { value: "simple", label: "Простой", icon: "palette" },
            { value: "advanced", label: "Продвинутый", icon: "sliders" },
          ]}
        />
        <span className="ad-theme-editor-actions">
          <Button size="sm" icon="download" onClick={() => download(fileName, exportTheme(config))}>Экспорт</Button>
          <IconButton size="sm" icon="copy" label="Скопировать JSON темы" onClick={async () => {
            const done = await copyText(exportTheme(config));
            setNotice(done ? { tone: "success", text: "JSON темы скопирован." } : { tone: "error", text: "Не удалось скопировать." });
          }} />
          <FilePicker size="sm" icon="upload" label="Импорт" description=" " accept=".json,application/json"
            onFiles={async ([file]) => file && load(await file.text())} />
          <IconButton ref={pasteAnchor} size="sm" icon="document" label="Вставить JSON темы" aria-expanded={pasteOpen} onClick={() => setPasteOpen((v) => !v)} />
          <IconButton size="sm" variant="ghost" icon="reset" label="Сбросить тему" onClick={() => { setConfig(defaultThemeConfig); setNotice(undefined); }} />
        </span>
      </div>
      <Popover open={pasteOpen} onOpenChange={setPasteOpen} anchorRef={pasteAnchor} align="end" label="Вставить тему" className="ad-theme-editor-paste">
        <TextArea label="JSON темы" value={pasted} onValueChange={setPasted} rows={6} placeholder='{ "$type": "neo-ui-theme", … }' />
        <Button size="sm" variant="primary" icon="check" disabled={!pasted.trim()} onClick={() => { if (load(pasted)) { setPasted(""); setPasteOpen(false); } }}>
          Применить
        </Button>
      </Popover>
      {notice && <MessageBar tone={notice.tone}>{notice.text}</MessageBar>}

      {config.mode === "simple" ? (
        <div className="ad-theme-editor-simple">
          <ThemePicker value={config.theme} label="Готовая тема"
            onValueChange={(theme) => setConfig({ ...config, theme, primary: undefined, secondary: undefined })} />
          <div className="ad-theme-editor-colors">
            <ColorPicker label="Основной цвет" value={primary} onValueChange={(hex) => update({ primary: hex })} />
            <ColorPicker label="Второй цвет" value={secondary} disabled={config.autoSecondary}
              description={config.autoSecondary ? "Рассчитывается из основного" : undefined}
              onValueChange={(hex) => update({ secondary: hex })} />
          </div>
          <Switch label="Второй цвет рассчитывать автоматически" checked={!!config.autoSecondary}
            onValueChange={(autoSecondary) => update({ autoSecondary, primary: config.primary ?? primary, secondary })} />
          <Typography variant="caption" tone="muted">Палитра, построенная из этих цветов:</Typography>
          <div className="ad-theme-editor-strip">{paletteStrip.map((name) => <i key={name} title={name} style={{ background: `var(--ad-${name})` }} />)}</div>
          <div className="ad-theme-editor-strip">{neutralStrip.map((name) => <i key={name} title={name} style={{ background: `var(--ad-${name})` }} />)}</div>
        </div>
      ) : (
        <div className="ad-theme-editor-advanced">
          <div className="ad-theme-editor-search">
            <TextField size="sm" placeholder="Найти токен…" startAdornment={<Icon name="search" />} clearable value={search} onValueChange={setSearch} aria-label="Найти токен" />
            <Badge tone={changed ? "warning" : undefined}>{changed ? `Изменено: ${changed}` : "Всё из темы"}</Badge>
          </div>
          {themeTokenGroups.map((group, index) => {
            const rows = group.tokens.filter((token) => !needle || `${token.name} ${token.label} ${group.title}`.toLowerCase().includes(needle));
            if (!rows.length) return null;
            const own = rows.filter((token) => tokens[token.name] !== undefined).length;
            return (
              <CollapsibleSection key={group.title} title={group.title} defaultOpen={index < 2 || !!needle}
                description={own ? `изменено: ${own} из ${rows.length}` : tokensWord(rows.length)}>
                <div className="ad-theme-editor-tokens">
                  {rows.map((token) => {
                    const current = tokens[token.name] ?? resolved[token.name] ?? "";
                    return (
                      <div key={token.name} className="ad-theme-editor-token" data-changed={tokens[token.name] !== undefined || undefined}>
                        {token.kind === "color" ? (
                          <ColorPicker size="sm" label={token.label} value={/^#[0-9a-f]{6}$/i.test(current) ? current : "#000000"}
                            onValueChange={(hex) => setToken(token.name, hex)} />
                        ) : (
                          <TextField size="sm" label={token.label} value={current} spellCheck={false}
                            onValueChange={(value) => setToken(token.name, value)} />
                        )}
                        <code>--ad-{token.name}</code>
                        {tokens[token.name] !== undefined && (
                          <IconButton size="xs" variant="ghost" icon="reset" label={`Вернуть ${token.label}`} onClick={() => setToken(token.name, undefined)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            );
          })}
        </div>
      )}

      <div className="ad-theme-editor-preview" aria-label="Пример темы">
        <Typography variant="eyebrow" tone="accent">Пример</Typography>
        <Typography variant="title">Так выглядит тема</Typography>
        <div className="ad-theme-editor-preview-row">
          <Button size="sm" variant="primary" icon="play">Играть</Button>
          <Button size="sm" icon="settings">Настройки</Button>
          <Badge tone="success">Готово</Badge>
          <Badge tone="warning">Внимание</Badge>
        </div>
        <ProgressBar value={62} label="Обработка" />
      </div>
    </div>
  );
}
