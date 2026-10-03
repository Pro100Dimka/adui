/**
 * Browser APIs that tests (jsdom) and server rendering lack. Without them components lose
 * only the extra (re-measuring on resize, pausing off-screen, following the motion setting)
 * and keep working.
 */
const inert = { observe() {}, unobserve() {}, disconnect() {} };

export const createResizeObserver = (callback: ResizeObserverCallback) =>
  typeof ResizeObserver === "undefined"
    ? (inert as unknown as ResizeObserver)
    : new ResizeObserver(callback);

export const canObserveIntersection = () =>
  typeof IntersectionObserver !== "undefined";

export const reducedMotionQuery = (): MediaQueryList =>
  typeof matchMedia === "function"
    ? matchMedia("(prefers-reduced-motion: reduce)")
    : ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      } as unknown as MediaQueryList);

/** jsdom has canvas elements but no 2D context unless the native canvas package is added. */
export const canPaint = () => typeof CanvasRenderingContext2D !== "undefined";
