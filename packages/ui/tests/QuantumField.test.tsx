import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { existsSync, readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import QuantumFieldExample from "../src/components/artwork/QuantumField/example";
import { ExamplePreviewContext } from "../src/dev/exampleHelpers";
import { QuantumFieldExperience, quantumFieldExperienceControls } from "../src/components/artwork/QuantumField/QuantumFieldExperience";
import { createQuantumFieldAudio } from "../src/components/artwork/QuantumField/audio";
import { quantumFieldGeometry, quantumFieldFilaments, quantumFieldNetwork, quantumFieldZoom } from "../src/components/artwork/QuantumField/renderer";
import { ThemeProvider } from "../src/components/foundation/ThemeProvider/ThemeProvider";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { Tabs } from "../src/components/controls/Tabs/Tabs";
import {
  QuantumField,
  quantumFieldModes,
  quantumFieldResolution,
  quantumFieldAudio,
} from "../src/components/artwork/QuantumField/QuantumField";

it("preserves the source visualizer's MIT notice when restoring it", () => {
  const license = readFileSync(new URL("../src/components/artwork/QuantumField/UPSTREAM-LICENSE.txt", import.meta.url), "utf8");
  const reference = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(license).toContain("Quantum Fields Contributors");
  expect(reference).toContain("UPSTREAM-LICENSE.txt");
  expect(reference).not.toContain("Auto-starting System Audio");
  expect(reference).toContain("AlphaFromLumaShader");
  expect(reference.indexOf("composer.addPass(new OutputPass())")).toBeLessThan(reference.indexOf("composer.addPass(new ShaderPass(AlphaFromLumaShader))"));
  expect(reference).toContain("key === 'background'");
});

it("restores the licensed full visualizer instead of the reduced native scene", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  const reference = new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url);
  expect(existsSync(reference)).toBe(true);
  expect(html).toContain("<iframe");
  expect(html).not.toContain('data-ad-component="QuantumField"');
});

it("keeps the restored visualizer's full settings and song transport in the kit", () => {
  const keys = quantumFieldExperienceControls.flatMap(({ controls }) => controls.map(({ key }) => key));
  expect(keys).toEqual(expect.arrayContaining([
    "field", "sensitivity", "density", "timeScale", "nebulaEnabled", "connectionsEnabled",
    "lensFlareEnabled", "dofEnabled", "bloom", "trails", "vortexStrength", "pulseIntensity",
    "bassGateEnabled", "onsetSensitivity", "adaptiveQualityEnabled", "targetFPS",
  ]));
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("key === 'seek'");
  expect(source).toContain("ad-qf-transport");
});

it("keeps seven field presets while sharing the responsive particle geometry", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const presets = source.match(/const FIELD_TYPES = \{([\s\S]*?)\n        \};/)?.[1] ?? "";
  expect([...presets.matchAll(/'[^']+': \{/g)]).toHaveLength(7);
  expect(source).toContain("vec3 shapedPosition(vec3 seed)");
  expect(source).toContain("vec3 newPos = shapedPosition(aRandom)");
  expect(source).toContain("vec3 newPos = shapedPosition(instanceRandom)");
});

it("fits every field to the viewport aspect on resize", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(quantumFieldExperienceControls[0]?.controls[0]).toMatchObject({ value: "Gluon (Strong)" });
  expect(source).toContain("seed.xy * 2.0 - 1.0");
  expect(source).toContain("uViewportAspect * uViewportHalfHeight");
  expect(source).toContain("uViewportAspect.value = window.innerWidth / window.innerHeight");
  expect(source).toContain("controls.autoRotate = false;");
});

it("keeps every field type inside the same responsive rectangle", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const shape = source.match(/const shapeFunction = `([\s\S]*?)`;/)?.[1] ?? "";
  expect(quantumFieldExperienceControls[0]?.controls[0]?.options).not.toContain("Rectangular Field");
  expect(shape).toContain("seed.xy * 2.0 - 1.0");
  expect(shape).not.toContain("if (shape");
  expect(source).not.toContain("uFieldShape");
  expect(source).not.toContain("newPos.xz = mix(vec2(gridX");
  expect(source).toContain("controls.autoRotate = false;");
});

