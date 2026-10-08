const n=`import type { CSSProperties, ReactNode } from "react";

/**
 * One drawing of an artwork stack. A stack splits an SVG picture in its own paint order: the
 * static parts (with their blurs) are painted once, and every part that pulses, twinkles or
 * floats becomes a layer of its own that is only moved or faded on the compositor. Gradients
 * and filters are declared once, in the bottom drawing; the others refer to them by id.
 */
export function ArtLayer({
  viewBox,
  className,
  origin,
  style,
  children,
}: {
  viewBox: string;
  className?: string;
  /** The point (in drawing units) a pulsing layer scales about. */
  origin?: [number, number];
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [, , width, height] = viewBox.split(" ").map(Number);
  return (
    <svg
      className={className ? \`ad-art-layer \${className}\` : "ad-art-layer"}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      style={
        origin
          ? { ...style, transformOrigin: \`\${(origin[0] / width!) * 100}% \${(origin[1] / height!) * 100}%\` }
          : style
      }
    >
      {children}
    </svg>
  );
}
`;export{n as default};
