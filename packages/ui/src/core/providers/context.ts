import { createContext, useContext, useEffect, useState } from "react";

export const MotionContext = createContext<boolean | null>(null);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useMotion() {
  const explicit = useContext(MotionContext);
  const reduced = useReducedMotion();
  return explicit ?? !reduced;
}
