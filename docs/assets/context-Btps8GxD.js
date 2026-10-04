const e=`import { reducedMotionQuery } from "../environment";\r
import { useEffect, useState } from "react";\r
export function useReducedMotion() {\r
  const [reduced, setReduced] = useState(() => reducedMotionQuery().matches);\r
  useEffect(() => {\r
    const media = reducedMotionQuery(),\r
      update = () => setReduced(media.matches);\r
    media.addEventListener("change", update);\r
    update();\r
    return () => media.removeEventListener("change", update);\r
  }, []);\r
  return reduced;\r
}\r
export function useMotion() {\r
  const reduced = useReducedMotion();\r
  const [explicit, setExplicit] = useState<boolean | undefined>(() =>\r
    typeof document === "undefined"\r
      ? undefined\r
      : document.documentElement.dataset.adMotion === "off"\r
        ? false\r
        : document.documentElement.dataset.adMotion === "on"\r
          ? true\r
          : undefined,\r
  );\r
  useEffect(() => {\r
    if (typeof document === "undefined") return;\r
    const root = document.documentElement,\r
      update = () =>\r
        setExplicit(\r
          root.dataset.adMotion === "off"\r
            ? false\r
            : root.dataset.adMotion === "on"\r
              ? true\r
              : undefined,\r
        );\r
    const observer = new MutationObserver(update);\r
    observer.observe(root, {\r
      attributes: true,\r
      attributeFilter: ["data-ad-motion"],\r
    });\r
    update();\r
    return () => observer.disconnect();\r
  }, []);\r
  return explicit ?? !reduced;\r
}\r
`;export{e as default};
