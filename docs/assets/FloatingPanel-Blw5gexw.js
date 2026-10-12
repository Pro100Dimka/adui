const e=`import { useRef, type ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { resizeEdges, useFloatingPanel, type FloatingPanelOptions } from "./useFloatingPanel";\r
\r
export interface FloatingPanelProps extends CommonProps, FloatingPanelOptions {\r
  /** Resize handles on every edge and corner while the panel is selected. */\r
  resizable?: boolean;\r
  label?: string;\r
  children?: ReactNode;\r
}\r
\r
/**\r
 * A panel that floats over the page: drag it by its surface, select it with a click to resize it\r
 * from any edge or corner. Focus the panel and use arrow keys to move; Shift+arrow resizes.\r
 * Where it starts is up to its class; once moved, it keeps its place.\r
 */\r
export const FloatingPanel = ({ layout: saved, onLayoutChange, defaultSize, limits, onDragOutside, ignore, resizable = false, label, children, ...p }: FloatingPanelProps) => {\r
  const frame = useRef<HTMLDivElement>(null);\r
  const { layout, active, beginMove, beginResize, handleMove, handleUp, handleCancel, handleKeyDown } = useFloatingPanel(frame, {\r
    layout: saved,\r
    onLayoutChange,\r
    defaultSize,\r
    limits,\r
    onDragOutside,\r
    ignore,\r
  });\r
  return (\r
    <div\r
      {...mark("FloatingPanel", p)}\r
      ref={frame}\r
      role="group"\r
      tabIndex={0}\r
      aria-label={label}\r
      data-active={active || undefined}\r
      style={{ ...p.style, ...(layout ?? {}) }}\r
      onPointerDown={beginMove}\r
      onPointerMove={handleMove}\r
      onPointerUp={handleUp}\r
      onPointerCancel={handleCancel}\r
      onKeyDown={event => handleKeyDown(event, resizable)}\r
    >\r
      {children}\r
      {resizable && active &&\r
        resizeEdges.map((edge) => (\r
          <span key={edge} className="ad-floating-panel-handle" data-edge={edge} aria-hidden="true" onPointerDown={beginResize(edge)} />\r
        ))}\r
    </div>\r
  );\r
};\r
`;export{e as default};
