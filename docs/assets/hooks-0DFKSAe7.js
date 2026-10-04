const e=`import { reducedMotionQuery } from "../environment";\r
import React, { useEffect, useLayoutEffect, useRef } from "react";\r
import {\r
  attachBorder,\r
  attachTabShape,\r
  createMotion,\r
} from "../motion-engine.js";\r
import { useMotion } from "../providers/context";\r
\r
/** One scheduler in the engine; every observer and subscription is detached on unmount. */\r
export function useDecoration(\r
  ref: React.RefObject<Element | null>,\r
  paint: (time: number) => void,\r
) {\r
  const enabled = useMotion();\r
  const painter = useRef(paint);\r
  painter.current = paint;\r
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);\r
\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node) return;\r
\r
    const controller = createMotion(node);\r
    scope.current = controller;\r
    const unsubscribe = controller.add(node, (time: number) =>\r
      painter.current(time),\r
    );\r
\r
    return () => {\r
      unsubscribe();\r
      controller.dispose();\r
      scope.current = null;\r
    };\r
  }, [ref]);\r
\r
  useLayoutEffect(() => {\r
    scope.current?.set(enabled);\r
  }, [enabled]);\r
}\r
\r
export function useBorder(\r
  ref: React.RefObject<HTMLElement | null>,\r
  enabled = true,\r
  shell = false,\r
  round = false,\r
) {\r
  const motion = useMotion();\r
  const scope = useRef<ReturnType<typeof createMotion> | null>(null);\r
\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node || !enabled) return;\r
\r
    const controller = createMotion(node);\r
    scope.current = controller;\r
    const border = attachBorder(node, { shell, round, scope: controller });\r
\r
    return () => {\r
      border.destroy();\r
      controller.dispose();\r
      scope.current = null;\r
    };\r
  }, [ref, enabled, shell, round]);\r
\r
  useLayoutEffect(() => {\r
    scope.current?.set(motion);\r
  }, [motion, enabled, shell, round]);\r
}\r
\r
export function useTabShape(ref: React.RefObject<HTMLButtonElement | null>) {\r
  useLayoutEffect(() => {\r
    const node = ref.current;\r
    if (!node) return;\r
    const shape = attachTabShape(node);\r
    return () => shape.destroy();\r
  }, [ref]);\r
}\r
\r
/**\r
 * Mouse-wheel notches glide to their target instead of jumping. Trackpads already glide and\r
 * keep native scrolling; an inner scroller that can still move takes the wheel itself.\r
 */\r
export function useSmoothWheel(ref: React.RefObject<HTMLElement | null>) {\r
  const enabled = useMotion();\r
  useEffect(() => {\r
    const element = ref.current;\r
    if (\r
      !element ||\r
      !enabled ||\r
      reducedMotionQuery().matches\r
    )\r
      return;\r
    let target = element.scrollTop;\r
    let position = target;\r
    let applied = target;\r
    let frame = 0;\r
    let last = 0;\r
    const stop = () => {\r
      cancelAnimationFrame(frame);\r
      frame = 0;\r
      last = 0;\r
    };\r
    // Exponential easing on real elapsed time: the same glide at 60, 144 or 360 Hz,\r
    // and every refresh of the display gets its own sub-pixel step.\r
    const glide = (now: number) => {\r
      // Something else moved the scroller (the browser keeping the view anchored while\r
      // content above resizes, a scrollbar drag, keys): take that shift on board and glide\r
      // the remaining distance from there instead of fighting it.\r
      const shift = element.scrollTop - applied;\r
      if (Math.abs(shift) > 1.5) {\r
        position += shift;\r
        target += shift;\r
      }\r
      const elapsed = Math.min(64, now - (last || now - 16));\r
      last = now;\r
      target = Math.max(\r
        0,\r
        Math.min(element.scrollHeight - element.clientHeight, target),\r
      );\r
      position += (target - position) * (1 - Math.exp(-elapsed / 95));\r
      if (Math.abs(target - position) < 0.25) position = target;\r
      element.scrollTop = position;\r
      applied = element.scrollTop;\r
      if (position === target) return stop();\r
      frame = requestAnimationFrame(glide);\r
    };\r
    const onWheel = (event: WheelEvent) => {\r
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))\r
        return;\r
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;\r
      if (event.deltaMode === 0 && Math.abs(delta) < 40) return;\r
      for (\r
        let node = event.target as HTMLElement | null;\r
        node && node !== element;\r
        node = node.parentElement\r
      ) {\r
        const canScroll =\r
          node.scrollHeight > node.clientHeight + 1 &&\r
          /auto|scroll/.test(getComputedStyle(node).overflowY);\r
        if (\r
          canScroll &&\r
          (delta < 0\r
            ? node.scrollTop > 0\r
            : node.scrollTop + node.clientHeight < node.scrollHeight - 1)\r
        )\r
          return;\r
      }\r
      event.preventDefault();\r
      if (!frame) target = position = applied = element.scrollTop;\r
      target = Math.max(\r
        0,\r
        Math.min(element.scrollHeight - element.clientHeight, target + delta),\r
      );\r
      if (!frame) frame = requestAnimationFrame(glide);\r
    };\r
    element.addEventListener("wheel", onWheel, { passive: false });\r
    return () => {\r
      element.removeEventListener("wheel", onWheel);\r
      stop();\r
    };\r
  }, [ref, enabled]);\r
}\r
`;export{e as default};
