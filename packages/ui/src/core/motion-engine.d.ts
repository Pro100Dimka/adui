export interface MotionScope {
  root: Document | ShadowRoot | Element;
  enabled: boolean;
  time: number;
  previous: number | null;
  disposed?: boolean;
  callbacks: Map<Element, (time: number) => void>;
  add(node: Element, callback: (time: number) => void, immediate?: boolean): () => void;
  set(enabled: boolean, explicit?: boolean): boolean;
  dispose(): void;
}
export interface BorderEffect {
  element: HTMLElement;
  overlay: HTMLSpanElement;
  observer: ResizeObserver;
  sync(): void;
  destroy(): void;
}
export function createMotion(
  root?: Document | ShadowRoot | Element,
): MotionScope;
export function attachBorder(
  element: HTMLElement,
  options: {
    shell?: boolean;
    round?: boolean;
    scope?: MotionScope;
    /** Defer geometry until visible and share the motion clock's work budget. */
    defer?: boolean;
  },
): BorderEffect;
export function attachTabShape(element: HTMLButtonElement): {
  shape: SVGSVGElement;
  observer: ResizeObserver;
  sync(): void;
  destroy(): void;
};
export function getMotionStats(): {
  scopes: number;
  running: number;
  scheduled: boolean;
  callbacks: number;
};

/** Frames per second of the motion clock that steps every looping decoration (default 30). */
export function setMotionFrameRate(fps: number): void;
/** Calls the listener on every tick of the motion clock (30 a second); returns the unsubscribe. */
export function subscribeTick(listener: (now: number) => void): () => void;
/** Requests a shared-frame visibility refresh after an offscreen boundary changes. */
export function refreshMotion(): void;
