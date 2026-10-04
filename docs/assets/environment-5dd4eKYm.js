const e=`/**\r
 * Browser APIs that tests (jsdom) and server rendering lack. Without them components lose\r
 * only the extra (re-measuring on resize, pausing off-screen, following the motion setting)\r
 * and keep working.\r
 */\r
const inert = { observe() {}, unobserve() {}, disconnect() {} };\r
\r
export const createResizeObserver = (callback: ResizeObserverCallback) =>\r
  typeof ResizeObserver === "undefined"\r
    ? (inert as unknown as ResizeObserver)\r
    : new ResizeObserver(callback);\r
\r
export const canObserveIntersection = () =>\r
  typeof IntersectionObserver !== "undefined";\r
\r
export const reducedMotionQuery = (): MediaQueryList =>\r
  typeof matchMedia === "function"\r
    ? matchMedia("(prefers-reduced-motion: reduce)")\r
    : ({\r
        matches: false,\r
        addEventListener() {},\r
        removeEventListener() {},\r
      } as unknown as MediaQueryList);\r
\r
/** jsdom has canvas elements but no 2D context unless the native canvas package is added. */\r
export const canPaint = () => typeof CanvasRenderingContext2D !== "undefined";\r
`;export{e as default};
