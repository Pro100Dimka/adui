const r=`import { mark } from "../../../core/base";\r
import { Icon } from "../Icon/Icon";\r
import {\r
  Typography,\r
  type TypographyVariant,\r
} from "../../foundation/Typography/Typography";\r
import type { HeaderProps } from "../shared";\r
\r
const headingVariant: Record<1 | 2 | 3 | 4, TypographyVariant> = {\r
  1: "h1",\r
  2: "h2",\r
  3: "h3",\r
  4: "title",\r
};\r
const headingTag: Record<1 | 2 | 3 | 4, "h1" | "h2" | "h3" | "h4"> = {\r
  1: "h1",\r
  2: "h2",\r
  3: "h3",\r
  4: "h4",\r
};\r
\r
export const Header = ({\r
  as = "header",\r
  level = 2,\r
  title,\r
  description,\r
  eyebrow,\r
  icon,\r
  actions,\r
  compact,\r
  ...p\r
}: HeaderProps) => {\r
  const Component = as;\r
  return (\r
    <Component {...mark("Header", p)} data-ad-compact={compact || undefined}>\r
      {icon && <Icon name={icon} surface="tile" />}\r
      <div className="ad-header-copy">\r
        {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}\r
        <Typography\r
          as={headingTag[level]}\r
          variant={headingVariant[level]}\r
          weight="bold"\r
        >\r
          {title ?? "Название раздела"}\r
        </Typography>\r
        {description && (\r
          <Typography variant="body-sm" tone="muted">\r
            {description}\r
          </Typography>\r
        )}\r
      </div>\r
      {actions && <div className="ad-header-actions">{actions}</div>}\r
    </Component>\r
  );\r
};\r
`;export{r as default};
