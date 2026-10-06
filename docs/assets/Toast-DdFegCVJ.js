const n=`import { useTr } from "../../../core/i18n";
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
  const tr = useTr();
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
        { ...p, tone: p.tone ?? "success" },
        "dialog",
        p.floating ? "ad-toast-floating" : undefined,
      )}
      role={p.tone === "error" ? "alert" : "status"}
      aria-live={p.tone === "error" ? "assertive" : "polite"}
    >
      <span className="ad-toast-icon" aria-hidden>
        <Icon
          name={
            p.tone === "error" || p.tone === "warning"
              ? "warning"
              : p.tone === "info"
                ? "info"
                : "check"
          }
        />
      </span>
      <span>{p.message ?? p.children ?? tr("Настройки сохранены")}</span>
      {onClose && duration > 0 && (
        <span
          className="ad-toast-timer"
          style={{ animationDuration: \`\${duration}ms\` }}
          aria-hidden
        />
      )}
    </div>
  );
};
`;export{n as default};
