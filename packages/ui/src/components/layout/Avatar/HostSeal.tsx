import { useMemo, useRef } from "react";
import { SvgAsset } from "../../../core/artwork";
import type { VectorNode } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { illustrations } from "../shared";

/** The seal's face circle; a photo is clipped to it and drawn under the rings and label. */
const facePhoto = (src: string): VectorNode => ({
  tag: "image",
  props: {
    className: "host-emblem__photo",
    x: "20.65",
    y: "19.15",
    width: "88.7",
    height: "88.7",
    preserveAspectRatio: "xMidYMid slice",
    clipPath: "url(#hostv2-face-clip)",
    href: src,
  },
});
const withPhoto = (seal: VectorNode, src?: string): VectorNode => {
  if (!src || !seal.children) return seal;
  const children = [...seal.children];
  const crown = children.findIndex(
    (child) => typeof child !== "string" && child.props?.className === "host-emblem__crown",
  );
  children.splice(crown < 0 ? children.length : crown, 0, facePhoto(src));
  return { ...seal, children };
};

/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */
export function HostSeal({ photo }: { photo?: string }) {
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
  const node = useMemo(() => withPhoto(illustrations.host, photo), [photo]);
  return (
    <span ref={ref} className="ad-host-seal" aria-hidden="true">
      <SvgAsset node={node} />
    </span>
  );
}