it("spreads network lines, crawlers, and trails across the rectangular field", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("const particleSeeds = geometry.getAttribute('aRandom');");
  expect(source).toContain("fieldParticlePosition(trackedParticles[i], positions[i]);");
  expect(source).toContain("return positions[idx % trackedParticles.length];");
  expect(source).toContain("geometry.drawRange.count");
  expect(source).toContain("trail.anchor.x * halfWidth");
  expect(source).not.toContain("posAttr.getX(pi)");
  expect(source).not.toContain("head.multiplyScalar(CONFIG.fieldRadius");
});

it("responds to bass across the rectangle without pushing its centre empty", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).not.toContain("newPos += centerDir * smoothstep(0.3, 0.8, uBass)");
  expect(source).not.toContain("newPos += centerDir * onsetPunch");
  expect(source).not.toContain("newPos += dir * uOnsetEnergy");
  expect(source).not.toContain("uVortexStrength * uBass * 3.5 / (1.0 + distFromCenter");
  expect(source).toContain("newPos.z += bassDepth;");
  expect(source).toContain("newPos.z += uOnsetEnergy * 14.0");
});

it("adds sparse theme-coloured glints and a field-wide depth wave without extra particle layers", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("float fieldWave = sin(");
  expect(source).toContain("newPos.z += fieldWave *");
  expect(source).toContain("vGlint = smoothstep(0.985, 0.998, aRandom.z)");
  expect(source).toContain("max(size * uPixelRatio * (90.0 / -mvPosition.z) * layerMod, vGlint * 4.5 * uPixelRatio)");
  expect(source).toContain("float glint =");
  expect(source).toContain("finalColor += vColor * vRimLight");
  expect(source).not.toContain("vec3(0.2, 0.3, 0.4) * vRimLight");
});

it("starts the restored renderer with bounded resolution and adaptive quality", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toMatch(/pixelRatio:\s*Math\.min\(window\.devicePixelRatio,\s*1\.5\)/);
  expect(source).toMatch(/adaptiveQualityEnabled:\s*true/);
});

it("scales the compositor and particles together on slower GPUs", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("composer.setPixelRatio(pixelRatio);");
  expect(source).toContain("renderer.setPixelRatio(pixelRatio);");
  expect(source).toContain("material.uniforms.uPixelRatio.value = pixelRatio;");
  expect(source).toContain("secondaryMaterial.uniforms.uPixelRatio.value = pixelRatio;");
  expect(source).toContain("secondaryGeometry.instanceCount = visibleParticles - mainCount;");
  expect(source).toContain("i < this.trails.length * STATE.qualityLevel");
  expect(source).toContain("Math.max(0.75, STATE.pixelRatio * q)");
  expect(source).toContain("this.currentFPS < STATE.targetFPS * 0.6 ? 0.2 : 0.1");
  expect(source).toContain("performance.now() - this.lastAdjustTime > 1000");
});

it("caps both particle layers with the public budget while adaptive quality can lower it further", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience, { particleBudget: 6_000 }));
  expect(html).toContain('data-particle-budget="6000"');
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/applyQuality\(\) \{([\s\S]*?)\n            \}\n        \};/)?.[1];
  expect(body).toBeTruthy();
  const apply = new Function("CONFIG", "STATE", "particleBudget", "geometry", "secondaryGeometry", "renderer", "composer", "material", "secondaryMaterial", body!);
  const config = { maxParticles: 250_000, secondaryParticles: 50_000 };
  const run = (budget: number, qualityLevel: number) => {
    const geometry = { setDrawRange: vi.fn() };
    const secondaryGeometry = { instanceCount: 0 };
    const renderer = { getPixelRatio: () => 1, setPixelRatio: vi.fn() };
    const composer = { setPixelRatio: vi.fn() };
    const material = { uniforms: { uPixelRatio: { value: 1 } } };
    const secondaryMaterial = { uniforms: { uPixelRatio: { value: 1 } } };
    apply(config, { density: 0.043, qualityLevel, pixelRatio: 1 }, budget, geometry, secondaryGeometry, renderer, composer, material, secondaryMaterial);
    return geometry.setDrawRange.mock.lastCall![1] + secondaryGeometry.instanceCount;
  };
  expect(run(Infinity, 1)).toBe(60_750);
  expect(run(6_000, 1)).toBe(6_000);
  expect(run(6_000, 0.5)).toBe(3_000);
  expect(run(0, 1)).toBe(0);
});

