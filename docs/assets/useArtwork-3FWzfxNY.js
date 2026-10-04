const e=`import { canPaint, createResizeObserver } from "../../core/environment";\r
import { useEffect, type RefObject } from "react";\r
import { paintCanvas, type Painting } from "../../core/noise";\r
\r
/** Most pixels one picture may take: sharp on large hi-dpi screens, still quick to paint. */\r
const BUDGET = 3_200_000;\r
\r
/**\r
 * Paints a procedural picture at the resolution its canvas is actually shown at (the box\r
 * it covers times the screen's pixel density), so nothing is upscaled into blocks or\r
 * stair-stepped edges. Repaints sharper when the box grows; reveals the canvas when ready.\r
 */\r
export function useArtwork(\r
  ref: RefObject<HTMLCanvasElement | null>,\r
  key: string,\r
  width: number,\r
  height: number,\r
  painting: Painting,\r
) {\r
  useEffect(() => {\r
    const canvas = ref.current;\r
    if (!canvas) return;\r
    let shown = 0;\r
    let alive = true;\r
    const paint = () => {\r
      if (!canPaint()) return;\r
      const box = canvas.getBoundingClientRect();\r
      const density = window.devicePixelRatio || 1;\r
      const wanted = Math.max(box.width / width, box.height / height) * density;\r
      const limit = Math.sqrt(BUDGET / (width * height));\r
      // Steps of a quarter keep the cache small while resizing.\r
      const scale = Math.min(limit, Math.max(1, Math.ceil(wanted * 4) / 4));\r
      if (scale <= shown) return;\r
      shown = scale;\r
      const w = Math.round(width * scale);\r
      const h = Math.round(height * scale);\r
      void paintCanvas(key, w, h, painting).then((picture) => {\r
        if (!alive || scale !== shown) return;\r
        canvas.width = w;\r
        canvas.height = h;\r
        canvas.getContext("2d")?.drawImage(picture, 0, 0);\r
        canvas.dataset.ready = "";\r
      });\r
    };\r
    const observer = createResizeObserver(paint);\r
    observer.observe(canvas);\r
    return () => {\r
      alive = false;\r
      observer.disconnect();\r
    };\r
  }, [ref, key, width, height, painting]);\r
}\r
`;export{e as default};
