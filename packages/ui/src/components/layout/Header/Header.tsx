import { mark } from "../../../core/base";
import { Icon } from "../Icon/Icon";
import {
  Typography,
  type TypographyVariant,
} from "../../foundation/Typography/Typography";
import type { HeaderProps } from "../shared";

const headingVariant: Record<1 | 2 | 3 | 4, TypographyVariant> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "title",
};
const headingTag: Record<1 | 2 | 3 | 4, "h1" | "h2" | "h3" | "h4"> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
};

export const Header = ({
  as = "header",
  level = 2,
  title,
  description,
  eyebrow,
  icon,
  actions,
  compact,
  ...p
}: HeaderProps) => {
  const Component = as;
  return (
    <Component {...mark("Header", p)} data-ad-compact={compact || undefined}>
      {icon && <Icon name={icon} surface="tile" />}
      <div className="ad-header-copy">
        {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}
        <Typography
          as={headingTag[level]}
          variant={headingVariant[level]}
          weight="bold"
        >
          {title ?? "Название раздела"}
        </Typography>
        {description && (
          <Typography variant="body-sm" tone="muted">
            {description}
          </Typography>
        )}
      </div>
      {actions && <div className="ad-header-actions">{actions}</div>}
    </Component>
  );
};
