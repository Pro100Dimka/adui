const e=`import { useState } from "react";
import { copyText, mark, type CommonProps } from "../../../core/base";
import { tr } from "../../../core/i18n";
import { Button } from "../../controls/Button/Button";
import { ColorPicker } from "../../controls/ColorPicker/ColorPicker";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { Slider } from "../../controls/Slider/Slider";
import { Typography } from "../Typography/Typography";
import { Loader, loaderAnimationLabel, loaderAnimations, loaderCss, loaderDefaultImage, type LoaderAnimation } from "../Loader/Loader";

export interface LoaderSettings {
  src: string;
  animation: LoaderAnimation;
  /** rem */
  size: number;
  speed: number;
  color: string;
}

export interface LoaderGeneratorProps extends CommonProps {
  value?: LoaderSettings;
  defaultValue?: Partial<LoaderSettings>;
  onValueChange?: (settings: LoaderSettings) => void;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** A standalone page with just the loader: its markup and the animation it uses. */
export function loaderHtml({ src, animation, size, speed, color }: LoaderSettings) {
  const rings = animation === "wave" ? 2 : ["bounce", "orbit", "glow", "radar"].includes(animation) ? 1 : 0;
  const extra =
    animation === "fill"
      ? \`<span class="ad-loader-fill"><img src="\${src}" alt=""></span>\`
      : animation === "shine"
        ? \`<span class="ad-loader-sweep"><i></i></span>\`
        : "";
  return \`<!doctype html>
<html><head><meta charset="utf-8"><title>Loader</title><style>
html,body{height:100%;margin:0;display:grid;place-items:center;background:#0b0508}
\${loaderCss.trim()}
</style></head><body>
<span class="ad-loader" role="status" aria-label="Loading" data-animation="\${animation}" style="--ad-loader-size:\${size}rem;--ad-loader-speed:\${speed};--ad-loader-color:\${color};\${animation === "shine" ? \`--ad-loader-src:url('\${src}')\` : ""}">\${'<span class="ad-loader-ring"></span>'.repeat(rings)}<img class="ad-loader-img" src="\${src}" alt="">\${extra}</span>
</body></html>\`;
}

/**
 * Make a loader from your own picture: upload it, pick one of twelve animations from live
 * previews, set size, speed and colour, then copy the code or download a ready page.
 */
export function LoaderGenerator({ value, defaultValue, onValueChange, ...p }: LoaderGeneratorProps) {
  const [own, setOwn] = useState<LoaderSettings>({
    src: loaderDefaultImage,
    animation: "orbit",
    size: 6,
    speed: 1,
    color: "#ff244c",
    ...defaultValue,
  });
  const settings = value ?? own;
  const update = (patch: Partial<LoaderSettings>) => {
    const next = { ...settings, ...patch };
    setOwn(next);
    onValueChange?.(next);
  };
  const [copied, setCopied] = useState(false);
  const isData = settings.src.startsWith("data:");
  const code = \`<Loader src=\${isData ? "{picture}" : JSON.stringify(settings.src)} animation="\${settings.animation}" size="\${settings.size}rem"\${settings.speed !== 1 ? \` speed={\${settings.speed}}\` : ""} color="\${settings.color}" />\`;

  return (
    <div {...mark("LoaderGenerator", p)}>
      <div className="ad-loader-generator-top">
        <div className="ad-loader-generator-stage">
          <Loader src={settings.src} animation={settings.animation} size={\`\${settings.size}rem\`} speed={settings.speed} color={settings.color} />
        </div>
        <div className="ad-loader-generator-controls">
          <FilePicker variant="zone" icon="photo" accept="image/*" label={tr("Загрузите картинку")}
            description={tr("PNG, SVG или WebP с прозрачностью — лучше всего")}
            onFiles={async ([file]) => file && update({ src: await fileToDataUrl(file) })} />
          <label className="ad-loader-generator-slider">
            <span><Typography variant="label">{tr("Размер")}</Typography><Typography variant="mono" tone="muted">{settings.size} rem</Typography></span>
            <Slider label={tr("Размер")} min={2} max={12} step={0.5} value={settings.size} onValueChange={(size) => update({ size })} />
          </label>
          <label className="ad-loader-generator-slider">
            <span><Typography variant="label">{tr("Скорость")}</Typography><Typography variant="mono" tone="muted">×{settings.speed}</Typography></span>
            <Slider label={tr("Скорость")} min={0.25} max={3} step={0.25} value={settings.speed} onValueChange={(speed) => update({ speed })} />
          </label>
          <ColorPicker label={tr("Цвет")} value={settings.color} onValueChange={(color) => update({ color })} />
        </div>
      </div>

      <Typography variant="label">{tr("Анимация")}</Typography>
      <div className="ad-loader-generator-grid" role="radiogroup" aria-label={tr("Анимация")}>
        {loaderAnimations.map((animation) => (
          <button key={animation} type="button" role="radio" aria-checked={animation === settings.animation}
            className="ad-loader-generator-option" onClick={() => update({ animation })}>
            <Loader src={settings.src} animation={animation} size="3rem" speed={settings.speed} color={settings.color} />
            <span>{loaderAnimationLabel(animation)}</span>
          </button>
        ))}
      </div>

      <div className="ad-loader-generator-code">
        <Typography variant="label">{tr("Код лоадера")}</Typography>
        <pre>{code}</pre>
        <div className="ad-loader-generator-actions">
          <Button size="sm" icon={copied ? "check" : "copy"} onClick={async () => setCopied(await copyText(code))}>
            {copied ? tr("Скопировано") : tr("Копировать")}
          </Button>
          <Button size="sm" variant="primary" icon="download" onClick={() => {
            const url = URL.createObjectURL(new Blob([loaderHtml(settings)], { type: "text/html" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = \`loader-\${settings.animation}.html\`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
          }}>
            {tr("Скачать HTML")}
          </Button>
        </div>
      </div>
    </div>
  );
}
`;export{e as default};
