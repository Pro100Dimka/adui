import { mark, type CommonProps } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";

const icons = { success: "check", error: "warning", warning: "warning" };

export const MessageBar = (p: CommonProps) => (
  <div
    {...mark("MessageBar", { ...p, tone: p.tone ?? "warning" })}
    role={p.tone === "error" ? "alert" : "status"}
  >
    <span className="ad-message-bar-icon" aria-hidden>
      <Icon name={icons[p.tone as keyof typeof icons] ?? "info"} />
    </span>
    <span className="ad-message-bar-text">
      {p.children ?? "Для операции нужно больше свободного места."}
    </span>
  </div>
);
