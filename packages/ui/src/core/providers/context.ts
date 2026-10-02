import { useEffect, useState } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
export function useMotion() {
  const reduced = useReducedMotion();
  const [explicit, setExplicit] = useState<boolean | undefined>(() =>
    typeof document === "undefined"
      ? undefined
      : document.documentElement.dataset.adMotion === "off"
        ? false
        : document.documentElement.dataset.adMotion === "on"
          ? true
          : undefined,
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement,
      update = () =>
        setExplicit(
          root.dataset.adMotion === "off"
            ? false
            : root.dataset.adMotion === "on"
              ? true
              : undefined,
        );
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-ad-motion"],
    });
    update();
    return () => observer.disconnect();
  }, []);
  return explicit ?? !reduced;
}
