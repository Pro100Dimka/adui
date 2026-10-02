import React, { createElement, useRef } from "react";
import { define, mark } from "../../../core/base";
import { useBorder } from "../../../core/motion/hooks";
import { Header } from "../Header/Header";
import type { CardProps } from "../shared";
export const Card = define<CardProps>("Card", ({ as="section", border=false, shell=false, padding="md", title, description, eyebrow, icon, actions, level=3, children, ...p }) => {
  const ref=useRef<HTMLElement>(null); useBorder(ref,border,shell);
  return createElement(as,{...mark("Card",p,p.material ?? (shell?"shell":"card"),"ad-surface"),ref,"data-ad-padding":padding},
    title && <Header level={level as 1|2|3|4} title={title} description={description} eyebrow={eyebrow} icon={icon} actions={actions} compact={level>2}/>, children);
});
