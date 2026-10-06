import { useTr } from "../../../core/i18n";
import type { ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Avatar } from "../../layout/Avatar/Avatar";
import { Icon } from "../../layout/Icon/Icon";

export interface ChipProps extends CommonProps {
  label: ReactNode;
  /** Icon before the label. */
  icon?: string;
  /** A person's picture before the label. */
  avatar?: { name: string; src?: string };
  /** Shows a × that calls this. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Makes the chip a toggle, e.g. a filter. */
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

/** A compact pill for a tag, a person or a filter: optional picture or icon, removable or pressable. */
export function Chip({ label, icon, avatar, onRemove, removeLabel, onClick, selected, disabled, ...p }: ChipProps) {
  const tr = useTr();
  const removeText = removeLabel ?? tr("Убрать");
  const content = (
    <>
      {avatar && <Avatar size="xs" name={avatar.name} src={avatar.src} />}
      {icon && <Icon name={icon} />}
      <span className="ad-chip-label">{label}</span>
    </>
  );
  return (
    <span {...mark("Chip", p)} data-selected={selected || undefined} data-disabled={disabled || undefined}>
      {onClick ? (
        <button type="button" className="ad-chip-body" aria-pressed={selected} disabled={disabled} onClick={onClick}>
          {content}
        </button>
      ) : (
        <span className="ad-chip-body">{content}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className="ad-chip-remove"
          aria-label={typeof label === "string" ? `${removeText}: ${label}` : removeText}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="close" />
        </button>
      )}
    </span>
  );
}