it("updates and removes the particle cap without recreating the visualizer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("getComputedStyle", () => ({ backgroundColor: "rgb(10, 10, 10)" }));
  let receive!: (event: MessageEvent) => void;
  vi.stubGlobal("window", { addEventListener: (_type: string, listener: typeof receive) => { receive = listener; }, removeEventListener: vi.fn() });
  const postMessage = vi.fn();
  const contentWindow = { postMessage };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience, { particleBudget: 6_000 }), {
    createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : {},
  }); });
  try {
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-ready" } } as unknown as MessageEvent));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: 6_000 }, "*");
    act(() => tree.update(createElement(QuantumFieldExperience, { particleBudget: 1_200 })));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: 1_200 }, "*");
    act(() => tree.update(createElement(QuantumFieldExperience)));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: undefined }, "*");
  } finally {
    act(() => tree.unmount());
    vi.unstubAllGlobals();
  }
});

it("idles offscreen rendering and limits network rebuilds to 20 Hz", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).toContain("new IntersectionObserver");
  expect(host).toContain('send("visible", entry.isIntersecting)');
  expect(source).toContain("if (!renderVisible || document.hidden)");
  expect(source).toContain("else if (key === 'visible') renderVisible = !!value;");
  expect(source).toContain("connectionElapsed >= 1 / 20");
});

it("defers the expensive iframe startup until its example approaches the viewport", () => {
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).toContain('useState(typeof IntersectionObserver === "undefined")');
  expect(host).toContain("if (entry?.isIntersecting) setMounted(true)");
  expect(host).toContain("{mounted && <iframe");
});

it("keeps the embedded visualizer script syntactically valid", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const script = source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeTruthy();
  expect(() => transformSync(script!, { loader: "js" })).not.toThrow();
});

it("keeps a detailed volumetric field without an embedded renderer", () => {
  const component = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumField.tsx", import.meta.url), "utf8");
  const renderer = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(component).toMatch(/WEBGL_BUDGET\s*=\s*\{\s*low:\s*[3-9]\d_\d{3},\s*high:\s*[6-9]\d_\d{3}/);
  expect(renderer).toContain("vDepth");
  expect(renderer).toContain("vSparkle");
  expect(renderer).toContain("mix(tone, vec3(1.0), vSparkle");
  expect(renderer).toContain("gl.blendFunc(gl.SRC_ALPHA, gl.ONE);");
  expect(renderer).not.toContain("reference.html");
});

it("keeps the restored visualizer settings in kit controls", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  expect(html).toContain('data-ad-component="Tabs"');
  expect(html).toContain('data-ad-component="Slider"');
  expect(html).toContain("Gluon (Strong)");
});

it("fills the transparent viewport with the native field", () => {
  const css = readFileSync(new URL("../src/components/artwork/QuantumField/styles.css", import.meta.url), "utf8");
  expect(css).toMatch(/\.ad-qf-viewport > \.ad-quantum-field\s*\{[^}]*height:\s*100%/s);
  expect(css).not.toContain("mix-blend-mode");
});

it("sends field and audio controls to the restored visualizer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("getComputedStyle", () => ({ backgroundColor: "rgb(10, 10, 10)" }));
  let receive!: (event: MessageEvent) => void;
  vi.stubGlobal("window", { setTimeout, clearTimeout, addEventListener: (_type: string, listener: typeof receive) => { receive = listener; }, removeEventListener: vi.fn() });
  const postMessage = vi.fn();
  const contentWindow = { postMessage };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience), {
    createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : {},
  }); });
  try {
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-ready" } } as unknown as MessageEvent));
    const fieldChoice = tree.root.findByProps({ label: "Тип поля" });
    act(() => fieldChoice.props.onValueChange("Photon (EM)"));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "field", value: "Photon (EM)" }, "*");
    act(() => tree.root.findByType(Tabs).props.onValueChange("audio"));
    const file = { name: "song.mp3" } as File;
    act(() => tree.root.findByType(FilePicker).props.onFiles([file]));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "file", value: file }, "*");
  } finally {
    act(() => tree.unmount());
    vi.unstubAllGlobals();
  }
});

