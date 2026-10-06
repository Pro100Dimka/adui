const n=`import { useMemo, useRef } from "react";\r
import { SvgAsset } from "../../../core/artwork";\r
import type { VectorNode } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
import { illustrations } from "../shared";\r
\r
/** The seal's face circle; a photo is clipped to it and drawn under the rings and label. */
const facePhoto = (src: string): VectorNode => ({\r
  tag: "image",\r
  props: {\r
    className: "host-emblem__photo",\r
    x: "20.65",\r
    y: "19.15",\r
    width: "88.7",\r
    height: "88.7",\r
    preserveAspectRatio: "xMidYMid slice",\r
    clipPath: "url(#hostv2-face-clip)",\r
    href: src,\r
  },\r
});\r
const withPerson = (seal: VectorNode, photo?: string, name?: string): VectorNode => {
  const person = name?.trim();
  if ((!photo && !person) || !seal.children) return seal;
  return {
    ...seal,
    children: seal.children.map((child) => {
      if (typeof child === "string") return child;
      if (child.props?.className === "host-emblem__crown") {
        if (photo) return facePhoto(photo);
        const initial = Array.from(person ?? "")[0];
        const text = { x: "65", y: "74", textAnchor: "middle", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "48", fontWeight: "700" };
        return {
          tag: "g",
          props: { className: "host-emblem__initial" },
          children: [
            { tag: "text", props: { ...text, fill: "#ff7b12", filter: "url(#hostv2-gold-bloom)", opacity: ".7" }, children: [initial] },
            { tag: "text", props: { ...text, fill: "#ffe69b" }, children: [initial] },
          ],
        };
      }
      if (person && child.props?.className === "host-emblem__label")
        return {
          ...child,
          children: child.children?.map((label) =>
            typeof label === "string" || label.tag !== "text" ? label : {
              ...label,
              props: { ...label.props, fontSize: Math.min(11.5, 75 / Array.from(person).length) },
              children: [person],
            }),
        };
      return child;
    }),
  };
};
\r
/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */\r
export function HostSeal({ photo, name }: { photo?: string; name?: string }) {
  const ref = useRef<HTMLSpanElement>(null);\r
  useDecoration(ref, (t) =>\r
    ref.current\r
      ?.querySelectorAll<SVGGElement>("[data-host-orbit]")\r
      .forEach((g) => {\r
        const inner =\r
          g.classList.contains("host-motion__inner-rear") ||\r
          g.classList.contains("host-motion__inner-front");\r
        g.setAttribute(\r
          "transform",\r
          \`rotate(\${t * (inner ? 360 / 5.6 : -360 / 8.4)} 65 65)\`,\r
        );\r
      }),\r
  );\r
  const node = useMemo(() => withPerson(illustrations.host, photo, name), [photo, name]);
  return (\r
    <span ref={ref} className="ad-host-seal" aria-hidden="true">\r
      <SvgAsset node={node} />\r
    </span>\r
  );\r
}\r
`;export{n as default};
