import React, { useMemo, useRef, useState } from "react";
import { assignRef, define, useControllable } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { InputBase } from "../InputBase/InputBase";
import { Popover } from "../../feedback/Popover/Popover";
import type { AutocompleteProps } from "../shared";

export const Autocomplete = define<AutocompleteProps>("Autocomplete", (p) => {
  const {
    options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO"],
    onOptionSelect,
    value,
    defaultValue = "",
    onValueChange,
    label,
    description,
    error,
    startAdornment,
    endAdornment,
    clearable,
    inputRef,
    ...input
  } = p;
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const localInputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const q = current.trim().toLocaleLowerCase();
    return q
      ? normalized.filter(
          (o) =>
            o.label.toLocaleLowerCase().includes(q) ||
            o.value.toLocaleLowerCase().includes(q),
        )
      : normalized;
  }, [current, options]);
  const choose = (next: string) => {
    setCurrent(next);
    onOptionSelect?.(next);
    setOpen(false);
    localInputRef.current?.focus();
  };
  const suffix = (
    <>
      {clearable && current && (
        <IconButton
          size="xs"
          variant="ghost"
          icon="close"
          label="Очистить"
          onClick={() => {
            setCurrent("");
            setOpen(true);
          }}
        />
      )}
      {endAdornment}
      <IconButton
        size="xs"
        variant="ghost"
        icon="chevron"
        label="Показать варианты"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          localInputRef.current?.focus();
        }}
      />
    </>
  );
  return (
    <label className={`ad-autocomplete-shell ${p.className ?? ""}`}>
      {label && (
        <span className="ad-field-label">
          {label}
          {p.required ? " *" : ""}
        </span>
      )}
      <InputBase
        size={p.size}
        disabled={p.disabled}
        readOnly={p.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={suffix}
      >
        <input
          {...input}
          className="ad-autocomplete-input"
          style={undefined}
          ref={(n) => {
            localInputRef.current = n;
            assignRef(inputRef, n);
          }}
          value={current}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={
            open ? `${p.id ?? "ad-autocomplete"}-listbox` : undefined
          }
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setCurrent(e.currentTarget.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(filtered.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && open && filtered[active]) {
              e.preventDefault();
              choose(filtered[active].value);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
      </InputBase>
      {(description || error) && (
        <small className={error ? "ad-field-error" : ""}>
          {error || description}
        </small>
      )}
      <Popover
        open={open && filtered.length > 0}
        onOpenChange={setOpen}
        anchorRef={localInputRef}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover ad-autocomplete-popover"
        label={typeof label === "string" ? label : "Подсказки"}
      >
        <div
          id={`${p.id ?? "ad-autocomplete"}-listbox`}
          className="ad-option-list"
        >
          {filtered.map((option, index) => (
            <Button
              key={option.value}
              role="option"
              aria-selected={index === active}
              variant="ghost"
              className="ad-option"
              onPointerMove={() => setActive(index)}
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
