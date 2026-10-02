import React, { createElement } from "react";
import { define, mark } from "../../../core/base";
import { Icon } from "../Icon/Icon";
import { Typography } from "../../foundation/Typography/Typography";
import type { HeaderProps } from "../shared";

export const Header = define<HeaderProps>("Header", ({ as = "header", level = 2, title, description, eyebrow, icon, actions, compact, ...p }) => {
  const heading = createElement(`h${level}`, {}, title ?? "Название раздела");
  return React.createElement(as, { ...mark("Header", p), "data-ad-compact": compact || undefined },
    icon && <Icon name={icon} surface="tile" />,
    <div className="ad-header-copy">{eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}{heading}{description && <Typography variant="body-sm" tone="muted">{description}</Typography>}</div>,
    actions && <div className="ad-header-actions">{actions}</div>
  );
});
