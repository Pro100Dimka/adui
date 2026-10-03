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
function tick(now) {
  raf = null;
  if (now - last > 1000 / 30) {
    for (const scope of running) scope.tick(now);
    last = now;
  }
  if (running.size && !document.hidden) raf = requestAnimationFrame(tick);
}
function schedule() {
  if (raf === null && running.size && !document.hidden)
    raf = requestAnimationFrame(tick);
}
const wake = () => {
  for (const s of running) s.previous = null;
  schedule();
};
let scopeCount = 0;
U.createMotion = (root = document) => {
  if (scopeCount++ === 0) document.addEventListener("visibilitychange", wake);
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
      if (--scopeCount === 0) {
        document.removeEventListener("visibilitychange", wake);
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      }
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
U.attachBorder = (element, { shell = false, round = false, scope } = {}) => {
  if (borders.has(element)) return borders.get(element);
  const radius = round ? 28 : shell ? 102 : 116;
  const overlay = U.svg("svg", {
    class: "ad-border",
    "aria-hidden": "true",
    focusable: "false",
    fill: "none",
    "data-ad-component": "AnimatedBorder",
  });
  const defs = U.svg("defs"),
    path = U.svg("path", {
      fill: "none",
      stroke: shell ? "rgb(from var(--ad-secondary) r g b / 0.65)" : "rgb(from var(--ad-primary) r g b / 0.16)",
      "stroke-width": shell ? 1.1 : 0.6,
    });
  overlay.append(defs, path);
  const lights = [];
  for (let k = 0; k < 2; k++) {
    const id = U.uid("ad-orbit");
    const gradient = U.svg("radialGradient", {
      id,
      gradientUnits: "userSpaceOnUse",
      r: radius,
    });
    for (const [offset, color, opacity] of [
      [0, "var(--ad-neutral-200)", 1],
      [0.04, "var(--ad-neutral-200)", 1],
      [0.16, "var(--ad-secondary)", 1],
      [0.4, "var(--ad-primary)", 0.85],
      [0.72, "var(--ad-primary)", 0.32],
      [1, "var(--ad-primary)", 0],
    ])
      gradient.append(
        U.svg("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
      );
    const red = U.svg("radialGradient", {
      id: `${id}-red`,
      gradientUnits: "userSpaceOnUse",
      r: radius,
    });
    for (const [offset, opacity] of [
      [0, 1],
      [0.4, 0.7],
      [1, 0],
    ])
      red.append(
        U.svg("stop", {
          offset,
          "stop-color": "var(--ad-primary)",
          "stop-opacity": opacity,
        }),
      );
    const blur = U.svg("filter", {
      id: `${id}-blur`,
      filterUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: radius * 2 + 28,
      height: radius * 2 + 28,
      "color-interpolation-filters": "sRGB",
    });
    blur.append(U.svg("feGaussianBlur", { stdDeviation: 4.2 }));
    defs.append(gradient, red, blur);
    const aura = U.svg("path", {
      fill: "none",
      stroke: `url(#${id}-red)`,
      "stroke-width": 7.5,
      filter: `url(#${id}-blur)`,
      opacity: 0.94,
    });
    const core = U.svg("path", {
      fill: "none",
      stroke: `url(#${id})`,
      "stroke-width": shell ? 1.9 : 1.35,
    });
    overlay.append(aura, core);
    lights.push({
      gradient,
      red,
      blur,
      radius,
      phase: (k * 0.48 + 0.535) % 1,
      speed: round ? (k ? 25 : 36) : k ? 86 : 125,
      paths: [aura, core],
    });
  }
  const computedPosition = getComputedStyle(element).position;
  const patchedPosition = computedPosition === "static";
  const previousInlinePosition = element.style.position;
  if (patchedPosition) element.style.position = "relative";
  Object.assign(overlay.style, {
    inset: "0",
    width: "100%",
    height: "100%",
    overflow: "visible",
  });
  overlay.setAttribute("width", "100%");
  overlay.setAttribute("height", "100%");
  overlay.setAttribute("preserveAspectRatio", "none");
  element.append(overlay);
  const item = {
    element,
    overlay,
    path,
    lights,
    length: 0,
    patchedPosition,
    previousInlinePosition,
  };
  item.paint = (time) => {
    if (!item.length) return;
    for (const light of lights) {
      const p = path.getPointAtLength(
        (light.phase * item.length + time * light.speed) % item.length,
      );
      for (const g of [light.gradient, light.red]) {
        g.setAttribute("cx", p.x.toFixed(2));
        g.setAttribute("cy", p.y.toFixed(2));
      }
      light.blur.setAttribute("x", (p.x - radius - 14).toFixed(1));
      light.blur.setAttribute("y", (p.y - radius - 14).toFixed(1));
    }
  };
  item.sync = () => {
    const w = element.offsetWidth,
      h = element.offsetHeight;
    if (!w || !h) return;
    const s = getComputedStyle(element),
      corner = s.borderTopLeftRadius;
    const r = corner.includes("%")
      ? (Math.min(w, h) * parseFloat(corner)) / 100
      : parseFloat(corner) || 0;
    const d = U.roundedPath(w, h, r);
    overlay.setAttribute("viewBox", `0 0 ${w} ${h}`);
    path.setAttribute("d", d);
    for (const l of lights) for (const p of l.paths) p.setAttribute("d", d);
    item.length = path.getTotalLength();
    item.paint(scope?.time || 0);
  };
  item.observer = createResizeObserver(item.sync);
  item.observer.observe(element);
  item.sync();
  const unsubscribe = scope.add(element, item.paint);
  item.destroy = () => {
    unsubscribe();
    item.observer.disconnect();
    overlay.remove();
    if (item.patchedPosition)
      element.style.position = item.previousInlinePosition;
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
/** Diagnostic snapshot for lifecycle tests; not used to render the UI. */
export function getMotionStats() {
  return {
    scopes: scopeCount,
    running: running.size,
    scheduled: raf !== null,
    callbacks: [...running].reduce((n, s) => n + s.callbacks.size, 0),
  };
}
