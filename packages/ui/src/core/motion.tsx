import React, { useLayoutEffect, useRef } from "react";
import { attachBorder, attachTabShape, createMotion } from "./motion-engine.js";
import { useMotion } from "./providers";
import { define, mark, type CommonProps } from "./base";

/** One scheduler in the engine; every observer and subscription is detached on unmount. */
export function useDecoration(
  ref: React.RefObject<Element | null>,
  paint: (time: number) => void,
) {
  const enabled = useMotion();
  const painter = useRef(paint);
  painter.current = paint;
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controller = createMotion(node);
    scope.current = controller;
    const unsub = controller.add(node, (t: number) => painter.current(t));
    return () => {
      unsub();
      controller.dispose();
      scope.current = null;
    };
  }, [ref]);
  useLayoutEffect(() => {
    scope.current?.set(enabled);
  }, [enabled]);
}
export function useBorder(
  ref: React.RefObject<HTMLElement | null>,
  enabled = true,
  shell = false,
  round = false,
) {
  const motion = useMotion();
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const controller = createMotion(node);
    scope.current = controller;
    const border = attachBorder(node, { shell, round, scope: controller });
    return () => {
      border.destroy();
      controller.dispose();
      scope.current = null;
    };
  }, [ref, enabled, shell, round]);
  useLayoutEffect(() => {
    scope.current?.set(motion);
  }, [motion, enabled, shell, round]);
}
export function useTabShape(ref: React.RefObject<HTMLButtonElement | null>) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const shape = attachTabShape(node);
    return () => shape.destroy();
  }, [ref]);
}
export interface AnimatedBorderProps extends CommonProps {
  shell?: boolean;
  round?: boolean;
  enabled?: boolean;
}
export const AnimatedBorder = define<AnimatedBorderProps>(
  "AnimatedBorder",
  (p) => {
    const ref = useRef<HTMLDivElement>(null);
    useBorder(ref, p.enabled ?? true, p.shell, p.round);
    return (
      <div
        {...mark("AnimatedBorder", p, "card", "ad-surface")}
        ref={ref}
        style={{ padding: 28, position: "relative", ...p.style }}
      >
        <>{p.children ?? "Свет движется по контуру"}</>
      </div>
    );
  },
);
