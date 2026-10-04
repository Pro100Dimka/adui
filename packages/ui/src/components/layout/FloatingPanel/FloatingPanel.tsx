import { useRef, type ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { resizeEdges, useFloatingPanel, type FloatingPanelOptions } from "./useFloatingPanel";

export interface FloatingPanelProps extends CommonProps, FloatingPanelOptions {
  /** Resize handles on every edge and corner while the panel is selected. */
  resizable?: boolean;
  label?: string;
  children?: ReactNode;
}

/**
 * A panel that floats over the page: drag it by its surface, select it with a click to resize it
 * from any edge or corner. Where it starts is up to its class; once moved, it keeps its place.
 */
export const FloatingPanel = ({ layout: saved, onLayoutChange, limits, onDragOutside, ignore, resizable = false, label, children, ...p }: FloatingPanelProps) => {
  const frame = useRef<HTMLDivElement>(null);
  const { layout, active, beginMove, beginResize, handleMove, handleUp } = useFloatingPanel(frame, {
    layout: saved,
    onLayoutChange,
    limits,
    onDragOutside,
    ignore,
  });
  return (
    <div
      {...mark("FloatingPanel", p)}
      ref={frame}
      role="group"
      aria-label={label}
      data-active={active || undefined}
      style={{ ...p.style, ...(layout ?? {}) }}
      onPointerDown={beginMove}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {children}
      {resizable && active &&
        resizeEdges.map((edge) => (
          <span key={edge} className="ad-floating-panel-handle" data-edge={edge} aria-hidden="true" onPointerDown={beginResize(edge)} />
        ))}
    </div>
  );
};
