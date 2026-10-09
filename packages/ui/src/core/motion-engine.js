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
const measurements = new Set();
let raf = null,
  timer = null,
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
const pendingAnimations = new Set();
const pendingTargets = new Set();
let active = [];
let lastScan = -Infinity;
let needsScan = false;
/* Plain listeners on the same clock (playback positions, meters): they run whether or not
   motion is on, but share its frames instead of asking for their own. */
const tickers = new Set();
U.subscribeTick = (listener) => {
  tickers.add(listener);
  schedule();
  return () => {
    tickers.delete(listener);
    schedule();
  };
};
const isLoop = (animation) => {
  if (!animation.animationName || !animation.animationName.startsWith("ad-")) return false;
  const timing = animation.effect && animation.effect.getTiming();
  return !!timing && timing.iterations === Infinity;
};
function scan(now, animations = pendingAnimations) {
  lastScan = now;
  needsScan = false;
  // Native discovery can flush layout; read each event target once per shared frame.
  for (const target of pendingTargets)
    for (const animation of target.getAnimations?.() || []) pendingAnimations.add(animation);
  pendingTargets.clear();
  for (const animation of animations)
    if (!looping.has(animation) && animation.playState === "running" && isLoop(animation)) {
      animation.__adStart = now - (animation.currentTime || 0);
      animation.pause();
      looping.add(animation);
    }
  pendingAnimations.clear();
  active = [];
  for (const animation of looping) {
    const target = animation.effect && animation.effect.target;
    // Gone, turned into a one-off (motion switched off) or replaced: hand it back.
    if (!target || !target.isConnected || animation.playState === "idle" || !isLoop(animation)) {
      looping.delete(animation);
      if (target && target.isConnected && animation.playState === "paused") animation.play();
      continue;
    }
    const hidden = document.hidden || target.closest("[data-ad-offscreen]");
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
  if (needsScan || now - lastScan > 400) scan(now);
  // Border geometry can flush layout. Spread visible mount/resize work across frames.
  // Unseen borders keep their pending measurement without forcing it.
  const deadline = performance.now() + 8;
  for (const item of measurements) {
    if (!item.element.isConnected) {
      measurements.delete(item);
      continue;
    }
    if (item.element._adInView === false) continue;
    if (performance.now() >= deadline) break;
    measurements.delete(item);
    item.sync();
  }
  if (now - last >= FRAME - 6) {
    for (const animation of active) animation.currentTime = now - animation.__adStart;
    for (const scope of running) scope.tick(now);
    for (const listener of tickers) listener(now);
    last = now;
  }
  // Sleep until the next tick is due instead of asking for every screen refresh: a request
  // for an animation frame makes the browser prepare a frame even when nothing changes.
  if (hasVisibleWork() && !document.hidden) {
    timer = setTimeout(() => {
      timer = null;
      schedule();
    }, Math.max(0, FRAME - (performance.now() - now) - 4));
  }
}
function hasVisibleWork() {
  if (needsScan || tickers.size || active.length) return true;
  for (const item of measurements)
    if (item.element.isConnected && item.element._adInView !== false) return true;
  for (const scope of running)
    if (scope.enabled)
      for (const node of scope.callbacks.keys())
        if (node.isConnected && node._adInView !== false) return true;
  return false;
}
function schedule() {
  if (document.hidden || !hasVisibleWork()) {
    if (raf !== null) cancelAnimationFrame(raf);
    if (timer !== null) clearTimeout(timer);
    raf = timer = null;
    return;
  }
  if (raf === null && timer === null) raf = requestAnimationFrame(tick);
}
export function refreshMotion() {
  // A route can detach dozens of offscreen boundaries in one React commit.
  // Scan once on the shared frame, not once per boundary while the old DOM exists.
  needsScan = true;
  schedule();
}
const wake = () => {
  for (const s of running) s.previous = null;
  // Hold CSS clocks once before sleeping, not for every hidden boundary cleanup.
  if (document.hidden) scan(performance.now());
  refreshMotion();
};
// Discover CSS loops when they start, including pseudo-elements. No polling of the
// consumer's document is needed while the kit is idle or while effects are running.
if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("visibilitychange", wake);
  const onAnimation = (event) => {
    if (!event.animationName.startsWith("ad-")) return;
    pendingTargets.add(event.target);
    needsScan = true;
    schedule();
  };
  document.addEventListener("animationstart", onAnimation);
  document.addEventListener("animationcancel", onAnimation);
  scan(performance.now(), document.getAnimations?.() || []);
  schedule();
}
let scopeCount = 0;
let preferenceMedia = null;
const preferenceScopes = new Set();
const onPreference = (event) => {
  for (const scope of preferenceScopes)
    if (!scope.explicit) scope.set(!event.matches, false);
};
let visibilityObserver = null;
const visibilityScopes = new Map();
const observeScope = (node, scope) => {
  if (!canObserveIntersection()) return;
  let scopes = visibilityScopes.get(node);
  if (!scopes) {
    scopes = new Set();
    visibilityScopes.set(node, scopes);
    visibilityObserver ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target._adInView = entry.isIntersecting;
          for (const watcher of visibilityScopes.get(entry.target) || []) watcher.previous = null;
        }
        schedule();
      },
      { rootMargin: "10%" },
    );
    visibilityObserver.observe(node);
  }
  scopes.add(scope);
};
const unobserveScope = (node, scope) => {
  const scopes = visibilityScopes.get(node);
  if (!scopes) return;
  scopes.delete(scope);
  if (scopes.size) return;
  visibilityScopes.delete(node);
  visibilityObserver.unobserve(node);
  if (!visibilityScopes.size) {
    visibilityObserver.disconnect();
    visibilityObserver = null;
  }
};
U.createMotion = (root = document) => {
  scopeCount++;
  if (!preferenceMedia) {
    preferenceMedia = reducedMotionQuery();
    preferenceMedia.addEventListener("change", onPreference);
  }
  const scope = {
    root,
    enabled: !preferenceMedia.matches,
    time: 0,
    previous: null,
    explicit: false,
    callbacks: new Map(),
    tick(now) {
      if (!this.enabled) {
        this.previous = null;
        return;
      }
      let painted = false;
      for (const [node, fn] of this.callbacks) {
        if (!node.isConnected) {
          this.callbacks.delete(node);
          unobserveScope(node, this);
          continue;
        }
        if (node._adInView === true || (node._adInView !== false && node.getClientRects().length)) {
          if (!painted) {
            if (this.previous !== null)
              this.time += Math.min((now - this.previous) / 1000, 0.1);
            this.previous = now;
            painted = true;
          }
          fn(this.time);
        }
      }
      if (!painted) this.previous = null;
    },
    add(node, callback, immediate = true) {
      this.callbacks.set(node, callback);
      if (immediate) callback(this.time);
      observeScope(node, this);
      schedule();
      return () => {
        this.callbacks.delete(node);
        unobserveScope(node, this);
        schedule();
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
      for (const node of this.callbacks.keys()) unobserveScope(node, this);
      this.callbacks.clear();
      preferenceScopes.delete(this);
      if (!preferenceScopes.size) {
        preferenceMedia.removeEventListener("change", onPreference);
        preferenceMedia = null;
      }
      schedule();
    },
  };
  preferenceScopes.add(scope);
  scope.set(scope.enabled, false);
  return scope;
};

U.roundedPath = (w, h, r) => {
  const i = 0.65,
    R = w - i,
    B = h - i;
  r = Math.max(0, Math.min(r - i, (w - 2 * i) / 2, (h - 2 * i) / 2));
  const d = r
    ? `M${i + r} ${i}H${R - r}A${r} ${r} 0 0 1 ${R} ${i + r}V${B - r}A${r} ${r} 0 0 1 ${R - r} ${B}H${i + r}A${r} ${r} 0 0 1 ${i} ${B - r}V${i + r}A${r} ${r} 0 0 1 ${i + r} ${i}Z`
    : `M${i} ${i}H${R}V${B}H${i}Z`;
  const horizontal = Math.abs(R - i - 2 * r),
    vertical = Math.abs(B - i - 2 * r),
    arc = Math.PI * r / 2,
    dx = Math.sign(R - i),
    dy = Math.sign(B - i);
  const segments = [
    { length: horizontal, x: i + r, y: i, dx, dy: 0 },
    { length: arc, x: R - r, y: i + r, angle: -Math.PI / 2 },
    { length: vertical, x: R, y: i + r, dx: 0, dy },
    { length: arc, x: R - r, y: B - r, angle: 0 },
    { length: horizontal, x: R - r, y: B, dx: -dx, dy: 0 },
    { length: arc, x: i + r, y: B - r, angle: Math.PI / 2 },
    { length: vertical, x: i, y: B - r, dx: 0, dy: -dy },
    { length: arc, x: i + r, y: i + r, angle: Math.PI },
  ];
  const length = 2 * (horizontal + vertical) + 4 * arc;
  return {
    d,
    point(fraction) {
      let distance = fraction * length;
      for (const segment of segments) {
        if (segment.length && distance <= segment.length) {
          if (segment.angle !== undefined) {
            const angle = segment.angle + distance / r;
            return { x: segment.x + r * Math.cos(angle), y: segment.y + r * Math.sin(angle) };
          }
          return { x: segment.x + segment.dx * distance, y: segment.y + segment.dy * distance };
        }
        distance -= segment.length;
      }
      return { x: i + r, y: i };
    },
  };
};
const borders = new WeakMap();
/* [stroke width, opacity] of the halo layers, widest first. Edges 3px apart and opacities fitted
   to the old feGaussianBlur(4.2) of a 7.5px stroke, so the steps blend instead of banding. */
const AURA = [[25, 0.016], [22, 0.031], [19, 0.055], [16, 0.087], [13, 0.124], [10, 0.157], [7, 0.17], [4, 0.153]];
let borderSerial = 0;
/* Room around the element for the halo (half the widest AURA stroke, rounded up). */
const HALO = 16;
const CORE_STOPS = [
  ["var(--ad-neutral-200)", 0], ["var(--ad-neutral-200)", 4], ["var(--ad-secondary)", 16],
  ["rgb(from var(--ad-primary) r g b / 0.85)", 40], ["rgb(from var(--ad-primary) r g b / 0.32)", 72],
  ["rgb(from var(--ad-primary) r g b / 0)", 100],
];
const AURA_STOPS = [
  ["var(--ad-primary)", 0], ["rgb(from var(--ad-primary) r g b / 0.7)", 40],
  ["rgb(from var(--ad-primary) r g b / 0)", 100],
];
const radial = (stops) =>
  `radial-gradient(circle closest-side, ${stops.map(([color, at]) => `${color} ${at}%`).join(", ")})`;
/** The ring a light shows through, as a still mask picture of the contour's strokes. */
const ringMask = (w, h, d, strokes) => {
  const paths = strokes
    .map(([width, opacity]) => `<path d='${d}' stroke-width='${width}' stroke-opacity='${opacity}'/>`)
    .join("");
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${-HALO} ${-HALO} ${w + 2 * HALO} ${h + 2 * HALO}'>` +
      `<g fill='none' stroke='#000' stroke-linecap='round' stroke-linejoin='round'>${paths}</g></svg>`,
  )}")`;
};
/* The early-release border: two broad lights travel the edge at different speeds, each with a
   soft aura and a fine bright core. The rings are still mask pictures, painted once per size;
   each light is a soft spot under them that only moves. A frame of the border is then four
   transforms on the compositor: nothing is repainted and nothing is re-blurred. */
