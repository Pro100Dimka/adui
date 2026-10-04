const e=`import { canObserveIntersection } from "../../../core/environment";
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface RevealProps extends CommonProps {
  as?: ElementType;
  /** How children arrive. */
  effect?: "rise" | "fade" | "zoom" | "blur";
  /** Delay between consecutive children, ms. */
  stagger?: number;
  /** Play again every time the block re-enters the viewport. */
  repeat?: boolean;
}

/** Children arrive one after another when the block scrolls into view. */
export function Reveal({
  as = "div",
  effect = "rise",
  stagger = 90,
  repeat = false,
  style,
  children,
  ...p
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Without visibility tracking there is no "scrolled into view": show at once.
    if (!canObserveIntersection()) return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (!repeat) observer.disconnect();
        } else if (repeat) setShown(false);
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);
  return createElement(
    as,
    {
      ...mark("Reveal", p),
      ref,
      style: { ...style, "--ad-reveal-stagger": \`\${stagger}ms\` },
      "data-effect": effect,
      "data-shown": shown || undefined,
    },
    // Each child learns its order so the CSS can delay it.
    Children.map(children, (child, index) =>
      isValidElement(child)
        ? cloneElement(child as ReactElement<{ style?: CSSProperties }>, {
            style: {
              ...(child.props as { style?: CSSProperties }).style,
              "--ad-reveal-i": index,
            } as CSSProperties,
          })
        : child,
    ),
  );
}
`;export{e as default};
