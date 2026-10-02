import { mark, type CommonProps } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";

export const MessageBar = (p: CommonProps) => (
  <div
    {...mark("MessageBar", { ...p, tone: p.tone ?? "warning" })}
    role={p.tone === "error" ? "alert" : "status"}
  >
    <Icon
      name={
        p.tone === "success" ? "check" : p.tone === "error" ? "warning" : "info"
      }
      size={22}
    />
    <span>{p.children ?? "Для операции нужно больше свободного места."}</span>
  </div>
);
