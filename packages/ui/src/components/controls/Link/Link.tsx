import type { AnchorHTMLAttributes, ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";

export interface LinkProps
  extends
    CommonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "color"> {
  href?: string;
  icon?: string;
  endIcon?: string;
  external?: boolean;
  underline?: "none" | "hover" | "always";
  children?: ReactNode;
}

export function Link({
  href = "#",
  icon,
  endIcon,
  external,
  underline = "hover",
  children,
  ...props
}: LinkProps) {
  return (
    <a
      {...props}
      {...mark("Link", props)}
      href={href}
      target={external ? "_blank" : props.target}
      rel={external ? "noreferrer" : props.rel}
      data-ad-underline={underline}
    >
      {icon && <Icon name={icon} />}
      {children}
      {endIcon && <Icon name={endIcon} />}
    </a>
  );
}
