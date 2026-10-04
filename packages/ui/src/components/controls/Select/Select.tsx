import { useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Icon } from "../../layout/Icon/Icon";
import { FieldFrame, fieldLabel, useFieldIds, OptionList, toOption } from "../internal";
import { InputBase } from "../InputBase/InputBase";
import type { SelectProps } from "../shared";

export function Select<V extends string = string>(p: SelectProps<V>) {
  const ids = useFieldIds(p.label, p.description || p.error);
  const floating = p.labelPlacement === "floating" && !!p.label;
  const options = (p.options ?? ["Первый вариант", "Второй вариант"]).map(
    toOption,
  );
  const [value, setValue] = useControllable<string>(
    p.value,
    p.defaultValue ?? (p.placeholder ? "" : (options[0]?.value ?? "")),
    p.onValueChange as ((value: string) => void) | undefined,
  );
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const choose = (next: string) => {
    setValue(next);
    setOpen(false);
    anchor.current?.focus();
  };
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
          {selected?.label ?? p.placeholder ?? "Выберите значение"}
        </button>
      </InputBase>
      {p.name && <input type="hidden" name={p.name} value={value} />}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) anchor.current?.focus();
        }}
        anchorRef={box}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover"
        label={typeof p.label === "string" ? p.label : "Варианты"}
      >
        <OptionList options={options} selected={value} onChoose={choose} />
      </Popover>
    </FieldFrame>
  );
}
