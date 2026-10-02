import { useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { FieldFrame, OptionList, toOption } from "../internal";
import { IconButton } from "../IconButton/IconButton";
import { InputBase } from "../InputBase/InputBase";
import type { AutocompleteProps } from "../shared";

export const Autocomplete = ({
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
  className,
  size,
  variant,
  tone: _tone,
  material: _material,
  style: _style,
  children: _children,
  ...input
}: AutocompleteProps) => {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputNode = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const all = options.map(toOption);
  // A value that already names an option shows the whole list, like a reopened select.
  const query = all.some((o) => o.label === current)
    ? ""
    : current.trim().toLocaleLowerCase();
  const filtered = all.filter(
    (o) =>
      !query ||
      o.label.toLocaleLowerCase().includes(query) ||
      o.value.toLocaleLowerCase().includes(query),
  );
  const listId = `${input.id ?? "ad-autocomplete"}-listbox`;
  const choose = (next: string) => {
    setCurrent(next);
    onOptionSelect?.(next);
    setOpen(false);
    inputNode.current?.focus();
  };
  return (
    <FieldFrame
      className={`ad-autocomplete-shell ${className ?? ""}`}
      label={label}
      required={input.required}
      description={description}
      error={error}
    >
      <InputBase
        ref={box}
        size={size}
        variant={variant}
        disabled={input.disabled}
        readOnly={input.readOnly}
        error={!!error}
        startAdornment={startAdornment}
        endAdornment={
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
                inputNode.current?.focus();
              }}
            />
          </>
        }
      >
        <input
          {...input}
          className="ad-autocomplete-input"
          ref={(n) => {
            inputNode.current = n;
            assignRef(inputRef, n);
          }}
          value={current}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
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
      <Popover
        open={open && filtered.length > 0}
        onOpenChange={setOpen}
        anchorRef={box}
        autoFocus={false}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover ad-autocomplete-popover"
        label={typeof label === "string" ? label : "Подсказки"}
      >
        <OptionList
          id={listId}
          options={filtered}
          selected={current}
          active={active}
          onChoose={choose}
          onHover={setActive}
        />
      </Popover>
    </FieldFrame>
  );
};
