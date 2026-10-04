import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/** Where a floating panel sits, in window pixels. */
export interface PanelLayout {
  left: number;
  top: number;
  width: number;
  height: number;
}
/** A point on the screen, in screen pixels. */
export interface ScreenPoint {
  screenX: number;
  screenY: number;
}
/** Which edges a resize handle moves; a corner combines its two edges. */
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export const resizeEdges: readonly ResizeEdge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export interface FloatingPanelOptions {
  /** The saved placement, or null for the panel's own default place. */
  layout?: PanelLayout | null;
  /** Called once a move or resize ends, with the new placement to keep. */
  onLayoutChange?(layout: PanelLayout): void;
  /** Size to start from before the panel can be measured (it has not been laid out yet). */
  defaultSize?: { width: number; height: number };
  /** Size limits while resizing. */
  limits?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number };
  /** The panel was dragged out of the window (e.g. to become a window of its own). */
  onDragOutside?(screenBounds: PanelLayout, pointer: ScreenPoint): void;
  /** More elements that keep their own pointer gestures instead of moving the panel. */
  ignore?: string;
}

// A drag this short is a plain click (select only).
const threshold = 3;
// Pressing a control inside the panel uses that control; only the panel's own surface moves it.
export const panelControls =
  "button, a, input, select, textarea, [role=slider], [role=button], [role=switch], [role=listbox], [contenteditable=true], .ad-rotary-knob";

type Drag =
  | { kind: "move"; x: number; y: number; origin: PanelLayout }
  | { kind: "resize"; edge: ResizeEdge; x: number; y: number; origin: PanelLayout };

/**
 * Click a panel to select it, drag it anywhere in the window, resize it from any edge or corner,
 * drag it past the window's edge to hand it over. The placement stays on screen when the window
 * shrinks; the caller keeps it (storage, preferences) through `onLayoutChange`.
 */
export const useFloatingPanel = (frameRef: RefObject<HTMLElement | null>, options: FloatingPanelOptions = {}) => {
  const [active, setActive] = useState(false);
  const [live, setLive] = useState<PanelLayout | null>(null);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const latest = useRef(options);
  latest.current = options;

  const [, setViewport] = useState(0);
  useEffect(() => {
    const onResize = () => setViewport((n) => n + 1);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const keepInWindow = (next: PanelLayout): PanelLayout => {
    const { limits = {} } = latest.current;
    const width = Math.min(Math.max(next.width, limits.minWidth ?? 0), limits.maxWidth ?? Infinity, window.innerWidth);
    const height = Math.min(Math.max(next.height, limits.minHeight ?? 0), limits.maxHeight ?? Infinity, window.innerHeight);
    return {
      left: Math.min(Math.max(next.left, 0), Math.max(0, window.innerWidth - width)),
      top: Math.min(Math.max(next.top, 0), Math.max(0, window.innerHeight - height)),
      width,
      height,
    };
  };
  const saved = options.layout;
  const layout = live ?? (saved ? keepInWindow(saved) : null);

  const box = (): PanelLayout => {
    if (layout) return layout;
    const rect = frameRef.current?.getBoundingClientRect();
    return rect?.width
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : { left: 0, top: 0, width: 0, height: 0, ...latest.current.defaultSize };
  };

  const resized = (origin: PanelLayout, edge: ResizeEdge, dx: number, dy: number): PanelLayout => {
    let { left, top, width, height } = origin;
    if (edge.includes("e")) width += dx;
    else if (edge.includes("w")) {
      // The right edge stays put while the left one moves.
      width -= dx;
      left = origin.left + origin.width - width;
    }
    if (edge.includes("s")) height += dy;
    else if (edge.includes("n")) {
      height -= dy;
      top = origin.top + origin.height - height;
    }
    return keepInWindow({ left, top, width, height });
  };

  const beginMove = (event: ReactPointerEvent<HTMLElement>) => {
    const { ignore } = latest.current;
    const skip = ignore ? `${panelControls}, ${ignore}` : panelControls;
    if (event.button !== 0 || (event.target as Element | null)?.closest?.(skip)) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moved.current = false;
    drag.current = { kind: "move", x: event.clientX, y: event.clientY, origin: box() };
  };
  const beginResize = (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moved.current = false;
    drag.current = { kind: "resize", edge, x: event.clientX, y: event.clientY, origin: box() };
  };
  const handleMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!moved.current && Math.abs(dx) <= threshold && Math.abs(dy) <= threshold) return;
    moved.current = true;
    const { onDragOutside } = latest.current;
    const outside = event.clientX < 0 || event.clientY < 0 || event.clientX > window.innerWidth || event.clientY > window.innerHeight;
    if (current.kind === "move" && onDragOutside && outside) {
      drag.current = null;
      setLive(null);
      // The grab point stays under the pointer in the new place.
      onDragOutside(
        { ...current.origin, left: event.screenX - (current.x - current.origin.left), top: event.screenY - (current.y - current.origin.top) },
        { screenX: event.screenX, screenY: event.screenY },
      );
      return;
    }
    setLive(
      current.kind === "move"
        ? keepInWindow({ ...current.origin, left: current.origin.left + dx, top: current.origin.top + dy })
        : resized(current.origin, current.edge, dx, dy),
    );
  };
  const handleUp = () => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setActive(true);
    // A plain click only selects; it never changes the placement.
    if (!moved.current || !live) return;
    // Moving keeps the size the panel was given, not the size a small window squeezed it to,
    // so it grows back when the window does.
    const { layout: kept, defaultSize } = latest.current;
    const size = kept ?? defaultSize;
    latest.current.onLayoutChange?.(current.kind === "move" && size ? { ...live, width: size.width, height: size.height } : live);
  };

  const deactivate = useCallback(() => setActive(false), []);
  // A press anywhere else deselects the panel, like a selection on a canvas.
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !frameRef.current?.contains(event.target)) deactivate();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, deactivate, frameRef]);

  return { layout, active, beginMove, beginResize, handleMove, handleUp };
};
