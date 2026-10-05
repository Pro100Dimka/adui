const e=`import { tr } from "../../../core/i18n";
import { useState } from "react";
import { useControllable, type CommonProps } from "../../../core/base";
import { Chip } from "../Chip/Chip";
import { ChipField } from "../ChipField";
import { Icon } from "../../layout/Icon/Icon";
import type { InputVariant } from "../shared";

export interface TagInputProps extends CommonProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  /** Offered while typing; a click or Enter adds one. */
  suggestions?: string[];
  /** The most tags allowed. */
  max?: number;
  /** Checks a new tag; a returned message refuses it and is shown under the field. */
  validate?: (tag: string) => string | undefined;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: InputVariant;
  labelPlacement?: "top" | "floating";
}

/** Tags typed into a field: Enter, comma or a pasted list adds them, Backspace takes the last one back. */
export function TagInput({
  value: controlled,
  defaultValue = [],
  onValueChange,
  suggestions = [],
  max,
  validate,
  icon,
  placeholder = tr("Добавьте тег и нажмите Enter"),
  ...p
}: TagInputProps) {
  const [tags, setTags] = useControllable(controlled, defaultValue, onValueChange);
  const [query, setQuery] = useState("");
  const [refusal, setRefusal] = useState<string>();
  const full = max !== undefined && tags.length >= max;

  const add = (raw: string) => {
    const fresh = raw
      .split(/[,\\n;]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
    if (!fresh.length) return setQuery("");
    const problem = fresh.map((tag) => validate?.(tag)).find(Boolean);
    if (problem) return setRefusal(problem);
    setTags([...tags, ...fresh].slice(0, max ?? Infinity));
    setRefusal(undefined);
    setQuery("");
  };
  const offered = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()) && !tags.includes(s)).slice(0, 6)
    : [];

  return (
    <div className={\`ad-tag-input \${p.className ?? ""}\`} style={p.style} id={p.id}>
      <ChipField
        className=""
        label={p.label}
        description={p.description}
        error={refusal ?? p.error}
        required={p.required}
        disabled={p.disabled}
        size={p.size}
        variant={p.variant}
        labelPlacement={p.labelPlacement}
        startAdornment={icon ? <Icon name={icon} /> : undefined}
        placeholder={full ? undefined : placeholder}
        query={query}
        onQueryChange={(next) => {
          setRefusal(undefined);
          if (/[,;]/.test(next)) add(next);
          else setQuery(next);
        }}
        inputProps={{ disabled: p.disabled || full, onPaste: (event) => {
          const text = event.clipboardData.getData("text");
          if (/[,;\\n]/.test(text)) {
            event.preventDefault();
            add(text);
          }
        } }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(offered[0] && !query.includes(" ") && offered[0].toLowerCase().startsWith(query.toLowerCase()) ? offered[0] : query);
          } else if (event.key === "Backspace" && !query && tags.length) {
            setTags(tags.slice(0, -1));
          }
        }}
        chips={tags.map((tag) => (
          <Chip key={tag} label={tag} disabled={p.disabled} onRemove={() => setTags(tags.filter((t) => t !== tag))} />
        ))}
      />
      {offered.length > 0 && (
        <div className="ad-tag-input-suggestions" role="listbox" aria-label={tr("Подсказки")}>
          {offered.map((tag) => (
            <Chip key={tag} label={tag} icon="plus" onClick={() => add(tag)} />
          ))}
        </div>
      )}
    </div>
  );
}
`;export{e as default};
