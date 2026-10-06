import { reducedMotionQuery } from "../environment";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import {
  attachBorder,
  attachTabShape,
  createMotion,
  subscribeTick,
} from "../motion-engine.js";
import { useMotion } from "../providers/context";

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
    const unsubscribe = controller.add(node, (time: number) =>
      painter.current(time),
    );

    return () => {
      unsubscribe();
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

/**
 * Runs a callback on the shared motion clock while `active`: positions, meters and other live
 * read-outs update in step with every animation instead of asking for frames of their own.
 */
export function useTick(callback: (now: number) => void, active = true) {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    if (!active) return;
    return subscribeTick((now) => latest.current(now));
  }, [active]);
}

/**
 * One observer for the whole page marks blocks that are out of view with `data-ad-offscreen`;
 * the stylesheet pauses every animation inside them, so effects nobody can see cost nothing.
 */
let offscreenObserver: IntersectionObserver | null = null;
const watchOffscreen = (node: Element) => {
  if (typeof IntersectionObserver === "undefined") return () => undefined;
  offscreenObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.toggleAttribute("data-ad-offscreen", !entry.isIntersecting);
    },
    { rootMargin: "12% 0px" },
  );
  offscreenObserver.observe(node);
  return () => {
    offscreenObserver?.unobserve(node);
    node.removeAttribute("data-ad-offscreen");
  };
};

/** Pauses the animations of a block (and everything in it) while it is outside the viewport. */
export function usePauseOffscreen(ref: React.RefObject<Element | null>) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    return watchOffscreen(node);
  }, [ref]);
}

export function useTabShape(ref: React.RefObject<HTMLButtonElement | null>) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const shape = attachTabShape(node);
    return () => shape.destroy();
  }, [ref]);
}

/**
 * Mouse-wheel notches glide to their target instead of jumping. Trackpads already glide and
 * keep native scrolling; an inner scroller that can still move takes the wheel itself.
 */
export function useSmoothWheel(ref: React.RefObject<HTMLElement | null>) {
  const enabled = useMotion();
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !enabled ||
      reducedMotionQuery().matches
    )
      return;
    let target = element.scrollTop;
    let position = target;
    let applied = target;
    let frame = 0;
    let last = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    // Exponential easing on real elapsed time: the same glide at 60, 144 or 360 Hz,
    // and every refresh of the display gets its own sub-pixel step.
    const glide = (now: number) => {
      // Something else moved the scroller (the browser keeping the view anchored while
      // content above resizes, a scrollbar drag, keys): take that shift on board and glide
      // the remaining distance from there instead of fighting it.
      const shift = element.scrollTop - applied;
      if (Math.abs(shift) > 1.5) {
        position += shift;
        target += shift;
      }
      const elapsed = Math.min(64, now - (last || now - 16));
      last = now;
      target = Math.max(
        0,
        Math.min(element.scrollHeight - element.clientHeight, target),
      );
      position += (target - position) * (1 - Math.exp(-elapsed / 95));
      if (Math.abs(target - position) < 0.25) position = target;
      element.scrollTop = position;
      applied = element.scrollTop;
      if (position === target) return stop();
      frame = requestAnimationFrame(glide);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
        return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (event.deltaMode === 0 && Math.abs(delta) < 40) return;
      for (
        let node = event.target as HTMLElement | null;
        node && node !== element;
        node = node.parentElement
      ) {
        const canScroll =
          node.scrollHeight > node.clientHeight + 1 &&
          /auto|scroll/.test(getComputedStyle(node).overflowY);
        if (
          canScroll &&
          (delta < 0
            ? node.scrollTop > 0
            : node.scrollTop + node.clientHeight < node.scrollHeight - 1)
        )
          return;
      }
      event.preventDefault();
      if (!frame) target = position = applied = element.scrollTop;
      target = Math.max(
        0,
        Math.min(element.scrollHeight - element.clientHeight, target + delta),
      );
      if (!frame) frame = requestAnimationFrame(glide);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
      stop();
    };
  }, [ref, enabled]);
}
