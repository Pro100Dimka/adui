const e=`import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { FieldFrame, fieldLabel, useFieldIds } from "./internal";
import { InputBase } from "./InputBase/InputBase";
import type { InputVariant } from "./shared";
import type { Size } from "../../core/base";

/** A field whose value is a row of chips followed by a text input (tags, people). */
export function ChipField({
  className,
  label,
  description,
  error,
  required,
  disabled,
  size,
  variant,
  labelPlacement,
  chips,
  query,
  placeholder,
  startAdornment,
  boxRef,
  onQueryChange,
  onKeyDown,
  onFocus,
  onBlur,
  inputProps,
}: {
  className: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: Size;
  variant?: InputVariant;
  labelPlacement?: "top" | "floating";
  chips: ReactNode;
  query: string;
  placeholder?: string;
  startAdornment?: ReactNode;
  boxRef?: React.Ref<HTMLDivElement>;
  onQueryChange: (query: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const ids = useFieldIds(label, description || error);
  const input = useRef<HTMLInputElement>(null);
  const floating = labelPlacement === "floating" && !!label;
  const hasChips = Array.isArray(chips) ? chips.length > 0 : !!chips;
  return (
    <FieldFrame ids={ids} className={\`ad-chip-field \${className}\`} label={floating ? undefined : label} required={required} description={description} error={error}>
      <InputBase
        ref={boxRef}
        size={size}
        variant={variant}
        labelId={ids.label}
        label={floating ? fieldLabel(label, required) : undefined}
        filled={hasChips || !!query}
        disabled={disabled}
        error={!!error}
        multiline
        startAdornment={startAdornment}
        onClick={() => input.current?.focus()}
      >
        <span className="ad-chip-field-items">
          {chips}
          <input
            {...inputProps}
            ref={input}
            className="ad-chip-field-input"
            value={query}
            placeholder={hasChips ? undefined : placeholder}
            disabled={disabled}
            aria-labelledby={ids.aria["aria-labelledby"]}
            aria-describedby={ids.aria["aria-describedby"]}
            aria-invalid={!!error || undefined}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </span>
      </InputBase>
    </FieldFrame>
  );
}
`;export{e as default};
