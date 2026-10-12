import { useTr } from "../../../core/i18n";
import { useEffect, useId, useRef, useState } from "react";
import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Avatar } from "../../layout/Avatar/Avatar";
import { Icon } from "../../layout/Icon/Icon";
import { Chip } from "../Chip/Chip";
import { ChipField } from "../ChipField";
import { useActiveOption } from "../internal";
import type { InputVariant } from "../shared";

export interface PickerPerson {
  id: string;
  name: string;
  /** Photo; initials are shown without it. */
  src?: string;
  /** A second line: role, e-mail, status. */
  description?: string;
  presence?: "online" | "busy" | "offline";
}

export interface PeoplePickerProps extends CommonProps {
  /** Everyone who can be picked; filtered by name and description while typing. */
  people?: PickerPerson[];
  /** Search elsewhere; the optional signal cancels superseded or unmounted requests. */
  onSearch?: (query: string, signal?: AbortSignal) => Promise<PickerPerson[]> | PickerPerson[];
  value?: PickerPerson[];
  defaultValue?: PickerPerson[];
  onValueChange?: (people: PickerPerson[]) => void;
  /** Pick one person instead of several. */
  single?: boolean;
  /** The most people allowed. */
  max?: number;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: InputVariant;
  labelPlacement?: "top" | "floating";
}

const searchDelay = 220;

/**
 * Picking people: type a name, choose from the list with avatars, presence and roles; chosen
 * people become chips. Works on a given list or with an asynchronous search.
 */
export function PeoplePicker({
  people = [],
  onSearch,
  value: controlled,
  defaultValue = [],
  onValueChange,
  single = false,
  max,
  placeholder,
  ...p
}: PeoplePickerProps) {
  const tr = useTr();
  const [chosen, setChosen] = useControllable(controlled, defaultValue, onValueChange);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [found, setFound] = useState<PickerPerson[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  const box = useRef<HTMLDivElement>(null);
  const listId = `${useId()}-people`;
  const search = useRef(onSearch);
  search.current = onSearch;
  const remote = !!onSearch;
  const needle = query.trim().toLowerCase();
  const limit = single ? 1 : max;
  const full = limit !== undefined && chosen.length >= limit;
  const visible = open && !full && !p.disabled;
  useEffect(() => { if (p.disabled) setOpen(false); }, [p.disabled]);

  // Asynchronous search: debounced, and a late answer to an older query is ignored.
  useEffect(() => {
    if (!remote || !query.trim()) {
      setFound(null);
      setSearchError(undefined);
      setLoading(false);
      return;
    }
    let current = true;
    const controller = new AbortController();
    setLoading(true);
    setSearchError(undefined);
    const timer = setTimeout(async () => {
      try {
        const load = search.current;
        if (!load) return;
        const result = await load(query.trim(), controller.signal);
        if (current) setFound(result);
      } catch (error) {
        if (current) {
          setFound([]);
          setSearchError(error instanceof Error ? error.message : tr("Не удалось выполнить поиск"));
        }
      } finally {
        if (current) setLoading(false);
      }
    }, searchDelay);
    return () => {
      current = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, remote]);

  const pool = onSearch ? (found ?? []) : people;
  const options = pool
    .filter((person) => !chosen.some((c) => c.id === person.id))
    .filter((person) => onSearch || !needle || `${person.name} ${person.description ?? ""}`.toLowerCase().includes(needle))
    .slice(0, 50);
  const activeIndex = Math.max(0, Math.min(active, options.length - 1));
  useActiveOption(listId, activeIndex, visible && !loading && !searchError);

  const pick = (person: PickerPerson) => {
    if (p.disabled || full || loading) return;
    setChosen(single ? [person] : [...chosen, person]);
    setQuery("");
    setActive(0);
    if (single || (limit !== undefined && chosen.length + 1 >= limit)) setOpen(false);
  };

  return (
    <div {...mark("PeoplePicker", p)}>
      <ChipField
        className=""
        boxRef={box}
        label={p.label}
        description={p.description}
        error={p.error}
        required={p.required}
        disabled={p.disabled}
        size={p.size}
        variant={p.variant}
        labelPlacement={p.labelPlacement}
        startAdornment={<Icon name="users" />}
        placeholder={full ? undefined : placeholder ?? tr("Начните вводить имя")}
        query={query}
        onQueryChange={(next) => {
          setQuery(next);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => !full && setOpen(true)}
        inputProps={{ disabled: p.disabled || full, role: "combobox", "aria-expanded": visible, "aria-autocomplete": "list",
          "aria-label": p["aria-label"], "aria-labelledby": p["aria-labelledby"], "aria-describedby": p["aria-describedby"],
          "aria-controls": visible ? listId : undefined,
          "aria-activedescendant": visible && !loading && !searchError && options[activeIndex] ? `${listId}-option-${activeIndex}` : undefined }}
        onKeyDown={(event) => {
          if (p.disabled || full || event.nativeEvent?.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive(visible ? (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % Math.max(1, options.length) : event.key === "ArrowDown" ? 0 : Math.max(0, options.length - 1));
          } else if (event.key === "Enter" && visible && options[activeIndex] && !loading && !searchError) {
            event.preventDefault();
            pick(options[activeIndex]);
          } else if (event.key === "Escape" || event.key === "Tab") {
            if (event.key === "Escape" && visible) event.preventDefault();
            setOpen(false);
          } else if (event.key === "Backspace" && !query && chosen.length) {
            setChosen(chosen.slice(0, -1));
          }
        }}
        chips={chosen.map((person) => (
          <Chip key={person.id} label={person.name} avatar={{ name: person.name, src: person.src }} disabled={p.disabled}
            onRemove={() => setChosen(chosen.filter((c) => c.id !== person.id))} />
        ))}
      />
      <Popover id={listId} open={visible} onOpenChange={setOpen} anchorRef={box} role="listbox" align="start" matchAnchorWidth autoFocus={false}
        className="ad-option-popover" label={tr("Люди")}>
        <div className="ad-option-list">
          {loading && <div className="ad-option-empty"><span className="ad-spinner" aria-hidden /> {tr("Ищем…")}</div>}
          {!loading && (searchError || options.length === 0) && (
            <div className="ad-option-empty">{searchError ?? (onSearch && !needle ? tr("Начните вводить имя") : tr("Никого не нашли"))}</div>
          )}
          {!loading && !searchError &&
            options.map((person, index) => (
              <button key={person.id} id={`${listId}-option-${index}`} type="button" role="option" tabIndex={-1} className="ad-option" aria-selected={false}
                data-active={index === activeIndex || undefined} onPointerMove={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()} onClick={() => pick(person)}>
                <Avatar size="sm" name={person.name} src={person.src} presence={person.presence} />
                <span className="ad-option-text">
                  <span className="ad-option-label">{person.name}</span>
                  {person.description && <span className="ad-option-description">{person.description}</span>}
                </span>
              </button>
            ))}
        </div>
      </Popover>
    </div>
  );
}
