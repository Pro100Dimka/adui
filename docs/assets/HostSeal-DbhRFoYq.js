const r=`import { createElement, useMemo, useRef, type ReactElement } from "react";
import { useSvgId, vectorElement } from "../../../core/artwork";
import type { VectorNode } from "../../../core/base";
import { usePauseOffscreen } from "../../../core/motion/hooks";
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
const withPerson = (seal: VectorNode, photo?: string, name?: string): VectorNode => {\r
  const person = name?.trim();\r
  if ((!photo && !person) || !seal.children) return seal;\r
  return {\r
    ...seal,\r
    children: seal.children.map((child) => {\r
      if (typeof child === "string") return child;\r
      if (child.props?.className === "host-emblem__crown") {\r
        if (photo) return facePhoto(photo);\r
        const initial = Array.from(person ?? "")[0];\r
        const text = { x: "65", y: "74", textAnchor: "middle", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "48", fontWeight: "700" };\r
        return {\r
          tag: "g",\r
          props: { className: "host-emblem__initial" },\r
          children: [\r
            { tag: "text", props: { ...text, fill: "#ff7b12", filter: "url(#hostv2-gold-bloom)", opacity: ".7" }, children: [initial] },\r
            { tag: "text", props: { ...text, fill: "#ffe69b" }, children: [initial] },\r
          ],\r
        };\r
      }\r
      if (person && child.props?.className === "host-emblem__label")\r
        return {\r
          ...child,\r
          children: child.children?.map((label) =>\r
            typeof label === "string" || label.tag !== "text" ? label : {\r
              ...label,\r
              props: { ...label.props, fontSize: Math.min(11.5, 75 / Array.from(person).length) },\r
              children: [person],\r
            }),\r
        };\r
      return child;\r
    }),\r
  };\r
};\r
\r
/** One drawing of the stack: the static parts, or a single ring that spins. */\r
interface Layer {\r
  nodes: VectorNode[];\r
  /** Turns per second; absent for a static layer. */\r
  spin?: number;\r
}\r
\r
const isOrbit = (node: VectorNode) => node.props?.["data-host-orbit"] !== undefined;\r
const spinOf = (node: VectorNode) =>\r
  /host-motion__inner-(rear|front)/.test(String(node.props?.className ?? "")) ? 1 / 5.6 : -1 / 8.4;\r
/** The orbit group itself keeps its look but no longer carries the moving attribute. */\r
const still = (node: VectorNode): VectorNode => {\r
  const { "data-host-orbit": _orbit, ...props } = node.props ?? {};\r
  return { ...node, props };\r
};\r
\r
/**\r
 * Splits the seal into a stack in its own paint order. The static parts are painted once;\r
 * every ring becomes a layer of its own that the compositor turns. A blur turned is the same\r
 * as a turned shape blurred, so the rings' glows are computed once instead of on every frame.\r
 */\r
const toLayers = (seal: VectorNode): Layer[] => {\r
  const layers: Layer[] = [];\r
  const paint = (node: VectorNode) => {\r
    const top = layers[layers.length - 1];\r
    if (top && top.spin === undefined) top.nodes.push(node);\r
    else layers.push({ nodes: [node] });\r
  };\r
  for (const child of seal.children ?? []) {\r
    if (typeof child === "string") continue;\r
    if (isOrbit(child)) {\r
      layers.push({ nodes: [still(child)], spin: spinOf(child) });\r
      continue;\r
    }\r
    // A shared halo around several rings: each ring takes its own copy of the halo.\r
    const orbits = child.children?.filter((c): c is VectorNode => typeof c !== "string" && isOrbit(c));\r
    if (child.tag === "g" && orbits?.length) {\r
      for (const orbit of orbits)\r
        layers.push({ nodes: [{ ...child, children: [still(orbit)] }], spin: spinOf(orbit) });\r
      continue;\r
    }\r
    paint(child);\r
  }\r
  return layers;\r
};\r
\r
/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */\r
export function HostSeal({ photo, name }: { photo?: string; name?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefix = \`svg-\${useSvgId()}-\`;
  usePauseOffscreen(ref);
  const layers = useMemo(() => {\r
    const seal = withPerson(illustrations.host, photo, name);\r
    const root = (vectorElement({ tag: "svg", props: seal.props }, prefix) as ReactElement<Record<string, unknown>>).props;\r
    // Gradients and filters live once, in the bottom drawing (it opens with <defs>); the\r
    // layers above refer to them by id.\r
    return toLayers(seal).map((layer, i) =>\r
      createElement(
        "svg",
        {
          ...root,
          key: i,
          "data-host-spin": layer.spin,
          style: layer.spin === undefined ? undefined : {
            animationDuration: \`\${1 / Math.abs(layer.spin)}s\`,
            animationDirection: layer.spin < 0 ? "reverse" : "normal",
          },
        },
        layer.nodes.map((node, k) => vectorElement(node, prefix, k)),\r
      ),\r
    );\r
  }, [photo, name, prefix]);\r
  return (\r
    <span ref={ref} className="ad-host-seal" aria-hidden="true">\r
      {layers}\r
    </span>\r
  );\r
}\r
`;export{r as default};
