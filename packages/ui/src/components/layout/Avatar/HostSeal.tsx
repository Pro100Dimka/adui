import { createElement, useMemo, useRef, type ReactElement } from "react";
import { useSvgId, vectorElement } from "../../../core/artwork";
import type { VectorNode } from "../../../core/base";
import { usePauseOffscreen } from "../../../core/motion/hooks";
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

/** One drawing of the stack: the static parts, or a single ring that spins. */
interface Layer {
  nodes: VectorNode[];
  /** Turns per second; absent for a static layer. */
  spin?: number;
}

const isOrbit = (node: VectorNode) => node.props?.["data-host-orbit"] !== undefined;
const spinOf = (node: VectorNode) =>
  /host-motion__inner-(rear|front)/.test(String(node.props?.className ?? "")) ? 1 / 5.6 : -1 / 8.4;
/** The orbit group itself keeps its look but no longer carries the moving attribute. */
const still = (node: VectorNode): VectorNode => {
  const { "data-host-orbit": _orbit, ...props } = node.props ?? {};
  return { ...node, props };
};

/**
 * Splits the seal into a stack in its own paint order. The static parts are painted once;
 * every ring becomes a layer of its own that the compositor turns. A blur turned is the same
 * as a turned shape blurred, so the rings' glows are computed once instead of on every frame.
 */
const toLayers = (seal: VectorNode): Layer[] => {
  const layers: Layer[] = [];
  const paint = (node: VectorNode) => {
    const top = layers[layers.length - 1];
    if (top && top.spin === undefined) top.nodes.push(node);
    else layers.push({ nodes: [node] });
  };
  for (const child of seal.children ?? []) {
    if (typeof child === "string") continue;
    if (isOrbit(child)) {
      layers.push({ nodes: [still(child)], spin: spinOf(child) });
      continue;
    }
    // A shared halo around several rings: each ring takes its own copy of the halo.
    const orbits = child.children?.filter((c): c is VectorNode => typeof c !== "string" && isOrbit(c));
    if (child.tag === "g" && orbits?.length) {
      for (const orbit of orbits)
        layers.push({ nodes: [{ ...child, children: [still(orbit)] }], spin: spinOf(orbit) });
      continue;
    }
    paint(child);
  }
  return layers;
};

/** The host's neon seal: a crown (or the host's photo) inside two counter-rotating rings of light. */
export function HostSeal({ photo, name }: { photo?: string; name?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefix = `svg-${useSvgId()}-`;
  usePauseOffscreen(ref);
  const layers = useMemo(() => {
    const seal = withPerson(illustrations.host, photo, name);
    const root = (vectorElement({ tag: "svg", props: seal.props }, prefix) as ReactElement<Record<string, unknown>>).props;
    // Gradients and filters live once, in the bottom drawing (it opens with <defs>); the
    // layers above refer to them by id.
    return toLayers(seal).map((layer, i) =>
      createElement(
        "svg",
        {
          ...root,
          key: i,
          "data-host-spin": layer.spin,
          style: layer.spin === undefined ? undefined : {
            animationDuration: `${1 / Math.abs(layer.spin)}s`,
            animationDirection: layer.spin < 0 ? "reverse" : "normal",
          },
        },
        layer.nodes.map((node, k) => vectorElement(node, prefix, k)),
      ),
    );
  }, [photo, name, prefix]);
  return (
    <span ref={ref} className="ad-host-seal" aria-hidden="true">
      {layers}
    </span>
  );
}
