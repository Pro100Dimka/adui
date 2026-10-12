import { useTr } from "../../../core/i18n";
import { forwardRef, useEffect, useMemo, useRef, useState, type ForwardedRef, type ReactElement, type ReactNode } from "react";
import { assignRef, mark, useControllable } from "../../../core/base";
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
export const Select = /* @__PURE__ */ forwardRef(function Select<V = string>(p: SelectProps<V>, ref: ForwardedRef<HTMLButtonElement>) {
  const tr = useTr();
  const floating = p.labelPlacement === "floating" && !!p.label;
  const keyOf = (p.getKey ?? defaultKey) as (value: V) => string;
  const options = useMemo<SelectOption<V>[]>(
    () =>
      (p.options ?? ["Первый вариант", "Второй вариант"].map((label) => ({ value: label as V, label: tr(label) }))).map((option) =>
        typeof option === "object" && option !== null && "value" in (option as object)
          ? (option as SelectOption<V>)
          : { value: option as V, label: String(option) },
      ),
    [p.options, tr],
  );
  const [value, setValue] = useControllable<V | undefined>(
    p.value,
    p.defaultValue ?? (p.placeholder ? undefined : options.find((option) => !option.disabled)?.value),
    p.onValueChange as ((value: V | undefined) => void) | undefined,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { if (p.disabled) { setOpen(false); setQuery(""); } }, [p.disabled]);
  const anchor = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const keyedOptions = useMemo(() => options.map((option) => ({ option, key: keyOf(option.value) })), [options, keyOf]);
  const selectedKey = value === undefined ? undefined : keyOf(value);
  const selected = keyedOptions.find(({ key }) => key === selectedKey)?.option;
  const error = p.error || (invalid && p.required && !selected ? tr("Выберите значение") : undefined);
  const ids = useFieldIds(p.label, error || p.description, p.id, p);

  const rows = useMemo<Option[]>(() => {
    if (!open) return [];
    const needle = query.trim().toLowerCase();
    // Insertion order groups rows in a single pass without repeatedly searching group indices.
    const groups = new Map<string, typeof keyedOptions>();
    for (const entry of keyedOptions) {
      const { option } = entry;
      if (needle && !`${textOf(option as SelectOption<unknown>)} ${option.group ?? ""}`.toLowerCase().includes(needle)) continue;
      const group = option.group ?? "";
      const items = groups.get(group) ?? [];
      items.push(entry);
      groups.set(group, items);
    }
    return [...groups.values()].flatMap((group) => group.map(({ option, key }) => {
      return {
        value: key, label: option.label, disabled: option.disabled, icon: option.icon,
        avatar: option.avatar, description: option.description, group: option.group,
        content: p.renderOption?.(option, { selected: key === selectedKey }),
      };
    }));
  }, [open, query, keyedOptions, selectedKey, p.renderOption]);

  const choose = (key: string) => {
    const option = keyedOptions.find((item) => item.key === key)?.option;
    if (!option) return;
    setValue(option.value);
    setOpen(false);
    setQuery("");
    anchor.current?.focus();
  };

  const shownValue: ReactNode = selected
    ? (p.renderValue?.(selected) ?? (
        <>
          {selected.avatar && <Avatar size="xs" name={selected.avatar.name} src={selected.avatar.src} />}
          {selected.icon && <Icon name={selected.icon} />}
          <span className="ad-select-value-text">{selected.label}</span>
        </>
      ))
    : (p.placeholder ?? tr("Выберите значение"));

  return (
    <FieldFrame
      ids={ids}
      style={p.style}
      className={`ad-select-shell ${p.className ?? ""}`}
      label={floating ? undefined : p.label}
      required={p.required}
      description={p.description}
      error={error}
    >
      <InputBase
        ref={box}
        size={p.size}
        variant={p.variant}
        labelId={ids.label}
        label={floating ? fieldLabel(p.label, p.required) : undefined}
        filled={!!selected}
        disabled={p.disabled}
        error={!!error}
        startAdornment={p.startAdornment ?? (p.icon ? <Icon name={p.icon} /> : undefined)}
        endAdornment={
          <>
            {p.endAdornment}
            <Icon name="chevron" className="ad-select-chevron" />
          </>
        }
      >
        <button
          {...mark("Select", { ...p, style: undefined })}
          {...ids.aria}
          ref={(n) => {
            anchor.current = n;
            assignRef(ref, n);
          }}
          type="button"
          id={ids.control}
          // The name reads as "label, chosen value", like a native select.
          aria-labelledby={ids.valueLabelledBy}
          className="ad-input-control ad-select-control"
          disabled={p.disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={p.required || undefined}
          aria-invalid={!!error || undefined}
          data-placeholder={!selected || undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="ad-select-value" id={ids.value}>{shownValue}</span>
        </button>
      </InputBase>
      {p.name && <input type="hidden" name={p.name} disabled={p.disabled} value={selected ? (selected.text ?? selectedKey ?? "") : ""} />}
      {p.required && <select hidden required disabled={p.disabled} tabIndex={-1} aria-hidden="true"
        value={selected ? selectedKey : ""} onChange={(event) => choose(event.currentTarget.value)}
        onInvalid={(event) => { event.preventDefault(); setInvalid(true); anchor.current?.focus(); }}>
        <option value="" />
        {keyedOptions.map(({ option, key }) => <option key={key} value={key} disabled={option.disabled}>{textOf(option)}</option>)}
      </select>}
      <Popover
        open={open && !p.disabled}
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
}) as <V = string>(p: SelectProps<V>) => ReactElement;
