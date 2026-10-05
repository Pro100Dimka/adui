import { tr } from "../../../core/i18n";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { FieldFrame, useFieldIds } from "../internal";
import { InputBase } from "../InputBase/InputBase";
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from "./color";

export interface ColorPickerProps extends CommonProps {
  /** #rrggbb */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Ready colours offered under the picker. */
  swatches?: string[];
  /** The panel itself, without a field and a popover (e.g. inside a theme editor). */
  inline?: boolean;
  disabled?: boolean;
}

const defaultSwatches = ["#ff244c", "#ff7c97", "#e0a43a", "#10c99a", "#38bdf8", "#9b5cff", "#f472b6", "#f5f5f5"];

/** Picks a colour on a saturation/brightness square and a hue strip, by hex code or from swatches. */
function ColorPanel({ value, onChange, swatches }: { value: string; onChange: (hex: string) => void; swatches: string[] }) {
  // HSV is kept while dragging, so a grey or black point does not lose the chosen hue.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [text, setText] = useState(value);
  useEffect(() => {
    if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value));
    setText(value);
  }, [value]);
  const update = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };
  const drag = (handler: (x: number, y: number) => void) => ({
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const box = event.currentTarget.getBoundingClientRect();
      handler((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const box = event.currentTarget.getBoundingClientRect();
      handler((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
    },
  });
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return (
    <div className="ad-color-panel">
      <div
        className="ad-color-area"
        style={{ "--ad-color-hue": `hsl(${hsv.h} 100% 50%)` } as React.CSSProperties}
        role="slider"
        aria-label={tr("Насыщенность и яркость")}
        aria-valuetext={value}
        tabIndex={0}
        {...drag((x, y) => update({ ...hsv, s: clamp(x), v: 1 - clamp(y) }))}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 0.1 : 0.02;
          const moves: Record<string, Partial<Hsv>> = {
            ArrowLeft: { s: clamp(hsv.s - step) },
            ArrowRight: { s: clamp(hsv.s + step) },
            ArrowUp: { v: clamp(hsv.v + step) },
            ArrowDown: { v: clamp(hsv.v - step) },
          };
          if (moves[event.key]) {
            event.preventDefault();
            update({ ...hsv, ...moves[event.key] });
          }
        }}
      >
        <i style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }} />
      </div>
      <div
        className="ad-color-hue"
        role="slider"
        aria-label={tr("Оттенок")}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        tabIndex={0}
        {...drag((x) => update({ ...hsv, h: clamp(x) * 360 }))}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 15 : 3;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            update({ ...hsv, h: (hsv.h + (event.key === "ArrowRight" ? step : -step) + 360) % 360 });
          }
        }}
      >
        <i style={{ left: `${(hsv.h / 360) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }} />
      </div>
      <label className="ad-color-hex">
        <span className="ad-color-sample" style={{ background: value }} />
        <input
          value={text}
          spellCheck={false}
          aria-label={tr("Код цвета")}
          onChange={(event) => {
            setText(event.currentTarget.value);
            const hex = normalizeHex(event.currentTarget.value);
            if (hex) {
              setHsv(hexToHsv(hex));
              onChange(hex);
            }
          }}
          onBlur={() => setText(value)}
        />
      </label>
      {swatches.length > 0 && (
        <div className="ad-color-swatches">
          {swatches.map((swatch) => (
            <button key={swatch} type="button" aria-label={swatch} aria-pressed={swatch.toLowerCase() === value}
              style={{ background: swatch }} onClick={() => onChange(swatch.toLowerCase())} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A colour field: its swatch and code; a click opens the picker panel. With `inline` the panel stands alone. */
export function ColorPicker({ value: controlled, defaultValue = "#ff244c", onValueChange, swatches = defaultSwatches, inline, ...p }: ColorPickerProps) {
  const [value, setValue] = useControllable(controlled, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ids = useFieldIds(p.label, p.description);
  const hex = normalizeHex(value) ?? "#ff244c";
  if (inline)
    return (
      <div {...mark("ColorPicker", p)} data-inline="">
        <ColorPanel value={hex} onChange={setValue} swatches={swatches} />
      </div>
    );
  return (
    <div {...mark("ColorPicker", p)}>
      <FieldFrame ids={ids} className="" label={p.label} description={p.description}>
        <InputBase ref={box} size={p.size} disabled={p.disabled} startAdornment={<span className="ad-color-sample" style={{ background: hex }} />}>
          <button type="button" className="ad-input-control ad-color-control" disabled={p.disabled} aria-haspopup="dialog"
            aria-expanded={open} aria-labelledby={ids.aria["aria-labelledby"]} onClick={() => setOpen((v) => !v)}>
            {hex.toUpperCase()}
          </button>
        </InputBase>
      </FieldFrame>
      <Popover open={open} onOpenChange={setOpen} anchorRef={box} align="start" label={tr("Выбор цвета")} className="ad-color-popover">
        <ColorPanel value={hex} onChange={setValue} swatches={swatches} />
      </Popover>
    </div>
  );
}
