const r=`import type { AnchorHTMLAttributes, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
\r
export interface LinkProps\r
  extends\r
    CommonProps,\r
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "color"> {\r
  href?: string;\r
  icon?: string;\r
  endIcon?: string;\r
  external?: boolean;\r
  underline?: "none" | "hover" | "always";\r
  children?: ReactNode;\r
}\r
\r
export function Link({\r
  href = "#",\r
  icon,\r
  endIcon,\r
  external,\r
  underline = "hover",\r
  children,\r
  ...props\r
}: LinkProps) {\r
  return (\r
    <a\r
      {...props}\r
      {...mark("Link", props)}\r
      href={href}\r
      target={external ? "_blank" : props.target}\r
      rel={external ? "noreferrer" : props.rel}\r
      data-ad-underline={underline}\r
    >\r
      {icon && <Icon name={icon} />}\r
      {children}\r
      {endIcon && <Icon name={endIcon} />}\r
    </a>\r
  );\r
}\r
`;export{r as default};