it("renders immediately without an Enter gate and inherits the theme palette", () => {
  const html = renderToStaticMarkup(createElement(ThemeProvider, {
    primary: "#10c99a", secondary: "#7cf3d0",
  }, createElement(QuantumField, { mode: "vortex", "aria-label": "Music field" })));
  expect(html).toContain('data-ad-component="QuantumField"');
  expect(html).toContain('data-mode="vortex"');
  expect(html).toContain('aria-label="Music field"');
  expect(html).toContain('canvas');
  expect(html).not.toMatch(/Enter|Start|Запустить/);
  expect(html).toContain("#10c99a");
  expect(html).toContain("#7cf3d0");
});

it("offers distinct field geometries with a bounded adaptive render budget", () => {
  expect(quantumFieldModes).toEqual([
    "orbit", "vortex", "lattice", "wave", "bloom", "helix", "terrain",
  ]);
  expect(new Set(quantumFieldModes).size).toBe(7);
  const low = quantumFieldResolution(1920, 1080, 3, "low");
  const high = quantumFieldResolution(1920, 1080, 3, "high");
  expect(low.width * low.height).toBeLessThanOrEqual(350_000);
  expect(high.width * high.height).toBeLessThanOrEqual(1_050_000);
  expect(high.width * high.height).toBeGreaterThan(low.width * low.height);
});

it("derives seven stable audio bands from an analyser without allocations in the draw loop", () => {
  const bins = new Uint8Array(128);
  bins.fill(255, 0, 8);
  const analyser = {
    frequencyBinCount: bins.length,
    getByteFrequencyData(target: Uint8Array) { target.set(bins); },
  };
  const frame = quantumFieldAudio(analyser, new Uint8Array(bins.length));
  expect(frame.bands).toHaveLength(7);
  expect(frame.bands[0]).toBeGreaterThan(frame.bands[6]);
  expect(frame.energy).toBeGreaterThan(0);
  expect(frame.bands.every((value) => value >= 0 && value <= 1)).toBe(true);
});

it("connects the canvas to the renderer and sizes it before the first visible frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", undefined);
  const fill = vi.fn();
  const stroke = vi.fn();
  const setFillStyle = vi.fn();
  const canvas = { width: 300, height: 150, getContext: vi.fn(() => ({
    set fillStyle(value: string) { setFillStyle(value); },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill, stroke,
  })) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(canvas.getContext).toHaveBeenCalledWith("2d", { alpha: true });
  expect(canvas.width).toBe(400);
  expect(fill).toHaveBeenCalled();
  expect(stroke).toHaveBeenCalled();
  expect(setFillStyle.mock.calls.length).toBeLessThanOrEqual(4);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("connects an explicitly supplied microphone stream and releases its audio graph", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const disconnect = vi.fn(), close = vi.fn(), resume = vi.fn(async () => undefined);
  const connect = vi.fn();
  const analyser = { frequencyBinCount: 32, fftSize: 0, disconnect: vi.fn(), getByteFrequencyData: vi.fn((buffer: Uint8Array) => buffer.fill(0)) };
  const createMediaStreamSource = vi.fn(() => ({ connect, disconnect }));
  vi.stubGlobal("AudioContext", class {
    createAnalyser() { return analyser; }
    createMediaStreamSource = createMediaStreamSource;
    close = close;
    resume = resume;
  });
  const stream = {} as MediaStream;
  const canvas = { width: 300, height: 150, getContext: () => ({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {}, stroke() {} }) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true, stream }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(createMediaStreamSource).toHaveBeenCalledWith(stream);
  expect(connect).toHaveBeenCalledWith(analyser);
  expect(resume).toHaveBeenCalled();
  expect(analyser.getByteFrequencyData).toHaveBeenCalled();
  act(() => tree.unmount());
  expect(disconnect).toHaveBeenCalled();
  expect(close).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("does not force an opaque rectangle over a consumer's themed surface", () => {
  const css = readFileSync(new URL("../src/components/artwork/QuantumField/styles.css", import.meta.url), "utf8");
  expect(css).toContain("background: transparent");
  expect(css).not.toMatch(/var\(--ad-neutral-950\)/);
});

it("shows the restored visualizer in the documentation stage", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExample));
  expect(html).toContain('class="example-stage"');
  expect(html).not.toContain('data-stretch="true"');
  expect(html).toContain('data-ad-component="QuantumFieldExperience"');
  expect(html).toContain("<iframe");
});

