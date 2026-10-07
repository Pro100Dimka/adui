const n=`import { useTr } from "../../../core/i18n";
import { useMemo, useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { FieldFrame, fieldLabel, useFieldIds, OptionList, toOption } from "../internal";
import { IconButton } from "../IconButton/IconButton";
import { InputBase } from "../InputBase/InputBase";
import type { AutocompleteProps } from "../shared";

const defaultOptions = ["WASAPI Shared", "WASAPI Exclusive", "ASIO"];

export const Autocomplete = ({
  options = defaultOptions,
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
  labelPlacement = "top",
  tone: _tone,
  material: _material,
  style: _style,
  children: _children,
  ...input
}: AutocompleteProps) => {
  const tr = useTr();
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputNode = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => {
    const all = options.map(toOption);
    // A value that already names an option shows the whole list, like a reopened select.
    const query = all.some((o) => o.label === current) ? "" : current.trim().toLocaleLowerCase();
    return all.filter((o) => !query || String(o.label).toLocaleLowerCase().includes(query) || o.value.toLocaleLowerCase().includes(query));
  }, [options, current]);
  const listId = \`\${input.id ?? "ad-autocomplete"}-listbox\`;
  const choose = (next: string) => {
    setCurrent(next);
    onOptionSelect?.(next);
    setOpen(false);
    inputNode.current?.focus();
  };
  const ids = useFieldIds(label, description || error);
  const floating = labelPlacement === "floating" && !!label;
  return (
    <FieldFrame
      ids={ids}
      className={\`ad-autocomplete-shell \${className ?? ""}\`}
      label={floating ? undefined : label}
      required={input.required}
      description={description}
      error={error}
    >
      <InputBase
        ref={box}
        size={size}
        variant={variant}
        labelId={ids.label}
        label={floating ? fieldLabel(label, input.required) : undefined}
        filled={!!current}
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
                label={tr("Очистить")}
                disabled={input.disabled || input.readOnly}
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
              label={tr("Показать варианты")}
              disabled={input.disabled || input.readOnly}
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
          {...ids.aria}
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
        label={typeof label === "string" ? label : tr("Подсказки")}
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
`;export{n as default};
