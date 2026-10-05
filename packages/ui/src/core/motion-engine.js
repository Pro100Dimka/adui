import {
  canObserveIntersection,
  createResizeObserver,
  reducedMotionQuery,
} from "./environment";
/* Shared SVG effect engine retained from the approved DOM library.
   React owns attachment / detachment through useLayoutEffect. No component DOM is built here. */
let uid = 0;
const U = {
  uid: (p = "ad") => `${p}-${++uid}`,
  svg(tag, attrs = {}) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  },
};
const seen = new WeakMap();
const running = new Set();
let raf = null,
  last = 0;

/* The motion clock. Every looping decoration of the library (glows, glints, comets, border
   lights) is stepped here, together with the scripted ones, 30 times a second and all at once.
   The page then composes 30 frames a second instead of 60 — half the work for the GPU (or the
   CPU on machines without one) — and nothing moves between ticks to ask for extra frames.
   One-off motion (entrances, hovers, menus) is left to the browser at full rate; anything out
   of view (inside [data-ad-offscreen]) is not touched at all. */
/* 30 frames a second by default; machines with few cores or little memory get 20, which halves
   their work again while every effect keeps moving the same way. */
const weakDevice =
  typeof navigator !== "undefined" &&
  ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4);
let FRAME = 1000 / (weakDevice ? 20 : 30);
/** Frames per second of the motion clock (default 30); fewer is lighter, 60 is the screen's rate. */
U.setMotionFrameRate = (fps) => {
  FRAME = 1000 / Math.max(1, Math.min(120, fps));
};
const looping = new Set();
let active = [];
let lastScan = -Infinity;
/* Plain listeners on the same clock (playback positions, meters): they run whether or not
   motion is on, but share its frames instead of asking for their own. */
const tickers = new Set();
U.subscribeTick = (listener) => {
  tickers.add(listener);
  schedule();
  return () => tickers.delete(listener);
};
const isLoop = (animation) => {
  if (!animation.animationName || !animation.animationName.startsWith("ad-")) return false;
  const timing = animation.effect && animation.effect.getTiming();
  return !!timing && timing.iterations === Infinity;
};
function scan(now) {
  lastScan = now;
  if (typeof document.getAnimations !== "function") return;
  for (const animation of document.getAnimations())
    if (!looping.has(animation) && animation.playState === "running" && isLoop(animation)) {
      animation.__adStart = now - (animation.currentTime || 0);
      animation.pause();
      looping.add(animation);
    }
  active = [];
  for (const animation of looping) {
    const target = animation.effect && animation.effect.target;
    // Gone, turned into a one-off (motion switched off) or replaced: hand it back.
    if (!target || !target.isConnected || animation.playState === "idle" || !isLoop(animation)) {
      looping.delete(animation);
      if (target && target.isConnected && animation.playState === "paused") animation.play();
      continue;
    }
    const hidden = target.closest("[data-ad-offscreen]");
    if (hidden) {
      // Resume where it stopped once back in view.
      animation.__adHeld = true;
      continue;
    }
    if (animation.__adHeld) {
      animation.__adStart = now - (animation.currentTime || 0);
      animation.__adHeld = false;
    }
    active.push(animation);
  }
}
function tick(now) {
  raf = null;
  if (now - last >= FRAME - 6) {
    if (now - lastScan > 400) scan(now);
    for (const animation of active) animation.currentTime = now - animation.__adStart;
    for (const scope of running) scope.tick(now);
    for (const listener of tickers) listener(now);
    last = now;
  }
  // Sleep until the next tick is due instead of asking for every screen refresh: a request
  // for an animation frame makes the browser prepare a frame even when nothing changes.
  if ((running.size || looping.size || tickers.size || now - lastScan < 1500) && !document.hidden) {
    raf = 0;
    setTimeout(() => {
      raf = document.hidden ? null : requestAnimationFrame(tick);
    }, Math.max(0, FRAME - (performance.now() - now) - 4));
  }
}
function schedule() {
  if (raf === null && !document.hidden) raf = requestAnimationFrame(tick);
}
const wake = () => {
  for (const s of running) s.previous = null;
  lastScan = -Infinity;
  schedule();
};
// New loops appear as components mount; a light check twice a second picks them up.
if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("visibilitychange", wake);
  setInterval(() => {
    if (!document.hidden && raf === null) schedule();
  }, 500);
  schedule();
}
let scopeCount = 0;
U.createMotion = (root = document) => {
  scopeCount++;
  const media = reducedMotionQuery();
  const scope = {
    root,
    enabled: !media.matches,
    time: 0,
    previous: null,
    explicit: false,
    callbacks: new Map(),
    observers: [],
    tick(now) {
      if (!this.enabled) {
        this.previous = null;
        return;
      }
      if (this.previous !== null)
        this.time += Math.min((now - this.previous) / 1000, 0.1);
      this.previous = now;
      for (const [node, fn] of this.callbacks) {
        if (!node.isConnected) {
          this.callbacks.delete(node);
          continue;
        }
        if (node.getClientRects().length && node._adInView !== false)
          fn(this.time);
      }
    },
    add(node, callback) {
      this.callbacks.set(node, callback);
      callback(this.time);
      this.intersection?.observe(node);
      return () => {
        this.callbacks.delete(node);
        this.intersection?.unobserve(node);
      };
    },
    set(enabled, explicit = true) {
      this.enabled = !!enabled;
      this.explicit ||= explicit;
      this.previous = null;
      const target =
        root instanceof HTMLElement
          ? root
          : root.host || document.documentElement;
      target.dataset.adMotion = enabled ? "on" : "off";
      if (this.enabled) running.add(this);
      else running.delete(this);
      schedule();
      return this.enabled;
    },
    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      --scopeCount;
      running.delete(this);
      this.callbacks.clear();
      this.intersection?.disconnect();
      media.removeEventListener("change", this.onPreference);
    },
  };
  scope.intersection = canObserveIntersection()
    ? new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => (e.target._adInView = e.isIntersecting)),
        { rootMargin: "10%" },
      )
    : null;
  scope.onPreference = (e) => {
    if (!scope.explicit) scope.set(!e.matches, false);
  };
  media.addEventListener("change", scope.onPreference);
  scope.set(scope.enabled, false);
  return scope;
};

