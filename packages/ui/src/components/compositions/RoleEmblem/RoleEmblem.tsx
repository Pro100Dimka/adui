import { useRef } from "react";
import { mark } from "../../../core/base";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { illustrations } from "../../layout/shared";
import type { RoleEmblemProps } from "../shared";
export const RoleEmblem = (p: RoleEmblemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useDecoration(ref, (t) =>
    ref.current
      ?.querySelectorAll<SVGGElement>("[data-host-orbit]")
      .forEach((g) =>
        g.setAttribute(
          "transform",
          `rotate(${t * (g.classList.contains("host-motion__inner-rear") || g.classList.contains("host-motion__inner-front") ? 360 / 5.6 : -360 / 8.4)} 65 65)`,
        ),
      ),
  );
  return (
    <div
      {...mark(
        "RoleEmblem",
        p,
        undefined,
        p.role === "guest" ? "ad-role-guest" : undefined,
      )}
      ref={ref}
    >
      {p.role === "guest" ? (
        <>
          <Icon name="user" size="2.6rem" />
          <strong>GUEST</strong>
        </>
      ) : (
        <SvgAsset node={illustrations.host} />
      )}
    </div>
  );
};
