import { useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { Button } from "../Button/Button";
import { FieldFrame, toOption } from "../internal";
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
  const query = current.trim().toLocaleLowerCase();
  const filtered = options
    .map(toOption)
    .filter(
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
        size={size}
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
        anchorRef={inputNode}
        role="listbox"
        align="start"
        matchAnchorWidth
        className="ad-option-popover ad-autocomplete-popover"
        label={typeof label === "string" ? label : "Подсказки"}
      >
        <div id={listId} className="ad-option-list">
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
    </FieldFrame>
  );
};
