import { useRef } from "react";
import { SvgAsset } from "../../../core/artwork";
import { useDecoration } from "../../../core/motion/hooks";
import { illustrations } from "../shared";

/** The host's neon seal: a crown inside two counter-rotating rings of light. */
export function HostSeal() {
  const ref = useRef<HTMLSpanElement>(null);
  useDecoration(ref, (t) =>
    ref.current
      ?.querySelectorAll<SVGGElement>("[data-host-orbit]")
      .forEach((g) => {
        const inner =
          g.classList.contains("host-motion__inner-rear") ||
          g.classList.contains("host-motion__inner-front");
        g.setAttribute(
          "transform",
          `rotate(${t * (inner ? 360 / 5.6 : -360 / 8.4)} 65 65)`,
        );
      }),
  );
  return (
    <span ref={ref} className="ad-host-seal" aria-hidden="true">
      <SvgAsset node={illustrations.host} />
    </span>
  );
}
