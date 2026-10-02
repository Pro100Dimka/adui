import { useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Icon } from "../../layout/Icon/Icon";
import { Button } from "../Button/Button";
import { FieldFrame, toOption } from "../internal";
import { InputBase } from "../InputBase/InputBase";
import type { SelectProps } from "../shared";

export const Select = (p: SelectProps) => {
  const options = (p.options ?? ["Первый вариант", "Второй вариант"]).map(
    toOption,
  );
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? options[0]?.value ?? "",
    p.onValueChange,
  );
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);
  const choose = (next: string) => {
    setValue(next);
    setOpen(false);
    anchor.current?.focus();
  };
  return (
    <FieldFrame
      className={`ad-select-shell ${p.className ?? ""}`}
      label={p.label}
      required={p.required}
      description={p.description}
      error={p.error}
    >
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
          aria-required={p.required || undefined}
          onClick={() => setOpen((v) => !v)}
        >
          {selected?.label ?? p.placeholder ?? "Выберите значение"}
        </button>
      </InputBase>
      {p.name && <input type="hidden" name={p.name} value={value} />}
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
          {options.map((option) => (
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
    </FieldFrame>
  );
};
