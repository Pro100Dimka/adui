import React, { useRef, useState } from "react";
import { assignRef, define, useControllable } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { Button } from "../Button/Button";
import { InputBase } from "../InputBase/InputBase";
import { Popover } from "../../feedback/Popover/Popover";
import type { SelectProps } from "../shared";

export const Select = define<SelectProps>("Select", (p) => {
  const options = p.options ?? ["Первый вариант", "Второй вариант"];
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  const first = normalized[0]?.value ?? "";
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? first,
    p.onValueChange,
  );
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const selected = normalized.find((option) => option.value === value);
  const choose = (next: string) => {
    setValue(next);
    setOpen(false);
    anchor.current?.focus();
  };
  return (
    <label className={`ad-select-shell ${p.className ?? ""}`}>
      {p.label && (
        <span className="ad-field-label">
          {p.label}
          {p.required ? " *" : ""}
        </span>
      )}
      <InputBase
        size={p.size}
        disabled={p.disabled}
        error={!!p.error}
        startAdornment={
          p.startAdornment ?? (p.icon ? <Icon name={p.icon} /> : undefined)
        }
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
          className="ad-input-control ad-select-control"
          disabled={p.disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          aria-required={p.required || undefined}
        >
          {selected?.label ?? p.placeholder ?? "Выберите значение"}
        </button>
      </InputBase>
      {p.name && <input type="hidden" name={p.name} value={value} />}
      {(p.description || p.error) && (
        <small className={p.error ? "ad-field-error" : ""}>
          {p.error || p.description}
        </small>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover"
        label={typeof p.label === "string" ? p.label : "Варианты"}
      >
        <div className="ad-option-list">
          {normalized.map((option) => (
            <Button
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              variant="ghost"
              disabled={option.disabled}
              className="ad-option"
              onClick={() => choose(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Popover>
    </label>
  );
});
