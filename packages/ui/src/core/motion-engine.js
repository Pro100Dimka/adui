/* Shared SVG effect engine retained from the approved DOM library.
   React owns attachment / detachment through useLayoutEffect. No component DOM is built here. */
let uid = 0;
const U = {
  scopes: new WeakMap(),
  uid: (p = "ad") => `${p}-${++uid}`,
  svg(tag, attrs = {}) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  },
  scopeFor(node) {
    for (let n = node; n; n = n.parentNode || n.host) {
      if (this.scopes.has(n)) return this.scopes.get(n);
    }
    return null;
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
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const scope = {
    root,
    enabled: !media.matches,
    active: true,
    time: 0,
    previous: null,
    explicit: false,
    callbacks: new Map(),
    observers: [],
    tick(now) {
      if (!this.active || !this.enabled) {
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
      if (this.enabled && this.active) running.add(this);
      else running.delete(this);
      schedule();
      return this.enabled;
    },
    setActive(active) {
      this.active = active;
      this.previous = null;
      if (active && this.enabled) running.add(this);
      else running.delete(this);
      schedule();
    },
    seek(t) {
      this.time = Math.max(0, t);
      for (const [node, fn] of this.callbacks)
        if (node.isConnected) fn(this.time);
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
  scope.intersection = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => (e.target._adInView = e.isIntersecting)),
    { rootMargin: "100px" },
  );
  scope.onPreference = (e) => {
    if (!scope.explicit) scope.set(!e.matches, false);
  };
  media.addEventListener("change", scope.onPreference);
  U.scopes.set(root, scope);
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
U.attachBorder = (
  element,
  { shell = false, round = false, index = 0, scope = U.scopeFor(element) } = {},
) => {
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
      stroke: shell ? "#ff6373a6" : "#ff335329",
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
      [0, "#fff9f0", 1],
      [0.04, "#ffe2dd", 1],
      [0.16, "#ff798e", 1],
      [0.4, "#ff244c", 0.85],
      [0.72, "#ff1745", 0.32],
      [1, "#ff1745", 0],
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
          "stop-color": "#ff224b",
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
      phase: (k * 0.48 + 0.535 + index * 0.051) % 1,
      speed: round ? (k ? 25 : 36) : k ? 86 : 125,
      paths: [aura, core],
    });
  }
  element.append(overlay);
  const item = { element, overlay, path, lights, length: 0 };
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
    Object.assign(overlay.style, {
      left: `-${parseFloat(s.borderLeftWidth) || 0}px`,
      top: `-${parseFloat(s.borderTopWidth) || 0}px`,
      width: w + "px",
      height: h + "px",
    });
    const d = U.roundedPath(w, h, r);
    overlay.setAttribute("viewBox", `0 0 ${w} ${h}`);
    path.setAttribute("d", d);
    for (const l of lights) for (const p of l.paths) p.setAttribute("d", d);
    item.length = path.getTotalLength();
    item.paint(scope?.time || 0);
  };
  item.observer = new ResizeObserver(item.sync);
  item.observer.observe(element);
  item.sync();
  const unsubscribe = scope.add(element, item.paint);
  item.destroy = () => {
    unsubscribe();
    item.observer.disconnect();
    overlay.remove();
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
    });
  const defs = U.svg("defs"),
    grad = U.svg("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 });
  [
    [0, "#7d0926", 0.77],
    [0.38, "#370014", 0.86],
    [0.76, "#130309", 0.94],
    [1, "#9b082d", 0.94],
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
  const sync = () => {
    const w = button.offsetWidth,
      h = button.offsetHeight;
    if (!w || !h) return;
    shape.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const edgeR = Math.min(38, w * 0.2),
      slope = Math.min(22, w * 0.12);
    const d = `M5 ${h - 3}Q10 ${h - 5} 12 ${h - 15}L${slope} 14Q${slope + 3} 2 ${edgeR} 2H${w - edgeR}Q${w - slope - 3} 2 ${w - slope} 14L${w - 12} ${h - 15}Q${w - 10} ${h - 5} ${w - 5} ${h - 3}H${w / 2 + 6}L${w / 2} ${h + 1}L${w / 2 - 6} ${h - 3}Z`;
    for (const p of [glow, edge, glint]) p.setAttribute("d", d);
    floor.setAttribute(
      "d",
      `M6 ${h - 3}H${w / 2 - 7}L${w / 2} ${h + 1}L${w / 2 + 7} ${h - 3}H${w - 6}`,
    );
  };
  const observer = new ResizeObserver(sync);
  observer.observe(button);
  sync();
  const item = {
    observer,
    shape,
    sync,
    destroy() {
      observer.disconnect();
      shape.remove();
      button.removeAttribute("data-ad-shape-ready");
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
