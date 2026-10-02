import { buttonView, type IconButtonProps } from "../shared";

export const IconButton = (p: IconButtonProps) =>
  buttonView(
    {
      ...p,
      icon: p.icon ?? "more",
      children: p.children ?? null,
      label: undefined,
      "aria-label": p.label,
      title: p.title ?? p.label,
    },
    "IconButton",
  );
