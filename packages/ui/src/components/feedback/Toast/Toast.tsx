import { useEffect, useRef } from "react";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type ToastProps } from "../shared";

export const Toast = ({
  open = true,
  duration = 3600,
  onClose,
  ...p
}: ToastProps) => {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !onClose || duration <= 0) return;
    const id = window.setTimeout(() => close.current?.(), duration);
    return () => clearTimeout(id);
  }, [open, duration, !!onClose]);
  if (!open) return null;
  return (
    <div
      {...mark(
        "Toast",
        p,
        "dialog",
        p.floating ? "ad-toast-floating" : undefined,
      )}
      role={p.tone === "error" ? "alert" : "status"}
      aria-live={p.tone === "error" ? "assertive" : "polite"}
    >
      <Icon name={p.tone === "error" ? "warning" : "check"} size={20} />
      <span>{p.message ?? p.children ?? "Настройки сохранены"}</span>
    </div>
  );
};
