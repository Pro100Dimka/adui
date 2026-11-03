function createNeonGeometry() {
  const W = 600;
  const H = 120;
  const SKYLINE = [
    [0, 0.93],
    [0.16, 0.86],
    [0.3, 0.82],
    [0.42, 0.72],
    [0.55, 0.64],
    [0.64, 0.7],
    [0.74, 0.52],
    [0.84, 0.1],
    [0.9, 0.56],
    [0.95, 0.46],
    [1, 0.08],
  ];
  const skyline = (x) => {
    const i = Math.max(0, SKYLINE.findIndex(([at]) => at >= x) - 1);
    const [x0, y0] = SKYLINE[i];
    const [x1, y1] = SKYLINE[Math.min(SKYLINE.length - 1, i + 1)];
    const k = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
    return y0 + ((y1 - y0) * (1 - Math.cos(k * Math.PI))) / 2;
  };
  const SAMPLES = 36;
  const toPath = (curve) => {
    let d = `M${curve[0].toFixed(2)} ${curve[1].toFixed(2)}`;
    for (let i = 2; i < curve.length; i += 6)
      d += `C${curve
        .slice(i, i + 6)
        .map((n) => n.toFixed(2))
        .join(" ")}`;
    return d;
  };
  const smoothTo = (curve, c2x, c2y, x, y) => {
    const n = curve.length;
    curve.push(
      2 * curve[n - 2] - curve[n - 4],
      2 * curve[n - 1] - curve[n - 3],
      c2x,
      c2y,
      x,
      y,
    );
  };
  const smooth = (xs, ys) => {
    const curve = [xs[0], ys[0]];
    for (let i = 0; i < xs.length - 1; i += 1) {
      const x0 = xs[i - 1] ?? xs[i],
        y0 = ys[i - 1] ?? ys[i];
      const x1 = xs[i],
        y1 = ys[i],
        x2 = xs[i + 1],
        y2 = ys[i + 1];
      const x3 = xs[i + 2] ?? x2,
        y3 = ys[i + 2] ?? y2;
      curve.push(
        x1 + (x2 - x0) / 6,
        y1 + (y2 - y0) / 6,
        x2 - (x3 - x1) / 6,
        y2 - (y3 - y1) / 6,
        x2,
        y2,
      );
    }
    return curve;
  };
  const ridgeStrand = (t, drift) => {
    const xs = [];
    const ys = [];
    for (let i = 0; i <= SAMPLES; i += 1) {
      const x = i / SAMPLES;
      const base = skyline(x);
      const spread = H * (0.06 + 0.26 * base);
      const ripple =
        Math.sin(x * 8 + drift + t * 7) * H * (0.03 + 0.05 * base) +
        Math.sin(x * 21 - drift * 1.3 + t * 11) * H * 0.014;
      xs.push(x * (W + 20) - 10);
      ys.push(base * H + (t - 0.5) * spread + ripple);
    }
    return smooth(xs, ys);
  };
  const twistStrand = (t, drift, main) => {
    const a = Math.sin(drift + t * 1.4) * H * 0.095;
    const b = Math.cos(drift * 0.8 + t * 1.8) * H * 0.08;
    if (!main) {
      const curve2 = [
        -12,
        H * (0.9 + t * 0.12) + b,
        W * 0.21,
        H * 0.98 + a,
        W * 0.33,
        H * 0.24 + t * H * 0.2 + a,
        W * 0.52,
        H * 0.75 + t * H * 0.25 + b,
      ];
      smoothTo(
        curve2,
        W * 0.82,
        H * 0.38 + t * H * 0.27 + a,
        W + 8,
        H * (0.48 + t * 0.5) + b,
      );
      return curve2;
    }
    const curve = [
      -12,
      H * (0.38 + t * 0.58) + a,
      W * 0.2,
      H * 1.28 - t * H * 0.27 + a,
      W * 0.32,
      H * 0.34 + t * H * 0.21 + b,
      W * 0.46,
      H * 0.62 + t * H * 0.12,
    ];
    smoothTo(
      curve,
      W * 0.67,
      H * 1.14 - t * H * 0.09 + a,
      W * 0.8,
      H * 0.69 - t * H * 0.22 + b,
    );
    smoothTo(
      curve,
      W * 0.94,
      H * 0.43 - t * H * 0.44 + a,
      W + 8,
      H * 0.21 + t * H * 0.45,
    );
    return curve;
  };
  const STEPS = 16;
  const measure = (curve) => {
    const xs = [curve[0]],
      ys = [curve[1]],
      lengths = [0];
    for (let i = 2; i < curve.length; i += 6) {
      const x0 = curve[i - 2],
        y0 = curve[i - 1];
      const [x1, y1, x2, y2, x3, y3] = curve.slice(i, i + 6);
      for (let k = 1; k <= STEPS; k += 1) {
        const u = k / STEPS,
          v = 1 - u;
        const x =
          v * v * v * x0 +
          3 * v * v * u * x1 +
          3 * v * u * u * x2 +
          u * u * u * x3;
        const y =
          v * v * v * y0 +
          3 * v * v * u * y1 +
          3 * v * u * u * y2 +
          u * u * u * y3;
        lengths.push(
          lengths[lengths.length - 1] +
            Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]),
        );
        xs.push(x);
        ys.push(y);
      }
    }
    return { xs, ys, lengths, total: lengths[lengths.length - 1] };
  };
  const pointAt = (track, fraction) => {
    const distance = Math.min(1, Math.max(0, fraction)) * track.total;
    let low = 0,
      high = track.lengths.length - 1;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (track.lengths[middle] < distance) low = middle;
      else high = middle;
    }
    const span = track.lengths[high] - track.lengths[low] || 1;
    const k = (distance - track.lengths[low]) / span;
    return {
      x: track.xs[low] + (track.xs[high] - track.xs[low]) * k,
      y: track.ys[low] + (track.ys[high] - track.ys[low]) * k,
    };
  };
  const COMET_LAP = 6;
  const COMET_DASH = 0.016;
  const COMET_WIDTH = 1.6;
  const cometStrand = (i, comets, strands) =>
    Math.min(strands - 1, Math.round(((i + 0.5) / comets) * (strands - 1)));
  return {
    W,
    H,
    toPath,
    ridgeStrand,
    twistStrand,
    measure,
    pointAt,
    cometStrand,
    COMET_LAP,
    COMET_DASH,
    COMET_WIDTH,
  };
}
const neonGeometry = createNeonGeometry();
export { createNeonGeometry, neonGeometry };

