import { useEffect, type RefObject } from "react";
import { paintCanvas, type Painting } from "../../core/noise";

/** Most pixels one picture may take: sharp on large hi-dpi screens, still quick to paint. */
const BUDGET = 3_200_000;

/**
 * Paints a procedural picture at the resolution its canvas is actually shown at (the box
 * it covers times the screen's pixel density), so nothing is upscaled into blocks or
 * stair-stepped edges. Repaints sharper when the box grows; reveals the canvas when ready.
 */
export function useArtwork(
  ref: RefObject<HTMLCanvasElement | null>,
  key: string,
  width: number,
  height: number,
  painting: Painting,
) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let shown = 0;
    let alive = true;
    const paint = () => {
      const box = canvas.getBoundingClientRect();
      const density = window.devicePixelRatio || 1;
      const wanted = Math.max(box.width / width, box.height / height) * density;
      const limit = Math.sqrt(BUDGET / (width * height));
      // Steps of a quarter keep the cache small while resizing.
      const scale = Math.min(limit, Math.max(1, Math.ceil(wanted * 4) / 4));
      if (scale <= shown) return;
      shown = scale;
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      void paintCanvas(key, w, h, painting).then((picture) => {
        if (!alive || scale !== shown) return;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(picture, 0, 0);
        canvas.dataset.ready = "";
      });
    };
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [ref, key, width, height, painting]);
}
