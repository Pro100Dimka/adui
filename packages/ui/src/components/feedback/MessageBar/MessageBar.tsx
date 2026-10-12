import { useTr } from "../../../core/i18n";
import { mark, type Tone } from "../../../core/base";
import type { MessageBarProps } from "../shared";
import { Icon } from "../../layout/Icon/Icon";

const icons: Partial<Record<Tone, string>> = { success: "check", error: "warning", warning: "warning" };

export const MessageBar = ({ action, tone = "warning", ...p }: MessageBarProps) => { const tr = useTr(); return ((
  <div
    {...mark("MessageBar", { ...p, tone })}
    role={tone === "error" ? "alert" : "status"}
  >
    <span className="ad-message-bar-icon" aria-hidden>
      <Icon name={icons[tone] ?? "info"} />
    </span>
    <span className="ad-message-bar-text">
      {p.children ?? tr("Для операции нужно больше свободного места.")}
    </span>
    {action && <span className="ad-message-bar-action">{action}</span>}
  </div>
)); };
