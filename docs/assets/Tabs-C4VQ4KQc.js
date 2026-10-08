const e=`import { tr, useTr } from "../../../core/i18n";\r
import { createResizeObserver } from "../../../core/environment";\r
import { useLayoutEffect, useRef, useState } from "react";\r
import {\r
  mark,\r
  ripple,\r
  useControllable,\r
  type TokenStyle,\r
} from "../../../core/base";\r
import { type TabItem, type TabsProps } from "../shared";\r
import { Tab } from "../Tab/Tab";\r
\r
export function Tabs<V extends string = string>(p: TabsProps<V>) {\r
  const tr = useTr();\r
  const items =\r
    p.items ??\r
    ([\r
      { value: "appearance", label: tr("Внешний вид"), icon: "palette" },\r
      { value: "audio", label: tr("Аудио"), icon: "audio" },\r
      { value: "advanced", label: tr("Дополнительно"), icon: "wrench" },\r
    ] as TabItem<V>[]);\r
  const [value, setValue] = useControllable<V>(\r
    p.value,\r
    p.defaultValue ?? items[0]?.value ?? ("" as V),\r
    p.onValueChange,\r
  );\r
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);\r
  const selected = items.findIndex((item) => item.value === value);\r
\r
  // The blade follows the selected tab and is told when it is travelling, to squash and flare.\r
  const [place, setPlace] = useState<TokenStyle>();\r
  const [moving, setMoving] = useState(false);\r
  const first = useRef(true);\r
  useLayoutEffect(() => {\r
    const tab = buttons.current[selected];\r
    if (!tab) return setPlace(undefined);\r
    const update = () =>\r
      setPlace({\r
        "--ad-tabs-x": \`\${tab.offsetLeft}px\`,\r
        "--ad-tabs-w": \`\${tab.offsetWidth}px\`,\r
      });\r
    update();\r
    const observer = createResizeObserver(update);\r
    observer.observe(tab);\r
    if (tab.parentElement) observer.observe(tab.parentElement);\r
    let timer = 0;\r
    if (!first.current) {\r
      setMoving(true);\r
      timer = window.setTimeout(() => setMoving(false), 420);\r
    }\r
    first.current = false;\r
    return () => {\r
      observer.disconnect();\r
      clearTimeout(timer);\r
    };\r
  }, [selected, items.length]);\r
\r
  return (\r
    <nav\r
      {...mark("Tabs", p)}\r
      role="tablist"\r
      aria-label={p.label ?? tr("Разделы")}\r
      data-moving={moving || undefined}\r
      onPointerDown={(e) => {\r
        const tab = (e.target as HTMLElement).closest<HTMLElement>(".ad-tab");\r
        if (tab && !tab.matches(":disabled")) ripple(tab, e.clientX, e.clientY);\r
      }}\r
      onKeyDown={(e) => {\r
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;\r
        const available = items\r
          .map((item, index) => ({ item, index }))\r
          .filter((x) => !x.item.disabled);\r
        if (!available.length) return;\r
        e.preventDefault();\r
        const current = available.findIndex(\r
          (x) => buttons.current[x.index] === document.activeElement,\r
        );\r
        const next =\r
          e.key === "Home"\r
            ? 0\r
            : e.key === "End"\r
              ? available.length - 1\r
              : (current +\r
                  (e.key === "ArrowRight" ? 1 : -1) +\r
                  available.length) %\r
                available.length;\r
        setValue(available[next].item.value);\r
        buttons.current[available[next].index]?.focus();\r
      }}\r
    >\r
      {place && (\r
        <>\r
          <span className="ad-tabs-trail" style={place} aria-hidden />\r
          <span className="ad-tabs-indicator" style={place} aria-hidden>\r
            <span className="ad-tabs-halo" />\r
            <span className="ad-tabs-blade">\r
              <span className="ad-tabs-blade-edge" />\r
            </span>\r
          </span>\r
          <span className="ad-tabs-rail" style={place} aria-hidden />\r
        </>\r
      )}\r
      {items.map((item, index) => (\r
        <Tab\r
          key={item.value}\r
          id={item.id}\r
          ref={(n) => {\r
            buttons.current[index] = n;\r
          }}\r
          icon={item.icon}\r
          panelId={item.panelId}\r
          disabled={item.disabled}\r
          size={p.size}\r
          selected={item.value === value}\r
          onClick={() => setValue(item.value)}\r
        >\r
          {item.label}\r
        </Tab>\r
      ))}\r
    </nav>\r
  );\r
}\r
`;export{e as default};