function renderNeon(createGeometry) {
  const geometry = createGeometry(),
    scenes = new Map();
  let frame = null,
    fps = 60,
    last = -Infinity;
  function draw(scene) {
    const { ctx, width, height, padX, padY, sx, sy, options, time, gradient } =
      scene;
    ctx.clearRect(-padX, -padY, width + padX * 2, height + padY * 2);
    ctx.strokeStyle = gradient;
    const tracks = new Map();
    const carried = new Set(
      Array.from({ length: options.comets }, (_, i) =>
        geometry.cometStrand(i, options.comets, options.strands),
      ),
    );
    for (let i = 0; i < options.strands; i++) {
      const t = i / Math.max(1, options.strands - 1),
        drift = time * 0.42 + options.phase;
      const curve =
        options.shape === "ridge"
          ? geometry.ridgeStrand(t, drift)
          : geometry.twistStrand(t, drift, i < options.strands * 0.68);
      ctx.beginPath();
      ctx.moveTo(curve[0] * sx, curve[1] * sy);
      for (let j = 2; j < curve.length; j += 6)
        ctx.bezierCurveTo(
          curve[j] * sx,
          curve[j + 1] * sy,
          curve[j + 2] * sx,
          curve[j + 3] * sy,
          curve[j + 4] * sx,
          curve[j + 5] * sy,
        );
      ctx.lineWidth = i === 5 ? 1 : 0.55;
      ctx.globalAlpha = i === 5 ? 0.95 : 0.52;
      ctx.stroke();
      if (carried.has(i)) tracks.set(i, geometry.measure(curve));
    }
    for (let i = 0; i < options.comets; i++) {
      const track = tracks.get(
        geometry.cometStrand(i, options.comets, options.strands),
      );
      if (!track) continue;
      const start =
        ((time + (i * geometry.COMET_LAP) / options.comets + 1.8) /
          geometry.COMET_LAP) %
        1;
      const tail = geometry.pointAt(track, start),
        head = geometry.pointAt(track, start + geometry.COMET_DASH);
      const dx = (head.x - tail.x) * sx,
        dy = (head.y - tail.y) * sy;
      const length = Math.round(Math.hypot(dx, dy) + geometry.COMET_WIDTH);
      let sprite = scene.sprites.get(length);
      if (!sprite) {
        const padding = Math.ceil(
          Math.max(0, ...scene.shadows.map((shadow) => shadow.blur)) * 2 + 2,
        );
        const canvas = new OffscreenCanvas(
          Math.ceil((length + padding * 2) * scene.dpr),
          Math.ceil((geometry.COMET_WIDTH + padding * 2) * scene.dpr),
        );
        const paint = canvas.getContext("2d");
        paint.scale(scene.dpr, scene.dpr);
        paint.fillStyle = scene.color;
        for (const shadow of [...scene.shadows].reverse()) {
          paint.shadowColor = shadow.color;
          paint.shadowBlur = shadow.blur * scene.dpr;
          paint.beginPath();
          paint.roundRect(
            padding,
            padding,
            length,
            geometry.COMET_WIDTH,
            geometry.COMET_WIDTH / 2,
          );
          paint.fill();
        }
        sprite = { canvas, padding };
        scene.sprites.set(length, sprite);
      }
      const x = (tail.x + head.x) / 2,
        y = (tail.y + head.y) / 2;
      ctx.save();
      ctx.translate(x * sx, y * sy);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.globalAlpha = Math.min(
        1,
        Math.max(0, (x + 20) / ((geometry.W + 40) * 0.35)),
      );
      ctx.drawImage(
        sprite.canvas,
        -length / 2 - sprite.padding,
        -geometry.COMET_WIDTH / 2 - sprite.padding,
        sprite.canvas.width / scene.dpr,
        sprite.canvas.height / scene.dpr,
      );
      ctx.restore();
    }
    // CSS ease-in-out: invert its x curve once for each of the nine shared phases.
    const phases = scene.twinkle ??= new Float32Array(9);
    for (let phase = 0; phase < (options.dots?.length ? 9 : 0); phase++) {
      const cycle = (time + phase * 0.45) % 4;
      const x = cycle < 2 ? cycle / 2 : (4 - cycle) / 2;
      let low = 0, high = 1;
      for (let step = 0; step < 20; step++) {
        const t = (low + high) / 2;
        const at = 3 * (1 - t) ** 2 * t * 0.42 + 3 * (1 - t) * t * t * 0.58 + t ** 3;
        if (at < x) low = t;
        else high = t;
      }
      const t = (low + high) / 2;
      phases[phase] = 1 - (3 * t * t - 2 * t ** 3);
    }
    ctx.fillStyle = scene.starColor;
    for (const [i, dot] of (options.dots ?? []).entries()) {
      ctx.globalAlpha = 0.05 + (dot.o - 0.05) * phases[i % 9];
      ctx.beginPath();
      ctx.arc(dot.x * sx, dot.y * sy, Math.max(1, dot.r * 3) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function schedule() {
    if (frame === null && [...scenes.values()].some((scene) => scene.visible))
      frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = null;
    if (now - last >= 1000 / fps - 0.5) {
      for (const scene of scenes.values()) {
        if (!scene.visible) continue;
        if (scene.previous !== null)
          scene.time += Math.min(
            0.1,
            Math.max(0, (now - scene.previous) / 1000),
          );
        scene.previous = now;
        draw(scene);
      }
      last = now;
    }
    schedule();
  }
  onmessage = ({ data }) => {
    const previous = scenes.get(data.id);
    if (data.type === "rate") fps = data.fps;
    else if (data.type === "remove") scenes.delete(data.id);
    else if (data.type === "visible") {
      if (previous) {
        previous.visible = data.visible;
        previous.previous = null;
      }
    } else if (data.type === "update") {
      const scene = {
        ...data,
        canvas: previous?.canvas ?? data.canvas,
        time: previous?.time ?? data.time,
        previous: null,
        sprites: new Map(),
      };
      scene.canvas.width = Math.ceil((data.width + data.padX * 2) * data.dpr);
      scene.canvas.height = Math.ceil((data.height + data.padY * 2) * data.dpr);
      scene.ctx = scene.canvas.getContext("2d");
      scene.ctx.setTransform(
        data.dpr,
        0,
        0,
        data.dpr,
        data.padX * data.dpr,
        data.padY * data.dpr,
      );
      scene.sx = data.width / geometry.W;
      scene.sy = data.height / geometry.H;
      const [start, end] =
        data.options.shape === "ridge" ? [-10, 610] : [-12, 608];
      scene.gradient = scene.ctx.createLinearGradient(
        start * scene.sx,
        0,
        end * scene.sx,
        0,
      );
      for (const stop of data.stops)
        scene.gradient.addColorStop(stop.at, stop.color);
      scenes.set(data.id, scene);
      draw(scene);
      postMessage({ id: data.id });
    }
    schedule();
  };
}
let thread = null,
  url = null,
  serial = 0,
  unavailable = false,
  frameRate = 60;
const clients = new Map();
const visibilityChanged = () => {
  for (const client of clients.values()) client.visibility();
};
const resized = () => {
  for (const client of clients.values()) client.update();
};
export function setNeonFrameRate(fps) {
  frameRate = fps;
  thread?.postMessage({ type: "rate", fps });
}
function stopThread() {
  thread?.terminate();
  if (url) URL.revokeObjectURL(url);
  thread = url = null;
  document.removeEventListener("visibilitychange", visibilityChanged);
  window.removeEventListener("resize", resized);
}
export function createNeonRenderer(root, svg, initial) {
  if (
    unavailable ||
    typeof Worker === "undefined" ||
    typeof OffscreenCanvas === "undefined" ||
    typeof HTMLCanvasElement === "undefined" ||
    !HTMLCanvasElement.prototype.transferControlToOffscreen ||
    typeof IntersectionObserver === "undefined" ||
    typeof MutationObserver === "undefined"
  )
    return null;
  if (!thread) {
    try {
      url = URL.createObjectURL(
        new Blob(
          [`(${renderNeon.toString()})(${createNeonGeometry.toString()})`],
          { type: "text/javascript" },
        ),
      );
      thread = new Worker(url);
    } catch {
      unavailable = true;
      stopThread();
      return null;
    }
    thread.onmessage = ({ data }) => clients.get(data.id)?.ready();
    thread.onerror = () => {
      unavailable = true;
      const pending = [...clients.values()];
      stopThread();
      for (const client of pending) client.dispose();
    };
    thread.postMessage({ type: "rate", fps: frameRate });
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("resize", resized);
  }
  const worker = thread,
    id = ++serial,
    canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;pointer-events:none;visibility:hidden";
  root.insertBefore(canvas, svg);
  const originalVisibility = svg.style.visibility;
  let options = initial,
    inView = false,
    visible = false,
    disposed = false,
    transferred = false,
    queued = false,
    signature = "";
  let comets = null,
    cometVisibility = "";
  const renderer = {
    ready: false,
    update(next = options) {
      options = next;
      queue();
    },
    dispose,
  };
  const hideOriginal = () => {
    if (!renderer.ready) return;
    root.setAttribute("data-ad-neon-rendered", "");
    svg.style.visibility = "hidden";
    const node = root.querySelector(".ad-neon-waves-comets");
    if (node !== comets) {
      comets = node;
      cometVisibility = node?.style.visibility ?? "";
    }
    if (comets) comets.style.visibility = "hidden";
  };
  const visibility = () => {
    const next =
      inView &&
      !document.hidden &&
      svg.closest("[data-ad-motion]")?.dataset.adMotion !== "off" &&
      !root.closest("[data-ad-paused], [data-ad-offscreen]");
    if (next !== visible) {
      visible = next;
      worker.postMessage({ type: "visible", id, visible });
    }
  };
  const intersection = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    visibility();
  });
  intersection.observe(root);
  const tokens = new MutationObserver((records) => {
    visibility();
    if (
      records.some((record) =>
        ["style", "class", "data-ad-theme", "data-ad-color-scheme"].includes(
          record.attributeName,
        ),
      )
    )
      queue();
  });
  for (let node = root; node; node = node.parentElement)
    tokens.observe(node, {
      attributes: true,
      attributeFilter: [
        "style",
        "class",
        "data-ad-theme",
        "data-ad-color-scheme",
        "data-ad-paused",
        "data-ad-offscreen",
        "data-ad-motion",
      ],
    });
  tokens.observe(svg, {
    attributes: true,
    attributeFilter: ["data-ad-motion", "data-ad-offscreen"],
  });
  clients.set(id, {
    visibility,
    update: queue,
    dispose,
    ready() {
      renderer.ready = true;
      hideOriginal();
      canvas.style.visibility = "";
    },
  });
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.ready = false;
    intersection.disconnect();
    tokens.disconnect();
    svg.style.visibility = originalVisibility;
    root.removeAttribute("data-ad-neon-rendered");
    if (comets) comets.style.visibility = cometVisibility;
    canvas.remove();
    clients.delete(id);
    if (thread === worker) worker.postMessage({ type: "remove", id });
    if (!clients.size) stopThread();
  }
  function queue() {
    if (queued || disposed) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!disposed) update();
    });
  }
  function update() {
    try {
      hideOriginal();
      visibility();
      const width = root.clientWidth,
        height = root.clientHeight,
        dpr = devicePixelRatio || 1;
      if (!width || !height) return;
      const padX = width / 30 + 2,
        padY = height / 2 + 2;
      const stops = [...svg.querySelectorAll("stop")].map((stop) => {
        const style = getComputedStyle(stop);
        return {
          at: Number(stop.getAttribute("offset") || 0),
          color: `color-mix(in srgb, ${style.stopColor} ${Number(style.stopOpacity) * 100}%, transparent)`,
        };
      });
      const comet = root.querySelector(".ad-neon-waves-comet"),
        style = comet && getComputedStyle(comet);
      const shadows = !style
        ? []
        : style.boxShadow.split(/,\s*(?![^()]*\))/).map((shadow) => {
            const values = shadow.match(
              /^(.*?)\s+[-\d.]+px\s+[-\d.]+px\s+([\d.]+)px(?:\s+[-\d.]+px)?$/,
            );
            if (!values) throw new Error("Invalid comet shadow");
            return { color: values[1], blur: Number(values[2]) };
          });
      const config = {
        width,
        height,
        dpr,
        padX,
        padY,
        stops,
        shadows,
        color: style?.backgroundColor,
        starColor: getComputedStyle(root.querySelector(".ad-neon-waves-star") ?? root).backgroundColor,
        options: { ...options, comets: comet ? options.comets : 0 },
      };
      const key = JSON.stringify(config);
      if (key === signature) return;
      signature = key;
      canvas.style.left = `${-padX}px`;
      canvas.style.top = `${-padY}px`;
      canvas.style.width = `${width + 2 * padX}px`;
      canvas.style.height = `${height + 2 * padY}px`;
      const surface = transferred
        ? undefined
        : canvas.transferControlToOffscreen();
      transferred = true;
      worker.postMessage(
        {
          type: "update",
          id,
          canvas: surface,
          ...config,
          visible,
          time: options.time,
        },
        surface ? [surface] : [],
      );
    } catch {
      dispose();
    }
  }
  queue();
  return renderer;
}
