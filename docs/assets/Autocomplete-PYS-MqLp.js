const e=`import { useTr } from "../../../core/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { assignRef, useControllable } from "../../../core/base";
import { Popover } from "../../feedback/Popover/Popover";
import { FieldFrame, fieldLabel, useFieldIds, useActiveOption, OptionList, toOption } from "../internal";
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
  style,
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
  const ids = useFieldIds(label, description || error, input.id, input);
  const locked = !!(input.disabled || input.readOnly);
  useEffect(() => { if (locked) setOpen(false); }, [locked]);
  const all = useMemo(() => options.map(toOption), [options]);
  const filtered = useMemo(() => {
    // A value that already names an option shows the whole list, like a reopened select.
    const query = all.some((o) => o.value === current || o.label === current) ? "" : current.trim().toLocaleLowerCase();
    return all.filter((o) => !query || String(o.label).toLocaleLowerCase().includes(query) || o.value.toLocaleLowerCase().includes(query));
  }, [all, current]);
  const listId = \`\${input.id ?? ids.label}-listbox\`;
  const visible = open && !locked && filtered.length > 0;
  const activeIndex = Math.max(0, Math.min(active, filtered.length - 1));
  useActiveOption(listId, activeIndex, visible);
  const choose = (next: string) => {
    if (locked) return;
    setCurrent(next);
    onOptionSelect?.(next);
    setOpen(false);
    inputNode.current?.focus();
  };
  const floating = labelPlacement === "floating" && !!label;
  return (
    <FieldFrame
      ids={ids}
      style={style}
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
              aria-expanded={visible}
              onClick={() => {
                inputNode.current?.focus();
                setOpen(!visible);
              }}
            />
          </>
        }
      >
        <input
          {...ids.aria}
          {...input}
          id={ids.control}
          className="ad-autocomplete-input"
          ref={(n) => {
            inputNode.current = n;
            assignRef(inputRef, n);
          }}
          value={current}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={visible ? listId : undefined}
          aria-activedescendant={visible ? \`\${listId}-option-\${activeIndex}\` : undefined}
          aria-invalid={!!error || input["aria-invalid"]}
          onFocus={(event) => {
            input.onFocus?.(event);
            if (!locked && !event?.defaultPrevented) setOpen(true);
          }}
          onChange={(e) => {
            setCurrent(e.currentTarget.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            input.onKeyDown?.(e);
            if (locked || e.defaultPrevented || e.nativeEvent?.isComposing) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive(visible ? Math.min(filtered.length - 1, activeIndex + 1) : 0);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive(visible ? Math.max(0, activeIndex - 1) : Math.max(0, filtered.length - 1));
            } else if (e.key === "Enter" && visible && filtered[activeIndex]) {
              e.preventDefault();
              choose(filtered[activeIndex].value);
            } else if (e.key === "Escape" || e.key === "Tab") {
              if (e.key === "Escape" && visible) e.preventDefault();
              setOpen(false);
            }
          }}
        />
      </InputBase>
      <Popover
        id={listId}
        open={visible}
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
          active={activeIndex}
          onChoose={choose}
          onHover={setActive}
        />
      </Popover>
    </FieldFrame>
  );
};
`;export{e as default};
