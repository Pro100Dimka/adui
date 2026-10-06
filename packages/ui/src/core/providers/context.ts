import { reducedMotionQuery } from "../environment";
import { useSyncExternalStore } from "react";

const subscribers = new Set<() => void>();
let media: MediaQueryList | undefined;
let observer: MutationObserver | undefined;
const notify = () => subscribers.forEach((subscriber) => subscriber());
const subscribe = (subscriber: () => void) => {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    media = reducedMotionQuery();
    media.addEventListener("change", notify);
    if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ad-motion"] });
    }
  }
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      media?.removeEventListener("change", notify);
      observer?.disconnect();
      media = undefined;
      observer = undefined;
    }
  };
};
const reducedMotion = () => media?.matches ?? reducedMotionQuery().matches;
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, reducedMotion, () => false);
}
/** Read the current motion setting only when an interaction needs it. */
export function motionEnabled() {
  const setting = typeof document === "undefined" ? undefined : document.documentElement.dataset.adMotion;
  return setting === "on" || (setting !== "off" && !reducedMotion());
}
export function useMotion() {
  return useSyncExternalStore(subscribe, motionEnabled, () => true);
}
