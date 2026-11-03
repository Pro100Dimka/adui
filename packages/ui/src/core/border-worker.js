/* Border pixels have their own clock; React and CSS layout never carry their frame traffic. */
function renderBorders() {
  const scenes = new Map();
  let frame = null, fps = 60, last = -Infinity;
  const release = (scene) => {
    for (const layer of scene.layers) {
      layer.mask.close();
      layer.texture.close();
    }
  };
  const draw = (scene) => {
    const { ctx, width, height, points, length, radius } = scene;
    ctx.clearRect(0, 0, width, height);
    for (const layer of scene.layers) {
      const paint = layer.ctx;
      paint.globalCompositeOperation = "source-over";
      paint.clearRect(0, 0, width, height);
      for (const light of scene.lights) {
        const index = ((light.phase + scene.elapsed * light.speed / length) % 1) * 1024;
        const lo = Math.floor(index), hi = (lo + 1) % 1024, weight = index - lo;
        const x = points[lo * 2] * (1 - weight) + points[hi * 2] * weight;
        const y = points[lo * 2 + 1] * (1 - weight) + points[hi * 2 + 1] * weight;
        paint.drawImage(layer.texture, x - radius + 16, y - radius + 16, radius * 2, radius * 2);
      }
      paint.globalCompositeOperation = "destination-in";
      paint.drawImage(layer.mask, 0, 0, width, height);
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.buffer, 0, 0, width, height);
    }
    ctx.globalAlpha = 1;
  };
  const schedule = () => {
    if (frame === null && [...scenes.values()].some((scene) => scene.visible))
      frame = requestAnimationFrame(tick);
  };
  function tick(now) {
    frame = null;
    if (now - last >= 1000 / fps - 0.5) {
      for (const scene of scenes.values()) {
        if (!scene.visible) continue;
        if (scene.previous !== null) scene.elapsed += Math.min(0.1, Math.max(0, (now - scene.previous) / 1000));
        scene.previous = now;
        draw(scene);
      }
      last = now;
    }
    schedule();
  }
  onmessage = ({ data }) => {
    const scene = scenes.get(data.id);
    if (data.type === "rate") fps = data.fps;
    else if (data.type === "remove") {
      if (scene) release(scene);
      scenes.delete(data.id);
    } else if (data.type === "visible") {
      if (scene) { scene.visible = data.visible; scene.previous = null; }
    } else if (data.type === "update") {
      if (scene) release(scene);
      const next = { ...data, canvas: scene?.canvas ?? data.canvas, elapsed: scene?.elapsed ?? data.elapsed, previous: null };
      next.canvas.width = Math.ceil(data.width * data.dpr);
      next.canvas.height = Math.ceil(data.height * data.dpr);
      next.ctx = next.canvas.getContext("2d");
      next.ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
      for (const layer of next.layers) {
        layer.buffer = new OffscreenCanvas(next.canvas.width, next.canvas.height);
        layer.ctx = layer.buffer.getContext("2d");
        layer.ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
      }
      scenes.set(data.id, next);
      draw(next);
      postMessage({ id: data.id, elapsed: next.elapsed, revision: data.revision });
    }
    schedule();
  };
}

let worker = null, workerUrl = null, serial = 0, unavailable = false, frameRate = 60;
const clients = new Map();
const visibilityChanged = () => { for (const client of clients.values()) client.visibility(); };
const resized = () => { for (const client of clients.values()) client.update(); };
export function setBorderFrameRate(fps) {
  frameRate = fps;
  worker?.postMessage({ type: "rate", fps });
}
function stopWorker() {
  worker?.terminate();
  if (workerUrl) URL.revokeObjectURL(workerUrl);
  worker = workerUrl = null;
  document.removeEventListener("visibilitychange", visibilityChanged);
  window.removeEventListener("resize", resized);
}
function startWorker() {
  if (worker) return worker;
  try {
    workerUrl = URL.createObjectURL(new Blob([`(${renderBorders.toString()})()`], { type: "text/javascript" }));
    worker = new Worker(workerUrl);
  } catch {
    unavailable = true;
    stopWorker();
    return null;
  }
  worker.onmessage = ({ data }) => clients.get(data.id)?.ready(data);
  worker.onerror = () => {
    unavailable = true;
    const pending = [...clients.values()];
    stopWorker();
    for (const client of pending) client.fail();
  };
  worker.postMessage({ type: "rate", fps: frameRate });
  document.addEventListener("visibilitychange", visibilityChanged);
  window.addEventListener("resize", resized);
  return worker;
}

