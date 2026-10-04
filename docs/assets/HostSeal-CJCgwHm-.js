const r=`import { useMemo, useRef } from "react";\r
import { SvgAsset } from "../../../core/artwork";\r
import type { VectorNode } from "../../../core/base";\r
import { useDecoration } from "../../../core/motion/hooks";\r
import { illustrations } from "../shared";\r
\r
/** The seal's face circle; a photo is clipped to it and drawn under the rings and label. */\r
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
const withPhoto = (seal: VectorNode, src?: string): VectorNode => {\r
  if (!src || !seal.children) return seal;\r
  const children = [...seal.children];\r
  const crown = children.findIndex(\r
    (child) => typeof child !== "string" && child.props?.className === "host-emblem__crown",\r
  );\r
  children.splice(crown < 0 ? children.length : crown, 0, facePhoto(src));\r
  return { ...seal, children };\r
};\r
\r
/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */\r
export function HostSeal({ photo }: { photo?: string }) {\r
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
  const node = useMemo(() => withPhoto(illustrations.host, photo), [photo]);\r
  return (\r
    <span ref={ref} className="ad-host-seal" aria-hidden="true">\r
      <SvgAsset node={node} />\r
    </span>\r
  );\r
}\r
`;export{r as default};
