export interface MotionScope {
  root: Document | ShadowRoot | Element;
  enabled: boolean; active: boolean; time: number; previous: number | null;
  disposed?: boolean;
  callbacks: Map<Element, (time: number) => void>;
  add(node: Element, callback: (time: number) => void): () => void;
  set(enabled: boolean, explicit?: boolean): boolean;
  setActive(active: boolean): void;
  seek(seconds: number): void;
  dispose(): void;
}
export interface BorderEffect {
  element: HTMLElement; overlay: SVGSVGElement; path: SVGPathElement;
  length: number; observer: ResizeObserver;
  sync(): void; paint(seconds: number): void; destroy(): void;
}
export function createMotion(root?: Document | ShadowRoot | Element): MotionScope;
export function attachBorder(element: HTMLElement, options: {shell?: boolean; round?: boolean; index?: number; scope: MotionScope}): BorderEffect;
export function attachTabShape(element: HTMLButtonElement): {shape: SVGSVGElement; observer: ResizeObserver; sync(): void; destroy(): void};
export function getMotionStats(): {scopes: number; running: number; scheduled: boolean; callbacks: number};
