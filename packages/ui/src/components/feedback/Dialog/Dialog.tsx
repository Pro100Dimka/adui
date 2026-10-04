import { useId, useLayoutEffect, useRef, useState } from "react";
import { mark, useControllable } from "../../../core/base";
import { Button } from "../../controls/Button/Button";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Header } from "../../layout/Header/Header";
import { DialogBody } from "../../layout/DialogBody/DialogBody";
import { DialogActions } from "../../layout/DialogActions/DialogActions";
import { MessageBar } from "../MessageBar/MessageBar";
import type { DialogProps } from "../shared";
/** The backdrop belongs to the dialog element itself: a press on it lands on the dialog, outside its box. */
const outside = (dialog: HTMLDialogElement, x: number, y: number, target: EventTarget) => {
  if (target !== dialog) return false;
  const box = dialog.getBoundingClientRect();
  return x < box.left || x > box.right || y < box.top || y > box.bottom;
};

export const Dialog = (p: DialogProps) => {
  const [open, setOpen] = useControllable(
      p.open,
      p.defaultOpen ?? false,
      p.onOpenChange,
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string>();
  const ref = useRef<HTMLDialogElement>(null),
    // Where the press began: a click closes the window only when it both starts and ends outside it.
    pressedOutside = useRef(false),
    titleId = useId(),
    descId = useId();
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    // Environments without the modal dialog API (jsdom) just toggle the open attribute.
    const modal = typeof d.showModal === "function";
    if (open && !d.open) {
      if (modal) d.showModal();
      else d.setAttribute("open", "");
    } else if (!open && d.open) {
      if (modal) d.close();
      else d.removeAttribute("open");
    }
    return () => {
      if (d.open && modal) d.close();
      else d.removeAttribute("open");
    };
  }, [open]);
  return (
    <dialog
      {...mark("Dialog", p, "dialog")}
      ref={ref}
      data-ad-width={p.width}
      aria-labelledby={titleId}
      onPointerDown={(e) => {
        pressedOutside.current = outside(e.currentTarget, e.clientX, e.clientY, e.target);
      }}
      onClick={(e) => {
        if (p.dismissible !== false && !pending && pressedOutside.current && outside(e.currentTarget, e.clientX, e.clientY, e.target))
          setOpen(false);
        pressedOutside.current = false;
      }}
      onPointerMove={(e) => {
        // A soft light follows the pointer across the window.
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--ad-spot-x", `${e.clientX - box.left}px`);
        e.currentTarget.style.setProperty("--ad-spot-y", `${e.clientY - box.top}px`);
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.removeProperty("--ad-spot-x");
        e.currentTarget.style.removeProperty("--ad-spot-y");
      }}
      aria-describedby={p.description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) setOpen(false);
      }}
    >
      {p.art && (
        <div className="ad-dialog-art" aria-hidden="true">
          {p.art}
        </div>
      )}
      <Header
        title={<span id={titleId}>{p.title ?? "Подтверждение"}</span>}
        icon={p.icon}
        level={2}
        actions={
          <IconButton
            variant="ghost"
            icon="close"
            label={p.closeLabel ?? "Закрыть"}
            disabled={pending}
            onClick={() => setOpen(false)}
          />
        }
      />
      <DialogBody>
        {p.description && <p id={descId}>{p.description}</p>}
        {p.children}
        {error && <MessageBar tone="error">{error}</MessageBar>}
      </DialogBody>
      {(p.cancelLabel !== false || p.confirmLabel !== false) && (
        <DialogActions>
          {p.cancelLabel !== false && (
            <Button disabled={pending} onClick={() => setOpen(false)}>
              {p.cancelLabel ?? "Отмена"}
            </Button>
          )}
          {p.confirmLabel !== false && (
            <Button
              variant={p.danger ? "danger" : "primary"}
              loading={pending}
              onClick={async () => {
                setError(undefined);
                try {
                  const outcome = p.onConfirm?.();
                  // Only an asynchronous action holds the dialog busy; a plain one closes at once.
                  if (!(outcome instanceof Promise)) {
                    if (outcome !== false) setOpen(false);
                    return;
                  }
                  setPending(true);
                  if ((await outcome) !== false) setOpen(false);
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Не удалось выполнить действие",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {p.confirmLabel ?? "Готово"}
            </Button>
          )}
        </DialogActions>
      )}
    </dialog>
  );
};
