import { useTr } from "../../../core/i18n";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Avatar } from "../../layout/Avatar/Avatar";
import { Icon } from "../../layout/Icon/Icon";
import { FieldFrame, fieldLabel, useFieldIds, OptionList, type Option } from "../internal";
import { InputBase } from "../InputBase/InputBase";
import type { SelectOption, SelectProps } from "../shared";

const defaultKey = (value: unknown) =>
  typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);

const textOf = (option: SelectOption<unknown>) =>
  option.text ?? (typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : "");

/**
 * A choice from a list. Values can be strings, numbers or whole objects; options can carry an
 * icon, an avatar, a description and a group, or be drawn by `renderOption`; long lists get a
 * search box with `searchable`.
 */
export function Select<V = string>(p: SelectProps<V>) {
  const tr = useTr();
  const ids = useFieldIds(p.label, p.description || p.error);
  const floating = p.labelPlacement === "floating" && !!p.label;
  const keyOf = (p.getKey ?? defaultKey) as (value: V) => string;
  const options = useMemo<SelectOption<V>[]>(
    () =>
      (p.options ?? ([tr("Первый вариант"), tr("Второй вариант")] as unknown as V[])).map((option) =>
        typeof option === "object" && option !== null && "value" in (option as object)
          ? (option as SelectOption<V>)
          : { value: option as V, label: String(option) },
      ),
    [p.options],
  );
  const [value, setValue] = useControllable<V | undefined>(
    p.value,
    p.defaultValue ?? (p.placeholder ? undefined : options[0]?.value),
    p.onValueChange as ((value: V | undefined) => void) | undefined,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchor = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const selectedKey = value === undefined ? undefined : keyOf(value);
  const selected = options.find((option) => keyOf(option.value) === selectedKey);

  const rows = useMemo<Option[]>(() => {
    if (!open) return [];
    const needle = query.trim().toLowerCase();
    // Insertion order groups rows in a single pass without repeatedly searching group indices.
    const groups = new Map<string, SelectOption<V>[]>();
    for (const option of options) {
      if (needle && !`${textOf(option as SelectOption<unknown>)} ${option.group ?? ""}`.toLowerCase().includes(needle)) continue;
      const group = option.group ?? "";
      const items = groups.get(group) ?? [];
      items.push(option);
      groups.set(group, items);
    }
    return [...groups.values()].flatMap((group) => group.map((option) => {
      const key = keyOf(option.value);
      return {
        value: key, label: option.label, disabled: option.disabled, icon: option.icon,
        avatar: option.avatar, description: option.description, group: option.group,
        content: p.renderOption?.(option, { selected: key === selectedKey }),
      };
    }));
  }, [open, query, options, keyOf, selectedKey, p.renderOption]);

  const choose = (key: string) => {
    const option = options.find((item) => keyOf(item.value) === key);
    if (!option) return;
    setValue(option.value);
    setOpen(false);
    setQuery("");
    anchor.current?.focus();
  };

  const shownValue: ReactNode = selected
    ? (p.renderValue?.(selected) ?? (
        <span className="ad-select-value">
          {selected.avatar && <Avatar size="xs" name={selected.avatar.name} src={selected.avatar.src} />}
          {selected.icon && <Icon name={selected.icon} />}
          <span className="ad-select-value-text">{selected.label}</span>
        </span>
      ))
    : (p.placeholder ?? tr("Выберите значение"));

  return (
    <FieldFrame
      ids={ids}
      className={`ad-select-shell ${p.className ?? ""}`}
      label={floating ? undefined : p.label}
      required={p.required}
      description={p.description}
      error={p.error}
    >
      <InputBase
        ref={box}
        size={p.size}
        variant={p.variant}
        labelId={ids.label}
        label={floating ? fieldLabel(p.label, p.required) : undefined}
        filled={!!selected}
        disabled={p.disabled}
        error={!!p.error}
        startAdornment={p.startAdornment ?? (p.icon ? <Icon name={p.icon} /> : undefined)}
        endAdornment={
          <>
            {p.endAdornment}
            <Icon name="chevron" className="ad-select-chevron" />
          </>
        }
      >
        <button
          ref={(n) => {
            anchor.current = n;
            assignRef(p.ref, n);
          }}
          type="button"
          id={`${ids.label}control`}
          // The name reads as "label, chosen value", like a native select.
          aria-labelledby={p.label ? `${ids.label} ${ids.label}control` : undefined}
          aria-describedby={ids.aria["aria-describedby"]}
          className="ad-input-control ad-select-control"
          disabled={p.disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={p.required || undefined}
          data-placeholder={!selected || undefined}
          onClick={() => setOpen((v) => !v)}
        >
          {shownValue}
        </button>
      </InputBase>
      {p.name && <input type="hidden" name={p.name} value={selected ? (selected.text ?? selectedKey ?? "") : ""} />}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            anchor.current?.focus();
          }
        }}
        anchorRef={box}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover"
        label={typeof p.label === "string" ? p.label : tr("Варианты")}
        autoFocus={!p.searchable}
      >
        {p.searchable && (
          <label className="ad-option-search">
            <Icon name="search" />
            <input
              autoFocus
              value={query}
              placeholder={p.searchPlaceholder ?? tr("Поиск")}
              aria-label={p.searchPlaceholder ?? tr("Поиск")}
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && rows[0] && !rows[0].disabled) {
                  event.preventDefault();
                  choose(rows[0].value);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  event.currentTarget.closest(".ad-option-popover")?.querySelector<HTMLButtonElement>(".ad-option:not(:disabled)")?.focus();
                }
              }}
            />
          </label>
        )}
        {rows.length ? (
          <OptionList options={rows} selected={selectedKey} onChoose={choose} />
        ) : (
          <div className="ad-option-empty">{tr("Ничего не найдено")}</div>
        )}
      </Popover>
    </FieldFrame>
  );
}
