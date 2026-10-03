import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { HostSeal } from "../../layout/Avatar/HostSeal";
import type { RoleEmblemProps } from "../shared";
export const RoleEmblem = (p: RoleEmblemProps) => (
  <div
    {...mark(
      "RoleEmblem",
      p,
      undefined,
      p.role === "guest" ? "ad-role-guest" : undefined,
    )}
  >
    {p.role === "guest" ? (
      <>
        <Icon name="user" size="2.6rem" />
        <strong>GUEST</strong>
      </>
    ) : (
      <HostSeal />
    )}
  </div>
);
