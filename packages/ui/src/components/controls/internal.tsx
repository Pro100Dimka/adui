import type { ReactNode } from "react";
import type { Material, Variant } from "../../core/base";
import { Icon } from "../layout/Icon/Icon";

export const variantMaterial: Record<Variant, Material> = {
  primary: "ruby",
  secondary: "glass",
  danger: "danger",
  ghost: "ghost",
};

type Option = { value: string; label: string; disabled?: boolean };
export const toOption = (option: string | Option): Option =>
  typeof option === "string" ? { value: option, label: option } : option;

/** Field label with the required mark, used above the field or floating inside it. */
export const fieldLabel = (label: ReactNode, required?: boolean) => (
  <>
    {label}
    {required && (
      <span className="ad-field-required" aria-hidden="true">
        *
      </span>
    )}
  </>
);

/** Label, control and description/error line shared by every text-like field. */
export function FieldFrame({
  className,
  label,
  required,
  description,
  error,
  children,
}: {
  className: string;
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={`ad-field ${className}`}>
      {label && (
        <span className="ad-field-label">{fieldLabel(label, required)}</span>
      )}
      {children}
      {(description || error) && (
        <small className="ad-field-message" data-error={!!error || undefined}>
          {error && <Icon name="warning" />}
          {error || description}
        </small>
      )}
    </label>
  );
}

/** Flat option rows shared by Select and Autocomplete; the chosen one carries a check mark. */
export function OptionList({
  id,
  options,
  selected,
  active,
  onChoose,
  onHover,
}: {
  id?: string;
  options: Option[];
  selected?: string;
  active?: number;
  onChoose: (value: string) => void;
  onHover?: (index: number) => void;
}) {
  return (
    <div
      id={id}
      className="ad-option-list"
      onKeyDown={(e) => {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
        if (!keys.includes(e.key)) return;
        e.preventDefault();
        const items = [
          ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ),
        ];
        const at = items.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? items.length - 1
              : (at + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                items.length;
        items[next]?.focus();
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="option"
          className="ad-option"
          aria-selected={option.value === selected}
          data-active={index === active || undefined}
          disabled={option.disabled}
          onPointerMove={() => onHover?.(index)}
          onClick={() => onChoose(option.value)}
        >
          <span className="ad-option-label">{option.label}</span>
          {option.value === selected && <Icon name="check" />}
        </button>
      ))}
    </div>
  );
}