it("keeps the interactive controls out of overview previews", () => {
  const html = renderToStaticMarkup(createElement(ExamplePreviewContext.Provider, {
    value: true,
  }, createElement(QuantumFieldExample)));
  expect(html).not.toContain("<iframe");
  expect(html).toContain('data-ad-component="QuantumField"');
});

it("loads audio files without autoplay and releases media, URLs, and context", async () => {
  const revokeObjectURL = vi.fn(), createObjectURL = vi.fn(() => "blob:track");
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  const play = vi.fn(async () => undefined), pause = vi.fn();
  vi.stubGlobal("Audio", class {
    src: string;
    currentTime = 0;
    constructor(src: string) { this.src = src; }
    play = play;
    pause = pause;
  });
  const connect = vi.fn(), disconnect = vi.fn(), close = vi.fn(async () => undefined), resume = vi.fn(async () => undefined);
  const analyser = { connect: vi.fn(), disconnect: vi.fn(), fftSize: 0 };
  vi.stubGlobal("AudioContext", class {
    destination = {};
    createAnalyser() { return analyser; }
    createMediaElementSource() { return { connect, disconnect }; }
    close = close;
    resume = resume;
  });
  const controller = createQuantumFieldAudio();
  const file = new Blob(["audio"]);
  const media = controller.loadFile(file);
  expect(createObjectURL).toHaveBeenCalledWith(file);
  expect(play).not.toHaveBeenCalled();
  expect(controller.media).toBe(media);
  await controller.play();
  expect(resume).toHaveBeenCalled();
  expect(play).toHaveBeenCalled();
  controller.seek(12);
  expect(media.currentTime).toBe(12);
  await controller.dispose();
  expect(pause).toHaveBeenCalled();
  expect(disconnect).toHaveBeenCalled();
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:track");
  expect(close).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("repaints when an ancestor changes CSS theme tokens without React rerender", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  let primary = "#ff244c";
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: (name: string) => name === "--ad-primary" ? primary : "#ff7c97" }));
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  let changed!: MutationCallback;
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: MutationCallback) { changed = callback; }
    observe() {}
    disconnect() {}
  });
  const colours: string[] = [];
  const canvas = { width: 300, height: 150, getContext: () => ({
    set fillStyle(value: string) { colours.push(value); },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {}, stroke() {},
  }) };
  const root = { parentElement: null, getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(colours).toContain("#ff244c");
  primary = "#10c99a";
  act(() => changed([], {} as MutationObserver));
  expect(colours).toContain("#10c99a");
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("does not paint an offscreen field until it enters the viewport", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("MutationObserver", undefined);
  let reveal!: IntersectionObserverCallback;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const fill = vi.fn();
  const canvas = { width: 300, height: 150, getContext: () => ({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill, stroke() {} }) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(fill).not.toHaveBeenCalled();
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(fill).toHaveBeenCalled();
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("builds a volumetric 3D field instead of a flat point cloud", () => {
  const sphere = quantumFieldGeometry("orbit", 4_000);
  const vortex = quantumFieldGeometry("vortex", 4_000);
  expect(sphere).toHaveLength(16_000);
  const depths = Array.from({ length: 4_000 }, (_, i) => sphere[i * 4 + 2]!);
  expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(1.5);
  expect(vortex).not.toEqual(sphere);
  expect(sphere.some((_, i) => i % 4 === 0 && Math.hypot(sphere[i]!, sphere[i + 1]!, sphere[i + 2]!) > 1.15)).toBe(true);
  expect(sphere.some((_, i) => i % 4 === 0 && Math.hypot(sphere[i]!, sphere[i + 1]!, sphere[i + 2]!) < 0.25)).toBe(true);
});

it("adds connected volumetric filaments for detail at microscopic zoom", () => {
  const lines = quantumFieldFilaments("orbit", 48, 12);
  expect(lines).toHaveLength(48 * 12 * 2 * 4);
  const depths = Array.from({ length: lines.length / 4 }, (_, i) => lines[i * 4 + 2]!);
  expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(1);
  expect(Array.from(lines.slice(4, 8))).toEqual(Array.from(lines.slice(8, 12)));
});

it("rewires a bounded force network over time without rebuilding the full particle field", () => {
  const first = quantumFieldNetwork("orbit", 96, 0);
  const next = quantumFieldNetwork("orbit", 96, 1);
  expect(first.length).toBeGreaterThan(0);
  expect(first.length).toBeLessThanOrEqual(320 * 8);
  expect(next).not.toEqual(first);
  expect(quantumFieldNetwork("orbit", 96, 0)).toEqual(first);
});

it("zooms smoothly with the wheel while respecting camera limits", () => {
  expect(quantumFieldZoom(3.5, -120)).toBeLessThan(3.5);
  expect(quantumFieldZoom(3.5, 120)).toBeGreaterThan(3.5);
  let inside = 1.5;
  for (let i = 0; i < 5; i += 1) inside = quantumFieldZoom(inside, -500);
  expect(inside).toBeLessThan(0.5);
  expect(quantumFieldZoom(0.1, -500)).toBeLessThan(0.1);
  expect(quantumFieldZoom(0.01, -100_000)).toBeGreaterThanOrEqual(0.06);
  expect(quantumFieldZoom(9, 100_000)).toBeLessThanOrEqual(8);
});

it("links vertex and fragment lighting uniforms at matching precision", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  const precisions = [...source.matchAll(/const (?:VERTEX|FRAGMENT) = `\s*precision (\w+) float;/g)].map((match) => match[1]);
  expect(precisions).toEqual(["mediump", "mediump"]);
});

it("composites the particle core over light themes rather than washing it out additively", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);");
});

it("reserves soft halos for sparse highlights so the field stays sharply detailed", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("if (uHalo > 0.5 && vStar < 0.5) discard;");
  expect(source).toContain("vSparkle * (0.25 + vMicro * 0.75)");
});

it("does not rotate the whole field on hover or as time passes", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("float cy = cos(uYaw), sy = sin(uYaw);");
  expect(source).toContain("gl.drawArrays(gl.LINES");
});

it("gives particles independent three-axis motion instead of rigidly spinning the field", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("vec3 fieldFlow(vec3 p, float t)");
  expect(source).toContain("p += fieldFlow(p,");
});

it("wires wheel zoom to the interactive component without scrolling the page", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const doc = { addEventListener, removeEventListener };
  const root = { dataset: {} as Record<string, string> };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { interactive: true, paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? {
      getContext: () => null,
      ownerDocument: doc,
      getBoundingClientRect: () => ({ left: 100, right: 500, top: 200, bottom: 400 }),
    } : root,
  }); });
  expect(addEventListener).toHaveBeenCalledWith("wheel", expect.any(Function), { passive: false, capture: true });
  const preventDefault = vi.fn();
  const wheel = addEventListener.mock.calls.find(([type]) => type === "wheel")![1];
  act(() => wheel({ clientX: 600, clientY: 300, deltaY: -120, preventDefault }));
  expect(preventDefault).not.toHaveBeenCalled();
  expect(root.dataset.zoom).toBeUndefined();
  act(() => wheel({ clientX: 300, clientY: 300, deltaY: -120, preventDefault }));
  expect(preventDefault).toHaveBeenCalled();
  expect(Number(root.dataset.zoom)).toBeLessThan(3.5);
  act(() => tree.unmount());
  expect(removeEventListener).toHaveBeenCalledWith("wheel", wheel, true);
  vi.unstubAllGlobals();
});
