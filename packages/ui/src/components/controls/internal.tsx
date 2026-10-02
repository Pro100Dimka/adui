import type { ReactNode } from "react";
import type { Material, Variant } from "../../core/base";

export const variantMaterial: Record<Variant, Material> = {
  primary: "ruby",
  secondary: "glass",
  danger: "danger",
  ghost: "ghost",
};

type Option = { value: string; label: string; disabled?: boolean };
export const toOption = (option: string | Option): Option =>
  typeof option === "string" ? { value: option, label: option } : option;

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
    <label className={className}>
      {label && (
        <span className="ad-field-label">
          {label}
          {required ? " *" : ""}
        </span>
      )}
      {children}
      {(description || error) && (
        <small className={error ? "ad-field-error" : ""}>
          {error || description}
        </small>
      )}
    </label>
  );
}