U.roundedPath = (w, h, r) => {
  const i = 0.65,
    R = w - i,
    B = h - i;
  r = Math.max(0, Math.min(r - i, (w - 2 * i) / 2, (h - 2 * i) / 2));
  return r
    ? `M${i + r} ${i}H${R - r}A${r} ${r} 0 0 1 ${R} ${i + r}V${B - r}A${r} ${r} 0 0 1 ${R - r} ${B}H${i + r}A${r} ${r} 0 0 1 ${i} ${B - r}V${i + r}A${r} ${r} 0 0 1 ${i + r} ${i}Z`
    : `M${i} ${i}H${R}V${B}H${i}Z`;
};
const borders = new WeakMap();
/* The animated border: two lights travel round the element's edge, each a soft glow seen through
   three ring-shaped windows (a wide haze, an aura, a thin bright core) centred on the edge.
   The lights move along a CSS motion path, so the browser composites them: nothing is
   repainted per frame and no script runs while they move. */
const BORDER_RINGS = [
  ["haze", 13],
  ["aura", 6.5],
  ["core", 1.35],
];
U.attachBorder = (element, { shell = false, round = false } = {}) => {
  if (borders.has(element)) return borders.get(element);
  const overlay = document.createElement("span");
  overlay.className = "ad-border";
  overlay.setAttribute("aria-hidden", "true");
  overlay.dataset.adComponent = "AnimatedBorder";
  if (shell) overlay.dataset.shell = "";
  if (round) overlay.dataset.round = "";
  const outline = document.createElement("span");
  outline.className = "ad-border-outline";
  overlay.append(outline);
  const speeds = round ? [36, 25] : [125, 86];
  const lights = [];
  for (const [kind, width] of BORDER_RINGS) {
    const ring = document.createElement("span");
    ring.className = "ad-border-ring";
    ring.dataset.ring = kind;
    ring.style.setProperty("--ad-ring", `${width}px`);
    for (let k = 0; k < 2; k++) {
      const light = document.createElement("i");
      light.className = "ad-border-light";
      ring.append(light);
      lights.push({ light, k });
    }
    overlay.append(ring);
  }
  const computedPosition = getComputedStyle(element).position;
  const patchedPosition = computedPosition === "static";
  const previousInlinePosition = element.style.position;
  if (patchedPosition) element.style.position = "relative";
  element.append(overlay);
  const item = { element, overlay, patchedPosition, previousInlinePosition };
  // Each light keeps its own speed in px/s, so its lap time follows the edge's length.
  item.sync = () => {
    const w = element.offsetWidth,
      h = element.offsetHeight;
    if (!w || !h) return;
    const corner = getComputedStyle(element).borderTopLeftRadius;
    const r = Math.min(
      corner.includes("%") ? (Math.min(w, h) * parseFloat(corner)) / 100 : parseFloat(corner) || 0,
      w / 2,
      h / 2,
    );
    const perimeter = 2 * (w + h) - 8 * r + 2 * Math.PI * r;
    overlay.style.setProperty("--ad-border-r", `${r}px`);
    for (const { light, k } of lights) {
      const lap = perimeter / speeds[k];
      const phase = (k * 0.48 + 0.535) % 1;
      light.style.animationDuration = `${lap.toFixed(2)}s`;
      light.style.animationDelay = `${(-phase * lap).toFixed(2)}s`;
    }
  };
  item.observer = createResizeObserver(item.sync);
  item.observer.observe(element);
  item.sync();
  item.destroy = () => {
    item.observer.disconnect();
    overlay.remove();
    if (item.patchedPosition) element.style.position = item.previousInlinePosition;
    borders.delete(element);
  };
  borders.set(element, item);
  return item;
};
U.attachTabShape = (button) => {
  if (seen.has(button)) return seen.get(button);
  const id = U.uid("ad-tab-fill"),
    shape = U.svg("svg", {
      class: "tab-shape ad-tab-shape",
      "aria-hidden": "true",
      fill: "none",
      preserveAspectRatio: "none",
    });
  const defs = U.svg("defs"),
    grad = U.svg("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 });
  [
    [0, "var(--ad-primary-700)", 0.77],
    [0.38, "var(--ad-primary-900)", 0.86],
    [0.76, "var(--ad-primary-900)", 0.94],
    [1, "var(--ad-primary-600)", 0.94],
  ].forEach(([offset, color, opacity]) =>
    grad.append(
      U.svg("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
    ),
  );
  defs.append(grad);
  shape.append(defs);
  const glow = U.svg("path", { class: "tab-shape__glow" }),
    edge = U.svg("path", { class: "tab-shape__edge", fill: `url(#${id})` }),
    glint = U.svg("path", { class: "tab-shape__glint", pathLength: 100 }),
    floor = U.svg("path", { class: "tab-shape__floor" });
  shape.append(glow, edge, glint, floor);
  button.prepend(shape);
  button.dataset.adShapeReady = "";
  const position = () => {
    const siblings = [...(button.parentElement?.children || [])].filter(
      (node) =>
        node instanceof HTMLElement && node.getAttribute("role") === "tab",
    );
    const index = siblings.indexOf(button);
    return {
      first: index === 0,
      last: index === siblings.length - 1,
      single: siblings.length === 1,
    };
  };
  const sync = () => {
    const w = button.offsetWidth,
      h = button.offsetHeight;
    if (!w || !h) return;
    shape.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const { first, last, single } = position();
    const top = 1.5,
      bottom = h - 1.5,
      outer = 1.2;
    const shoulder = Math.min(24, w * 0.11),
      corner = Math.min(34, w * 0.19),
      sideLift = Math.min(13, h * 0.28);
    const notchWidth = Math.min(10, w * 0.05),
      notchDepth = Math.min(3.5, h * 0.08);
    const radius = Math.min(10, h * 0.22, w * 0.05);

    const leftOuter = single || first;
    const rightOuter = single || last;
    let d = `M${w / 2 - notchWidth} ${bottom}`;

    // bottom -> left edge
    if (leftOuter) {
      d += `H${outer + radius}Q${outer} ${bottom} ${outer} ${bottom - radius}V${top + radius}Q${outer} ${top} ${outer + radius} ${top}`;
    } else {
      d += `H${outer + 4.5}Q${outer + 1.5} ${bottom - 0.3} ${outer + 4.5} ${bottom - sideLift}L${shoulder} 13Q${shoulder + 4} ${top} ${corner} ${top}`;
    }

    // top edge -> right edge
    d += `H${rightOuter ? w - (outer + radius) : w - corner}`;
    if (rightOuter) {
      d += `Q${w - outer} ${top} ${w - outer} ${top + radius}V${bottom - radius}Q${w - outer} ${bottom} ${w - (outer + radius)} ${bottom}`;
    } else {
      d += `Q${w - shoulder - 4} ${top} ${w - shoulder} 13L${w - (outer + 4.5)} ${bottom - sideLift}Q${w - (outer + 1.5)} ${bottom - 0.3} ${w - (outer + 4.5)} ${bottom}`;
    }

    d += `H${w / 2 + notchWidth}L${w / 2} ${bottom + notchDepth}L${w / 2 - notchWidth} ${bottom}Z`;
    for (const path of [glow, edge, glint]) path.setAttribute("d", d);

    const floorLeft = leftOuter ? outer + radius : outer + 5;
    const floorRight = rightOuter ? w - (outer + radius) : w - (outer + 5);
    floor.setAttribute(
      "d",
      `M${floorLeft} ${bottom}H${w / 2 - notchWidth - 1}L${w / 2} ${bottom + notchDepth}L${w / 2 + notchWidth + 1} ${bottom}H${floorRight}`,
    );
    button.dataset.adTabEdge = single
      ? "single"
      : first
        ? "first"
        : last
          ? "last"
          : "middle";
  };
  const observer = createResizeObserver(sync);
  observer.observe(button);
  if (button.parentElement) observer.observe(button.parentElement);
  sync();
  const item = {
    observer,
    shape,
    sync,
    destroy() {
      observer.disconnect();
      shape.remove();
      button.removeAttribute("data-ad-shape-ready");
      button.removeAttribute("data-ad-tab-edge");
      seen.delete(button);
    },
  };
  seen.set(button, item);
  return item;
};

export const createMotion = U.createMotion;
export const attachBorder = U.attachBorder;
export const attachTabShape = U.attachTabShape;
export const setMotionFrameRate = U.setMotionFrameRate;
export const subscribeTick = U.subscribeTick;
/** Diagnostic snapshot for lifecycle tests; not used to render the UI. */
export function getMotionStats() {
  return {
    scopes: scopeCount,
    running: running.size,
    scheduled: raf !== null,
    callbacks: [...running].reduce((n, s) => n + s.callbacks.size, 0),
  };
}
