/* Border pixels have their own clock; React and CSS layout never carry their frame traffic. */
function renderBorders() {
  async function createGpuPainter() {
    if (!navigator.gpu) return null;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const shader = device.createShaderModule({ code: `
      struct Uniforms { size: vec4f, canvas: vec4f, lights: vec4f, padding: vec4f };
      @group(0) @binding(0) var<uniform> u: Uniforms;
      @group(0) @binding(1) var linearSampler: sampler;
      @group(0) @binding(2) var mask0: texture_2d<f32>;
      @group(0) @binding(3) var glow0: texture_2d<f32>;
      @group(0) @binding(4) var mask1: texture_2d<f32>;
      @group(0) @binding(5) var glow1: texture_2d<f32>;
      @vertex fn vertex(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
        let positions = array<vec2f, 3>(vec2f(-1,-1), vec2f(3,-1), vec2f(-1,3));
        return vec4f(positions[i], 0, 1);
      }
      fn spot(p: vec2f, origin: vec2f, texture: texture_2d<f32>) -> vec4f {
        let uv = (p - origin) / (u.size.w * 2);
        if (any(uv < vec2f(0)) || any(uv > vec2f(1))) { return vec4f(0); }
        return textureSampleLevel(texture, linearSampler, uv, 0);
      }
      fn layer(p: vec2f, mask: texture_2d<f32>, glow: texture_2d<f32>) -> vec4f {
        let alpha = textureSampleLevel(mask, linearSampler, p / u.size.xy, 0).a;
        if (alpha == 0) { return vec4f(0); }
        let first = spot(p, u.lights.xy, glow);
        let second = spot(p, u.lights.zw, glow);
        return (second + first * (1 - second.a)) * alpha;
      }
      fn filtered(q: vec2f, mask: texture_2d<f32>, glow: texture_2d<f32>) -> vec4f {
        let base = floor(q - vec2f(.5)) + vec2f(.5);
        let f = fract(q - vec2f(.5));
        let a = layer(base / u.size.z, mask, glow);
        let b = layer((base + vec2f(1,0)) / u.size.z, mask, glow);
        let c = layer((base + vec2f(0,1)) / u.size.z, mask, glow);
        let d = layer((base + vec2f(1,1)) / u.size.z, mask, glow);
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      @fragment fn fragment(@builtin(position) p: vec4f) -> @location(0) vec4f {
        let q = p.xy * u.canvas.xy / (u.size.xy * u.size.z);
        let aura = filtered(q, mask0, glow0) * u.canvas.z;
        let core = filtered(q, mask1, glow1) * u.canvas.w;
        return core + aura * (1-core.a);
      }
    ` });
    let pipeline;
    try {
      pipeline = await device.createRenderPipelineAsync({
        layout: "auto",
        vertex: { module: shader, entryPoint: "vertex" },
        fragment: { module: shader, entryPoint: "fragment", targets: [{ format }] },
        primitive: { topology: "triangle-list" }
      });
    } catch (error) {
      device.destroy();
      throw error;
    }
    const sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });
    device.addEventListener("uncapturederror", (event) => {
      throw event.error;
    });
    device.lost.then((info) => {
      setTimeout(() => {
        throw new Error(info.message || "Border GPU device lost");
      });
    });
    return (scene) => {
      const context = scene.canvas.getContext("webgpu");
      context.configure({ device, format, alphaMode: "premultiplied" });
      const textures = scene.layers.flatMap((layer) => [layer.mask, layer.texture]).map((image) => {
        const texture = device.createTexture({
          size: [image.width, image.height],
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        device.queue.copyExternalImageToTexture({ source: image }, { texture, premultipliedAlpha: true }, [image.width, image.height]);
        return texture;
      });
      const buffer = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const values = new Float32Array(16);
      values.set([
        scene.width,
        scene.height,
        scene.dpr,
        scene.radius,
        scene.canvas.width,
        scene.canvas.height,
        scene.layers[0].opacity,
        scene.layers[1].opacity
      ]);
      const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer } },
        { binding: 1, resource: sampler },
        ...textures.map((texture, index) => ({ binding: index + 2, resource: texture.createView() }))
      ] });
      return {
        draw(current) {
          current.lights.forEach((light, index) => {
            const at = (light.phase + current.elapsed * light.speed / current.length) % 1 * 1024;
            const lo = Math.floor(at), hi = (lo + 1) % 1024, weight = at - lo;
            for (let axis = 0; axis < 2; axis++) values[8 + index * 2 + axis] = current.points[lo * 2 + axis] * (1 - weight) + current.points[hi * 2 + axis] * weight - current.radius + 16;
          });
          device.queue.writeBuffer(buffer, 0, values);
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({ colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            clearValue: [0, 0, 0, 0]
          }] });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          for (let i = 0; i < 2; i++) {
            const sx = current.width * current.dpr / current.canvas.width, sy = current.height * current.dpr / current.canvas.height;
            const x = Math.max(0, Math.floor((values[8 + i * 2] * current.dpr - 2) * sx));
            const y = Math.max(0, Math.floor((values[9 + i * 2] * current.dpr - 2) * sy));
            const r = Math.min(current.canvas.width, Math.ceil(((values[8 + i * 2] + current.radius * 2) * current.dpr + 2) * sx));
            const b = Math.min(current.canvas.height, Math.ceil(((values[9 + i * 2] + current.radius * 2) * current.dpr + 2) * sy));
            if (r > x && b > y) {
              pass.setScissorRect(x, y, r - x, b - y);
              pass.draw(3);
            }
          }
          pass.end();
          device.queue.submit([encoder.finish()]);
        },
        dispose() {
          context.unconfigure();
          buffer.destroy();
          textures.forEach((texture) => texture.destroy());
        }
      };
    };
  }
  let gpu;
  const pending = [];
  onmessage = event => pending.push(event);
  const scenes = new Map();
  let frame = null, fps = 60, last = -Infinity;
  const release = (scene) => {
    scene.gpu?.dispose();
    for (const layer of scene.layers) {
      layer.mask.close();
      layer.texture.close();
    }
  };
  const draw = (scene) => {
    if (scene.gpu) { scene.gpu.draw(scene); return; }
    const { ctx, width, height, points, length, radius, dpr } = scene;
    const lights = scene.lights.map((light) => {
      const index = ((light.phase + scene.elapsed * light.speed / length) % 1) * 1024;
      const lo = Math.floor(index), hi = (lo + 1) % 1024, weight = index - lo;
      return {
        x: points[lo * 2] * (1 - weight) + points[hi * 2] * weight - radius + 16,
        y: points[lo * 2 + 1] * (1 - weight) + points[hi * 2 + 1] * weight - radius + 16,
      };
    });
    const regions = lights.map(({ x, y }) => ({
      x: Math.max(0, Math.floor(x * dpr - 1) / dpr),
      y: Math.max(0, Math.floor(y * dpr - 1) / dpr),
      right: Math.min(scene.canvas.width, Math.ceil((x + radius * 2) * dpr + 1)) / dpr,
      bottom: Math.min(scene.canvas.height, Math.ceil((y + radius * 2) * dpr + 1)) / dpr,
    }));
    // Composite overlapping lights together before applying the ring mask.
    const [first, second] = regions;
    if (second && first.x < second.right && second.x < first.right &&
        first.y < second.bottom && second.y < first.bottom) {
      regions.splice(0, 2, { x: Math.min(first.x, second.x), y: Math.min(first.y, second.y),
        right: Math.max(first.right, second.right), bottom: Math.max(first.bottom, second.bottom) });
    }
    ctx.clearRect(0, 0, width, height);
    for (const layer of scene.layers) {
      const paint = layer.ctx;
      ctx.globalAlpha = layer.opacity;
      for (const { x, y, right, bottom } of regions) {
        const w = right - x, h = bottom - y;
        paint.globalCompositeOperation = "source-over";
        paint.clearRect(0, 0, layer.buffer.width / dpr, layer.buffer.height / dpr);
        for (const light of lights)
          paint.drawImage(layer.texture, light.x - x, light.y - y, radius * 2, radius * 2);
        paint.globalCompositeOperation = "destination-in";
        paint.drawImage(layer.mask, x * layer.mask.width / width, y * layer.mask.height / height,
          w * layer.mask.width / width, h * layer.mask.height / height, 0, 0, w, h);
        const scaleX = width * dpr / scene.canvas.width, scaleY = height * dpr / scene.canvas.height;
        ctx.drawImage(layer.buffer, 0, 0, w * dpr, h * dpr, x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      }
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
  const receive = ({ data }) => {
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
      if (gpu) next.gpu = gpu(next);
      else {
        next.ctx = next.canvas.getContext("2d");
        next.ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
        for (const layer of next.layers) {
          layer.buffer = new OffscreenCanvas(
            Math.min(next.canvas.width, Math.ceil(next.radius * 4 * data.dpr) + 4),
            Math.min(next.canvas.height, Math.ceil(next.radius * 4 * data.dpr) + 4),
          );
          layer.ctx = layer.buffer.getContext("2d");
          layer.ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
        }
      }
      scenes.set(data.id, next);
      draw(next);
      postMessage({ id: data.id, elapsed: next.elapsed, revision: data.revision });
    }
    schedule();
  };
  createGpuPainter().catch(error => {
    console.warn("Border GPU initialization failed; using Canvas 2D", error);
    return null;
  }).then(value => {
    gpu = value;
    onmessage = receive;
    pending.splice(0).forEach(receive);
  }).catch(error => { setTimeout(() => { throw error; }); });
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