/** The SVG/CSS border remains intact until its replacement has painted, and is the fallback. */
export function createBorderWorker(item) {
  if (unavailable || typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined" ||
      typeof createImageBitmap === "undefined" || typeof HTMLCanvasElement === "undefined" ||
      !HTMLCanvasElement.prototype.transferControlToOffscreen || typeof IntersectionObserver === "undefined" ||
      typeof MutationObserver === "undefined") return null;
  const thread = startWorker();
  if (!thread) return null;
  const id = ++serial, host = item.element;
  const groups = [...item.overlay.querySelectorAll(".ad-border-aura, .ad-border-core")];
  const originalVisibility = groups.map((group) => group.style.visibility);
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;left:-16px;top:-16px;pointer-events:none;visibility:hidden";
  item.overlay.append(canvas);
  let revision = 0, disposed = false, queued = false, signature = "", transferred = false;
  let inView = false, visible = false, elapsed = item.elapsed, since = performance.now();
  const renderer = { ready: false, update: queue, dispose };
  const visibility = () => {
    const motion = host.closest("[data-ad-motion]")?.dataset.adMotion !== "off";
    const next = inView && motion && !document.hidden && !host.closest("[data-ad-offscreen], [data-ad-paused]");
    canvas.style.display = motion ? "" : "none";
    if (next === visible) return;
    if (visible && renderer.ready) elapsed += (performance.now() - since) / 1000;
    since = performance.now();
    visible = next;
    thread.postMessage({ type: "visible", id, visible });
  };
  const observer = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    visibility();
  }, { rootMargin: "16px" });
  observer.observe(host);
  const tokens = new MutationObserver((records) => {
    visibility();
    if (records.some((record) => ["style", "class", "data-ad-theme", "data-ad-color-scheme"].includes(record.attributeName))) queue();
  });
  for (let node = host; node; node = node.parentElement)
    tokens.observe(node, { attributes: true, attributeFilter: ["style", "class", "data-ad-theme", "data-ad-color-scheme", "data-ad-motion", "data-ad-offscreen", "data-ad-paused"] });
  clients.set(id, {
    visibility,
    update: queue,
    ready(data) {
      if (disposed || data.revision !== revision) return;
      elapsed = data.elapsed;
      since = performance.now();
      renderer.ready = true;
      groups.forEach((group) => { group.style.visibility = "hidden"; });
      canvas.style.visibility = "";
      visibility();
    },
    fail() {
      item.elapsed = elapsed + (visible && renderer.ready ? (performance.now() - since) / 1000 : 0);
      item.previousTime = null;
      dispose();
    },
  });
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.ready = false;
    revision++;
    observer.disconnect();
    tokens.disconnect();
    groups.forEach((group, index) => { group.style.visibility = originalVisibility[index]; });
    canvas.remove();
    clients.delete(id);
    if (worker === thread) thread.postMessage({ type: "remove", id });
    if (!clients.size) stopWorker();
  }
  function queue() {
    if (disposed || queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!disposed) void update(); });
  }
  async function update() {
    const dpr = devicePixelRatio || 1;
    const width = item.overlay.clientWidth + 32, height = item.overlay.clientHeight + 32;
    const radius = item.lights[0].radius;
    const styles = groups.map((group) => ({
      mask: group.style.maskImage,
      gradient: getComputedStyle(group.firstElementChild).backgroundImage,
      opacity: Number(getComputedStyle(group).opacity),
    }));
    const key = JSON.stringify([item.geometry, dpr, styles]);
    if (!item.length || key === signature) return;
    signature = key;
    const current = ++revision, images = [];
    try {
      const layers = [];
      for (const style of styles) {
        const mask = new Image();
        mask.src = JSON.parse(style.mask.slice(4, -1));
        await mask.decode();
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = Math.ceil(width * dpr);
        maskCanvas.height = Math.ceil(height * dpr);
        maskCanvas.getContext("2d").drawImage(mask, 0, 0, maskCanvas.width, maskCanvas.height);
        const bitmap = await createImageBitmap(maskCanvas);
        images.push(bitmap);
        const texture = document.createElement("canvas");
        texture.width = texture.height = Math.ceil(radius * 2 * dpr);
        const ctx = texture.getContext("2d");
        ctx.scale(dpr, dpr);
        const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        for (const stop of style.gradient.slice(style.gradient.indexOf(",") + 1, -1).split(/,\s*(?![^()]*\))/)) {
          const match = stop.trim().match(/^(.*)\s+([\d.]+)%$/);
          if (!match) throw new Error("Invalid border gradient");
          gradient.addColorStop(Number(match[2]) / 100, match[1]);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, radius * 2, radius * 2);
        const spot = await createImageBitmap(texture);
        images.push(spot);
        layers.push({ mask: bitmap, texture: spot, opacity: style.opacity });
      }
      if (disposed || current !== revision) { images.forEach((image) => image.close()); return; }
      const points = new Float32Array(2048);
      for (let index = 0; index < 1024; index++) {
        const point = item.contour.point(index / 1024);
        points[index * 2] = point.x;
        points[index * 2 + 1] = point.y;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const surface = transferred ? undefined : canvas.transferControlToOffscreen();
      transferred = true;
      thread.postMessage({ type: "update", id, revision: current, canvas: surface, width, height, dpr, radius,
        lights: item.lights.map(({ phase, speed }) => ({ phase, speed })), points, length: item.length,
        layers, elapsed: item.elapsed, visible }, [...images, points.buffer, ...(surface ? [surface] : [])]);
    } catch {
      images.forEach((image) => image.close());
      if (!disposed) clients.get(id)?.fail();
    }
  }
  visibility();
  queue();
  return renderer;
}
