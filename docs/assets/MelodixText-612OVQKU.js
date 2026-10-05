const e=`import { createElement, type ElementType } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface MelodixTextProps extends CommonProps {
  children: string;
  as?: ElementType;
  /** "silver": brushed-metal letters under a blue neon; "theme": the theme's colours; "ink": plain text colour. */
  finish?: "silver" | "theme" | "ink";
  /** A neon halo round the letters. */
  glow?: boolean;
}

/**
 * A title set in Melodix, the library's musical typeface: records, keys, notes and clefs are
 * part of the letters themselves. In brushed silver, in the theme's colours, or plain.
 */
export function MelodixText({ children, as = "span", finish = "silver", glow = true, ...p }: MelodixTextProps) {
  return createElement(
    as,
    { ...mark("MelodixText", p), "data-finish": finish, "data-glow": glow || undefined },
    children,
  );
}
`;export{e as default};
