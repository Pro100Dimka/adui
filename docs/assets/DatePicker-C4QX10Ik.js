const e=`import { useMemo, useRef, useState } from "react";
import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { IconButton } from "../IconButton/IconButton";
import { Button } from "../Button/Button";
import { FieldFrame, useFieldIds } from "../internal";
import { InputBase } from "../InputBase/InputBase";

export interface DatePickerProps extends CommonProps {
  /** The date as YYYY-MM-DD, or "" for none. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  /** Earliest and latest dates that can be chosen, YYYY-MM-DD. */
  min?: string;
  max?: string;
  /** Language of month and day names. */
  locale?: string;
  disabled?: boolean;
  required?: boolean;
}

const iso = (date: Date) =>
  \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, "0")}-\${String(date.getDate()).padStart(2, "0")}\`;
const parse = (value?: string) => {
  const match = value && /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};
/** Typed "dd.mm.yyyy" (or with / and -) back to a date. */
const parseTyped = (text: string) => {
  const match = /^(\\d{1,2})[./-](\\d{1,2})[./-](\\d{4})$/.exec(text.trim());
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return date.getDate() === Number(match[1]) ? date : null;
};

/** A date field with a month calendar: arrows through months, today marked, out-of-range days off. */
export function DatePicker({ value: controlled, defaultValue = "", onValueChange, min, max, locale = "ru-RU", placeholder = "дд.мм.гггг", ...p }: DatePickerProps) {
  const [value, setValue] = useControllable(controlled, defaultValue, onValueChange);
  const selected = parse(value);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [month, setMonth] = useState(() => selected ?? new Date());
  const box = useRef<HTMLDivElement>(null);
  const ids = useFieldIds(p.label, p.description || p.error);
  const format = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }), [locale]);
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 1 + i))),
    [locale],
  );
  const today = iso(new Date());
  const allowed = (day: string) => (!min || day >= min) && (!max || day <= max);

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // weeks start on Monday
  const days = Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - offset + i));
  const choose = (date: Date) => {
    const day = iso(date);
    if (!allowed(day)) return;
    setValue(day);
    setText(null);
    setOpen(false);
  };
  const shift = (months: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + months, 1));

  return (
    <div {...mark("DatePicker", p)}>
      <FieldFrame ids={ids} className="" label={p.label} required={p.required} description={p.description} error={p.error}>
        <InputBase ref={box} size={p.size} disabled={p.disabled} error={!!p.error} filled={!!selected}
          endAdornment={<IconButton size="xs" variant="ghost" icon="clock" label="Открыть календарь" disabled={p.disabled}
            onClick={() => { setMonth(selected ?? new Date()); setOpen((v) => !v); }} />}>
          <input
            value={text ?? (selected ? format.format(selected) : "")}
            placeholder={placeholder}
            disabled={p.disabled}
            aria-labelledby={ids.aria["aria-labelledby"]}
            aria-describedby={ids.aria["aria-describedby"]}
            onChange={(event) => setText(event.currentTarget.value)}
            onFocus={() => setMonth(selected ?? new Date())}
            onBlur={() => {
              if (text === null) return;
              const typed = parseTyped(text);
              if (!text.trim()) setValue("");
              else if (typed && allowed(iso(typed))) setValue(iso(typed));
              setText(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "ArrowDown" && event.altKey) setOpen(true);
            }}
          />
        </InputBase>
      </FieldFrame>
      <Popover open={open} onOpenChange={setOpen} anchorRef={box} align="start" label="Календарь" className="ad-date-popover">
        <div className="ad-calendar">
          <div className="ad-calendar-head">
            <IconButton size="xs" variant="ghost" icon="prev" label="Предыдущий месяц" onClick={() => shift(-1)} />
            <strong>{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}</strong>
            <IconButton size="xs" variant="ghost" icon="prev" className="ad-calendar-next" label="Следующий месяц" onClick={() => shift(1)} />
          </div>
          <div className="ad-calendar-grid" role="grid">
            {weekdays.map((day) => <span key={day} className="ad-calendar-weekday">{day}</span>)}
            {days.map((date) => {
              const day = iso(date);
              return (
                <button key={day} type="button" className="ad-calendar-day" disabled={!allowed(day)}
                  data-outside={date.getMonth() !== month.getMonth() || undefined} data-today={day === today || undefined}
                  aria-pressed={day === value} aria-label={format.format(date)} onClick={() => choose(date)}>
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="ad-calendar-foot">
            <Button size="xs" variant="ghost" icon="clock" disabled={!allowed(today)} onClick={() => choose(new Date())}>Сегодня</Button>
            {selected && <Button size="xs" variant="ghost" icon="close" onClick={() => { setValue(""); setOpen(false); }}>Очистить</Button>}
          </div>
        </div>
      </Popover>
      {p.required && <input type="hidden" value={value} required aria-hidden />}
    </div>
  );
}
`;export{e as default};
