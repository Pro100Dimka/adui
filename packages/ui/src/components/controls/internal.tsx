import { Fragment, useId, type ReactNode } from "react";
import type { Material, Variant } from "../../core/base";
import { Icon } from "../layout/Icon/Icon";
import { Avatar } from "../layout/Avatar/Avatar";

export const variantMaterial: Record<Variant, Material> = {
  primary: "ruby",
  secondary: "glass",
  danger: "danger",
  ghost: "ghost",
};

/** An option as the list draws it: a string key and everything it shows. */
export type Option = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  icon?: string;
  avatar?: { name: string; src?: string };
  description?: ReactNode;
  group?: string;
  /** Replaces the whole row's content. */
  content?: ReactNode;
};
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

/**
 * Ids that tie a control to its own label and message. The frame is a wrapping label (a click
 * anywhere on the field focuses the control), but its text also holds the message and any
 * adornment buttons, so the accessible name is pointed at the label text alone.
 */
export const useFieldIds = (label: ReactNode, message: ReactNode) => {
  const id = useId();
  const ids = { label: `${id}label`, message: `${id}message` };
  return {
    ...ids,
    aria: {
      "aria-labelledby": label ? ids.label : undefined,
      "aria-describedby": message ? ids.message : undefined,
    },
  };
};
export type FieldIds = ReturnType<typeof useFieldIds>;

/** Label, control and description/error line shared by every text-like field. */
export function FieldFrame({
  className,
  label,
  required,
  description,
  error,
  ids,
  children,
}: {
  className: string;
  ids: FieldIds;
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={`ad-field ${className}`}>
      {label && (
        <span className="ad-field-label" id={ids.label}>{fieldLabel(label, required)}</span>
      )}
      {children}
      {(description || error) && (
        <small id={ids.message} className="ad-field-message" data-error={!!error || undefined}>
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
        <Fragment key={option.value}>
          {option.group && option.group !== options[index - 1]?.group && (
            <div className="ad-option-group" role="presentation">{option.group}</div>
          )}
          <button
            type="button"
            role="option"
            className="ad-option"
            aria-selected={option.value === selected}
            data-active={index === active || undefined}
            disabled={option.disabled}
            onPointerMove={() => onHover?.(index)}
            onClick={() => onChoose(option.value)}
          >
            {option.content ?? (
              <>
                {option.avatar && <Avatar size="sm" name={option.avatar.name} src={option.avatar.src} />}
                {option.icon && <Icon name={option.icon} className="ad-option-icon" />}
                <span className="ad-option-text">
                  <span className="ad-option-label">{option.label}</span>
                  {option.description && <span className="ad-option-description">{option.description}</span>}
                </span>
              </>
            )}
            {option.value === selected && <Icon name="check" className="ad-option-check" />}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