U.attachBorder = (element, { shell = false, round = false, scope, defer = false } = {}) => {
  if (borders.has(element)) return borders.get(element);
  defer &&= !!scope;
  if (defer && canObserveIntersection()) element._adInView = false;
  let radius = round ? 28 : shell ? 102 : 116;
  const overlay = document.createElement("div");
  overlay.className = "ad-border";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("data-ad-component", "AnimatedBorder");
  // The fine static edge the lights run along.
  const edge = U.svg("svg", { fill: "none", preserveAspectRatio: "none" });
  const path = U.svg("path", {
    stroke: shell ? "rgb(from var(--ad-secondary) r g b / 0.65)" : "rgb(from var(--ad-primary) r g b / 0.16)",
    "stroke-width": shell ? 1.1 : 0.6,
  });
  edge.append(path);
  const ring = (className) => {
    const node = document.createElement("div");
    node.className = className;
    return node;
  };
  const aura = ring("ad-border-aura"), core = ring("ad-border-core");
  overlay.append(edge, aura, core);
  const instancePhase = (++borderSerial * 0.38196601125) % 1;
  const lights = Array.from({ length: 2 }, (_, k) => {
    const spot = (parent, stops) => {
      const node = ring("ad-border-light");
      node.style.background = radial(stops);
      parent.append(node);
      return node;
    };
    return {
      radius,
      phase: (k * 0.48 + 0.535 + instancePhase) % 1,
      speed: round ? (k ? 25 : 36) : k ? 86 : 125,
      spots: [spot(aura, AURA_STOPS), spot(core, CORE_STOPS)],
      at: null,
    };
  });
  const previousInlinePosition = element.style.position;
  element.append(overlay);
  const item = {
    element, overlay, path, lights, length: 0, elapsed: 0, previousTime: null,
    lastFrame: -Infinity, patchedPosition: false, previousInlinePosition,
  };
  item.paint = (time) => {
    if (!item.length) return;
    if (item.previousTime !== null)
      item.elapsed += Math.min(0.1, Math.max(0, time - item.previousTime));
    item.previousTime = time;
    for (const light of lights) {
      const p = item.contour.point(((light.phase * item.length + item.elapsed * light.speed) % item.length) / item.length);
      light.at = p;
      const transform = `translate3d(${(p.x - radius + HALO).toFixed(2)}px, ${(p.y - radius + HALO).toFixed(2)}px, 0)`;
      for (const spot of light.spots) spot.style.transform = transform;
    }
  };
  item.sync = () => {
    const w = element.offsetWidth,
      h = element.offsetHeight;
    if (!w || !h) return;
    const computed = getComputedStyle(element);
    const corner = computed.borderTopLeftRadius;
    if (computed.position === "static") {
      item.patchedPosition = true;
      element.style.position = "relative";
    }
    const r = corner.includes("%")
      ? (Math.min(w, h) * parseFloat(corner)) / 100
      : parseFloat(corner) || 0;
    item.contour = U.roundedPath(w, h, r);
    const { d } = item.contour;
    edge.setAttribute("viewBox", `0 0 ${w} ${h}`);
    path.setAttribute("d", d);
    for (const [node, strokes] of [[aura, AURA], [core, [[shell ? 1.9 : 1.35, 1]]]]) {
      const mask = ringMask(w, h, d, strokes);
      node.style.maskImage = mask;
      node.style.webkitMaskImage = mask;
    }
    item.length = path.getTotalLength();
    radius = round ? 28 : Math.min(260, Math.max(42, item.length * 0.153));
    for (const light of lights) {
      light.radius = radius;
      for (const spot of light.spots) {
        spot.style.width = `${radius * 2}px`;
        spot.style.height = `${radius * 2}px`;
      }
    }
    item.paint(scope?.time || 0);
  };
  const queueMeasurement = () => {
    if (item.destroyed) return;
    measurements.add(item);
    schedule();
  };
  item.observer = createResizeObserver(defer ? queueMeasurement : item.sync);
  item.observer.observe(element);
  if (defer) queueMeasurement();
  else item.sync();
  const unsubscribe = scope?.add(element, (time) => {
    // Keep the ambient orbit on a slower clock while idle; interaction immediately restores
    // the full clock rate.
    if (!element.matches?.(":hover, :focus-within") && time - item.lastFrame < 0.09) return;
    item.lastFrame = time;
    item.paint(time);
  }, !defer);
  item.destroy = () => {
    item.destroyed = true;
    measurements.delete(item);
    unsubscribe?.();
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
    floor = U.svg("path", { class: "tab-shape__floor" });
  shape.append(glow, edge, floor);
  /* The running glint lives in a drawing of its own above the shape: it is the only part that
     repaints, and its glow is two faint wider copies of the dash instead of a filter, so the
     blurred glow and floor below are painted once. */
  const glints = U.svg("svg", {
    class: "tab-shape ad-tab-shape ad-tab-shape-glint",
    "aria-hidden": "true",
    fill: "none",
    preserveAspectRatio: "none",
  });
  const glint = ["wide", "near", "core"].map((part) =>
    U.svg("path", { class: "tab-shape__glint", "data-part": part, pathLength: 100 }),
  );
  glints.append(...glint);
  button.prepend(shape, glints);
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
    glints.setAttribute("viewBox", `0 0 ${w} ${h}`);
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
    for (const path of [glow, edge, ...glint]) path.setAttribute("d", d);

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
      glints.remove();
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
    scheduled: raf !== null || timer !== null,
    callbacks: [...running].reduce((n, s) => n + s.callbacks.size, 0),
  };
}
