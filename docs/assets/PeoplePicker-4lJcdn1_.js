const e=`import { tr, useTr } from "../../../core/i18n";
import { useEffect, useRef, useState } from "react";
import { useControllable, type CommonProps } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Avatar } from "../../layout/Avatar/Avatar";
import { Icon } from "../../layout/Icon/Icon";
import { Chip } from "../Chip/Chip";
import { ChipField } from "../ChipField";
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
  /** Search elsewhere (a server) instead: called as the user types, results replace \`people\`. */
  onSearch?: (query: string) => Promise<PickerPerson[]> | PickerPerson[];
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
  const limit = single ? 1 : max;
  const full = limit !== undefined && chosen.length >= limit;

  // Asynchronous search: debounced, and a late answer to an older query is ignored.
  useEffect(() => {
    if (!onSearch) return;
    if (!query.trim()) {
      setFound(null);
      setSearchError(undefined);
      return;
    }
    let current = true;
    setLoading(true);
    setSearchError(undefined);
    const timer = setTimeout(async () => {
      try {
        const result = await onSearch(query.trim());
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
    };
  }, [query, onSearch]);

  const needle = query.trim().toLowerCase();
  const pool = onSearch ? (found ?? []) : people;
  const options = pool
    .filter((person) => !chosen.some((c) => c.id === person.id))
    .filter((person) => onSearch || !needle || \`\${person.name} \${person.description ?? ""}\`.toLowerCase().includes(needle))
    .slice(0, 50);

  const pick = (person: PickerPerson) => {
    setChosen(single ? [person] : [...chosen, person]);
    setQuery("");
    setActive(0);
    if (single || (limit !== undefined && chosen.length + 1 >= limit)) setOpen(false);
  };

  return (
    <div className={\`ad-people-picker \${p.className ?? ""}\`} style={p.style} id={p.id}>
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
        inputProps={{ disabled: p.disabled || full, role: "combobox", "aria-expanded": open, "aria-autocomplete": "list" }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive((i) => (i + (event.key === "ArrowDown" ? 1 : -1) + options.length) % Math.max(1, options.length));
          } else if (event.key === "Enter" && open && options[active]) {
            event.preventDefault();
            pick(options[active]!);
          } else if (event.key === "Escape") {
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
      <Popover open={open && !full} onOpenChange={setOpen} anchorRef={box} role="listbox" align="start" matchAnchorWidth autoFocus={false}
        className="ad-option-popover" label={tr("Люди")}>
        <div className="ad-option-list">
          {loading && <div className="ad-option-empty"><span className="ad-spinner" aria-hidden /> {tr("Ищем…")}</div>}
          {!loading && (searchError || options.length === 0) && (
            <div className="ad-option-empty">{searchError ?? (onSearch && !needle ? tr("Начните вводить имя") : tr("Никого не нашли"))}</div>
          )}
          {!loading && !searchError &&
            options.map((person, index) => (
              <button key={person.id} type="button" role="option" className="ad-option" aria-selected={false}
                data-active={index === active || undefined} onPointerMove={() => setActive(index)}
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
`;export{e as default};
